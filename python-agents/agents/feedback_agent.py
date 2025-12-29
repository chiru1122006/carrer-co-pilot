"""
Feedback Agent
Analyzes rejection feedback, interview results, and progress patterns
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from llm_client import llm
from typing import Dict, List, Any


class FeedbackAgent:
    """
    The Feedback Agent is responsible for:
    1. Analyzing rejection and interview feedback
    2. Detecting patterns in failures
    3. Suggesting improvements
    4. Updating roadmaps based on learnings
    """
    
    SYSTEM_PROMPT = """You are an expert career coach specializing in feedback analysis and improvement strategies. Your role is to:
1. Analyze rejection and interview feedback objectively
2. Identify patterns and root causes
3. Suggest specific, actionable improvements
4. Provide encouraging but realistic guidance

Be constructive and focus on growth. Every setback is a learning opportunity."""
    
    def __init__(self):
        self.name = "FeedbackAgent"
    
    def analyze_rejection(self, rejection_data: Dict) -> Dict[str, Any]:
        """
        Analyze a job rejection and extract insights
        
        Args:
            rejection_data: Details about the rejection
        
        Returns:
            Analysis with insights and action items
        """
        prompt = f"""Analyze this job rejection and provide insights:

## Rejection Details
- Company: {rejection_data.get('company', 'Unknown')}
- Role: {rejection_data.get('role', 'Unknown')}
- Stage: {rejection_data.get('stage', 'Unknown')}
- Feedback Received: {rejection_data.get('message', 'No specific feedback')}
- Interview Type: {rejection_data.get('interview_type', 'Unknown')}

## User's Skills:
{rejection_data.get('user_skills', 'Not provided')}

Provide analysis in JSON:
{{
    "rejection_analysis": {{
        "likely_reasons": ["<possible reasons for rejection>"],
        "skill_gaps_identified": ["<skills that may have been lacking>"],
        "interview_performance": {{
            "strengths_shown": ["<what went well>"],
            "areas_for_improvement": ["<what could be better>"]
        }},
        "company_fit_analysis": "<assessment of fit with company>",
        "competition_factor": "<how competitive was this role likely>"
    }},
    "action_items": [
        {{
            "action": "<specific action to take>",
            "priority": "<high|medium|low>",
            "timeline": "<when to do this>",
            "expected_outcome": "<what this will improve>"
        }}
    ],
    "roadmap_updates": [
        "<suggested changes to learning plan>"
    ],
    "skills_to_focus": ["<skills to prioritize>"],
    "encouragement": "<motivational message>",
    "next_steps": ["<immediate actions>"],
    "similar_role_tips": "<advice for similar applications>"
}}"""
        
        result = llm.call_json(prompt, self.SYSTEM_PROMPT, temperature=0.4)
        
        if not result:
            return self._fallback_rejection_analysis(rejection_data)
        
        return {
            "agent": self.name,
            "status": "success",
            "analysis": result
        }
    
    def analyze_interview_feedback(self, feedback_data: Dict) -> Dict[str, Any]:
        """
        Analyze interview feedback to extract learnings
        
        Args:
            feedback_data: Interview feedback details
        
        Returns:
            Detailed analysis with improvement suggestions
        """
        prompt = f"""Analyze this interview feedback:

## Interview Details
- Company: {feedback_data.get('company', 'Unknown')}
- Role: {feedback_data.get('role', 'Unknown')}
- Interview Type: {feedback_data.get('type', 'Unknown')}
- Duration: {feedback_data.get('duration', 'Unknown')}

## Feedback Received:
{feedback_data.get('message', 'No specific feedback')}

## Questions Asked (if available):
{feedback_data.get('questions', 'Not provided')}

## Self-Assessment:
{feedback_data.get('self_assessment', 'Not provided')}

