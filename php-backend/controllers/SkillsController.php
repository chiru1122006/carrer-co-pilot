<?php
/**
 * Skills Controller
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class SkillsController {
    private Database $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Get all skills for user
     */
    public function getSkills(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $skills = $this->db->fetchAll(
            "SELECT id, skill_name, level, category, years_experience, verified, created_at
             FROM skills WHERE user_id = ? ORDER BY level DESC, skill_name",
            [$userId]
        );
        
        Response::success($skills);
    }
    
    /**
     * Add a skill
     */
    public function addSkill(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::validate([
            'skill_name' => 'required|min:1'
        ]);
        
        // Check for duplicate
        $existing = $this->db->fetch(
            "SELECT id FROM skills WHERE user_id = ? AND skill_name = ?",
            [$userId, $data['skill_name']]
        );
        
        if ($existing) {
            Response::error('Skill already exists', 400);
            return;
        }
        
        $skillId = $this->db->insert('skills', [
            'user_id' => $userId,
            'skill_name' => $data['skill_name'],
            'level' => Request::get('level', 'beginner'),
            'category' => Request::get('category', 'general'),
            'years_experience' => Request::get('years_experience', 0)
        ]);
        
        // Log career event
        try {
            $this->db->insert('career_events', [
                'user_id' => $userId,
                'event_type' => 'skill_added',
                'event_data' => json_encode([
                    'skill_name' => $data['skill_name'],
                    'level' => Request::get('level', 'beginner')
                ]),
                'description' => "Added skill: " . $data['skill_name']
            ]);
        } catch (Exception $e) {
            error_log("Failed to log career event: " . $e->getMessage());
        }
        
        // Recalculate readiness score
        $this->recalculateReadiness($userId);
        
        Response::success(['id' => $skillId], 'Skill added');
    }
    
    /**
     * Recalculate and update readiness score
     */
    private function recalculateReadiness(int $userId): void {
        try {
            $user = $this->db->fetch("SELECT * FROM users WHERE id = ?", [$userId]);
            $skills = $this->db->fetchAll("SELECT * FROM skills WHERE user_id = ?", [$userId]);
            $goals = $this->db->fetchAll("SELECT * FROM goals WHERE user_id = ? AND status = 'active'", [$userId]);
            $plans = $this->db->fetchAll("SELECT * FROM plans WHERE user_id = ?", [$userId]);
            $applications = $this->db->fetchAll("SELECT * FROM applications WHERE user_id = ?", [$userId]);
            
            // Calculate component scores
            $skillsScore = min(100, count($skills) * 10);
            $educationScore = 0;
            if ($user['education_level']) {
                $eduLevels = [
                    'High School' => 20,
                    'Associate Degree' => 40,
                    "Bachelor's Degree" => 60,
                    "Master's Degree" => 80,
                    'PhD' => 100,
                    'Bootcamp Graduate' => 50,
                    'Self-taught' => 40
                ];
                $educationScore = $eduLevels[$user['education_level']] ?? 30;
            }
            
            $goalsScore = count($goals) > 0 ? 50 : 0;
            if ($user['target_role']) $goalsScore += 25;
            if ($user['career_goal']) $goalsScore += 25;
            $goalsScore = min(100, $goalsScore);
            
            $progressScore = 0;
            $completedPlans = 0;
            foreach ($plans as $plan) {
                if ($plan['status'] === 'completed') $completedPlans++;
            }
            if (count($plans) > 0) {
                $progressScore = ($completedPlans / count($plans)) * 100;
            }
            
            $applicationsScore = min(100, count($applications) * 20);
            
            // Calculate overall score (weighted average)
            $overallScore = (int)(
                ($skillsScore * 0.30) +
                ($educationScore * 0.15) +
                ($goalsScore * 0.20) +
                ($progressScore * 0.20) +
                ($applicationsScore * 0.15)
            );
            
            // Update user's readiness score
            $this->db->update('users', ['readiness_score' => $overallScore], 'id = ?', [$userId]);
        } catch (Exception $e) {
            error_log("Failed to recalculate readiness: " . $e->getMessage());
        }
    }
    
    /**
     * Update a skill
     */
    public function updateSkill(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $skillId = $params['id'];
        $data = Request::getJson();
        
        $fields = [];
        if (isset($data['skill_name'])) $fields['skill_name'] = $data['skill_name'];
        if (isset($data['level'])) $fields['level'] = $data['level'];
        if (isset($data['category'])) $fields['category'] = $data['category'];
        if (isset($data['years_experience'])) $fields['years_experience'] = $data['years_experience'];
        
        if (empty($fields)) {
            Response::error('No fields to update');
        }
        
        $this->db->update('skills', $fields, 'id = ? AND user_id = ?', [$skillId, $userId]);
        
        Response::success(null, 'Skill updated');
    }
    
    /**
     * Delete a skill
     */
    public function deleteSkill(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $skillId = $params['id'];
        
        $this->db->delete('skills', 'id = ? AND user_id = ?', [$skillId, $userId]);
        
        // Recalculate readiness after skill deletion
        $this->recalculateReadiness($userId);
        
        Response::success(null, 'Skill deleted');
    }

    /**
     * Get skill gaps for user with learning resources
     */
    public function getSkillGaps(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $gaps = $this->db->fetchAll(
            "SELECT sg.id, sg.skill_name, sg.current_level, sg.required_level, sg.priority, sg.status,
                    sg.learning_resources, sg.estimated_learning_time, sg.learning_approach,
                    g.target_role
             FROM skill_gaps sg
             LEFT JOIN goals g ON sg.goal_id = g.id
             WHERE sg.user_id = ?
             ORDER BY FIELD(sg.priority, 'high', 'medium', 'low'), sg.skill_name",
            [$userId]
        );
        
        // Parse learning_resources JSON for each gap
        foreach ($gaps as &$gap) {
            if (isset($gap['learning_resources']) && is_string($gap['learning_resources'])) {
                $gap['learning_resources'] = json_decode($gap['learning_resources'], true) ?? [];
            } else if (!isset($gap['learning_resources'])) {
                $gap['learning_resources'] = [];
            }
        }
        
        // Return as proper JSON structure
        Response::success([
            'skillGaps' => $gaps ?: [],
            'total' => count($gaps)
        ]);
    }
    
    /**
     * Bulk add skills
     */
    public function bulkAddSkills(): void {
        $userId = $GLOBALS['auth_user_id'];
        $skills = Request::get('skills', []);
        
        if (!is_array($skills) || empty($skills)) {
            Response::error('skills array is required');
        }
        
        $added = 0;
        foreach ($skills as $skill) {
            if (isset($skill['skill_name'])) {
                $this->db->query(
                    "INSERT INTO skills (user_id, skill_name, level, category) 
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE level = VALUES(level), category = VALUES(category)",
                    [
                        $userId,
                        $skill['skill_name'],
                        $skill['level'] ?? 'beginner',
                        $skill['category'] ?? 'general'
                    ]
                );
                $added++;
            }
        }
        
        Response::success(['added' => $added], "Added {$added} skills");
    }
}
