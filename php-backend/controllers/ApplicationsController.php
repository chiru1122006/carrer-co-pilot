<?php
/**
 * Applications Controller
 */
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class ApplicationsController {
    private Database $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Get all applications for user
     */
    public function getApplications(): void {
        $userId = $GLOBALS['auth_user_id'];
        $status = Request::get('status');
        
        $sql = "SELECT * FROM applications WHERE user_id = ?";
        $params = [$userId];
        
        if ($status) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $applications = $this->db->fetchAll($sql, $params);
        
        Response::success($applications);
    }
    
    /**
     * Get single application
     */
    public function getApplication(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $appId = $params['id'];
        
        $app = $this->db->fetch(
            "SELECT * FROM applications WHERE id = ? AND user_id = ?",
            [$appId, $userId]
        );
        
        if (!$app) {
            Response::notFound('Application not found');
        }
        
        Response::success($app);
    }
    
    /**
     * Create application
     */
    public function createApplication(): void {
        $userId = $GLOBALS['auth_user_id'];
        $data = Request::validate([
            'company' => 'required|min:1',
            'role' => 'required|min:1'
        ]);
        
        $appId = $this->db->insert('applications', [
            'user_id' => $userId,
            'company' => $data['company'],
            'role' => $data['role'],
            'job_url' => Request::get('job_url'),
            'match_percentage' => Request::get('match_percentage', 0),
            'status' => Request::get('status', 'saved'),
            'deadline' => Request::get('deadline'),
            'notes' => Request::get('notes')
        ]);
        
        Response::success(['id' => $appId], 'Application created');
    }
    
    /**
     * Update application
     */
    public function updateApplication(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $appId = $params['id'];
        $data = Request::getJson();
        
        $fields = [];
        if (isset($data['status'])) {
            $fields['status'] = $data['status'];
            if ($data['status'] === 'applied' && !isset($data['applied_date'])) {
                $fields['applied_date'] = date('Y-m-d');
            }
        }
        if (isset($data['applied_date'])) $fields['applied_date'] = $data['applied_date'];
        if (isset($data['resume_version'])) $fields['resume_version'] = $data['resume_version'];
        if (isset($data['notes'])) $fields['notes'] = $data['notes'];
        if (isset($data['ai_tips'])) $fields['ai_tips'] = $data['ai_tips'];
        
        if (empty($fields)) {
            Response::error('No fields to update');
        }
        
        $this->db->update('applications', $fields, 'id = ? AND user_id = ?', [$appId, $userId]);
        
        Response::success(null, 'Application updated');
    }
    
    /**
     * Delete application
     */
    public function deleteApplication(array $params): void {
        $userId = $GLOBALS['auth_user_id'];
        $appId = $params['id'];
        
        $this->db->delete('applications', 'id = ? AND user_id = ?', [$appId, $userId]);
        
        Response::success(null, 'Application deleted');
    }
    
    /**
     * Get application stats
     */
    public function getStats(): void {
        $userId = $GLOBALS['auth_user_id'];
        
        $stats = $this->db->fetch(
            "SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'saved' THEN 1 ELSE 0 END) as saved,
                SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as applied,
                SUM(CASE WHEN status = 'interviewing' THEN 1 ELSE 0 END) as interviewing,
                SUM(CASE WHEN status = 'offered' THEN 1 ELSE 0 END) as offered,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                AVG(match_percentage) as avg_match
             FROM applications WHERE user_id = ?",
            [$userId]
        );
        
        Response::success([
            'total' => (int) $stats['total'],
            'saved' => (int) $stats['saved'],
            'applied' => (int) $stats['applied'],
            'interviewing' => (int) $stats['interviewing'],
            'offered' => (int) $stats['offered'],
            'rejected' => (int) $stats['rejected'],
            'avg_match' => round($stats['avg_match'] ?? 0)
        ]);
    }
    
    /**
     * Get opportunities (recommended jobs)
     */
    public function getOpportunities(): void {
        $opportunities = $this->db->fetchAll(
            "SELECT * FROM opportunities WHERE is_active = TRUE ORDER BY deadline ASC LIMIT 20"
        );
        
        // Parse requirements JSON
        foreach ($opportunities as &$opp) {
            $opp['requirements'] = json_decode($opp['requirements'], true) ?? [];
        }
        
        Response::success($opportunities);
    }
}
