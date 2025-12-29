"""
Skill Gap Agent
Identifies gaps between user skills and target role requirements
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from llm_client import llm
from typing import Dict, List, Any


class SkillGapAgent:
    """
    The Skill Gap Agent is responsible for:
    1. Comparing user skills vs job requirements
    2. Identifying missing skills
    3. Prioritizing gaps by importance
    4. Suggesting learning resources
    """
    
    SYSTEM_PROMPT = """You are an expert skill assessment agent. Your role is to:
1. Accurately compare user skills against job role requirements
2. Identify critical skill gaps
3. Prioritize gaps based on industry importance
4. Provide actionable insights for skill development

Be precise and realistic in your assessments. Consider both technical and soft skills."""
    
    def __init__(self):
        self.name = "SkillGapAgent"
        
        # Common role requirements (fallback data)
        self.role_requirements = {
            "Full Stack Developer": {
                "required": ["JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs", "HTML/CSS"],
                "preferred": ["TypeScript", "Docker", "AWS", "MongoDB", "GraphQL", "CI/CD"],
                "soft_skills": ["Problem Solving", "Communication", "Team Collaboration"]
            },
            "Frontend Developer": {
                "required": ["JavaScript", "React", "HTML/CSS", "Git", "Responsive Design"],
                "preferred": ["TypeScript", "Vue.js", "Testing", "Webpack", "Figma"],
                "soft_skills": ["Attention to Detail", "Communication", "Creativity"]
            },
            "Backend Developer": {
                "required": ["Python", "Node.js", "SQL", "REST APIs", "Git"],
                "preferred": ["Docker", "AWS", "Redis", "Microservices", "GraphQL"],
                "soft_skills": ["Problem Solving", "System Thinking", "Documentation"]
            },
            "Data Scientist": {
                "required": ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "NumPy"],
                "preferred": ["TensorFlow", "PyTorch", "Spark", "Tableau", "Deep Learning"],
                "soft_skills": ["Analytical Thinking", "Communication", "Curiosity"]
            },
            "Software Engineer": {
                "required": ["Programming", "Data Structures", "Algorithms", "Git", "Problem Solving"],
                "preferred": ["System Design", "Cloud", "CI/CD", "Testing", "Agile"],
                "soft_skills": ["Communication", "Teamwork", "Critical Thinking"]
            }
        }
    
    def analyze_gaps(self, user_skills: List[Dict], target_role: str) -> Dict[str, Any]:
        """
        Analyze skill gaps for a target role
        
        Args:
            user_skills: List of user's current skills with levels
            target_role: Target job role
        
        Returns:
            Detailed gap analysis with priorities
        """
        skills_str = self._format_skills(user_skills)
        
        prompt = f"""Analyze skill gaps for this career transition:

## Target Role: {target_role}

## User's Current Skills:
{skills_str}

Identify ALL skill gaps and provide detailed analysis in JSON:
{{
    "target_role": "{target_role}",
    "skill_gaps": [
        {{
            "skill_name": "<skill name>",
            "current_level": "<none|beginner|intermediate|advanced>",
            "required_level": "<beginner|intermediate|advanced|expert>",
            "priority": "<high|medium|low>",
            "importance": "<why this skill matters>",
            "estimated_learning_time": "<time to acquire>",
            "learning_approach": "<how to learn this skill>"
        }}
    ],
    "matching_skills": [
        {{
            "skill_name": "<skill name>",
            "current_level": "<level>",
            "status": "<exceeds|meets|close>"
        }}
    ],
    "gap_summary": {{
        "total_gaps": <number>,
        "high_priority": <number>,
        "medium_priority": <number>,
        "low_priority": <number>
    }},
    "readiness_percentage": <0-100>,
    "critical_path": ["<most important skills to learn in order>"],
    "quick_wins": ["<skills that can be acquired quickly>"],
    "overall_assessment": "<summary of the gap analysis>"
}}"""
        
        result = llm.call_json(prompt, self.SYSTEM_PROMPT, temperature=0.3)
        
        if not result:
            return self._fallback_analysis(user_skills, target_role)
        
        return {
            "agent": self.name,
            "status": "success",
            "analysis": result
        }
    
    def compare_with_job(self, user_skills: List[Dict], job_requirements: List[str]) -> Dict[str, Any]:
        """
        Compare user skills with specific job requirements
        
        Args:
            user_skills: User's current skills
            job_requirements: List of required skills for the job
        
        Returns:
            Match analysis
        """
        user_skill_names = [s.get('skill_name', s).lower() for s in user_skills]
        
        matching = []
        missing = []
        
        for req in job_requirements:
            req_lower = req.lower()
            if any(req_lower in skill or skill in req_lower for skill in user_skill_names):
                matching.append(req)
            else:
                missing.append(req)
        
        match_percentage = (len(matching) / len(job_requirements) * 100) if job_requirements else 0
        
        return {
            "agent": self.name,
            "status": "success",
            "comparison": {
                "matching_skills": matching,
                "missing_skills": missing,
                "match_percentage": round(match_percentage),
                "total_required": len(job_requirements),
                "skills_matched": len(matching),
                "skills_missing": len(missing)
            }
        }
    
    def prioritize_gaps(self, gaps: List[Dict], career_goal: str) -> Dict[str, Any]:
        """
        Prioritize skill gaps based on career goal
        
        Args:
            gaps: List of identified skill gaps
            career_goal: User's career goal
        
        Returns:
            Prioritized gaps with learning order
        """
        gaps_str = '\n'.join([f"- {g.get('skill_name', g)}: {g.get('current_level', 'unknown')}" for g in gaps])
        
        prompt = f"""Prioritize these skill gaps for the career goal:

