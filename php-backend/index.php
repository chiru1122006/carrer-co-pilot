<?php
/**
 * API Entry Point
 * Main router configuration
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);

// CORS headers
$config = require __DIR__ . '/config/database.php';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $config['allowed_origins'])) {
    header("Access-Control-Allow-Origin: {$origin}");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 86400");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Autoload
require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/JWT.php';

// Controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ProfileController.php';
require_once __DIR__ . '/controllers/SkillsController.php';
require_once __DIR__ . '/controllers/GoalsController.php';
require_once __DIR__ . '/controllers/PlansController.php';
require_once __DIR__ . '/controllers/ApplicationsController.php';
require_once __DIR__ . '/controllers/FeedbackController.php';
require_once __DIR__ . '/controllers/AgentController.php';
require_once __DIR__ . '/controllers/ResumeController.php';

// Initialize router
$router = new Router();

// Auth middleware
$router->addMiddleware('auth', function () {
    $token = Request::getBearerToken();

    if (!$token) {
        Response::unauthorized('No token provided');
        return false;
    }

    $payload = JWT::decode($token);

    if (!$payload) {
        Response::unauthorized('Invalid or expired token');
        return false;
    }

    $GLOBALS['auth_user_id'] = $payload['user_id'];
    return true;
});

// Controller instances
$authController = new AuthController();
$profileController = new ProfileController();
$skillsController = new SkillsController();
$goalsController = new GoalsController();
$plansController = new PlansController();
$applicationsController = new ApplicationsController();
$feedbackController = new FeedbackController();
$agentController = new AgentController();
$resumeController = new ResumeController();

// ==========================================
// PUBLIC ROUTES
// ==========================================

$router->get('/health', function () {
    Response::json([
        'status' => 'healthy',
        'service' => 'Career Agent API',
        'version' => '1.0.0',
        'timestamp' => date('c')
    ]);
});

// Auth routes
$router->post('/auth/register', [$authController, 'register']);
$router->post('/auth/login', [$authController, 'login']);

// ==========================================
// PROTECTED ROUTES
// ==========================================

// Auth
$router->get('/auth/me', [$authController, 'me'], ['auth']);
$router->post('/auth/logout', [$authController, 'logout'], ['auth']);

// Profile
$router->get('/profile', [$profileController, 'getProfile'], ['auth']);
$router->put('/profile', [$profileController, 'updateProfile'], ['auth']);
$router->post('/profile/onboarding', [$profileController, 'completeOnboarding'], ['auth']);
$router->post('/profile/resume', [$profileController, 'uploadResume'], ['auth']);

// Skills
$router->get('/skills', [$skillsController, 'getSkills'], ['auth']);
$router->get('/skills/gaps', [$skillsController, 'getSkillGaps'], ['auth']);
$router->post('/skills', [$skillsController, 'addSkill'], ['auth']);
$router->post('/skills/bulk', [$skillsController, 'bulkAddSkills'], ['auth']);
$router->put('/skills/{id}', [$skillsController, 'updateSkill'], ['auth']);
$router->delete('/skills/{id}', [$skillsController, 'deleteSkill'], ['auth']);

// Goals
$router->get('/goals', [$goalsController, 'getGoals'], ['auth']);
$router->get('/goals/primary', [$goalsController, 'getPrimaryGoal'], ['auth']);
$router->post('/goals', [$goalsController, 'createGoal'], ['auth']);
$router->put('/goals/{id}', [$goalsController, 'updateGoal'], ['auth']);
$router->delete('/goals/{id}', [$goalsController, 'deleteGoal'], ['auth']);
$router->get('/goals/{id}/gaps', [$goalsController, 'getSkillGaps'], ['auth']);

// Plans (Roadmap)
$router->get('/plans', [$plansController, 'getPlans'], ['auth']);
$router->get('/plans/current', [$plansController, 'getCurrentPlan'], ['auth']);
$router->get('/plans/summary', [$plansController, 'getRoadmapSummary'], ['auth']);
$router->get('/plans/{id}', [$plansController, 'getPlan'], ['auth']);
$router->put('/plans/{id}', [$plansController, 'updatePlan'], ['auth']);
$router->post('/plans/{id}/task', [$plansController, 'updateTask'], ['auth']);

// Applications
$router->get('/applications', [$applicationsController, 'getApplications'], ['auth']);
$router->get('/applications/stats', [$applicationsController, 'getStats'], ['auth']);
$router->get('/applications/opportunities', [$applicationsController, 'getOpportunities'], ['auth']);
$router->get('/applications/{id}', [$applicationsController, 'getApplication'], ['auth']);
$router->post('/applications', [$applicationsController, 'createApplication'], ['auth']);
$router->put('/applications/{id}', [$applicationsController, 'updateApplication'], ['auth']);
$router->delete('/applications/{id}', [$applicationsController, 'deleteApplication'], ['auth']);

// Feedback
$router->get('/feedback', [$feedbackController, 'getFeedback'], ['auth']);
$router->get('/feedback/stats', [$feedbackController, 'getStats'], ['auth']);
$router->get('/feedback/{id}', [$feedbackController, 'getFeedbackItem'], ['auth']);
$router->post('/feedback', [$feedbackController, 'createFeedback'], ['auth']);
$router->put('/feedback/{id}', [$feedbackController, 'updateFeedback'], ['auth']);
$router->delete('/feedback/{id}', [$feedbackController, 'deleteFeedback'], ['auth']);

// Resume routes
$router->get('/resume', [$resumeController, 'listResumes'], ['auth']);
$router->get('/resume/latest', [$resumeController, 'getLatestResume'], ['auth']);
$router->get('/resume/{id}', [$resumeController, 'getResume'], ['auth']);
$router->post('/resume/generate', [$resumeController, 'generateResume'], ['auth']);
$router->post('/resume/tailor', [$resumeController, 'tailorResume'], ['auth']);
$router->post('/resume/analyze', [$resumeController, 'analyzeMatch'], ['auth']);
$router->post('/resume/improve', [$resumeController, 'getSuggestions'], ['auth']);
$router->get('/resume/{id}/download', [$resumeController, 'downloadPdf'], ['auth']);
$router->delete('/resume/{id}', [$resumeController, 'deactivateResume'], ['auth']);

// Agent (AI) routes
$router->get('/agent/dashboard', [$agentController, 'getDashboard'], ['auth']);
$router->post('/agent/analyze', [$agentController, 'runAnalysis'], ['auth']);
$router->post('/agent/plan', [$agentController, 'analyzeAndPlan'], ['auth']);
$router->get('/agent/opportunities', [$agentController, 'getOpportunities'], ['auth']);
$router->post('/agent/skill-gaps', [$agentController, 'analyzeSkillGaps'], ['auth']);
$router->post('/agent/roadmap', [$agentController, 'generateRoadmap'], ['auth']);
$router->post('/agent/match-opportunities', [$agentController, 'matchOpportunities'], ['auth']);
$router->post('/agent/feedback', [$agentController, 'processFeedback'], ['auth']);
$router->post('/agent/analyze-feedback/{id}', [$agentController, 'analyzeFeedbackItem'], ['auth']);
$router->post('/agent/weekly-report', [$agentController, 'generateWeeklyReport'], ['auth']);
$router->post('/agent/readiness', [$agentController, 'calculateReadiness'], ['auth']);
$router->post('/agent/chat', [$agentController, 'chat'], ['auth']);
$router->get('/agent/chat/history', [$agentController, 'getChatHistory'], ['auth']);
$router->post('/agent/chat/clear', [$agentController, 'clearChatHistory'], ['auth']);
$router->get('/agent/state', [$agentController, 'getAgentState'], ['auth']);

// Dispatch request
$router->dispatch();