Provide analysis in JSON:
{{
    "performance_breakdown": {{
        "technical_skills": {{
            "score": "<weak|average|strong>",
            "notes": "<specific observations>"
        }},
        "communication": {{
            "score": "<weak|average|strong>",
            "notes": "<specific observations>"
        }},
        "problem_solving": {{
            "score": "<weak|average|strong>",
            "notes": "<specific observations>"
        }},
        "cultural_fit": {{
            "score": "<weak|average|strong>",
            "notes": "<specific observations>"
        }}
    }},
    "key_insights": ["<important takeaways>"],
    "strengths_demonstrated": ["<what you did well>"],
    "improvement_areas": [
        {{
            "area": "<what to improve>",
            "specific_feedback": "<details>",
            "how_to_improve": "<action steps>",
            "resources": ["<helpful resources>"]
        }}
    ],
    "practice_recommendations": ["<what to practice>"],
    "mindset_adjustments": ["<mental approach changes>"],
    "next_interview_tips": ["<tips for next time>"]
}}"""
        
        result = llm.call_json(prompt, self.SYSTEM_PROMPT, temperature=0.4)
        
        return {
            "agent": self.name,
            "status": "success" if result else "fallback",
            "analysis": result or {"message": "Analysis unavailable"}
        }
    
    def detect_patterns(self, feedback_history: List[Dict]) -> Dict[str, Any]:
        """
        Detect patterns across multiple feedback entries
        
        Args:
            feedback_history: List of previous feedback entries
        
        Returns:
            Pattern analysis with systemic insights
        """
        if not feedback_history:
            return {
                "agent": self.name,
                "status": "no_data",
                "patterns": {"message": "No feedback history to analyze"}
            }
        
        # Format feedback history
        history_str = ""
        for i, fb in enumerate(feedback_history[:10], 1):
            history_str += f"""
{i}. {fb.get('source', 'Unknown')} - {fb.get('company', 'Unknown')}
   Message: {fb.get('message', 'N/A')}
   Analysis: {fb.get('analysis', 'N/A')}
"""
        
        prompt = f"""Analyze patterns across this feedback history:

{history_str}

Identify patterns in JSON:
{{
    "recurring_themes": [
        {{
            "theme": "<pattern identified>",
            "frequency": "<how often it appears>",
            "severity": "<critical|significant|minor>",
            "examples": ["<specific instances>"]
        }}
    ],
    "skill_gaps_pattern": ["<consistently missing skills>"],
    "strength_patterns": ["<consistently positive areas>"],
    "interview_stage_analysis": {{
        "early_stage_issues": ["<problems in initial stages>"],
        "later_stage_issues": ["<problems in final stages>"]
    }},
    "root_causes": ["<underlying causes>"],
    "systemic_recommendations": [
        {{
            "recommendation": "<what to change>",
            "addresses": "<which pattern this fixes>",
            "implementation": "<how to implement>"
        }}
    ],
    "priority_improvements": ["<most impactful changes>"],
    "positive_trends": ["<improvements over time>"],
    "summary": "<overall pattern analysis>"
}}"""
        
        result = llm.call_json(prompt, self.SYSTEM_PROMPT, temperature=0.4)
        
        return {
            "agent": self.name,
            "status": "success" if result else "fallback",
            "patterns": result or self._fallback_patterns(feedback_history)
        }
    
    def analyze_progress(self, progress_data: Dict) -> Dict[str, Any]:
        """
        Analyze learning progress and provide feedback
        
        Args:
            progress_data: Progress metrics and completion data
        
        Returns:
            Progress analysis with recommendations
        """
        prompt = f"""Analyze this learning progress:

## Progress Data
- Tasks Completed: {progress_data.get('completed_tasks', 0)}
- Total Tasks: {progress_data.get('total_tasks', 0)}
- Completion Rate: {progress_data.get('completion_rate', 0)}%
- Weeks Elapsed: {progress_data.get('weeks_elapsed', 0)}
- Skills Improved: {progress_data.get('skills_improved', [])}
- Challenges Faced: {progress_data.get('challenges', [])}

## Weekly Breakdown:
{progress_data.get('weekly_breakdown', 'Not available')}

Provide progress analysis in JSON:
{{
    "progress_assessment": {{
        "overall_status": "<on_track|ahead|behind|needs_attention>",
        "completion_rate_analysis": "<assessment of completion rate>",
        "pace_analysis": "<is the pace sustainable?>"
    }},
    "achievements": ["<notable accomplishments>"],
    "areas_of_concern": ["<potential issues>"],
    "momentum_tips": ["<how to maintain progress>"],
    "schedule_adjustments": ["<suggested changes>"],
    "motivation_boosters": ["<encouragement>"],
    "next_week_focus": ["<what to prioritize>"],
    "celebration_worthy": ["<achievements to celebrate>"]
}}"""
        
        result = llm.call_json(prompt, self.SYSTEM_PROMPT, temperature=0.4)
        
        return {
            "agent": self.name,
            "status": "success" if result else "fallback",
            "analysis": result or self._fallback_progress(progress_data)
        }
    
    def generate_weekly_report(self, user_data: Dict) -> Dict[str, Any]:
        """
        Generate a weekly AI progress report
        
        Args:
            user_data: User's weekly data including progress, activities, etc.
        
        Returns:
            Comprehensive weekly report
        """
        prompt = f"""Generate a weekly progress report:

