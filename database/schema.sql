-- ============================================
-- AGENTIC AI CAREER DEVELOPMENT PLATFORM
-- MySQL Database Schema
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS career_agent_db;
USE career_agent_db;

-- ============================================
-- USERS TABLE
-- Stores user authentication and basic info
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    career_goal VARCHAR(255) DEFAULT NULL,
    current_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    readiness_score INT DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    education_level VARCHAR(100) DEFAULT NULL,
    field_of_study VARCHAR(200) DEFAULT NULL,
    target_role VARCHAR(150) DEFAULT NULL,
    experience_years INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- USER PROFILES TABLE
-- Extended profile information
-- ============================================
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    education JSON DEFAULT NULL,
    experience JSON DEFAULT NULL,
    interests JSON DEFAULT NULL,
    resume_url VARCHAR(500) DEFAULT NULL,
    resume_text TEXT DEFAULT NULL,
    linkedin_url VARCHAR(500) DEFAULT NULL,
    github_url VARCHAR(500) DEFAULT NULL,
    portfolio_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SKILLS TABLE
-- User skills with proficiency levels
-- ============================================
CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    category VARCHAR(50) DEFAULT 'general',
    years_experience DECIMAL(3,1) DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_name)
);

-- ============================================
-- GOALS TABLE
-- Career goals and targets
-- ============================================
CREATE TABLE goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_role VARCHAR(150) NOT NULL,
    target_company VARCHAR(150) DEFAULT NULL,
    timeline VARCHAR(50) DEFAULT NULL,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    status ENUM('active', 'achieved', 'paused', 'abandoned') DEFAULT 'active',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SKILL GAPS TABLE
-- Identified skill gaps for target roles
-- ============================================
CREATE TABLE skill_gaps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    current_level ENUM('none', 'beginner', 'intermediate', 'advanced') DEFAULT 'none',
    required_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

-- ============================================
-- PLANS TABLE
-- Weekly learning plans/roadmaps
-- ============================================
CREATE TABLE plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_id INT DEFAULT NULL,
    week_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    tasks JSON NOT NULL,
    milestones JSON DEFAULT NULL,
    ai_notes TEXT DEFAULT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    progress_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL
);

-- ============================================
-- MEMORY VECTORS TABLE
-- Embeddings for semantic memory
-- ============================================
CREATE TABLE memory_vectors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    embedding JSON NOT NULL,
    type ENUM('resume', 'feedback', 'reasoning', 'goal', 'skill', 'interaction') NOT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- FEEDBACK TABLE
-- Interview feedback, rejections, etc.
-- ============================================
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    source ENUM('interview', 'rejection', 'self', 'mentor', 'ai', 'application') NOT NULL,
    company VARCHAR(150) DEFAULT NULL,
    role VARCHAR(150) DEFAULT NULL,
    message TEXT NOT NULL,
    analysis TEXT DEFAULT NULL,
    sentiment ENUM('positive', 'neutral', 'negative') DEFAULT 'neutral',
    action_items JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- APPLICATIONS TABLE
