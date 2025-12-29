<?php
/**
 * User Profile Controller
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class ProfileController {
    private Database $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Get user profile
     */
    public function getProfile(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $user = $this->db->fetch(
            "SELECT u.*, up.education, up.experience, up.interests, up.resume_url, up.resume_text,
                    up.linkedin_url, up.github_url, up.portfolio_url
             FROM users u
             LEFT JOIN user_profiles up ON u.id = up.user_id
             WHERE u.id = ?",
            [$userId]
        );
        
        if (!$user) {
            Response::notFound('Profile not found');
        }
        
        unset($user['password']);
        
        // Parse JSON fields
        $user['education'] = json_decode($user['education'], true) ?? [];
        $user['experience'] = json_decode($user['experience'], true) ?? [];
        $user['interests'] = json_decode($user['interests'], true) ?? [];
        
        // Get skills
        $user['skills'] = $this->db->fetchAll(
            "SELECT id, skill_name, level, category, years_experience FROM skills WHERE user_id = ?",
            [$userId]
        );
        
        Response::success($user);
    }
    
    /**
     * Update user profile
     */
    public function updateProfile(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::getJson();
        
        // Update users table
        $userFields = [];
        if (isset($data['name'])) $userFields['name'] = $data['name'];
        if (isset($data['career_goal'])) $userFields['career_goal'] = $data['career_goal'];
        if (isset($data['current_level'])) $userFields['current_level'] = $data['current_level'];
        
        if (!empty($userFields)) {
            $this->db->update('users', $userFields, 'id = ?', [$userId]);
        }
        
        // Update user_profiles table
        $profileFields = [];
        if (isset($data['education'])) $profileFields['education'] = json_encode($data['education']);
        if (isset($data['experience'])) $profileFields['experience'] = json_encode($data['experience']);
        if (isset($data['interests'])) $profileFields['interests'] = json_encode($data['interests']);
        if (isset($data['linkedin_url'])) $profileFields['linkedin_url'] = $data['linkedin_url'];
        if (isset($data['github_url'])) $profileFields['github_url'] = $data['github_url'];
        if (isset($data['portfolio_url'])) $profileFields['portfolio_url'] = $data['portfolio_url'];
        
        if (!empty($profileFields)) {
            $this->db->update('user_profiles', $profileFields, 'user_id = ?', [$userId]);
        }
        
        Response::success(null, 'Profile updated successfully');
    }
    
    /**
     * Complete onboarding
     */
    public function completeOnboarding(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::getJson();
        
        // Update user
        $this->db->update('users', [
            'career_goal' => $data['career_goal'] ?? null,
            'current_level' => $data['current_level'] ?? 'beginner',
            'onboarding_completed' => true
        ], 'id = ?', [$userId]);
        
        // Update profile
        $this->db->update('user_profiles', [
            'education' => json_encode($data['education'] ?? []),
            'interests' => json_encode($data['interests'] ?? [])
        ], 'user_id = ?', [$userId]);
        
        // Add skills if provided
        if (isset($data['skills']) && is_array($data['skills'])) {
            foreach ($data['skills'] as $skill) {
                $this->db->query(
                    "INSERT INTO skills (user_id, skill_name, level, category) 
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE level = VALUES(level)",
                    [$userId, $skill['name'], $skill['level'] ?? 'beginner', $skill['category'] ?? 'general']
                );
            }
        }
        
        // Create initial goal if provided
        if (isset($data['target_role'])) {
            $this->db->insert('goals', [
                'user_id' => $userId,
                'target_role' => $data['target_role'],
                'timeline' => $data['timeline'] ?? '6 months',
                'priority' => 'high',
                'status' => 'active'
            ]);
        }
        
        Response::success(null, 'Onboarding completed');
    }
    
    /**
     * Upload resume
     */
    public function uploadResume(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        if (!isset($_FILES['resume'])) {
            Response::error('No file uploaded');
        }
        
        $file = $_FILES['resume'];
        $allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!in_array($file['type'], $allowedTypes)) {
            Response::error('Invalid file type. Please upload PDF or Word document.');
        }
        
        $uploadDir = __DIR__ . '/../uploads/resumes/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $filename = $userId . '_' . time() . '_' . basename($file['name']);
        $filepath = $uploadDir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $this->db->update('user_profiles', [
                'resume_url' => '/uploads/resumes/' . $filename
            ], 'user_id = ?', [$userId]);
            
            Response::success(['resume_url' => '/uploads/resumes/' . $filename], 'Resume uploaded');
        } else {
            Response::error('Failed to upload file', 500);
        }
    }
}