## User Data
- Name: {user_data.get('name', 'User')}
- Target Role: {user_data.get('target_role', 'Not set')}
- Current Week: {user_data.get('current_week', 1)}

## This Week's Activities
- Tasks Completed: {user_data.get('tasks_completed', [])}
- Hours Spent: {user_data.get('hours_spent', 0)}
- New Skills: {user_data.get('new_skills', [])}
- Applications Sent: {user_data.get('applications', 0)}

## Challenges
{user_data.get('challenges', 'None reported')}

Generate a comprehensive weekly report in JSON:
{{
    "report_title": "<catchy title>",
    "week_summary": "<brief overview>",
    "key_accomplishments": ["<achievements>"],
    "skills_progress": [
        {{"skill": "<skill>", "progress": "<description>", "level_change": "<if any>"}}
    ],
    "readiness_change": {{
        "previous": <score>,
        "current": <score>,
        "delta": <change>,
        "trend": "<improving|stable|declining>"
    }},
    "insights": ["<AI observations>"],
    "challenges_addressed": ["<how challenges were handled>"],
    "next_week_preview": {{
        "focus_areas": ["<priorities>"],
        "goals": ["<specific goals>"],
        "recommendations": ["<suggestions>"]
    }},
    "motivation_message": "<personalized encouragement>",
    "agent_thoughts": "<AI's perspective on progress>"
}}"""
        
        result = llm.call_json(prompt, self.SYSTEM_PROMPT, temperature=0.5)
        
        return {
            "agent": self.name,
            "status": "success" if result else "fallback",
            "report": result or self._fallback_report(user_data)
        }
    
    def _fallback_rejection_analysis(self, rejection_data: Dict) -> Dict[str, Any]:
        """Fallback rejection analysis"""
        return {
            "agent": self.name,
            "status": "fallback",
            "analysis": {
                "rejection_analysis": {
                    "likely_reasons": ["Competition was strong", "Skill mismatch possible"],
                    "skill_gaps_identified": ["Further assessment needed"]
                },
                "action_items": [
                    {"action": "Review job requirements", "priority": "high", "timeline": "This week"},
                    {"action": "Practice technical skills", "priority": "high", "timeline": "Ongoing"}
                ],
                "skills_to_focus": ["Technical fundamentals", "Communication"],
                "encouragement": "Every rejection is a step closer to the right opportunity. Keep learning and improving!",
                "next_steps": ["Continue learning", "Apply to similar roles", "Seek feedback"]
            }
        }
    
    def _fallback_patterns(self, history: List) -> Dict:
        """Fallback pattern analysis"""
        return {
            "recurring_themes": [{"theme": "Competitive market", "frequency": "Common", "severity": "significant"}],
            "skill_gaps_pattern": ["Technical depth"],
            "strength_patterns": ["Persistence", "Learning attitude"],
            "priority_improvements": ["Focus on core skills", "Practice interviewing"],
            "summary": "Based on limited data. Continue tracking for better insights."
        }
    
    def _fallback_progress(self, progress: Dict) -> Dict:
        """Fallback progress analysis"""
        rate = progress.get('completion_rate', 50)
        status = "on_track" if rate >= 70 else "needs_attention" if rate >= 40 else "behind"
        
        return {
            "progress_assessment": {
                "overall_status": status,
                "completion_rate_analysis": f"{rate}% completion rate",
                "pace_analysis": "Steady progress"
            },
            "achievements": ["Making progress on learning goals"],
            "momentum_tips": ["Stay consistent", "Celebrate small wins"],
            "next_week_focus": ["Continue current tasks", "Review completed work"]
        }
    
    def _fallback_report(self, user_data: Dict) -> Dict:
        """Fallback weekly report"""
        return {
            "report_title": f"Week {user_data.get('current_week', 1)} Progress Report",
            "week_summary": "Keep up the good work on your career journey!",
            "key_accomplishments": user_data.get('tasks_completed', ["Continued learning"]),
            "readiness_change": {"trend": "improving"},
            "insights": ["Consistent effort leads to results"],
            "next_week_preview": {
                "focus_areas": ["Continue current path"],
                "goals": ["Complete weekly tasks"],
                "recommendations": ["Stay focused and motivated"]
            },
            "motivation_message": "You're making progress every day. Keep going!",
            "agent_thoughts": "Steady progress is the key to success."
        }


# Global instance
feedback_agent = FeedbackAgent()
