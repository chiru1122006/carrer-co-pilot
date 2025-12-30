-- ============================================
-- MIGRATION V5: Add Learning Resources to Skill Gaps
-- Stores AI-generated YouTube videos and course links
-- ============================================

USE career_agent_db;

-- Add learning_resources column to skill_gaps table
ALTER TABLE skill_gaps
ADD COLUMN learning_resources JSON DEFAULT NULL COMMENT 'AI-generated learning resources (YouTube videos, courses, etc.)';

-- Add estimated_learning_time column
ALTER TABLE skill_gaps
ADD COLUMN estimated_learning_time VARCHAR(50) DEFAULT NULL COMMENT 'Estimated time to learn this skill';

-- Add learning_approach column  
ALTER TABLE skill_gaps
ADD COLUMN learning_approach TEXT DEFAULT NULL COMMENT 'AI suggested approach to learn this skill';

-- Create index for faster queries
CREATE INDEX idx_skill_gaps_user_priority ON skill_gaps(user_id, priority);

-- Verify changes
DESCRIBE skill_gaps;
