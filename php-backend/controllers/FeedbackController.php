<?php
/**
 * Feedback Controller
 * Handles career feedback analysis and management
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class FeedbackController {
    private Database $db;
    private string $pythonApiUrl;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->pythonApiUrl = getenv('PYTHON_API_URL') ?: 'http://localhost:5000';
    }
    
    /**
     * Get all feedback for user
     */
    public function getFeedback(): void {
        $userId = $GLOBALS['auth_user_id'];
        $source = Request::get('source');
        $limit = (int) Request::get('limit', 20);
        
        $sql = "SELECT * FROM feedback WHERE user_id = ?";
        $params = [$userId];
        
        if ($source) {
            $sql .= " AND source = ?";
            $params[] = $source;
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT ?";
        $params[] = $limit;
        
        $feedback = $this->db->fetchAll($sql, $params);
        
        // Parse action_items JSON
        foreach ($feedback as &$fb) {
            $fb['action_items'] = json_decode($fb['action_items'], true) ?? [];
        }
        
        Response::success($feedback);
    }
    
    /**
     * Get single feedback
     */
    public function getFeedbackItem(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $feedbackId = $params['id'];
        
        $feedback = $this->db->fetch(
            "SELECT * FROM feedback WHERE id = ? AND user_id = ?",
            [$feedbackId, $userId]
        );
        
        if (!$feedback) {
            Response::notFound('Feedback not found');
        }
        
        $feedback['action_items'] = json_decode($feedback['action_items'], true) ?? [];
        
        Response::success($feedback);
    }
    
    /**
     * Create feedback
     */
    public function createFeedback(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::validate([
            'source' => 'required',
            'message' => 'required|min:5'
        ]);
        
        $feedbackId = $this->db->insert('feedback', [
            'user_id' => $userId,
            'source' => $data['source'],
            'company' => Request::get('company'),
            'role' => Request::get('role'),
            'message' => $data['message'],
            'sentiment' => Request::get('sentiment', 'neutral'),
            'interview_type' => Request::get('interview_type'),
            'stage' => Request::get('stage')
        ]);
        
        Response::success(['id' => $feedbackId], 'Feedback saved');
    }
    
    /**
     * Update feedback with analysis
     */
    public function updateFeedback(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $feedbackId = $params['id'];
        $data = Request::getJson();
        
        $fields = [];
        if (isset($data['analysis'])) $fields['analysis'] = $data['analysis'];
        if (isset($data['sentiment'])) $fields['sentiment'] = $data['sentiment'];
        if (isset($data['action_items'])) $fields['action_items'] = json_encode($data['action_items']);
        
        if (empty($fields)) {
            Response::error('No fields to update');
        }
        
        $this->db->update('feedback', $fields, 'id = ? AND user_id = ?', [$feedbackId, $userId]);
        
        Response::success(null, 'Feedback updated');
    }
    
    /**
     * Delete feedback
     */
    public function deleteFeedback(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $feedbackId = $params['id'];
        
        $this->db->delete('feedback', 'id = ? AND user_id = ?', [$feedbackId, $userId]);
        
        Response::success(null, 'Feedback deleted');
    }
    
    /**
     * Get feedback stats
     */
    public function getStats(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $stats = $this->db->fetch(
            "SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN source = 'rejection' THEN 1 ELSE 0 END) as rejections,
                SUM(CASE WHEN source = 'interview' THEN 1 ELSE 0 END) as interviews,
                SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
                SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative
             FROM feedback WHERE user_id = ?",
            [$userId]
        );
        
        Response::success([
            'total' => (int) $stats['total'],
            'rejections' => (int) $stats['rejections'],
            'interviews' => (int) $stats['interviews'],
            'positive' => (int) $stats['positive'],
            'negative' => (int) $stats['negative']
        ]);
    }
    
    /**
     * Comprehensive feedback analysis using AI
     * Calls Python agent for detailed career feedback analysis
     */
    public function analyzeComprehensive(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::getJson();
        
        // Validate required fields
        if (empty($data['source'])) {
            Response::error('Source is required');
            return;
        }
        if (empty($data['message'])) {
            Response::error('Feedback message is required');
            return;
        }
        
        // Prepare feedback data
        $feedbackData = [
            'source' => $data['source'],
            'company' => $data['company'] ?? null,
            'role' => $data['role'] ?? null,
            'message' => $data['message'],
            'interview_type' => $data['interview_type'] ?? null,
            'stage' => $data['stage'] ?? null
        ];
        
        // Call Python agent for comprehensive analysis
        $response = $this->callPythonAgent('/api/agent/feedback/comprehensive', [
            'user_id' => $userId,
            'feedback_data' => $feedbackData
        ]);
        
        if (!$response || $response['status'] !== 'success') {
            Response::error($response['message'] ?? 'Analysis failed');
            return;
        }
        
        Response::success([
            'analysis' => $response['analysis'],
            'processing_time_ms' => $response['processing_time_ms'] ?? null
        ], 'Feedback analyzed successfully');
    }
    
    /**
     * Analyze feedback and save to database
     * Creates both feedback entry and detailed analysis
     */
    public function analyzeAndSave(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::getJson();
        
        // Validate required fields
        if (empty($data['source'])) {
            Response::error('Source is required');
            return;
        }
        if (empty($data['message'])) {
            Response::error('Feedback message is required');
            return;
        }
        
        // Map source to valid enum values
        $sourceMap = [
            'rejection_email' => 'rejection',
            'interview_feedback' => 'interview',
            'self_reflection' => 'self',
            'mentor_feedback' => 'mentor'
        ];
        $feedbackSource = $sourceMap[$data['source']] ?? $data['source'];
        
        // Create feedback entry first
        $feedbackId = $this->db->insert('feedback', [
            'user_id' => $userId,
            'source' => $feedbackSource,
            'company' => $data['company'] ?? null,
            'role' => $data['role'] ?? null,
            'message' => $data['message'],
            'sentiment' => 'neutral',
            'interview_type' => $data['interview_type'] ?? null,
            'stage' => $data['stage'] ?? null
        ]);
        
        // Prepare feedback data for analysis
        $feedbackData = [
            'source' => $data['source'],
            'company' => $data['company'] ?? null,
            'role' => $data['role'] ?? null,
            'message' => $data['message'],
            'interview_type' => $data['interview_type'] ?? null,
            'stage' => $data['stage'] ?? null
        ];
        
        // Call Python agent for comprehensive analysis
        $response = $this->callPythonAgent('/api/agent/feedback/analyze-and-save', [
            'user_id' => $userId,
            'feedback_data' => $feedbackData
        ]);
        
        if (!$response || $response['status'] !== 'success') {
            // Still return the feedback ID even if analysis fails
            Response::success([
                'feedback_id' => $feedbackId,
                'analysis' => null,
                'analysis_error' => $response['message'] ?? 'Analysis failed'
            ], 'Feedback saved but analysis failed');
            return;
        }
        
        $analysisData = $response['data_for_save'] ?? [];
        $analysis = $response['analysis'] ?? [];
        
        // Save to feedback_analysis table
        try {
            $analysisId = $this->db->insert('feedback_analysis', [
                'user_id' => $userId,
                'feedback_id' => $feedbackId,
                'source' => $data['source'],
                'company' => $data['company'] ?? null,
                'role' => $data['role'] ?? null,
                'original_message' => $data['message'],
                'identified_reasons' => json_encode($analysisData['identified_reasons'] ?? []),
                'skill_gaps' => json_encode($analysisData['skill_gaps'] ?? []),
                'behavioral_gaps' => json_encode($analysisData['behavioral_gaps'] ?? []),
                'resume_issues' => json_encode($analysisData['resume_issues'] ?? []),
                'technical_gaps' => json_encode($analysisData['technical_gaps'] ?? []),
                'strengths_detected' => json_encode($analysisData['strengths_detected'] ?? []),
                'confidence_level' => $analysisData['confidence_level'] ?? 'medium',
                'readiness_score' => $analysisData['readiness_score'] ?? 50,
                'recommended_actions' => json_encode($analysisData['recommended_actions'] ?? []),
                'learning_plan' => json_encode($analysisData['learning_plan'] ?? []),
                'project_suggestions' => json_encode($analysisData['project_suggestions'] ?? []),
                'resume_improvements' => json_encode($analysisData['resume_improvements'] ?? []),
                'next_steps' => json_encode($analysisData['next_steps'] ?? []),
                'summary_message' => $analysisData['summary_message'] ?? '',
                'processing_time_ms' => $response['processing_time_ms'] ?? null
            ]);
            
            // Update feedback with analysis summary and link
            $this->db->update('feedback', [
                'analysis' => $analysisData['summary_message'] ?? '',
                'action_items' => json_encode($analysisData['next_steps'] ?? []),
                'analyzed' => true,
                'analysis_id' => $analysisId,
                'sentiment' => $this->inferSentiment($analysis)
            ], 'id = ?', [$feedbackId]);
            
            // Create learning priorities from the learning plan
            $this->saveLearningPriorities($userId, $analysisId, $analysisData['learning_plan'] ?? []);
            
        } catch (\Exception $e) {
            // Log error but don't fail - we still have the analysis
            error_log("Failed to save feedback analysis: " . $e->getMessage());
        }
        
        Response::success([
            'feedback_id' => $feedbackId,
            'analysis_id' => $analysisId ?? null,
            'analysis' => $analysis,
            'processing_time_ms' => $response['processing_time_ms'] ?? null
        ], 'Feedback analyzed and saved successfully');
    }
    
    /**
     * Get analysis for a specific feedback
     */
    public function getAnalysis(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $feedbackId = $params['id'];
        
        $analysis = $this->db->fetch(
            "SELECT * FROM feedback_analysis WHERE feedback_id = ? AND user_id = ?",
            [$feedbackId, $userId]
        );
        
        if (!$analysis) {
            Response::notFound('Analysis not found');
            return;
        }
        
        // Parse JSON fields
        $jsonFields = ['identified_reasons', 'skill_gaps', 'behavioral_gaps', 'resume_issues', 
                       'technical_gaps', 'strengths_detected', 'recommended_actions', 
                       'learning_plan', 'project_suggestions', 'resume_improvements', 'next_steps'];
        
        foreach ($jsonFields as $field) {
            if (isset($analysis[$field])) {
                $analysis[$field] = json_decode($analysis[$field], true) ?? [];
            }
        }
        
        Response::success($analysis);
    }
    
    /**
     * Get all analyses for user
     */
    public function getAllAnalyses(): void {
        $userId = $GLOBALS['auth_user_id'];
        $limit = (int) Request::get('limit', 20);
        
        $analyses = $this->db->fetchAll(
            "SELECT fa.*, f.message as original_feedback_message
             FROM feedback_analysis fa
             LEFT JOIN feedback f ON fa.feedback_id = f.id
             WHERE fa.user_id = ?
             ORDER BY fa.created_at DESC
             LIMIT ?",
            [$userId, $limit]
        );
        
        // Parse JSON fields
        $jsonFields = ['identified_reasons', 'skill_gaps', 'behavioral_gaps', 'resume_issues', 
                       'technical_gaps', 'strengths_detected', 'recommended_actions', 
                       'learning_plan', 'project_suggestions', 'resume_improvements', 'next_steps'];
        
        foreach ($analyses as &$analysis) {
            foreach ($jsonFields as $field) {
                if (isset($analysis[$field])) {
                    $analysis[$field] = json_decode($analysis[$field], true) ?? [];
                }
            }
        }
        
        Response::success([
            'analyses' => $analyses,
            'count' => count($analyses)
        ]);
    }
    
    /**
     * Get learning priorities for user
     */
    public function getLearningPriorities(): void {
        $userId = $GLOBALS['auth_user_id'];
        $status = Request::get('status');
        
        $sql = "SELECT * FROM learning_priorities WHERE user_id = ?";
        $params = [$userId];
        
        if ($status) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY priority_rank ASC, created_at DESC";
        
        $priorities = $this->db->fetchAll($sql, $params);
        
        Response::success([
            'priorities' => $priorities,
            'count' => count($priorities)
        ]);
    }
    
    /**
     * Update learning priority status
     */
    public function updateLearningPriority(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $priorityId = $params['id'];
        $data = Request::getJson();
        
        $fields = [];
        if (isset($data['status'])) $fields['status'] = $data['status'];
        if (isset($data['progress_percentage'])) $fields['progress_percentage'] = $data['progress_percentage'];
        
        if (empty($fields)) {
            Response::error('No fields to update');
            return;
        }
        
        $this->db->update('learning_priorities', $fields, 'id = ? AND user_id = ?', [$priorityId, $userId]);
        
        Response::success(null, 'Priority updated');
    }
    
    /**
     * Detect patterns across feedback history
     */
    public function detectPatterns(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        // Get feedback history
        $feedbackHistory = $this->db->fetchAll(
            "SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
            [$userId]
        );
        
        if (count($feedbackHistory) < 3) {
            Response::success([
                'patterns' => null,
                'message' => 'Need at least 3 feedback entries to detect patterns'
            ]);
            return;
        }
        
        // Call Python agent for pattern detection
        $response = $this->callPythonAgent('/api/agent/feedback/patterns', [
            'history' => $feedbackHistory
        ]);
        
        if (!$response) {
            Response::error('Pattern detection failed');
            return;
        }
        
        Response::success([
            'patterns' => $response['patterns'] ?? null,
            'status' => $response['status'] ?? 'unknown'
        ]);
    }
    
    /**
     * Helper: Call Python agent API
     */
    private function callPythonAgent(string $endpoint, array $data): ?array {
        $url = $this->pythonApiUrl . $endpoint;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200 || !$response) {
            return null;
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Helper: Infer sentiment from analysis
     */
    private function inferSentiment(array $analysis): string {
        $readinessScore = $analysis['readiness_score'] ?? 50;
        $gapCount = count($analysis['skill_gaps'] ?? []) + 
                    count($analysis['behavioral_gaps'] ?? []) + 
                    count($analysis['technical_gaps'] ?? []);
        $strengthCount = count($analysis['strengths_detected'] ?? []);
        
        if ($readinessScore >= 70 && $strengthCount > $gapCount) {
            return 'positive';
        } elseif ($readinessScore < 40 || $gapCount > $strengthCount + 3) {
            return 'negative';
        }
        
        return 'neutral';
    }
    
    /**
     * Helper: Save learning priorities from analysis
     */
    private function saveLearningPriorities(int $userId, int $analysisId, array $learningPlan): void {
        if (empty($learningPlan)) return;
        
        $rank = 1;
        foreach ($learningPlan as $item) {
            if (!is_array($item)) continue;
            
            $this->db->insert('learning_priorities', [
                'user_id' => $userId,
                'feedback_analysis_id' => $analysisId,
                'area' => $item['area'] ?? 'General',
                'action' => $item['action'] ?? '',
                'timeline' => $item['timeline'] ?? null,
                'priority_rank' => $rank++,
                'status' => 'pending'
            ]);
        }
    }
}
