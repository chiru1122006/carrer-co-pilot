-- ============================================
-- MIGRATION V6: PROJECTS TABLE
-- Projects Recommendation & Tracking System
-- ============================================

USE career_agent_db;

-- ============================================
-- PROJECTS TABLE
-- User projects for portfolio and skill development
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
    description TEXT NOT NULL,
    skills_used JSON NOT NULL,
    features JSON NOT NULL,
    tech_stack JSON NOT NULL,
    learning_outcomes JSON DEFAULT NULL,
    resume_value TEXT DEFAULT NULL,
    status ENUM('planned', 'in_progress', 'completed', 'paused', 'abandoned') DEFAULT 'planned',
    progress_percentage INT DEFAULT 0,
    github_url VARCHAR(500) DEFAULT NULL,
    demo_url VARCHAR(500) DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_improved BOOLEAN DEFAULT FALSE,
    original_idea TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- PROJECT TASKS TABLE
-- Breakdown of project tasks/milestones
-- ============================================
CREATE TABLE IF NOT EXISTS project_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    due_date DATE DEFAULT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(user_id, status);
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_user ON project_tasks(user_id);

-- ============================================
-- SAMPLE PROJECTS DATA
-- ============================================
INSERT INTO projects (user_id, project_title, difficulty, description, skills_used, features, tech_stack, learning_outcomes, resume_value, status, progress_percentage) VALUES
(1, 'Personal Portfolio Website', 'Beginner', 
    'A responsive portfolio website to showcase projects, skills, and professional experience.',
    '["HTML", "CSS", "JavaScript", "React"]',
    '["Responsive design", "Project showcase", "Contact form", "Dark mode toggle", "Smooth animations"]',
    '{"frontend": ["React", "Tailwind CSS"], "hosting": ["Netlify"]}',
    '["Building responsive layouts", "React component architecture", "CSS animations", "Deployment workflow"]',
    'Demonstrates frontend development skills and attention to design',
    'completed', 100),
(1, 'Task Management API', 'Intermediate',
    'A RESTful API for task management with authentication, CRUD operations, and filtering.',
    '["Node.js", "Express", "SQL", "JWT"]',
    '["User authentication", "CRUD for tasks", "Filtering and sorting", "Rate limiting", "API documentation"]',
    '{"backend": ["Node.js", "Express"], "database": ["MySQL"], "auth": ["JWT"]}',
    '["RESTful API design", "Database relationships", "Authentication patterns", "Error handling"]',
    'Shows backend development capabilities and understanding of REST principles',
    'in_progress', 60);

