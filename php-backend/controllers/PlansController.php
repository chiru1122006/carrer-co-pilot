<?php
/**
 * Plans (Roadmap) Controller
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class PlansController {
    private Database $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Get all plans for user
     */
    public function getPlans(): void {
        $userId = $GLOBALS['auth_user_id'];
        $goalId = Request::get('goal_id');
        
        $sql = "SELECT * FROM plans WHERE user_id = ?";
        $params = [$userId];
        
        if ($goalId) {
            $sql .= " AND goal_id = ?";
            $params[] = $goalId;
        }
        
        $sql .= " ORDER BY week_number";
        
        $plans = $this->db->fetchAll($sql, $params);
        
        // Parse JSON fields
        foreach ($plans as &$plan) {
            $plan['tasks'] = json_decode($plan['tasks'], true) ?? [];
            $plan['milestones'] = json_decode($plan['milestones'], true) ?? [];
        }
        
        Response::success($plans);
    }
    
    /**
     * Get a single plan
     */
    public function getPlan(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $planId = $params['id'];
        
        $plan = $this->db->fetch(
            "SELECT * FROM plans WHERE id = ? AND user_id = ?",
            [$planId, $userId]
        );
        
        if (!$plan) {
            Response::notFound('Plan not found');
        }
        
        $plan['tasks'] = json_decode($plan['tasks'], true) ?? [];
        $plan['milestones'] = json_decode($plan['milestones'], true) ?? [];
        
        Response::success($plan);
    }
    
    /**
     * Get current week's plan
     */
    public function getCurrentPlan(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $plan = $this->db->fetch(
            "SELECT * FROM plans 
             WHERE user_id = ? AND status IN ('pending', 'in_progress')
             ORDER BY week_number
             LIMIT 1",
            [$userId]
        );
        
        if ($plan) {
            $plan['tasks'] = json_decode($plan['tasks'], true) ?? [];
            $plan['milestones'] = json_decode($plan['milestones'], true) ?? [];
        }
        
        Response::success($plan);
    }
    
    /**
     * Update plan status
     */
    public function updatePlan(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $planId = $params['id'];
        $data = Request::getJson();
        
        $fields = [];
        if (isset($data['status'])) $fields['status'] = $data['status'];
        if (isset($data['progress_percentage'])) $fields['progress_percentage'] = $data['progress_percentage'];
        if (isset($data['tasks'])) $fields['tasks'] = json_encode($data['tasks']);
        
        if (empty($fields)) {
            Response::error('No fields to update');
        }
        
        $this->db->update('plans', $fields, 'id = ? AND user_id = ?', [$planId, $userId]);
        
        Response::success(null, 'Plan updated');
    }
    
    /**
     * Update task completion
     */
    public function updateTask(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $planId = $params['id'];
        $data = Request::getJson();
        
        // Support both task_id and task_index for flexibility
        $taskId = $data['task_id'] ?? null;
        $taskIndex = $data['task_index'] ?? null;
        $completed = $data['completed'] ?? false;
        
        if ($taskId === null && $taskIndex === null) {
            Response::error('task_id or task_index is required');
        }
        
        // Get current plan
        $plan = $this->db->fetch(
            "SELECT tasks, progress_percentage FROM plans WHERE id = ? AND user_id = ?",
            [$planId, $userId]
        );
        
        if (!$plan) {
            Response::notFound('Plan not found');
        }
        
        $tasks = json_decode($plan['tasks'], true) ?? [];
        
        // Update task by id or index
        if ($taskIndex !== null && isset($tasks[$taskIndex])) {
            $tasks[$taskIndex]['completed'] = $completed;
        } else {
            foreach ($tasks as &$task) {
                if ($task['id'] == $taskId) {
                    $task['completed'] = $completed;
                    break;
                }
            }
        }
        
        // Calculate progress
        $totalTasks = count($tasks);
        $completedTasks = count(array_filter($tasks, fn($t) => $t['completed'] ?? false));
        $progress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;
        
        // Determine status
        $status = 'in_progress';
        if ($progress === 0) $status = 'pending';
        if ($progress === 100) $status = 'completed';
        
        // Update plan
        $this->db->update('plans', [
            'tasks' => json_encode($tasks),
            'progress_percentage' => $progress,
            'status' => $status
        ], 'id = ? AND user_id = ?', [$planId, $userId]);
        
        Response::success([
            'progress' => $progress,
            'status' => $status,
            'tasks' => $tasks
        ], 'Task updated');
    }
    
    /**
     * Get roadmap summary
     */
    public function getRoadmapSummary(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $stats = $this->db->fetch(
            "SELECT 
                COUNT(*) as total_weeks,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_weeks,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as current_weeks,
                AVG(progress_percentage) as avg_progress
             FROM plans WHERE user_id = ?",
            [$userId]
        );
        
        // Get total tasks
        $plans = $this->db->fetchAll("SELECT tasks FROM plans WHERE user_id = ?", [$userId]);
        $totalTasks = 0;
        $completedTasks = 0;
        
        foreach ($plans as $plan) {
            $tasks = json_decode($plan['tasks'], true) ?? [];
            $totalTasks += count($tasks);
            $completedTasks += count(array_filter($tasks, fn($t) => $t['completed'] ?? false));
        }
        
        Response::success([
            'total_weeks' => (int) $stats['total_weeks'],
            'completed_weeks' => (int) $stats['completed_weeks'],
            'current_weeks' => (int) $stats['current_weeks'],
            'avg_progress' => round($stats['avg_progress'] ?? 0),
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'task_completion_rate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0
        ]);
    }
}
