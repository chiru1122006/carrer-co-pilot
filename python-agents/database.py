"""
Database connection and helper functions
"""
import mysql.connector
from mysql.connector import Error
from config import Config
import json

class Database:
    def __init__(self):
        self.connection = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = mysql.connector.connect(
                host=Config.DB_HOST,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                database=Config.DB_NAME
            )
            return self.connection
        except Error as e:
            print(f"Database connection error: {e}")
            return None
    
    def disconnect(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
    
    def execute_query(self, query, params=None, fetch=True):
        """Execute a query and return results"""
        try:
            conn = self.connect()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, params or ())
            
            if fetch:
                result = cursor.fetchall()
            else:
                conn.commit()
                result = cursor.lastrowid
            
            cursor.close()
            self.disconnect()
            return result
        except Error as e:
            print(f"Query execution error: {e}")
            return None
    
    # ==========================================
    # USER METHODS
    # ==========================================
    
    def get_user(self, user_id: int):
        """Get user by ID"""
        query = "SELECT * FROM users WHERE id = %s"
        result = self.execute_query(query, (user_id,))
        return result[0] if result else None
    
    def get_user_profile(self, user_id: int):
        """Get user profile with all details"""
        query = """
            SELECT u.*, up.education, up.experience, up.interests, 
                   up.resume_url, up.resume_text
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = %s
        """
        result = self.execute_query(query, (user_id,))
        if result:
            user = result[0]
            # Parse JSON fields
            for field in ['education', 'experience', 'interests']:
                if user.get(field):
                    user[field] = json.loads(user[field]) if isinstance(user[field], str) else user[field]
            return user
        return None
    
    def update_readiness_score(self, user_id: int, score: int):
        """Update user's career readiness score"""
        query = "UPDATE users SET readiness_score = %s WHERE id = %s"
        self.execute_query(query, (score, user_id), fetch=False)
    
    # ==========================================
    # SKILLS METHODS
    # ==========================================
    
    def get_user_skills(self, user_id: int):
        """Get all skills for a user"""
        query = "SELECT * FROM skills WHERE user_id = %s ORDER BY level DESC"
        return self.execute_query(query, (user_id,)) or []
    
    def add_skill(self, user_id: int, skill_name: str, level: str, category: str = 'general'):
        """Add or update a skill"""
        query = """
            INSERT INTO skills (user_id, skill_name, level, category)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE level = %s, category = %s
        """
        return self.execute_query(query, (user_id, skill_name, level, category, level, category), fetch=False)
    
    # ==========================================
    # GOALS METHODS
    # ==========================================
    
    def get_user_goals(self, user_id: int):
        """Get all goals for a user"""
        query = "SELECT * FROM goals WHERE user_id = %s AND status = 'active'"
        return self.execute_query(query, (user_id,)) or []
    
    def get_primary_goal(self, user_id: int):
        """Get the primary (highest priority) active goal"""
        query = """
            SELECT * FROM goals 
            WHERE user_id = %s AND status = 'active'
            ORDER BY FIELD(priority, 'high', 'medium', 'low')
            LIMIT 1
        """
        result = self.execute_query(query, (user_id,))
        return result[0] if result else None
    
    # ==========================================
    # SKILL GAPS METHODS
    # ==========================================
    
    def get_skill_gaps(self, user_id: int, goal_id: int = None):
        """Get skill gaps for a user"""
        if goal_id:
            query = "SELECT * FROM skill_gaps WHERE user_id = %s AND goal_id = %s ORDER BY FIELD(priority, 'high', 'medium', 'low')"
            params = (user_id, goal_id)
        else:
            query = "SELECT * FROM skill_gaps WHERE user_id = %s ORDER BY FIELD(priority, 'high', 'medium', 'low')"
            params = (user_id,)
        return self.execute_query(query, params) or []
    
    def save_skill_gaps(self, user_id: int, goal_id: int, gaps: list):
        """Save skill gaps for a user"""
        # Clear existing gaps for this goal
        delete_query = "DELETE FROM skill_gaps WHERE user_id = %s AND goal_id = %s"
        self.execute_query(delete_query, (user_id, goal_id), fetch=False)
        
        # Insert new gaps
        for gap in gaps:
            insert_query = """
                INSERT INTO skill_gaps (user_id, goal_id, skill_name, current_level, required_level, priority)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            self.execute_query(insert_query, (
                user_id, goal_id, gap['skill_name'], 
                gap.get('current_level', 'none'),
                gap.get('required_level', 'intermediate'),
                gap.get('priority', 'medium')
            ), fetch=False)
    
    # ==========================================
    # PLANS METHODS
    # ==========================================
    
    def get_user_plans(self, user_id: int, goal_id: int = None):
        """Get learning plans for a user"""
        if goal_id:
            query = "SELECT * FROM plans WHERE user_id = %s AND goal_id = %s ORDER BY week_number"
            params = (user_id, goal_id)
        else:
            query = "SELECT * FROM plans WHERE user_id = %s ORDER BY week_number"
            params = (user_id,)
        
        plans = self.execute_query(query, params) or []
        for plan in plans:
            if plan.get('tasks'):
                plan['tasks'] = json.loads(plan['tasks']) if isinstance(plan['tasks'], str) else plan['tasks']
            if plan.get('milestones'):
                plan['milestones'] = json.loads(plan['milestones']) if isinstance(plan['milestones'], str) else plan['milestones']
        return plans
    
    def save_plan(self, user_id: int, goal_id: int, plan: dict):
        """Save a learning plan"""
        query = """
            INSERT INTO plans (user_id, goal_id, week_number, title, description, tasks, milestones, ai_notes, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
                title = VALUES(title), description = VALUES(description),
                tasks = VALUES(tasks), milestones = VALUES(milestones),
                ai_notes = VALUES(ai_notes), status = VALUES(status)
        """
        return self.execute_query(query, (
            user_id, goal_id, plan['week_number'], plan['title'],
            plan.get('description', ''),
            json.dumps(plan.get('tasks', [])),
            json.dumps(plan.get('milestones', [])),
            plan.get('ai_notes', ''),
            plan.get('status', 'pending')
        ), fetch=False)
    
    # ==========================================
    # FEEDBACK METHODS
    # ==========================================
    
    def get_user_feedback(self, user_id: int, limit: int = 10):
        """Get feedback entries for a user"""
        query = "SELECT * FROM feedback WHERE user_id = %s ORDER BY created_at DESC LIMIT %s"
        feedback_list = self.execute_query(query, (user_id, limit)) or []
        for fb in feedback_list:
            if fb.get('action_items'):
                fb['action_items'] = json.loads(fb['action_items']) if isinstance(fb['action_items'], str) else fb['action_items']
        return feedback_list
    
    def save_feedback(self, user_id: int, feedback: dict):
        """Save feedback entry"""
        query = """
            INSERT INTO feedback (user_id, source, company, role, message, analysis, sentiment, action_items)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        return self.execute_query(query, (
            user_id, feedback['source'], feedback.get('company'),
            feedback.get('role'), feedback['message'],
            feedback.get('analysis'), feedback.get('sentiment', 'neutral'),
            json.dumps(feedback.get('action_items', []))
        ), fetch=False)
    
    # ==========================================
    # MEMORY VECTORS METHODS
    # ==========================================
    
    def save_memory(self, user_id: int, content: str, embedding: list, memory_type: str, metadata: dict = None):
        """Save a memory vector"""
        query = """
            INSERT INTO memory_vectors (user_id, content, embedding, type, metadata)
            VALUES (%s, %s, %s, %s, %s)
        """
        return self.execute_query(query, (
            user_id, content, json.dumps(embedding), memory_type,
            json.dumps(metadata) if metadata else None
        ), fetch=False)
    
    def get_memories(self, user_id: int, memory_type: str = None, limit: int = 20):
        """Get memory vectors for a user"""
        if memory_type:
            query = "SELECT * FROM memory_vectors WHERE user_id = %s AND type = %s ORDER BY created_at DESC LIMIT %s"
            params = (user_id, memory_type, limit)
        else:
            query = "SELECT * FROM memory_vectors WHERE user_id = %s ORDER BY created_at DESC LIMIT %s"
            params = (user_id, limit)
        
        memories = self.execute_query(query, params) or []
        for mem in memories:
            if mem.get('embedding'):
                mem['embedding'] = json.loads(mem['embedding']) if isinstance(mem['embedding'], str) else mem['embedding']
            if mem.get('metadata'):
                mem['metadata'] = json.loads(mem['metadata']) if isinstance(mem['metadata'], str) else mem['metadata']
        return memories
    
    # ==========================================
    # APPLICATIONS METHODS
    # ==========================================
    
    def get_applications(self, user_id: int):
        """Get job applications for a user"""
        query = "SELECT * FROM applications WHERE user_id = %s ORDER BY created_at DESC"
        return self.execute_query(query, (user_id,)) or []
    
    def get_opportunities(self, limit: int = 20):
        """Get available opportunities"""
        query = "SELECT * FROM opportunities WHERE is_active = TRUE ORDER BY deadline ASC LIMIT %s"
        opportunities = self.execute_query(query, (limit,)) or []
        for opp in opportunities:
            if opp.get('requirements'):
                opp['requirements'] = json.loads(opp['requirements']) if isinstance(opp['requirements'], str) else opp['requirements']
        return opportunities
    
    # ==========================================
    # AGENT SESSIONS METHODS
    # ==========================================
    
    def create_agent_session(self, user_id: int, session_type: str, input_data: dict):
        """Create a new agent session"""
        query = """
            INSERT INTO agent_sessions (user_id, session_type, input_data, status)
            VALUES (%s, %s, %s, 'processing')
        """
        return self.execute_query(query, (user_id, session_type, json.dumps(input_data)), fetch=False)
    
    def update_agent_session(self, session_id: int, output_data: dict, thoughts: str, status: str = 'completed'):
        """Update agent session with results"""
        query = """
            UPDATE agent_sessions 
            SET output_data = %s, agent_thoughts = %s, status = %s, completed_at = NOW()
            WHERE id = %s
        """
        self.execute_query(query, (json.dumps(output_data), thoughts, status, session_id), fetch=False)


# Global database instance
db = Database()
