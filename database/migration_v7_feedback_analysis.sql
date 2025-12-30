-- ============================================
-- MIGRATION V7: Career Feedback Analysis System
-- Enhanced feedback analysis for career coaching
-- ============================================

USE career_agent_db;

-- ============================================
-- FEEDBACK ANALYSIS TABLE
-- Stores comprehensive AI-powered feedback analysis
-- ============================================
CREATE TABLE IF NOT EXISTS feedback_analysis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    feedback_id INT DEFAULT NULL,
    
    -- Source Information
    source ENUM('rejection_email', 'interview_feedback', 'self_reflection', 'mentor_feedback') NOT NULL,
    company VARCHAR(255) DEFAULT NULL,
    role VARCHAR(255) DEFAULT NULL,
    original_message TEXT NOT NULL,
    
    -- Analysis Results (stored as JSON for flexibility)
    identified_reasons JSON DEFAULT NULL,
    skill_gaps JSON DEFAULT NULL,
    behavioral_gaps JSON DEFAULT NULL,
    resume_issues JSON DEFAULT NULL,
    technical_gaps JSON DEFAULT NULL,
    strengths_detected JSON DEFAULT NULL,
    
    -- Confidence and Scoring
    confidence_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    readiness_score INT DEFAULT 0,
    
    -- Recommendations (stored as JSON)
    recommended_actions JSON DEFAULT NULL,
    learning_plan JSON DEFAULT NULL,
    project_suggestions JSON DEFAULT NULL,
    resume_improvements JSON DEFAULT NULL,
    next_steps JSON DEFAULT NULL,
    
    -- Summary
    summary_message TEXT DEFAULT NULL,
    
    -- Metadata
    analysis_version VARCHAR(20) DEFAULT '1.0',
    processing_time_ms INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE SET NULL
);

-- ============================================
-- FEEDBACK PATTERNS TABLE
-- Stores detected patterns across multiple feedback entries
-- ============================================
CREATE TABLE IF NOT EXISTS feedback_patterns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    
    -- Pattern Information
    pattern_type ENUM('recurring_skill_gap', 'interview_issue', 'resume_weakness', 'behavioral_pattern', 'positive_trend') NOT NULL,
    pattern_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    frequency INT DEFAULT 1,
    severity ENUM('critical', 'significant', 'minor') DEFAULT 'significant',
    
    -- Related Feedback IDs (JSON array)
    related_feedback_ids JSON DEFAULT NULL,
    
    -- Recommendations
    suggested_action TEXT DEFAULT NULL,
    
    -- Status
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- LEARNING PRIORITIES TABLE
-- Tracks user's learning priorities based on feedback analysis
-- ============================================
CREATE TABLE IF NOT EXISTS learning_priorities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    feedback_analysis_id INT DEFAULT NULL,
    
    -- Priority Details
    area VARCHAR(100) NOT NULL,
    action TEXT NOT NULL,
    timeline VARCHAR(50) DEFAULT NULL,
    priority_rank INT DEFAULT 1,
    
    -- Status
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
    progress_percentage INT DEFAULT 0,
    
    -- Source tracking
    source_type VARCHAR(50) DEFAULT 'feedback_analysis',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (feedback_analysis_id) REFERENCES feedback_analysis(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_feedback_analysis_user ON feedback_analysis(user_id);
CREATE INDEX idx_feedback_analysis_source ON feedback_analysis(source);
CREATE INDEX idx_feedback_analysis_created ON feedback_analysis(created_at);
CREATE INDEX idx_feedback_patterns_user ON feedback_patterns(user_id);
CREATE INDEX idx_feedback_patterns_type ON feedback_patterns(pattern_type);
CREATE INDEX idx_learning_priorities_user ON learning_priorities(user_id);
CREATE INDEX idx_learning_priorities_status ON learning_priorities(status);

-- ============================================
-- ALTER EXISTING FEEDBACK TABLE
-- Add additional fields for enhanced analysis
-- ============================================
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS interview_type VARCHAR(100) DEFAULT NULL AFTER role,
ADD COLUMN IF NOT EXISTS stage VARCHAR(100) DEFAULT NULL AFTER interview_type,
ADD COLUMN IF NOT EXISTS self_assessment TEXT DEFAULT NULL AFTER action_items,
ADD COLUMN IF NOT EXISTS analyzed BOOLEAN DEFAULT FALSE AFTER self_assessment,
ADD COLUMN IF NOT EXISTS analysis_id INT DEFAULT NULL AFTER analyzed;

-- Add foreign key for analysis_id
-- ALTER TABLE feedback ADD FOREIGN KEY (analysis_id) REFERENCES feedback_analysis(id) ON DELETE SET NULL;

