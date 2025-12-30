<?php
/**
 * Authentication Controller
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/JWT.php';

class AuthController {
    private Database $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Register new user
     */
    public function register(): void {
        $data = Request::validate([
            'name' => 'required|min:2',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ]);
        
        // Check if email exists
        $existing = $this->db->fetch(
            "SELECT id FROM users WHERE email = ?",
            [$data['email']]
        );
        
        if ($existing) {
            Response::error('Email already registered', 409);
        }
        
        // Create user
        $userId = $this->db->insert('users', [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT)
        ]);
        
        // Create profile
        $this->db->insert('user_profiles', ['user_id' => $userId]);
        
        // Generate token
        $token = JWT::encode(['user_id' => $userId, 'email' => $data['email']]);
        
        Response::success([
            'user' => [
                'id' => $userId,
                'name' => $data['name'],
                'email' => $data['email']
            ],
            'token' => $token
        ], 'Registration successful');
    }
    
    /**
     * Login user
     */
    public function login(): void {
        $data = Request::validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);
        
        $user = $this->db->fetch(
            "SELECT id, name, email, password, career_goal, current_level, readiness_score, onboarding_completed 
             FROM users WHERE email = ?",
            [$data['email']]
        );
        
        if (!$user || !password_verify($data['password'], $user['password'])) {
            Response::error('Invalid credentials', 401);
        }
        
        // Generate token
        $token = JWT::encode(['user_id' => $user['id'], 'email' => $user['email']]);
        
        unset($user['password']);
        
        Response::success([
            'user' => $user,
            'token' => $token
        ], 'Login successful');
    }
    
    /**
     * Get current user
     */
    public function me(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $user = $this->db->fetch(
            "SELECT u.id, u.name, u.email, u.career_goal, u.current_level, u.readiness_score, 
                    u.onboarding_completed, u.created_at,
                    up.education, up.experience, up.interests, up.resume_url
             FROM users u
             LEFT JOIN user_profiles up ON u.id = up.user_id
             WHERE u.id = ?",
            [$userId]
        );
        
        if (!$user) {
            Response::notFound('User not found');
        }
        
        // Parse JSON fields
        $user['education'] = json_decode($user['education'], true) ?? [];
        $user['experience'] = json_decode($user['experience'], true) ?? [];
        $user['interests'] = json_decode($user['interests'], true) ?? [];
        
        Response::success($user);
    }
    
    /**
     * Logout (invalidate token - for stateful implementation)
     */
    public function logout(): void {
        // For JWT, logout is handled client-side by removing the token
        Response::success(null, 'Logged out successfully');
    }
}
