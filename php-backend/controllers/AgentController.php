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
     * Analyze skill gaps - Uses unified agent
     */
    public function analyzeSkillGaps(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        // Get target role from request or goal
        $goal = $this->db->fetch(
            "SELECT id, target_role FROM goals WHERE user_id = ? AND status = 'active' LIMIT 1",
            [$userId]
        );
        
        $targetRole = Request::get('target_role', $goal['target_role'] ?? 'Software Developer');
        
        // Use unified agent for skill gap analysis
        $result = $this->agent->runUnifiedAgent($userId, 'skill_gap', [
            'target_role' => $targetRole
        ]);
        
        // Save gaps to database from unified agent result with learning resources
        if (isset($result['skill_gaps']) && is_array($result['skill_gaps']) && $goal) {
            $gaps = $result['skill_gaps'];
            
            // Clear existing gaps
            $this->db->delete('skill_gaps', 'user_id = ?', [$userId]);
            
            // Insert new gaps with learning resources
            foreach ($gaps as $gap) {
                if (!isset($gap['skill_name'])) continue;
                
                // Prepare learning resources as JSON
                $learningResources = null;
                if (isset($gap['learning_resources']) && is_array($gap['learning_resources'])) {
                    $learningResources = json_encode($gap['learning_resources']);
                }
                
                $this->db->insert('skill_gaps', [
                    'user_id' => $userId,
                    'goal_id' => $goal['id'] ?? 0,
                    'skill_name' => $gap['skill_name'],
                    'current_level' => $gap['current_level'] ?? 'none',
                    'required_level' => $gap['required_level'] ?? 'intermediate',
                    'priority' => $gap['priority'] ?? 'medium',
                    'learning_resources' => $learningResources,
                    'estimated_learning_time' => $gap['estimated_learning_time'] ?? null,
                    'learning_approach' => $gap['learning_approach'] ?? null
                ]);
            }
        }
        
        Response::success($result);
    }
    
    /**
     * Generate roadmap - Uses unified agent
     */
    public function generateRoadmap(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        // Get goal info
        $goal = $this->db->fetch(
            "SELECT id, target_role, timeline FROM goals 
             WHERE user_id = ? AND status = 'active' LIMIT 1",
            [$userId]
        );
        
        $timeline = Request::get('timeline', $goal['timeline'] ?? '3 months');
        
        // Use unified agent for roadmap generation
        $result = $this->agent->runUnifiedAgent($userId, 'roadmap', [
            'timeline' => $timeline
        ]);
        
        // Save plans to database from unified agent result
        if (isset($result['weekly_plans']) && is_array($result['weekly_plans']) && $goal) {
            // Clear existing plans for this goal
            $this->db->delete('plans', 'user_id = ? AND goal_id = ?', [$userId, $goal['id']]);
            
            foreach ($result['weekly_plans'] as $plan) {
                if (!isset($plan['week_number'])) continue;
                $this->db->insert('plans', [
                    'user_id' => $userId,
                    'goal_id' => $goal['id'] ?? null,
                    'week_number' => $plan['week_number'],
                    'title' => $plan['title'] ?? 'Week ' . $plan['week_number'],
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
     * Process feedback with AI - Uses unified agent
     */
    public function processFeedback(): void {
        $userId = $GLOBALS['auth_user_id'];
        $feedbackData = Request::getJson();
        
        // Use unified agent for feedback processing
        $result = $this->agent->runUnifiedAgent($userId, 'feedback', $feedbackData);
        
        // If feedback processing suggests roadmap update, trigger it
        if (isset($result['actions']) && in_array('regenerate_roadmap', $result['actions'])) {
            $this->agent->runUnifiedAgent($userId, 'roadmap', []);
        }
        
        Response::success($result);
    }
    
    /**
     * Analyze a specific feedback item with AI
     */
    public function analyzeFeedbackItem(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $id = (int) $params['id'];
        
        // Get the feedback item
        $feedback = $this->db->fetch(
            "SELECT * FROM feedback WHERE id = ? AND user_id = ?",
            [$id, $userId]
        );
        
        if (!$feedback) {
            Response::notFound('Feedback not found');
            return;
        }
        
        // Prepare feedback data for agent
        $feedbackData = [
            'source' => $feedback['source'],
            'company' => $feedback['company'],
            'role' => $feedback['role'],
            'message' => $feedback['message'],
            'feedback_id' => $id
        ];
        
        // Use unified agent for feedback processing
        $result = $this->agent->runUnifiedAgent($userId, 'feedback', ['feedback' => $feedbackData]);
        
        // Extract analysis from result
        $analysis = $result['analysis'] ?? [];
        $actionItems = $result['skills_to_focus'] ?? $analysis['action_items'] ?? [];
        
        // Determine sentiment based on analysis
        $sentiment = 'neutral';
        if (isset($analysis['sentiment'])) {
            $sentiment = $analysis['sentiment'];
        } elseif ($feedback['source'] === 'rejection') {
            $sentiment = 'negative';
        }
        
        // Build analysis text
        $analysisText = '';
        if (isset($analysis['rejection_analysis'])) {
            $ra = $analysis['rejection_analysis'];
            $analysisText = $ra['summary'] ?? '';
            if (isset($ra['key_issues'])) {
                $analysisText .= ' Key issues: ' . implode(', ', $ra['key_issues']);
            }
        } elseif (isset($analysis['summary'])) {
            $analysisText = $analysis['summary'];
        } elseif (isset($result['agent_thoughts'])) {
            $analysisText = $result['agent_thoughts'];
        }
        
        // Update feedback with analysis
        $this->db->update('feedback', [
            'analysis' => $analysisText,
            'sentiment' => $sentiment,
            'action_items' => json_encode($actionItems)
        ], 'id = ?', [$id]);
        
        // If feedback processing suggests roadmap update, trigger it
        if (isset($result['should_regenerate_roadmap']) && $result['should_regenerate_roadmap']) {
            try {
                $this->agent->runUnifiedAgent($userId, 'roadmap', []);
            } catch (Exception $e) {
                error_log("Roadmap regeneration error: " . $e->getMessage());
            }
        }
        
        Response::success([
            'analysis' => $analysisText,
            'sentiment' => $sentiment,
            'action_items' => $actionItems,
            'patterns' => $result['patterns'] ?? null,
            'roadmap_updates' => $result['roadmap_updates'] ?? []
        ]);
    }
    
    /**
     * Match job opportunities with AI - Uses unified agent
     */
    public function matchOpportunities(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        // Use unified agent for opportunity matching
        $result = $this->agent->runUnifiedAgent($userId, 'apply_role', []);
        
        // Save matched opportunities to database
        if (isset($result['opportunities']) && is_array($result['opportunities'])) {
            foreach ($result['opportunities'] as $opp) {
                // Check if already exists
                $existing = $this->db->fetch(
                    "SELECT id FROM applications WHERE user_id = ? AND role = ? AND company = ?",
                    [$userId, $opp['role'] ?? 'Unknown Role', $opp['company'] ?? 'Unknown Company']
                );
                
                if (!$existing) {
                    $this->db->insert('applications', [
                        'user_id' => $userId,
                        'company' => $opp['company'] ?? 'AI Suggested',
                        'role' => $opp['role'] ?? 'Matched Role',
                        'match_percentage' => $opp['match_percentage'] ?? 0,
                        'ai_tips' => $opp['reason'] ?? $opp['tips'] ?? '',
                        'status' => 'saved'
                    ]);
                }
            }
        }
        
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
    
    /**
     * Chat with AI career coach
     */
    public function chat(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::getJson();
        
        $message = $data['message'] ?? '';
        
        if (empty($message)) {
            Response::error('Message is required', 400);
            return;
        }
        
        $result = $this->agent->chat($userId, $message);
        
        Response::success($result);
    }
    
    /**
     * Get chat history
     */
    public function getChatHistory(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $result = $this->agent->getChatHistory($userId);
        
        Response::success($result);
    }
    
    /**
     * Clear chat history
     */
    public function clearChatHistory(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $result = $this->agent->clearChatHistory($userId);
        
        Response::success($result);
    }
    
    /**
     * Get current agent state
     */
    public function getAgentState(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $result = $this->agent->getAgentState($userId);
        
        Response::success($result);
    }
}
