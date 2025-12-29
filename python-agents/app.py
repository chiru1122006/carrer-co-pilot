"""
Flask API Server for Agent Service
Exposes agent functionality via REST API
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from orchestrator import orchestrator
from database import db
from agents import (
    reasoning_agent,
    skill_gap_agent,
    planner_agent,
    feedback_agent,
    embedding_generator
)

app = Flask(__name__)
CORS(app)

# ==========================================
# HEALTH CHECK
# ==========================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Career Agent Service",
        "version": "1.0.0"
    })


# ==========================================
# ORCHESTRATOR ENDPOINTS
# ==========================================

@app.route('/api/agent/analyze', methods=['POST'])
def full_analysis():
    """Run full analysis for a user"""
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    result = orchestrator.run_full_analysis(user_id)
    return jsonify(result)


@app.route('/api/agent/dashboard/<int:user_id>', methods=['GET'])
def get_dashboard(user_id):
    """Get dashboard data for a user"""
    result = orchestrator.get_dashboard_data(user_id)
    return jsonify(result)


@app.route('/api/agent/plan', methods=['POST'])
def analyze_and_plan():
    """Analyze gaps and create learning plan"""
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    result = orchestrator.analyze_and_plan(user_id)
    return jsonify(result)


@app.route('/api/agent/opportunities/<int:user_id>', methods=['GET'])
def get_opportunities(user_id):
    """Get matched opportunities for a user"""
    result = orchestrator.get_opportunity_matches(user_id)
    return jsonify(result)


# ==========================================
# REASONING AGENT ENDPOINTS
# ==========================================

@app.route('/api/agent/reasoning/analyze', methods=['POST'])
def reasoning_analyze():
    """Analyze user profile"""
    data = request.json
    profile = data.get('profile', {})
    
    result = reasoning_agent.analyze_profile(profile)
    return jsonify(result)


@app.route('/api/agent/reasoning/readiness', methods=['POST'])
def calculate_readiness():
    """Calculate job readiness score"""
    data = request.json
    skills = data.get('skills', [])
    target_role = data.get('target_role', 'Software Developer')
    
    result = reasoning_agent.calculate_readiness(skills, target_role)
    return jsonify(result)


@app.route('/api/agent/reasoning/compare-roles', methods=['POST'])
def compare_roles():
    """Compare user against multiple roles"""
    data = request.json
    profile = data.get('profile', {})
    roles = data.get('roles', [])
    
    result = reasoning_agent.compare_roles(profile, roles)
    return jsonify(result)


# ==========================================
# SKILL GAP AGENT ENDPOINTS
# ==========================================

@app.route('/api/agent/skills/gaps', methods=['POST'])
def analyze_skill_gaps():
    """Analyze skill gaps for target role"""
    data = request.json
    skills = data.get('skills', [])
    target_role = data.get('target_role', 'Software Developer')
    
    result = skill_gap_agent.analyze_gaps(skills, target_role)
    return jsonify(result)


@app.route('/api/agent/skills/compare', methods=['POST'])
def compare_with_job():
    """Compare skills with job requirements"""
    data = request.json
    skills = data.get('skills', [])
    requirements = data.get('requirements', [])
    
    result = skill_gap_agent.compare_with_job(skills, requirements)
    return jsonify(result)


@app.route('/api/agent/skills/requirements', methods=['POST'])
def get_role_requirements():
    """Get skill requirements for a role"""
    data = request.json
    role = data.get('role', 'Software Developer')
    
    result = skill_gap_agent.get_role_requirements(role)
    return jsonify(result)


@app.route('/api/agent/skills/prioritize', methods=['POST'])
def prioritize_gaps():
    """Prioritize skill gaps"""
    data = request.json
    gaps = data.get('gaps', [])
    career_goal = data.get('career_goal', 'Software Developer')
    
    result = skill_gap_agent.prioritize_gaps(gaps, career_goal)
    return jsonify(result)


# ==========================================
# PLANNER AGENT ENDPOINTS
# ==========================================

@app.route('/api/agent/planner/roadmap', methods=['POST'])
def create_roadmap():
    """Create learning roadmap"""
    data = request.json
    skill_gaps = data.get('skill_gaps', [])
    target_role = data.get('target_role', 'Software Developer')
    timeline = data.get('timeline', '3 months')
    
    result = planner_agent.create_roadmap(skill_gaps, target_role, timeline)
    return jsonify(result)


@app.route('/api/agent/planner/weekly', methods=['POST'])
def create_weekly_plan():
    """Create weekly plan"""
    data = request.json
    week_number = data.get('week_number', 1)
    skills = data.get('skills', [])
    context = data.get('context', {})
    
    result = planner_agent.create_weekly_plan(week_number, skills, context)
    return jsonify(result)


@app.route('/api/agent/planner/projects', methods=['POST'])
def suggest_projects():
    """Suggest portfolio projects"""
    data = request.json
    skills = data.get('skills', [])
    level = data.get('level', 'intermediate')
    
    result = planner_agent.suggest_projects(skills, level)
    return jsonify(result)


@app.route('/api/agent/planner/adjust', methods=['POST'])
def adjust_plan():
    """Adjust existing plan"""
    data = request.json
    current_plan = data.get('current_plan', {})
    feedback = data.get('feedback', '')
    progress = data.get('progress', {})
    
    result = planner_agent.adjust_plan(current_plan, feedback, progress)
    return jsonify(result)


# ==========================================
# FEEDBACK AGENT ENDPOINTS
# ==========================================

@app.route('/api/agent/feedback/rejection', methods=['POST'])
def analyze_rejection():
    """Analyze rejection feedback"""
    data = request.json
    result = feedback_agent.analyze_rejection(data)
    return jsonify(result)


@app.route('/api/agent/feedback/interview', methods=['POST'])
def analyze_interview():
    """Analyze interview feedback"""
    data = request.json
    result = feedback_agent.analyze_interview_feedback(data)
    return jsonify(result)


@app.route('/api/agent/feedback/patterns', methods=['POST'])
def detect_patterns():
    """Detect patterns in feedback history"""
    data = request.json
    history = data.get('history', [])
    result = feedback_agent.detect_patterns(history)
    return jsonify(result)


@app.route('/api/agent/feedback/progress', methods=['POST'])
def analyze_progress():
    """Analyze learning progress"""
    data = request.json
    result = feedback_agent.analyze_progress(data)
    return jsonify(result)


@app.route('/api/agent/feedback/weekly-report', methods=['POST'])
def generate_weekly_report():
    """Generate weekly progress report"""
    data = request.json
    result = feedback_agent.generate_weekly_report(data)
    return jsonify(result)


@app.route('/api/agent/feedback/process', methods=['POST'])
def process_feedback():
    """Process and store feedback"""
    data = request.json
    user_id = data.get('user_id')
    feedback_data = data.get('feedback', {})
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    result = orchestrator.process_feedback(user_id, feedback_data)
    return jsonify(result)


# ==========================================
# EMBEDDING ENDPOINTS
# ==========================================

@app.route('/api/agent/embed', methods=['POST'])
def generate_embedding():
    """Generate text embedding"""
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "text is required"}), 400
    
    embedding = embedding_generator.generate(text)
    return jsonify({
        "status": "success",
        "embedding": embedding,
        "dimension": len(embedding)
    })


@app.route('/api/agent/embed/similarity', methods=['POST'])
def calculate_similarity():
    """Calculate similarity between texts"""
    data = request.json
    text1 = data.get('text1', '')
    text2 = data.get('text2', '')
    
    emb1 = embedding_generator.generate(text1)
    emb2 = embedding_generator.generate(text2)
    similarity = embedding_generator.similarity(emb1, emb2)
    
    return jsonify({
        "status": "success",
        "similarity": similarity
    })


# ==========================================
# MEMORY ENDPOINTS
# ==========================================

@app.route('/api/agent/memory/store', methods=['POST'])
def store_memory():
    """Store memory with embedding"""
    data = request.json
    user_id = data.get('user_id')
    content = data.get('content', '')
    memory_type = data.get('type', 'interaction')
    metadata = data.get('metadata', {})
    
    if not user_id or not content:
        return jsonify({"error": "user_id and content are required"}), 400
    
    embedding = embedding_generator.generate(content)
    db.save_memory(user_id, content, embedding, memory_type, metadata)
    
    return jsonify({"status": "success", "message": "Memory stored"})


@app.route('/api/agent/memory/<int:user_id>', methods=['GET'])
def get_memories(user_id):
    """Get user memories"""
    memory_type = request.args.get('type')
    limit = int(request.args.get('limit', 20))
    
    memories = db.get_memories(user_id, memory_type, limit)
    return jsonify({
        "status": "success",
        "memories": memories,
        "count": len(memories)
    })


@app.route('/api/agent/memory/search', methods=['POST'])
def search_memories():
    """Search memories by similarity"""
    data = request.json
    user_id = data.get('user_id')
    query = data.get('query', '')
    top_k = data.get('top_k', 5)
    
    if not user_id or not query:
        return jsonify({"error": "user_id and query are required"}), 400
    
    # Get user memories
    memories = db.get_memories(user_id)
    if not memories:
        return jsonify({"status": "success", "results": []})
    
    # Generate query embedding
    query_emb = embedding_generator.generate(query)
    
    # Find similar
    embeddings = [m['embedding'] for m in memories]
    similar = embedding_generator.find_similar(query_emb, embeddings, top_k)
    
    results = []
    for idx, score in similar:
        results.append({
            **memories[idx],
            'similarity_score': score
        })
    
    return jsonify({
        "status": "success",
        "results": results
    })


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == '__main__':
    print(f"Starting Career Agent Service on port {Config.SERVICE_PORT}")
    app.run(
        host='0.0.0.0',
        port=Config.SERVICE_PORT,
        debug=Config.DEBUG
    )
