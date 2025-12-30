-- ============================================
-- MIGRATION SCRIPT V4
-- Adds Resume versioning and tailoring tables
-- ============================================

USE career_agent_db;

-- ============================================
-- RESUMES TABLE
-- Versioned resume storage with role-specific tailoring
-- ============================================
CREATE TABLE IF NOT EXISTS resumes (
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

-- Add indexes for resume queries
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_active ON resumes(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_resumes_role ON resumes(user_id, role_type);

SELECT 'Resume migration completed successfully!' as status;
