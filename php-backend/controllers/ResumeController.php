<?php
/**
 * Resume Controller
 * Handles resume generation, tailoring, and management
 */

class ResumeController
{
    private $db;
    private $python_agent_url = 'http://localhost:5000';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Generate new resume
     */
    public function generateResume(): void
    {
        $data = Request::getJson();
        $userId = $GLOBALS['auth_user_id'];

        $targetRole = $data['target_role'] ?? null;
        $targetCompany = $data['target_company'] ?? null;
        $jobDescription = $data['job_description'] ?? null;
        $generatePdf = $data['generate_pdf'] ?? true;

        if (!$targetRole) {
            Response::error('Target role is required');
            return;
        }

        // Call Python agent
        $response = $this->callPythonAgent('/api/resume/generate', [
            'user_id' => $userId,
            'target_role' => $targetRole,
            'target_company' => $targetCompany,
            'job_description' => $jobDescription,
            'generate_pdf' => $generatePdf
        ]);

        if ($response && isset($response['status']) && $response['status'] === 'success') {
            Response::success($response, 'Resume generated successfully');
        } else {
            $errorMsg = $response['error'] ?? 'Failed to generate resume - Python agent returned error';
            Response::error($errorMsg, 500);
        }
    }

    /**
     * Tailor resume to job description
     */
    public function tailorResume(): void
    {
        $data = Request::getJson();
        $userId = $GLOBALS['auth_user_id'];

        $resumeId = $data['resume_id'] ?? null;
        $jobDescription = $data['job_description'] ?? null;
        $targetRole = $data['target_role'] ?? null;
        $targetCompany = $data['target_company'] ?? null;
        $generatePdf = $data['generate_pdf'] ?? true;

        if (!$jobDescription || !$targetRole) {
            Response::error('Job description and target role are required');
            return;
        }

        // Call Python agent
        $response = $this->callPythonAgent('/api/resume/tailor', [
            'user_id' => $userId,
            'resume_id' => $resumeId,
            'job_description' => $jobDescription,
            'target_role' => $targetRole,
            'target_company' => $targetCompany,
            'generate_pdf' => $generatePdf
        ]);

        if ($response && $response['status'] === 'success') {
            Response::success($response, 'Resume tailored successfully');
        } else {
            Response::error('Failed to tailor resume', 500);
        }
    }

    /**
     * Analyze resume match with job description
     */
    public function analyzeMatch(): void
    {
        $data = Request::getJson();
        $userId = $GLOBALS['auth_user_id'];

        $resumeId = $data['resume_id'] ?? null;
        $jobDescription = $data['job_description'] ?? null;

        if (!$jobDescription) {
            Response::error('Job description is required');
            return;
        }

        // Call Python agent
        $response = $this->callPythonAgent('/api/resume/analyze', [
            'user_id' => $userId,
            'resume_id' => $resumeId,
            'job_description' => $jobDescription
        ]);

        if ($response) {
            Response::success($response);
        } else {
            Response::error('Failed to analyze resume', 500);
        }
    }

    /**
     * List all resumes for user
     */
    public function listResumes(): void
    {
        $userId = $GLOBALS['auth_user_id'];
        $activeOnly = Request::get('active_only') === 'true';

        $query = "SELECT * FROM resumes WHERE user_id = ?";
        if ($activeOnly) {
            $query .= " AND is_active = TRUE";
        }
        $query .= " ORDER BY version DESC";

        $resumes = $this->db->fetchAll($query, [$userId]);

        // Parse JSON fields
        foreach ($resumes as &$resume) {
            if ($resume['resume_data']) {
                $resume['resume_data'] = json_decode($resume['resume_data'], true);
            }
            if ($resume['emphasis_areas']) {
                $resume['emphasis_areas'] = json_decode($resume['emphasis_areas'], true);
            }
        }

        Response::success([
            'resumes' => $resumes,
            'count' => count($resumes)
        ]);
    }

