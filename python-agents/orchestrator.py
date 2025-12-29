"""
Agent Orchestrator
The central brain that coordinates all agents and manages the agentic loop
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from typing import Dict, Any, List, Optional
from database import db
from agents import (
    reasoning_agent, 
    skill_gap_agent, 
    planner_agent, 
    feedback_agent,
    embedding_generator
)


class AgentOrchestrator:
    """
    The Agent Orchestrator is the brain of the system.
    It:
    1. Observes user state
    2. Reasons about next steps
    3. Calls appropriate agents
    4. Stores results
    5. Updates roadmaps
    6. Returns responses
    """
    
    def __init__(self):
        self.name = "AgentOrchestrator"
        self.current_user_id = None
        self.session_memory = {}
    
    def observe_user_state(self, user_id: int) -> Dict[str, Any]:
        """
        Gather complete user state for reasoning
        
        Args:
            user_id: The user's ID
        
        Returns:
            Complete user state dictionary
        """
        self.current_user_id = user_id
        
        # Gather all user data
        user = db.get_user_profile(user_id)
        skills = db.get_user_skills(user_id)
        goals = db.get_user_goals(user_id)
        primary_goal = db.get_primary_goal(user_id)
        skill_gaps = db.get_skill_gaps(user_id, primary_goal['id'] if primary_goal else None)
        plans = db.get_user_plans(user_id, primary_goal['id'] if primary_goal else None)
        feedback = db.get_user_feedback(user_id, limit=5)
        applications = db.get_applications(user_id)
        
        state = {
            "user_id": user_id,
            "profile": user,
            "skills": skills,
            "goals": goals,
            "primary_goal": primary_goal,
            "skill_gaps": skill_gaps,
            "plans": plans,
            "recent_feedback": feedback,
            "applications": applications,
            "stats": self._calculate_stats(plans, applications, feedback)
        }
        
        # Store in session memory
        self.session_memory[user_id] = state
        
        return state
    
    def _calculate_stats(self, plans: List, applications: List, feedback: List) -> Dict:
        """Calculate user statistics"""
        total_tasks = 0
        completed_tasks = 0
        
        for plan in plans:
            tasks = plan.get('tasks', [])
            total_tasks += len(tasks)
            completed_tasks += sum(1 for t in tasks if t.get('completed'))
        
        return {
            "total_plans": len(plans),
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            "total_applications": len(applications),
            "active_applications": len([a for a in applications if a.get('status') in ['applied', 'interviewing']]),
            "feedback_count": len(feedback)
        }
    
    def reason_next_action(self, user_state: Dict) -> Dict[str, Any]:
        """
        Determine the next best action for the user
        
        Args:
            user_state: Current user state
        
        Returns:
            Recommended action with reasoning
        """
        # Analyze current state
        has_goal = bool(user_state.get('primary_goal'))
        has_skills = bool(user_state.get('skills'))
        has_gaps = bool(user_state.get('skill_gaps'))
        has_plan = bool(user_state.get('plans'))
        stats = user_state.get('stats', {})
        
        # Decision logic
        if not has_goal:
            return {
                "action": "set_goal",
                "priority": "critical",
                "message": "Set your career goal to get personalized guidance",
                "agent_to_call": None
            }
        
        if not has_skills or len(user_state.get('skills', [])) < 3:
            return {
                "action": "add_skills",
                "priority": "high",
                "message": "Add more skills to your profile for accurate analysis",
                "agent_to_call": None
            }
        
        if not has_gaps:
            return {
                "action": "analyze_gaps",
                "priority": "high",
                "message": "Let's analyze your skill gaps for your target role",
                "agent_to_call": "skill_gap_agent"
            }
        
        if not has_plan:
            return {
                "action": "create_plan",
                "priority": "high",
                "message": "Time to create your personalized learning roadmap",
                "agent_to_call": "planner_agent"
            }
        
        # Check progress
        if stats.get('completion_rate', 0) < 50 and stats.get('total_tasks', 0) > 5:
            return {
                "action": "review_progress",
                "priority": "medium",
                "message": "Let's review your progress and adjust the plan if needed",
                "agent_to_call": "feedback_agent"
            }
        
        # Default: continue with current plan
        return {
            "action": "continue_learning",
            "priority": "normal",
            "message": "Keep up the great work! Focus on your current tasks.",
            "agent_to_call": None
        }
    
    def run_full_analysis(self, user_id: int) -> Dict[str, Any]:
        """
        Run a complete analysis for a user
        
        Args:
            user_id: The user's ID
        
        Returns:
            Comprehensive analysis results
        """
        # Create session record
        session_id = db.create_agent_session(user_id, 'full_analysis', {'user_id': user_id})
        
        try:
            # 1. Observe state
            state = self.observe_user_state(user_id)
            
            # 2. Run reasoning agent
            profile_data = {
                **state.get('profile', {}),
                'skills': state.get('skills', []),
                'target_role': state.get('primary_goal', {}).get('target_role')
            }
            reasoning_result = reasoning_agent.analyze_profile(profile_data)
            
            # 3. Run skill gap analysis
            target_role = state.get('primary_goal', {}).get('target_role', 'Software Developer')
            gap_result = skill_gap_agent.analyze_gaps(state.get('skills', []), target_role)
            
            # 4. Get next action recommendation
            next_action = self.reason_next_action(state)
            
            # 5. Generate insights
            insights = self._generate_insights(state, reasoning_result, gap_result)
            
            # Compile results
            result = {
                "status": "success",
                "user_id": user_id,
                "readiness_score": reasoning_result.get('analysis', {}).get('readiness_score', 0),
                "reasoning": reasoning_result,
                "skill_gaps": gap_result,
                "next_action": next_action,
                "insights": insights,
                "stats": state.get('stats', {}),
                "agent_thoughts": self._generate_thoughts(state, reasoning_result)
            }
            
            # Update readiness score
            if reasoning_result.get('analysis', {}).get('readiness_score'):
                db.update_readiness_score(user_id, reasoning_result['analysis']['readiness_score'])
            
            # Store memory
            self._store_analysis_memory(user_id, result)
            
            # Update session
            db.update_agent_session(session_id, result, result.get('agent_thoughts', ''))
            
            return result
            
        except Exception as e:
            error_result = {"status": "error", "message": str(e)}
            db.update_agent_session(session_id, error_result, str(e), 'failed')
            return error_result
    
    def analyze_and_plan(self, user_id: int) -> Dict[str, Any]:
        """
        Analyze skill gaps and create a learning plan
        
        Args:
            user_id: The user's ID
        
        Returns:
            Skill gaps and generated plan
        """
        state = self.observe_user_state(user_id)
        
        # Get target role
        primary_goal = state.get('primary_goal', {})
        target_role = primary_goal.get('target_role', 'Software Developer')
        timeline = primary_goal.get('timeline', '3 months')
        
        # Analyze gaps
        gap_result = skill_gap_agent.analyze_gaps(state.get('skills', []), target_role)
        
        # Extract gaps for planning
        skill_gaps = gap_result.get('analysis', {}).get('skill_gaps', [])
        
        # Create roadmap
        roadmap_result = planner_agent.create_roadmap(skill_gaps, target_role, timeline)
        
        # Save gaps to database
        if primary_goal.get('id') and skill_gaps:
            db.save_skill_gaps(user_id, primary_goal['id'], skill_gaps)
        
        # Save plans to database
        weekly_plans = roadmap_result.get('roadmap', {}).get('weekly_plans', [])
        for plan in weekly_plans:
            db.save_plan(user_id, primary_goal.get('id'), plan)
        
        return {
            "status": "success",
            "skill_gaps": gap_result,
            "roadmap": roadmap_result,
            "saved_plans": len(weekly_plans)
        }
    
    def process_feedback(self, user_id: int, feedback_data: Dict) -> Dict[str, Any]:
        """
        Process new feedback and update recommendations
        
        Args:
            user_id: The user's ID
            feedback_data: Feedback details
        
        Returns:
            Feedback analysis and updated recommendations
        """
        # Analyze the feedback
        if feedback_data.get('source') == 'rejection':
            analysis = feedback_agent.analyze_rejection(feedback_data)
        else:
            analysis = feedback_agent.analyze_interview_feedback(feedback_data)
        
        # Save feedback
        feedback_data['analysis'] = analysis.get('analysis', {}).get('rejection_analysis', {})
        feedback_data['action_items'] = analysis.get('analysis', {}).get('action_items', [])
        db.save_feedback(user_id, feedback_data)
        
        # Store in memory
        content = f"Feedback from {feedback_data.get('company', 'Unknown')}: {feedback_data.get('message', '')}"
        embedding = embedding_generator.generate(content)
        db.save_memory(user_id, content, embedding, 'feedback', {'analysis': analysis})
        
        # Get patterns if enough history
        history = db.get_user_feedback(user_id, limit=10)
        patterns = None
        if len(history) >= 3:
            patterns = feedback_agent.detect_patterns(history)
        
        return {
            "status": "success",
            "analysis": analysis,
            "patterns": patterns,
            "roadmap_updates": analysis.get('analysis', {}).get('roadmap_updates', [])
        }
    
    def get_dashboard_data(self, user_id: int) -> Dict[str, Any]:
        """
        Get all data needed for the dashboard
        
        Args:
            user_id: The user's ID
        
        Returns:
            Dashboard data package
        """
        state = self.observe_user_state(user_id)
        
        # Get readiness analysis
        profile = state.get('profile', {})
        skills = state.get('skills', [])
        primary_goal = state.get('primary_goal', {})
        
        # Calculate readiness if we have enough data
        readiness = None
        if skills and primary_goal:
            readiness = reasoning_agent.calculate_readiness(
                skills, 
                primary_goal.get('target_role', 'Software Developer')
            )
        
        # Get current plan progress
        plans = state.get('plans', [])
        current_plan = None
        for plan in plans:
            if plan.get('status') in ['pending', 'in_progress']:
                current_plan = plan
                break
        
        # Get next action
        next_action = self.reason_next_action(state)
        
        # Get insights
        insights = self._generate_insights(state, readiness, None)
        
        return {
            "user": {
                "name": profile.get('name', 'User'),
                "career_goal": profile.get('career_goal'),
                "current_level": profile.get('current_level'),
                "readiness_score": profile.get('readiness_score', 0)
            },
            "target_role": primary_goal.get('target_role') if primary_goal else None,
            "readiness": readiness.get('readiness') if readiness else None,
            "stats": state.get('stats', {}),
            "skill_gaps_count": len(state.get('skill_gaps', [])),
            "current_plan": current_plan,
            "next_action": next_action,
            "insights": insights,
            "recent_feedback": state.get('recent_feedback', [])[:3],
            "applications_summary": {
                "total": len(state.get('applications', [])),
                "active": len([a for a in state.get('applications', []) if a.get('status') in ['applied', 'interviewing']])
            }
        }
    
    def get_opportunity_matches(self, user_id: int) -> Dict[str, Any]:
        """
        Get job opportunities matched to user profile
        
        Args:
            user_id: The user's ID
        
        Returns:
            Matched opportunities with scores
        """
        state = self.observe_user_state(user_id)
        user_skills = state.get('skills', [])
        
        # Get opportunities
        opportunities = db.get_opportunities()
        
        # Calculate match for each
        matched = []
        for opp in opportunities:
            requirements = opp.get('requirements', [])
            if requirements:
                comparison = skill_gap_agent.compare_with_job(user_skills, requirements)
                match_data = comparison.get('comparison', {})
                matched.append({
                    **opp,
                    'match_percentage': match_data.get('match_percentage', 0),
                    'matching_skills': match_data.get('matching_skills', []),
                    'missing_skills': match_data.get('missing_skills', [])
                })
            else:
                matched.append({**opp, 'match_percentage': 50})
        
        # Sort by match percentage
        matched.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        return {
            "status": "success",
            "opportunities": matched,
            "total": len(matched)
        }
    
    def _generate_insights(self, state: Dict, reasoning: Dict, gaps: Dict) -> List[str]:
        """Generate AI insights from analysis"""
        insights = []
        
        stats = state.get('stats', {})
        
        if stats.get('completion_rate', 0) >= 80:
            insights.append("🎉 Excellent progress! You're ahead of schedule.")
        elif stats.get('completion_rate', 0) >= 50:
            insights.append("👍 Good progress! Keep up the momentum.")
        elif stats.get('completion_rate', 0) > 0:
            insights.append("💪 You're making progress. Try to pick up the pace a bit.")
        
        skill_gaps = state.get('skill_gaps', [])
        high_priority = [g for g in skill_gaps if g.get('priority') == 'high']
        if high_priority:
            insights.append(f"🎯 Focus on {len(high_priority)} high-priority skills for your target role.")
        
        if reasoning and reasoning.get('analysis', {}).get('readiness_score', 0) >= 70:
            insights.append("🚀 You're getting close to job-ready! Consider applying soon.")
        
        applications = state.get('applications', [])
        active = [a for a in applications if a.get('status') in ['applied', 'interviewing']]
        if active:
            insights.append(f"📝 You have {len(active)} active application(s). Good luck!")
        
        return insights if insights else ["Keep learning and building your skills!"]
    
    def _generate_thoughts(self, state: Dict, reasoning: Dict) -> str:
        """Generate agent thought summary"""
        profile = state.get('profile', {})
        goal = state.get('primary_goal', {})
        stats = state.get('stats', {})
        
        thoughts = []
        thoughts.append(f"Analyzed profile for {profile.get('name', 'user')}.")
        
        if goal:
            thoughts.append(f"Target role: {goal.get('target_role')}.")
        
        if reasoning and reasoning.get('analysis'):
            score = reasoning['analysis'].get('readiness_score', 0)
            thoughts.append(f"Career readiness: {score}%.")
        
        if stats.get('completion_rate', 0) > 0:
            thoughts.append(f"Task completion: {stats['completion_rate']}%.")
        
        return " ".join(thoughts)
    
    def _store_analysis_memory(self, user_id: int, result: Dict):
        """Store analysis result in memory"""
        content = f"Full analysis completed. Readiness: {result.get('readiness_score', 0)}%."
        if result.get('next_action'):
            content += f" Next action: {result['next_action'].get('action')}."
        
        embedding = embedding_generator.generate(content)
        db.save_memory(user_id, content, embedding, 'reasoning', {'result_summary': True})


# Global orchestrator instance
orchestrator = AgentOrchestrator()