-- Job/internship applications
-- ============================================
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    company VARCHAR(150) NOT NULL,
    role VARCHAR(150) NOT NULL,
    job_url VARCHAR(500) DEFAULT NULL,
    match_percentage INT DEFAULT 0,
    status ENUM('saved', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn') DEFAULT 'saved',
    deadline DATE DEFAULT NULL,
    applied_date DATE DEFAULT NULL,
    resume_version VARCHAR(100) DEFAULT NULL,
    ai_tips TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- OPPORTUNITIES TABLE
-- AI-recommended opportunities
-- ============================================
CREATE TABLE opportunities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    requirements JSON DEFAULT NULL,
    location VARCHAR(150) DEFAULT NULL,
    job_type ENUM('full-time', 'part-time', 'internship', 'contract', 'remote') DEFAULT 'full-time',
    salary_range VARCHAR(100) DEFAULT NULL,
    url VARCHAR(500) DEFAULT NULL,
    deadline DATE DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AGENT SESSIONS TABLE
-- Track agent reasoning sessions
-- ============================================
CREATE TABLE agent_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_type ENUM('reasoning', 'skill_gap', 'planning', 'feedback', 'full_analysis') NOT NULL,
    input_data JSON NOT NULL,
    output_data JSON DEFAULT NULL,
    agent_thoughts TEXT DEFAULT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    duration_ms INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- WEEKLY REPORTS TABLE
-- AI-generated weekly progress reports
-- ============================================
CREATE TABLE weekly_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    summary TEXT NOT NULL,
    achievements JSON DEFAULT NULL,
    challenges JSON DEFAULT NULL,
    recommendations JSON DEFAULT NULL,
    readiness_delta INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- CHAT MESSAGES TABLE
-- Stores chat history for AI memory
-- ============================================
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    context JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- EDUCATION TABLE
-- User education details
-- ============================================
CREATE TABLE education (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    education_level VARCHAR(100) DEFAULT NULL,
    field_of_study VARCHAR(200) DEFAULT NULL,
    institution VARCHAR(200) DEFAULT NULL,
    graduation_year INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- RESUMES TABLE
-- Versioned resume storage with role-specific tailoring
-- ============================================
CREATE TABLE resumes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    version INT NOT NULL,
    role_type VARCHAR(150) NOT NULL,
    target_company VARCHAR(150) DEFAULT NULL,
    resume_data JSON NOT NULL,
    file_path VARCHAR(500) DEFAULT NULL,
    pdf_generated BOOLEAN DEFAULT FALSE,
    based_on_jd TEXT DEFAULT NULL,
    match_score INT DEFAULT 0,
    emphasis_areas JSON DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_version (user_id, version)
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_education_user ON education(user_id);
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_resumes_active ON resumes(user_id, is_active);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_skills_user ON skills(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_plans_user ON plans(user_id);
CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_memory_user_type ON memory_vectors(user_id, type);
CREATE INDEX idx_agent_sessions_user ON agent_sessions(user_id);

-- ============================================
-- SAMPLE DATA FOR DEMO
-- ============================================

-- Sample User
INSERT INTO users (name, email, password, career_goal, current_level, readiness_score, onboarding_completed) VALUES
('Alex Johnson', 'alex@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Full Stack Developer', 'intermediate', 65, TRUE);

-- Sample Profile
INSERT INTO user_profiles (user_id, education, experience, interests) VALUES
(1, '[{"degree": "B.S. Computer Science", "institution": "State University", "year": 2024}]', 
    '[{"title": "Web Development Intern", "company": "TechStartup Inc.", "duration": "3 months"}]',
    '["Web Development", "AI/ML", "Cloud Computing"]');

-- Sample Skills
INSERT INTO skills (user_id, skill_name, level, category, years_experience) VALUES
(1, 'JavaScript', 'intermediate', 'programming', 2.0),
(1, 'React', 'intermediate', 'frontend', 1.5),
(1, 'Python', 'beginner', 'programming', 0.5),
(1, 'HTML/CSS', 'advanced', 'frontend', 3.0),
(1, 'Git', 'intermediate', 'tools', 1.5),
(1, 'SQL', 'beginner', 'database', 0.5);

-- Sample Goal
INSERT INTO goals (user_id, target_role, target_company, timeline, priority, status) VALUES
(1, 'Full Stack Developer', 'Top Tech Company', '6 months', 'high', 'active');

-- Sample Skill Gaps
INSERT INTO skill_gaps (user_id, goal_id, skill_name, current_level, required_level, priority, status) VALUES
(1, 1, 'Node.js', 'beginner', 'advanced', 'high', 'in_progress'),
(1, 1, 'TypeScript', 'none', 'intermediate', 'high', 'not_started'),
(1, 1, 'System Design', 'none', 'intermediate', 'medium', 'not_started'),
(1, 1, 'Docker', 'none', 'intermediate', 'medium', 'not_started'),
(1, 1, 'AWS', 'none', 'beginner', 'low', 'not_started');

-- Sample Plan
INSERT INTO plans (user_id, goal_id, week_number, title, description, tasks, milestones, ai_notes, status, progress_percentage) VALUES
(1, 1, 1, 'Node.js Fundamentals', 'Master the basics of Node.js and server-side JavaScript', 
    '[{"id": 1, "title": "Complete Node.js basics course", "completed": true}, {"id": 2, "title": "Build REST API project", "completed": false}, {"id": 3, "title": "Learn Express.js framework", "completed": false}]',
    '["Understand event loop", "Create first API", "Handle async operations"]',
    'Focus on understanding async patterns. This is crucial for your full-stack journey.',
    'in_progress', 33),
(1, 1, 2, 'TypeScript Introduction', 'Learn TypeScript fundamentals for type-safe development',
    '[{"id": 1, "title": "TypeScript basics", "completed": false}, {"id": 2, "title": "Convert JS project to TS", "completed": false}]',
    '["Type annotations", "Interfaces", "Generics basics"]',
    'TypeScript will significantly improve your code quality and catch errors early.',
    'pending', 0);

-- Sample Application
INSERT INTO applications (user_id, company, role, match_percentage, status, deadline, ai_tips) VALUES
(1, 'TechCorp', 'Junior Full Stack Developer', 78, 'saved', '2025-02-15', 
    'Strong match for your React skills. Consider highlighting your internship project. Brush up on Node.js before applying.');

-- Sample Feedback
INSERT INTO feedback (user_id, source, company, role, message, analysis, sentiment, action_items) VALUES
(1, 'interview', 'StartupXYZ', 'Frontend Developer', 
    'Good React knowledge but struggled with system design questions. Communication was clear.',
    'The candidate shows strong frontend fundamentals but needs to work on architectural thinking and system design concepts.',
    'neutral',
    '["Study system design basics", "Practice explaining technical decisions", "Review common architecture patterns"]');

-- Sample Opportunity
INSERT INTO opportunities (title, company, description, requirements, location, job_type, salary_range, deadline) VALUES
('Junior Full Stack Developer', 'InnovateTech', 'Join our growing team to build modern web applications.',
    '["React", "Node.js", "SQL", "Git"]', 'Remote', 'full-time', '$60,000 - $80,000', '2025-02-28'),
('Frontend Developer Intern', 'DesignStudio', 'Summer internship focused on UI/UX development.',
    '["React", "CSS", "JavaScript"]', 'New York, NY', 'internship', '$25/hour', '2025-03-15');