## Career Goal: {career_goal}

## Skill Gaps:
{gaps_str}

Provide prioritized learning order in JSON:
{{
    "prioritized_gaps": [
        {{
            "rank": <1, 2, 3...>,
            "skill_name": "<skill>",
            "priority": "<critical|high|medium|low>",
            "reason": "<why this priority>",
            "dependencies": ["<skills to learn first>"],
            "time_investment": "<estimated time>"
        }}
    ],
    "learning_phases": [
        {{
            "phase": <1, 2, 3>,
            "name": "<phase name>",
            "skills": ["<skills in this phase>"],
            "duration": "<estimated duration>"
        }}
    ],
    "parallel_learning": ["<skills that can be learned simultaneously>"],
    "recommendation": "<overall learning strategy>"
}}"""
        
        result = llm.call_json(prompt, self.SYSTEM_PROMPT, temperature=0.3)
        
        return {
            "agent": self.name,
            "status": "success" if result else "fallback",
            "prioritization": result or {"error": "Prioritization unavailable"}
        }
    
    def get_role_requirements(self, role: str) -> Dict[str, Any]:
        """
        Get skill requirements for a role
        
        Args:
            role: Target role name
        
        Returns:
            Role requirements
        """
        # Check local requirements first
        for key, reqs in self.role_requirements.items():
            if role.lower() in key.lower() or key.lower() in role.lower():
                return {
                    "agent": self.name,
                    "status": "success",
                    "requirements": {
                        "role": key,
                        **reqs
                    }
                }
        
        # Use LLM for unknown roles
        prompt = f"""What skills are required for this role: {role}

Provide requirements in JSON:
{{
    "role": "{role}",
    "required": ["<essential skills>"],
    "preferred": ["<nice-to-have skills>"],
    "soft_skills": ["<soft skills needed>"],
    "education": "<typical education requirement>",
    "experience": "<typical experience requirement>"
}}"""
        
        result = llm.call_json(prompt, self.SYSTEM_PROMPT, temperature=0.3)
        
        return {
            "agent": self.name,
            "status": "success" if result else "fallback",
            "requirements": result or self.role_requirements.get("Software Engineer")
        }
    
    def _format_skills(self, skills: List[Dict]) -> str:
        """Format skills list for prompt"""
        if not skills:
            return "No skills listed"
        
        formatted = []
        for skill in skills:
            if isinstance(skill, dict):
                name = skill.get('skill_name', skill.get('name', 'Unknown'))
                level = skill.get('level', 'unknown')
                years = skill.get('years_experience', '')
                exp_str = f" ({years} years)" if years else ""
                formatted.append(f"- {name}: {level}{exp_str}")
            else:
                formatted.append(f"- {skill}")
        
        return '\n'.join(formatted)
    
    def _fallback_analysis(self, user_skills: List, target_role: str) -> Dict[str, Any]:
        """Fallback gap analysis"""
        # Get default requirements
        requirements = self.role_requirements.get("Software Engineer")
        for key, reqs in self.role_requirements.items():
            if target_role.lower() in key.lower():
                requirements = reqs
                break
        
        user_skill_names = [s.get('skill_name', str(s)).lower() for s in user_skills]
        
        gaps = []
        matching = []
        
        for skill in requirements.get('required', []):
            if skill.lower() in user_skill_names:
                matching.append({"skill_name": skill, "status": "meets"})
            else:
                gaps.append({
                    "skill_name": skill,
                    "current_level": "none",
                    "required_level": "intermediate",
                    "priority": "high",
                    "importance": "Core requirement for role",
                    "estimated_learning_time": "2-4 weeks"
                })
        
        for skill in requirements.get('preferred', []):
            if skill.lower() not in user_skill_names:
                gaps.append({
                    "skill_name": skill,
                    "current_level": "none",
                    "required_level": "beginner",
                    "priority": "medium",
                    "importance": "Preferred skill for role",
                    "estimated_learning_time": "1-2 weeks"
                })
        
        high_priority = len([g for g in gaps if g['priority'] == 'high'])
        
        return {
            "agent": self.name,
            "status": "fallback",
            "analysis": {
                "target_role": target_role,
                "skill_gaps": gaps,
                "matching_skills": matching,
                "gap_summary": {
                    "total_gaps": len(gaps),
                    "high_priority": high_priority,
                    "medium_priority": len(gaps) - high_priority,
                    "low_priority": 0
                },
                "readiness_percentage": round(len(matching) / (len(matching) + len(gaps)) * 100) if (matching or gaps) else 50,
                "critical_path": [g['skill_name'] for g in gaps if g['priority'] == 'high'][:3],
                "overall_assessment": "Analysis based on standard role requirements."
            }
        }


# Global instance
skill_gap_agent = SkillGapAgent()
