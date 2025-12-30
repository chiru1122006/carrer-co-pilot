<?php
/**
 * Projects Controller
 * Handles CRUD operations and AI-powered project recommendations
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class ProjectsController {
    private Database $db;
    private string $pythonApiUrl;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->pythonApiUrl = getenv('PYTHON_API_URL') ?: 'http://localhost:5000';
    }
    
    /**
     * Get all projects for user
     */
    public function getProjects(): void {
        $userId = $GLOBALS['auth_user_id'];
        $status = Request::get('status');
        
        $sql = "SELECT id, project_title, difficulty, description, skills_used, features, 
                       tech_stack, learning_outcomes, resume_value, status, progress_percentage,
                       github_url, demo_url, start_date, end_date, ai_generated, created_at
                FROM projects WHERE user_id = ?";
        $params = [$userId];
        
        if ($status) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $projects = $this->db->fetchAll($sql, $params);
        
        // Parse JSON fields
        foreach ($projects as &$project) {
            $project['skills_used'] = $this->parseJson($project['skills_used']);
            $project['features'] = $this->parseJson($project['features']);
            $project['tech_stack'] = $this->parseJson($project['tech_stack']);
            $project['learning_outcomes'] = $this->parseJson($project['learning_outcomes']);
        }
        
        Response::success([
            'projects' => $projects,
            'count' => count($projects)
        ]);
    }
    
    /**
     * Get single project
     */
    public function getProject(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $projectId = $params['id'];
        
        $project = $this->db->fetch(
            "SELECT * FROM projects WHERE id = ? AND user_id = ?",
            [$projectId, $userId]
        );
        
        if (!$project) {
            Response::error('Project not found', 404);
            return;
        }
        
        // Parse JSON fields
        $project['skills_used'] = $this->parseJson($project['skills_used']);
        $project['features'] = $this->parseJson($project['features']);
        $project['tech_stack'] = $this->parseJson($project['tech_stack']);
        $project['learning_outcomes'] = $this->parseJson($project['learning_outcomes']);
        
        Response::success(['project' => $project]);
    }
    
    /**
     * Create a new project
     */
    public function createProject(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::validate([
            'project_title' => 'required|min:1'
        ]);
        
        $projectId = $this->db->insert('projects', [
            'user_id' => $userId,
            'project_title' => $data['project_title'],
            'difficulty' => Request::get('difficulty', 'Intermediate'),
            'description' => Request::get('description', ''),
            'skills_used' => json_encode(Request::get('skills_used', [])),
            'features' => json_encode(Request::get('features', [])),
            'tech_stack' => json_encode(Request::get('tech_stack', [])),
            'learning_outcomes' => json_encode(Request::get('learning_outcomes', [])),
            'resume_value' => Request::get('resume_value', ''),
            'status' => Request::get('status', 'planned'),
            'progress_percentage' => Request::get('progress_percentage', 0),
            'github_url' => Request::get('github_url'),
            'demo_url' => Request::get('demo_url'),
            'ai_generated' => Request::get('ai_generated', false),
            'original_idea' => Request::get('original_idea', '')
        ]);
        
        // Log career event
        try {
            $this->db->insert('career_events', [
                'user_id' => $userId,
                'event_type' => 'project_created',
                'event_data' => json_encode([
                    'project_title' => $data['project_title'],
                    'difficulty' => Request::get('difficulty', 'Intermediate')
                ]),
                'description' => "Created project: " . $data['project_title']
            ]);
        } catch (Exception $e) {
            error_log("Failed to log career event: " . $e->getMessage());
        }
        
        Response::success(['id' => $projectId], 'Project created successfully');
    }
    
    /**
     * Update a project
     */
    public function updateProject(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $projectId = $params['id'];
        $data = Request::getJson();
        
        // Verify ownership
        $existing = $this->db->fetch(
            "SELECT id FROM projects WHERE id = ? AND user_id = ?",
            [$projectId, $userId]
        );
        
        if (!$existing) {
            Response::error('Project not found', 404);
            return;
        }
        
        $fields = [];
        $allowedFields = ['project_title', 'difficulty', 'description', 'status', 
                          'progress_percentage', 'github_url', 'demo_url', 'start_date', 
                          'end_date', 'resume_value'];
        $jsonFields = ['skills_used', 'features', 'tech_stack', 'learning_outcomes'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[$field] = $data[$field];
            }
        }
        
        foreach ($jsonFields as $field) {
            if (isset($data[$field])) {
                $fields[$field] = json_encode($data[$field]);
            }
        }
        
        if (empty($fields)) {
            Response::error('No fields to update');
            return;
        }
        
        $this->db->update('projects', $fields, 'id = ? AND user_id = ?', [$projectId, $userId]);
        
        // Check if status changed to completed
        if (isset($data['status']) && $data['status'] === 'completed') {
            try {
                $project = $this->db->fetch("SELECT project_title FROM projects WHERE id = ?", [$projectId]);
                $this->db->insert('career_events', [
                    'user_id' => $userId,
                    'event_type' => 'project_completed',
                    'event_data' => json_encode(['project_title' => $project['project_title']]),
                    'description' => "Completed project: " . $project['project_title']
                ]);
            } catch (Exception $e) {
                error_log("Failed to log career event: " . $e->getMessage());
            }
        }
        
        Response::success(null, 'Project updated successfully');
    }
    
    /**
     * Delete a project
     */
    public function deleteProject(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $projectId = $params['id'];
        
        $this->db->delete('projects', 'id = ? AND user_id = ?', [$projectId, $userId]);
        
        Response::success(null, 'Project deleted successfully');
    }
    
    /**
     * Get project statistics
     */
    public function getStats(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $stats = $this->db->fetch(
            "SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as planned,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused
             FROM projects WHERE user_id = ?",
            [$userId]
        );
        
        Response::success($stats);
    }
    
    /**
     * AI: Analyze user profile for project recommendations
     */
    public function analyzeForProjects(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $result = $this->callPythonAgent('/api/projects/analyze', [
            'user_id' => $userId
        ]);
        
        Response::success($result);
    }
    
    /**
     * AI: Get project suggestions
     */
    public function suggestProjects(): void {
        $userId = $GLOBALS['auth_user_id'];
        $count = Request::get('count', 5);
        
        $result = $this->callPythonAgent('/api/projects/suggest', [
            'user_id' => $userId,
            'count' => (int)$count
        ]);
        
        Response::success($result);
    }
    
    /**
     * AI: Improve user's project idea
     */
    public function improveIdea(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::validate([
            'idea' => 'required|min:5'
        ]);
        
        $result = $this->callPythonAgent('/api/projects/improve', [
            'user_id' => $userId,
            'idea' => $data['idea']
        ]);
        
        Response::success($result);
    }
    
    /**
     * AI: Chat for project recommendations
     */
    public function chatAboutProjects(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::validate([
            'message' => 'required|min:1'
        ]);
        
        $result = $this->callPythonAgent('/api/projects/chat', [
            'user_id' => $userId,
            'message' => $data['message'],
            'stage' => Request::get('stage', 'initial'),
            'previous_suggestions' => Request::get('previous_suggestions', [])
        ]);
        
        Response::success($result);
    }
    
    /**
     * AI: Save a project from AI suggestion
     */
    public function saveAIProject(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::validate([
            'project_data' => 'required'
        ]);
        
        $projectData = $data['project_data'];
        
        // Save directly to database
        $projectId = $this->db->insert('projects', [
            'user_id' => $userId,
            'project_title' => $projectData['project_title'] ?? 'Untitled Project',
            'difficulty' => $projectData['difficulty'] ?? 'Intermediate',
            'description' => $projectData['description'] ?? '',
            'skills_used' => json_encode($projectData['skills_used'] ?? []),
            'features' => json_encode($projectData['features'] ?? []),
            'tech_stack' => json_encode($projectData['tech_stack'] ?? []),
            'learning_outcomes' => json_encode($projectData['learning_outcomes'] ?? []),
            'resume_value' => $projectData['resume_value'] ?? '',
            'status' => 'planned',
            'ai_generated' => true,
            'ai_improved' => isset($projectData['improvements_made']),
            'original_idea' => $projectData['original_idea'] ?? ''
        ]);
        
        // Log career event
        try {
            $this->db->insert('career_events', [
                'user_id' => $userId,
                'event_type' => 'project_created',
                'event_data' => json_encode([
                    'project_title' => $projectData['project_title'] ?? 'Untitled',
                    'ai_generated' => true
                ]),
                'description' => "Created AI-suggested project: " . ($projectData['project_title'] ?? 'Untitled')
            ]);
        } catch (Exception $e) {
            error_log("Failed to log career event: " . $e->getMessage());
        }
        
        Response::success([
            'id' => $projectId,
            'project_title' => $projectData['project_title'] ?? 'Untitled'
        ], 'Project saved successfully');
    }
    
    /**
     * Helper: Call Python agent API
     */
    private function callPythonAgent(string $endpoint, array $data): array {
        $ch = curl_init($this->pythonApiUrl . $endpoint);
        
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_TIMEOUT => 60
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return ['status' => 'error', 'message' => 'Failed to connect to AI service'];
        }
        
        $result = json_decode($response, true);
        
        if ($httpCode >= 400) {
            return ['status' => 'error', 'message' => $result['error'] ?? 'AI service error'];
        }
        
        return $result ?: ['status' => 'error', 'message' => 'Invalid response from AI service'];
    }
    
    /**
     * Helper: Parse JSON field safely
     */
    private function parseJson($value) {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return $decoded !== null ? $decoded : [];
        }
        return $value ?: [];
    }
}
