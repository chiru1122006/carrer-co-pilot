-- ============================================
-- Migration V3: Add Agentic Persistence Tables
-- ============================================

USE career_agent_db;

-- ============================================
-- CAREER READINESS TABLE
-- Stores historical career readiness scores
-- ============================================
CREATE TABLE IF NOT EXISTS career_readiness (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    breakdown_json JSON DEFAULT NULL,
    skills_score INT DEFAULT 0,
    education_score INT DEFAULT 0,
    goals_score INT DEFAULT 0,
    progress_score INT DEFAULT 0,
    applications_score INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_career_readiness_user ON career_readiness(user_id);

-- ============================================
-- CAREER EVENTS TABLE
-- Stores career-related events/changes
-- ============================================
CREATE TABLE IF NOT EXISTS career_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_type ENUM('skill_added', 'skill_updated', 'goal_set', 'goal_updated', 'application_sent', 'interview', 'offer', 'rejection', 'feedback_received', 'plan_completed', 'milestone_reached') NOT NULL,
    event_data JSON DEFAULT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_career_events_user ON career_events(user_id);
CREATE INDEX IF NOT EXISTS idx_career_events_type ON career_events(event_type);

-- ============================================
-- LEARNING PROGRESS TABLE
-- Tracks learning progress over time
-- ============================================
CREATE TABLE IF NOT EXISTS learning_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT DEFAULT NULL,
    skill_name VARCHAR(100) DEFAULT NULL,
    progress_percentage INT DEFAULT 0,
    hours_spent DECIMAL(5,2) DEFAULT 0,
    notes TEXT DEFAULT NULL,
    week_number INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);

-- ============================================
-- AI FEEDBACK LOGS TABLE
-- Stores AI analysis logs for feedback
-- ============================================
CREATE TABLE IF NOT EXISTS ai_feedback_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    feedback_id INT DEFAULT NULL,
    prompt TEXT DEFAULT NULL,
    response TEXT DEFAULT NULL,
    parsed_insights JSON DEFAULT NULL,
    token_usage INT DEFAULT 0,
    model VARCHAR(100) DEFAULT 'openai/gpt-oss-20b:free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_logs_user ON ai_feedback_logs(user_id);

-- ============================================
-- USER MEMORY TABLE
-- Stores agent memory per user
-- ============================================
CREATE TABLE IF NOT EXISTS user_memory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    memory_key VARCHAR(100) NOT NULL,
    memory_value TEXT DEFAULT NULL,
    memory_type ENUM('preference', 'insight', 'context', 'pattern', 'recommendation') DEFAULT 'context',
    expires_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_memory_key (user_id, memory_key)
);

CREATE INDEX IF NOT EXISTS idx_user_memory_user ON user_memory(user_id);

-- ============================================
-- ADD ai_analysis column to feedback if not exists
-- ============================================
-- Check and add column for AI analysis storage
SET @columnExists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'career_agent_db' 
    AND TABLE_NAME = 'feedback' 
    AND COLUMN_NAME = 'ai_analysis'
);

-- Add ai_analysis column if not exists (for storing raw AI response)
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS ai_analysis TEXT DEFAULT NULL AFTER analysis;

-- ============================================
-- ENSURE INDEXES EXIST
-- ============================================
-- These are created with IF NOT EXISTS pattern above
