<?php
/**
 * Agent Controller
 * Handles communication with Python Agent Service
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../services/AgentService.php';

class AgentController {
    private Database $db;
    private AgentService $agent;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->agent = new AgentService();
    }
    
    /**
     * Run full analysis
     */
    public function runAnalysis(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $result = $this->agent->runFullAnalysis($userId);
        
        // Update readiness score if available
        if (isset($result['readiness_score'])) {
            $this->db->update('users', [
                'readiness_score' => $result['readiness_score']
            ], 'id = ?', [$userId]);
        }
        
        Response::success($result);
    }
    
    /**
     * Get dashboard data
     */
    public function getDashboard(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        // Try agent service first
        $agentData = $this->agent->getDashboard($userId);
        
        // Get local data as fallback/supplement
        $user = $this->db->fetch(
            "SELECT id, name, email, career_goal, current_level, readiness_score 
             FROM users WHERE id = ?",
            [$userId]
        );
        
        $primaryGoal = $this->db->fetch(
            "SELECT * FROM goals WHERE user_id = ? AND status = 'active' 
             ORDER BY FIELD(priority, 'high', 'medium', 'low') LIMIT 1",
            [$userId]
        );
        
        $skillGapsCount = $this->db->fetch(
            "SELECT COUNT(*) as count FROM skill_gaps WHERE user_id = ?",
            [$userId]
        )['count'];
        
        $currentPlan = $this->db->fetch(
            "SELECT * FROM plans WHERE user_id = ? AND status IN ('pending', 'in_progress') 
             ORDER BY week_number LIMIT 1",
            [$userId]
        );
        
        if ($currentPlan) {
            $currentPlan['tasks'] = json_decode($currentPlan['tasks'], true) ?? [];
        }
        
        // Calculate stats
        $planStats = $this->db->fetch(
            "SELECT 
                COUNT(*) as total_plans,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
             FROM plans WHERE user_id = ?",
            [$userId]
        );
        
        // Merge data
        $dashboard = [
            'user' => $user,
            'target_role' => $primaryGoal['target_role'] ?? null,
            'goal' => $primaryGoal,
            'readiness_score' => $user['readiness_score'] ?? 0,
            'skill_gaps_count' => (int) $skillGapsCount,
            'current_plan' => $currentPlan,
            'stats' => [
                'total_plans' => (int) $planStats['total_plans'],
                'completed_plans' => (int) $planStats['completed']
            ],
            'agent_data' => $agentData
        ];
        
        Response::success($dashboard);
    }
    
    /**
     * Analyze skill gaps and create plan
     */
    public function analyzeAndPlan(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $result = $this->agent->analyzeAndPlan($userId);
        
        Response::success($result);
    }
    
    /**
     * Get matched opportunities
     */
    public function getOpportunities(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $result = $this->agent->getOpportunities($userId);
        
        Response::success($result);
    }
    
    /**
     * Analyze skill gaps
     */
    public function analyzeSkillGaps(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        // Get user skills
        $skills = $this->db->fetchAll(
            "SELECT skill_name, level, category, years_experience FROM skills WHERE user_id = ?",
            [$userId]
        );
        
        // Get target role
        $goal = $this->db->fetch(
            "SELECT target_role FROM goals WHERE user_id = ? AND status = 'active' LIMIT 1",
            [$userId]
        );
        
        $targetRole = Request::get('target_role', $goal['target_role'] ?? 'Software Developer');
        
        $result = $this->agent->analyzeSkillGaps($skills, $targetRole);
        
        // Save gaps to database
        if (isset($result['analysis']['skill_gaps']) && $goal) {
            $gaps = $result['analysis']['skill_gaps'];
            
            // Clear existing gaps
            $this->db->delete('skill_gaps', 'user_id = ? AND goal_id = ?', [$userId, $goal['id'] ?? 0]);
            
            // Insert new gaps
            foreach ($gaps as $gap) {
                $this->db->insert('skill_gaps', [
                    'user_id' => $userId,
                    'goal_id' => $goal['id'] ?? 0,
                    'skill_name' => $gap['skill_name'],
                    'current_level' => $gap['current_level'] ?? 'none',
                    'required_level' => $gap['required_level'] ?? 'intermediate',
                    'priority' => $gap['priority'] ?? 'medium'
                ]);
            }
        }
        
        Response::success($result);
    }
    
    /**
     * Generate roadmap
     */
    public function generateRoadmap(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        // Get skill gaps
        $gaps = $this->db->fetchAll(
            "SELECT skill_name, current_level, required_level, priority 
             FROM skill_gaps WHERE user_id = ?
             ORDER BY FIELD(priority, 'high', 'medium', 'low')",
            [$userId]
        );
        
        // Get goal info
        $goal = $this->db->fetch(
            "SELECT id, target_role, timeline FROM goals 
             WHERE user_id = ? AND status = 'active' LIMIT 1",
            [$userId]
        );
        
        $targetRole = $goal['target_role'] ?? 'Software Developer';
        $timeline = Request::get('timeline', $goal['timeline'] ?? '3 months');
        
        $result = $this->agent->createRoadmap($gaps, $targetRole, $timeline);
        
        // Save plans to database
        if (isset($result['roadmap']['weekly_plans'])) {
            // Clear existing plans for this goal
            if ($goal) {
                $this->db->delete('plans', 'user_id = ? AND goal_id = ?', [$userId, $goal['id']]);
            }
            
            foreach ($result['roadmap']['weekly_plans'] as $plan) {
                $this->db->insert('plans', [
                    'user_id' => $userId,
                    'goal_id' => $goal['id'] ?? null,
                    'week_number' => $plan['week_number'],
                    'title' => $plan['title'],
                    'description' => $plan['description'] ?? '',
                    'tasks' => json_encode($plan['tasks'] ?? []),
                    'milestones' => json_encode($plan['milestones'] ?? []),
                    'ai_notes' => $plan['ai_notes'] ?? '',
                    'status' => 'pending'
                ]);
            }
        }
        
        Response::success($result);
    }
    
    /**
     * Process feedback with AI
     */
    public function processFeedback(): void {
        $userId = $GLOBALS['auth_user_id'];
        $feedbackData = Request::getJson();
        
        $result = $this->agent->processFeedback($userId, $feedbackData);
        
        Response::success($result);
    }
    
    /**
     * Generate weekly report
     */
    public function generateWeeklyReport(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        // Gather user data for report
        $user = $this->db->fetch("SELECT name FROM users WHERE id = ?", [$userId]);
        $goal = $this->db->fetch(
            "SELECT target_role FROM goals WHERE user_id = ? AND status = 'active' LIMIT 1",
            [$userId]
        );
        
        // Get this week's completed tasks
        $plans = $this->db->fetchAll(
            "SELECT tasks FROM plans WHERE user_id = ? AND status = 'in_progress'",
            [$userId]
        );
        
        $completedTasks = [];
        foreach ($plans as $plan) {
            $tasks = json_decode($plan['tasks'], true) ?? [];
            foreach ($tasks as $task) {
                if ($task['completed'] ?? false) {
                    $completedTasks[] = $task['title'];
                }
            }
        }
        
        $userData = [
            'name' => $user['name'],
            'target_role' => $goal['target_role'] ?? 'Not set',
            'current_week' => (int) date('W'),
            'tasks_completed' => $completedTasks,
            'hours_spent' => Request::get('hours_spent', 0),
            'new_skills' => Request::get('new_skills', []),
            'applications' => Request::get('applications', 0),
            'challenges' => Request::get('challenges', '')
        ];
        
        $result = $this->agent->generateWeeklyReport($userData);
        
        // Save report
        if (isset($result['report'])) {
            $this->db->insert('weekly_reports', [
                'user_id' => $userId,
                'week_start' => date('Y-m-d', strtotime('monday this week')),
                'week_end' => date('Y-m-d', strtotime('sunday this week')),
                'summary' => $result['report']['week_summary'] ?? '',
                'achievements' => json_encode($result['report']['key_accomplishments'] ?? []),
                'recommendations' => json_encode($result['report']['next_week_preview'] ?? [])
            ]);
        }
        
        Response::success($result);
    }
    
    /**
     * Calculate readiness score
     */
    public function calculateReadiness(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        // Get user skills
        $skills = $this->db->fetchAll(
            "SELECT skill_name, level, category FROM skills WHERE user_id = ?",
            [$userId]
        );
        
        // Get target role
        $goal = $this->db->fetch(
            "SELECT target_role FROM goals WHERE user_id = ? AND status = 'active' LIMIT 1",
            [$userId]
        );
        
        $targetRole = $goal['target_role'] ?? 'Software Developer';
        
        $result = $this->agent->calculateReadiness($skills, $targetRole);
        
        // Update user readiness score
        if (isset($result['readiness']['overall_score'])) {
            $this->db->update('users', [
                'readiness_score' => $result['readiness']['overall_score']
            ], 'id = ?', [$userId]);
        }
        
        Response::success($result);
    }
}
