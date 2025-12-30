<?php
/**
 * User Profile Controller
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../services/AgentService.php';

class ProfileController {
    private Database $db;
    private AgentService $agent;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->agent = new AgentService();
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
        
        // Get active goal for target_role
        $goal = $this->db->fetch(
            "SELECT target_role, target_company, timeline FROM goals WHERE user_id = ? AND status = 'active' LIMIT 1",
            [$userId]
        );
        if ($goal) {
            if (!$user['target_role']) {
                $user['target_role'] = $goal['target_role'];
            }
            $user['target_company'] = $goal['target_company'];
            $user['timeline'] = $goal['timeline'];
        }
        
        // Get education from separate education table if exists
        $educationRecord = $this->db->fetch(
            "SELECT education_level, field_of_study, institution, graduation_year FROM education WHERE user_id = ? ORDER BY id DESC LIMIT 1",
            [$userId]
        );
        if ($educationRecord) {
            if (!$user['education_level']) {
                $user['education_level'] = $educationRecord['education_level'];
            }
            if (!$user['field_of_study']) {
                $user['field_of_study'] = $educationRecord['field_of_study'];
            }
            $user['institution'] = $educationRecord['institution'];
            $user['graduation_year'] = $educationRecord['graduation_year'];
        }
        
        // Get career readiness score history
        $readinessHistory = $this->db->fetchAll(
            "SELECT score, breakdown_json, created_at FROM career_readiness WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
            [$userId]
        );
        if ($readinessHistory) {
            foreach ($readinessHistory as &$entry) {
                $entry['breakdown'] = json_decode($entry['breakdown_json'], true) ?? [];
                unset($entry['breakdown_json']);
            }
            $user['readiness_history'] = $readinessHistory;
        }
        
        Response::success($user);
    }
    
    /**
     * Update user profile
     */
    public function updateProfile(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::getJson();
        
        // Track what changed for agent notification
        $skillsChanged = false;
        $goalChanged = false;
        $educationChanged = false;
        
        // Update users table - all profile fields
        $userFields = [];
        if (isset($data['name'])) $userFields['name'] = $data['name'];
        if (isset($data['career_goal'])) {
            $userFields['career_goal'] = $data['career_goal'];
            $goalChanged = true;
        }
        if (isset($data['current_level'])) $userFields['current_level'] = $data['current_level'];
        
        // Education fields stored directly in users table
        if (isset($data['education_level'])) {
            $userFields['education_level'] = $data['education_level'];
            $educationChanged = true;
        }
        if (isset($data['field_of_study'])) {
            $userFields['field_of_study'] = $data['field_of_study'];
            $educationChanged = true;
        }
        if (isset($data['experience_years'])) {
            $userFields['experience_years'] = (int)$data['experience_years'];
        }
        
        // Target role - save both to users table and goals table
        if (isset($data['target_role'])) {
            $userFields['target_role'] = $data['target_role'];
            $userFields['career_goal'] = $data['target_role'];
            $goalChanged = true;
            
            // Update or create goal
            $existingGoal = $this->db->fetch(
                "SELECT id FROM goals WHERE user_id = ? AND status = 'active' LIMIT 1",
                [$userId]
            );
            
            if ($existingGoal) {
                $this->db->update('goals', ['target_role' => $data['target_role']], 'id = ?', [$existingGoal['id']]);
            } else {
                $this->db->insert('goals', [
                    'user_id' => $userId,
                    'target_role' => $data['target_role'],
                    'timeline' => $data['timeline'] ?? '3 months',
                    'priority' => 'high',
                    'status' => 'active'
                ]);
            }
            
            // Log career event
            $this->logCareerEvent($userId, 'goal_set', [
                'target_role' => $data['target_role'],
                'timeline' => $data['timeline'] ?? '3 months'
            ], "Set career goal: " . $data['target_role']);
        }
        
        if (!empty($userFields)) {
            $this->db->update('users', $userFields, 'id = ?', [$userId]);
        }
        
        // Update education table
        if ($educationChanged) {
            $educationData = [
                'education_level' => $data['education_level'] ?? null,
                'field_of_study' => $data['field_of_study'] ?? null,
                'institution' => $data['institution'] ?? null,
                'graduation_year' => $data['graduation_year'] ?? null
            ];
            
            $existingEducation = $this->db->fetch(
                "SELECT id FROM education WHERE user_id = ?",
                [$userId]
            );
            
            if ($existingEducation) {
                $this->db->update('education', $educationData, 'user_id = ?', [$userId]);
            } else {
                $educationData['user_id'] = $userId;
                $this->db->insert('education', $educationData);
            }
            
            // Log career event
            $this->logCareerEvent($userId, 'goal_updated', [
                'education_level' => $data['education_level'] ?? null,
                'field_of_study' => $data['field_of_study'] ?? null
            ], "Updated education information");
        }
        
        // Update user_profiles table for JSON fields
        $profileFields = [];
        if (isset($data['education']) && is_array($data['education'])) {
            $profileFields['education'] = json_encode($data['education']);
        }
        if (isset($data['experience']) && is_array($data['experience'])) {
            $profileFields['experience'] = json_encode($data['experience']);
        }
        if (isset($data['interests'])) {
            $profileFields['interests'] = json_encode($data['interests']);
            $skillsChanged = true;
        }
        if (isset($data['linkedin_url'])) $profileFields['linkedin_url'] = $data['linkedin_url'];
        if (isset($data['github_url'])) $profileFields['github_url'] = $data['github_url'];
        if (isset($data['portfolio_url'])) $profileFields['portfolio_url'] = $data['portfolio_url'];
        
        if (!empty($profileFields)) {
            // Check if profile exists
            $existingProfile = $this->db->fetch(
                "SELECT id FROM user_profiles WHERE user_id = ?",
                [$userId]
            );
            
            if ($existingProfile) {
                $this->db->update('user_profiles', $profileFields, 'user_id = ?', [$userId]);
            } else {
                $profileFields['user_id'] = $userId;
                $this->db->insert('user_profiles', $profileFields);
            }
        }
        
        // Recalculate career readiness score if profile changed significantly
        if ($goalChanged || $skillsChanged || $educationChanged) {
            try {
                $this->calculateAndSaveReadiness($userId);
            } catch (Exception $e) {
                error_log("Readiness calculation error: " . $e->getMessage());
            }
        }
        
        // Trigger agent for profile update if goal or skills changed
        if ($goalChanged || $skillsChanged) {
            try {
                $agentResult = $this->agent->runUnifiedAgent($userId, 'profile_update', [
                    'skills_changed' => $skillsChanged,
                    'goal_changed' => $goalChanged
                ]);
            } catch (Exception $e) {
                // Log but don't fail the request
                error_log("Agent profile_update error: " . $e->getMessage());
            }
        }
        
        Response::success([
            'message' => 'Profile updated successfully',
            'agent_triggered' => $goalChanged || $skillsChanged
        ]);
    }
    
    /**
     * Log career event
     */
    private function logCareerEvent(int $userId, string $eventType, array $eventData, string $description): void {
        try {
            $this->db->insert('career_events', [
                'user_id' => $userId,
                'event_type' => $eventType,
                'event_data' => json_encode($eventData),
                'description' => $description
            ]);
        } catch (Exception $e) {
            error_log("Failed to log career event: " . $e->getMessage());
        }
    }
    
    /**
     * Calculate and save career readiness score
     */
    private function calculateAndSaveReadiness(int $userId): void {
        // Get user data
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
        
        $breakdown = [
            'skills' => $skillsScore,
            'education' => $educationScore,
            'goals' => $goalsScore,
            'progress' => $progressScore,
            'applications' => $applicationsScore
        ];
        
        // Save to career_readiness table
        $this->db->insert('career_readiness', [
            'user_id' => $userId,
            'score' => $overallScore,
            'breakdown_json' => json_encode($breakdown),
            'skills_score' => $skillsScore,
            'education_score' => $educationScore,
            'goals_score' => $goalsScore,
            'progress_score' => $progressScore,
            'applications_score' => $applicationsScore
        ]);
        
        // Update user's readiness score
        $this->db->update('users', ['readiness_score' => $overallScore], 'id = ?', [$userId]);
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
