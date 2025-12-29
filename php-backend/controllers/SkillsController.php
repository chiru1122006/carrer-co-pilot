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
        
        $skillId = $this->db->insert('skills', [
            'user_id' => $userId,
            'skill_name' => $data['skill_name'],
            'level' => Request::get('level', 'beginner'),
            'category' => Request::get('category', 'general'),
            'years_experience' => Request::get('years_experience', 0)
        ]);
        
        Response::success(['id' => $skillId], 'Skill added');
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
        
        Response::success(null, 'Skill deleted');
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
