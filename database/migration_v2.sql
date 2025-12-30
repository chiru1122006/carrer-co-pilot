-- ============================================
-- MIGRATION SCRIPT V2
-- Run this to add missing columns and tables
-- ============================================

USE career_agent_db;

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS education_level VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(200) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS target_role VARCHAR(150) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0;

-- Create chat_messages table if not exists
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    context JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create education table if not exists
CREATE TABLE IF NOT EXISTS education (
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

-- Create roadmap_tasks table if not exists (for individual task tracking)
CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    user_id INT NOT NULL,
    task_index INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_task (plan_id, task_index)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user ON education(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_plan ON roadmap_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_user ON roadmap_tasks(user_id);

-- Update any existing users without user_profiles
INSERT IGNORE INTO user_profiles (user_id) 
SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM user_profiles);

SELECT 'Migration completed successfully!' as status;
