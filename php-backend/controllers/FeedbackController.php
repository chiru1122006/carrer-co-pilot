<?php
/**
 * Feedback Controller
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class FeedbackController {
    private Database $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
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
            'sentiment' => Request::get('sentiment', 'neutral')
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
}
