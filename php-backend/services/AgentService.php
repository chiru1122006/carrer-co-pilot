<?php
/**
 * Agent Service Client
 * Communicates with Python Agent Service
 */
class AgentService {
    private string $baseUrl;
    
    public function __construct() {
        $config = require __DIR__ . '/../config/database.php';
        $this->baseUrl = $config['agent_service_url'];
    }
    
    /**
     * Make HTTP request to agent service
     */
    private function request(string $method, string $endpoint, array $data = []): array {
        $url = $this->baseUrl . $endpoint;
        
        $options = [
            'http' => [
                'method' => $method,
                'header' => "Content-Type: application/json\r\n",
                'timeout' => 30
            ]
        ];
        
        if ($method !== 'GET' && !empty($data)) {
            $options['http']['content'] = json_encode($data);
        }
        
        $context = stream_context_create($options);
        $response = @file_get_contents($url, false, $context);
        
        if ($response === false) {
            return ['error' => 'Agent service unavailable'];
        }
        
        return json_decode($response, true) ?? ['error' => 'Invalid response'];
    }
    
    /**
     * Run full analysis for user
     */
    public function runFullAnalysis(int $userId): array {
        return $this->request('POST', '/api/agent/analyze', ['user_id' => $userId]);
    }
    
    /**
     * Get dashboard data
     */
    public function getDashboard(int $userId): array {
        return $this->request('GET', "/api/agent/dashboard/{$userId}");
    }
    
    /**
     * Analyze and create plan
     */
    public function analyzeAndPlan(int $userId): array {
        return $this->request('POST', '/api/agent/plan', ['user_id' => $userId]);
    }
    
    /**
     * Get matched opportunities
     */
    public function getOpportunities(int $userId): array {
        return $this->request('GET', "/api/agent/opportunities/{$userId}");
    }
    
    /**
     * Analyze skill gaps
     */
    public function analyzeSkillGaps(array $skills, string $targetRole): array {
        return $this->request('POST', '/api/agent/skills/gaps', [
            'skills' => $skills,
            'target_role' => $targetRole
        ]);
    }
    
    /**
     * Create roadmap
     */
    public function createRoadmap(array $skillGaps, string $targetRole, string $timeline = '3 months'): array {
        return $this->request('POST', '/api/agent/planner/roadmap', [
            'skill_gaps' => $skillGaps,
            'target_role' => $targetRole,
            'timeline' => $timeline
        ]);
    }
    
    /**
     * Process feedback
     */
    public function processFeedback(int $userId, array $feedback): array {
        return $this->request('POST', '/api/agent/feedback/process', [
            'user_id' => $userId,
            'feedback' => $feedback
        ]);
    }
    
    /**
     * Generate weekly report
     */
    public function generateWeeklyReport(array $userData): array {
        return $this->request('POST', '/api/agent/feedback/weekly-report', $userData);
    }
    
    /**
     * Calculate readiness
     */
    public function calculateReadiness(array $skills, string $targetRole): array {
        return $this->request('POST', '/api/agent/reasoning/readiness', [
            'skills' => $skills,
            'target_role' => $targetRole
        ]);
    }
}
