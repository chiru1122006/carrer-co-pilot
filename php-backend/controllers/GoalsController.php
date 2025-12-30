<?php
/**
 * Goals Controller
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class GoalsController {
    private Database $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Get all goals for user
     */
    public function getGoals(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $goals = $this->db->fetchAll(
            "SELECT * FROM goals WHERE user_id = ? ORDER BY FIELD(priority, 'high', 'medium', 'low'), created_at DESC",
            [$userId]
        );
        
        Response::success($goals);
    }
    
    /**
     * Get primary goal
     */
    public function getPrimaryGoal(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $goal = $this->db->fetch(
            "SELECT * FROM goals 
             WHERE user_id = ? AND status = 'active'
             ORDER BY FIELD(priority, 'high', 'medium', 'low')
             LIMIT 1",
            [$userId]
        );
        
        if (!$goal) {
            Response::success(null, 'No active goal found');
            return;
        }
        
        // Get skill gaps for this goal
        $gaps = $this->db->fetchAll(
            "SELECT * FROM skill_gaps WHERE goal_id = ? ORDER BY FIELD(priority, 'high', 'medium', 'low')",
            [$goal['id']]
        );
        
        $goal['skill_gaps'] = $gaps;
        
        Response::success($goal);
    }
    
    /**
     * Create a goal
     */
    public function createGoal(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::validate([
            'target_role' => 'required|min:2'
        ]);
        
        $goalId = $this->db->insert('goals', [
            'user_id' => $userId,
            'target_role' => $data['target_role'],
            'target_company' => Request::get('target_company'),
            'timeline' => Request::get('timeline', '6 months'),
            'priority' => Request::get('priority', 'high'),
            'notes' => Request::get('notes'),
            'status' => 'active'
        ]);
        
        Response::success(['id' => $goalId], 'Goal created');
    }
    
    /**
     * Update a goal
     */
    public function updateGoal(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $goalId = $params['id'];
        $data = Request::getJson();
        
        $fields = [];
        if (isset($data['target_role'])) $fields['target_role'] = $data['target_role'];
        if (isset($data['target_company'])) $fields['target_company'] = $data['target_company'];
        if (isset($data['timeline'])) $fields['timeline'] = $data['timeline'];
        if (isset($data['priority'])) $fields['priority'] = $data['priority'];
        if (isset($data['status'])) $fields['status'] = $data['status'];
        if (isset($data['notes'])) $fields['notes'] = $data['notes'];
        
        if (empty($fields)) {
            Response::error('No fields to update');
        }
        
        $this->db->update('goals', $fields, 'id = ? AND user_id = ?', [$goalId, $userId]);
        
        Response::success(null, 'Goal updated');
    }
    
    /**
     * Delete a goal
     */
    public function deleteGoal(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $goalId = $params['id'];
        
        $this->db->delete('goals', 'id = ? AND user_id = ?', [$goalId, $userId]);
        
        Response::success(null, 'Goal deleted');
    }
    
    /**
     * Get skill gaps for a goal
     */
    public function getSkillGaps(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $goalId = $params['id'];
        
        $gaps = $this->db->fetchAll(
            "SELECT sg.* FROM skill_gaps sg
             JOIN goals g ON sg.goal_id = g.id
             WHERE sg.goal_id = ? AND g.user_id = ?
             ORDER BY FIELD(sg.priority, 'high', 'medium', 'low')",
            [$goalId, $userId]
        );
        
        Response::success($gaps);
    }
}