    /**
     * Get specific resume
     */
    public function getResume(array $params = []): void
    {
        $resumeId = $params['id'] ?? null;
        $userId = $GLOBALS['auth_user_id'];

        $resume = $this->db->fetch(
            "SELECT * FROM resumes WHERE id = ? AND user_id = ?",
            [$resumeId, $userId]
        );

        if (!$resume) {
            Response::error('Resume not found', 404);
            return;
        }

        // Parse JSON fields
        if ($resume['resume_data']) {
            $resume['resume_data'] = json_decode($resume['resume_data'], true);
        }
        if ($resume['emphasis_areas']) {
            $resume['emphasis_areas'] = json_decode($resume['emphasis_areas'], true);
        }

        Response::success(['resume' => $resume]);
    }

    /**
     * Get latest resume
     */
    public function getLatestResume(): void
    {
        $userId = $GLOBALS['auth_user_id'];
        $roleType = Request::get('role_type');

        $query = "SELECT * FROM resumes WHERE user_id = ?";
        $params = [$userId];

        if ($roleType) {
            $query .= " AND role_type = ?";
            $params[] = $roleType;
        }

        $query .= " ORDER BY version DESC LIMIT 1";

        $resume = $this->db->fetch($query, $params);

        if (!$resume) {
            Response::error('No resume found', 404);
            return;
        }

        // Parse JSON fields
        if ($resume['resume_data']) {
            $resume['resume_data'] = json_decode($resume['resume_data'], true);
        }
        if ($resume['emphasis_areas']) {
            $resume['emphasis_areas'] = json_decode($resume['emphasis_areas'], true);
        }

        Response::success(['resume' => $resume]);
    }

    /**
     * Deactivate resume
     */
    public function deactivateResume(array $params = []): void
    {
        $resumeId = $params['id'] ?? null;
        $userId = $GLOBALS['auth_user_id'];

        $this->db->query(
            "UPDATE resumes SET is_active = FALSE WHERE id = ? AND user_id = ?",
            [$resumeId, $userId]
        );

        Response::success(['message' => 'Resume deactivated']);
    }

    /**
     * Get resume improvement suggestions
     */
    public function getSuggestions(): void
    {
        $data = Request::getJson();
        $userId = $GLOBALS['auth_user_id'];
        $resumeId = $data['resume_id'] ?? null;

        // Call Python agent
        $response = $this->callPythonAgent('/api/resume/improve', [
            'user_id' => $userId,
            'resume_id' => $resumeId
        ]);

        if ($response) {
            Response::success($response);
        } else {
            Response::error('Failed to get suggestions', 500);
        }
    }

    /**
     * Download resume PDF
     */
    public function downloadPdf(array $params = []): void
    {
        $resumeId = $params['id'] ?? null;
        $userId = $GLOBALS['auth_user_id'];

        $resume = $this->db->fetch(
            "SELECT file_path FROM resumes WHERE id = ? AND user_id = ? AND pdf_generated = TRUE",
            [$resumeId, $userId]
        );

        if (!$resume || !$resume['file_path']) {
            Response::error('PDF not found', 404);
            return;
        }

        $filePath = $resume['file_path'];

        if (!file_exists($filePath)) {
            Response::error('PDF file does not exist', 404);
            return;
        }

        // Set headers for PDF download
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
        header('Content-Length: ' . filesize($filePath));

        readfile($filePath);
        exit;
    }

    /**
     * Helper: Call Python agent service
     */
    private function callPythonAgent(string $endpoint, array $data): ?array
    {
        $url = $this->python_agent_url . $endpoint;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 120); // 2 minute timeout for LLM calls
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            error_log("Python agent curl error: " . $curlError);
            return null;
        }

        if ($httpCode === 200 && $response) {
            return json_decode($response, true);
        }

        error_log("Python agent returned HTTP $httpCode: " . ($response ?: 'empty response'));
        return null;
    }
}
