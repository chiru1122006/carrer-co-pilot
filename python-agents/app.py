"""
Flask API Server for Agent Service
Exposes agent functionality via REST API
"""
import os
from flask import Flask, request, jsonify, send_file, redirect
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from config import Config
from orchestrator import orchestrator
from database import db
from decimal import Decimal
from datetime import datetime, date
import json

# Custom JSON encoder to handle Decimal and datetime types
class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)

from agents import (
    reasoning_agent,
    skill_gap_agent,
    planner_agent,
    feedback_agent,
    get_embedding_generator,
    resume_agent
)
from services.html_pdf_generator import html_pdf_generator

app = Flask(__name__)
app.json = CustomJSONProvider(app)
CORS(app)

# ==========================================
# HEALTH CHECK
# ==========================================

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Career Agent Service",
        "version": "1.0.0"
    })


# ==========================================
# UNIFIED AGENT ENDPOINT
# ==========================================

@app.route('/api/agent/run', methods=['POST'])
def run_agent():
    """
    Unified agent endpoint
    Handles all agent events through single entry point
    """
    data = request.json
    user_id = data.get('user_id')
    event_type = data.get('event_type', 'full_analysis')
    payload = data.get('payload', {})
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    result = orchestrator.run_agent(event_type, user_id, payload)
    return jsonify(result)


@app.route('/api/agent/state/<int:user_id>', methods=['GET'])
def get_agent_state(user_id):
    """Get current agent state for a user"""
    result = orchestrator.get_agent_state(user_id)
    return jsonify(result)


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
    
    embedding = get_embedding_generator().generate(text)
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
    
    emb1 = get_embedding_generator().generate(text1)
    emb2 = get_embedding_generator().generate(text2)
    similarity = get_embedding_generator().similarity(emb1, emb2)
    
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
    
    embedding = get_embedding_generator().generate(content)
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
    query_emb = get_embedding_generator().generate(query)
    
    # Find similar
    embeddings = [m['embedding'] for m in memories]
    similar = get_embedding_generator().find_similar(query_emb, embeddings, top_k)
    
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
# CHAT ENDPOINTS
# ==========================================

from llm_client import llm

@app.route('/api/agent/chat', methods=['POST'])
def chat():
    """Chat with the AI career assistant"""
    data = request.json
    user_id = data.get('user_id')
    message = data.get('message', '')
    
    if not user_id or not message:
        return jsonify({"error": "user_id and message are required"}), 400
    
    # Get user context
    user = db.get_user_profile(user_id)
    skills = db.get_user_skills(user_id)
    goals = db.get_user_goals(user_id)
    primary_goal = db.get_primary_goal(user_id)
    skill_gaps = db.get_skill_gaps(user_id, primary_goal['id'] if primary_goal else None)
    plans = db.get_user_plans(user_id, primary_goal['id'] if primary_goal else None)
    applications = db.get_applications(user_id)
    feedback_list = db.get_user_feedback(user_id, limit=5)
    
    # Build user context string
    user_name = user.get('name', 'User') if user else 'User'
    target_role = primary_goal.get('target_role', 'Not set') if primary_goal else 'Not set'
    current_level = user.get('current_level', 'beginner') if user else 'beginner'
    readiness_score = user.get('readiness_score', 0) if user else 0
    
    skills_str = ', '.join([f"{s['skill_name']} ({s['level']})" for s in skills[:10]]) if skills else 'None added yet'
    gaps_str = ', '.join([f"{g['skill_name']} ({g['priority']} priority)" for g in skill_gaps[:5]]) if skill_gaps else 'None identified'
    
    current_plan = None
    for p in plans:
        if p.get('status') in ['pending', 'in_progress']:
            current_plan = p
            break
    
    plan_info = f"Week {current_plan['week_number']}: {current_plan['title']}" if current_plan else "No active plan"
    
    apps_count = len(applications) if applications else 0
    active_apps = len([a for a in applications if a.get('status') in ['applied', 'interviewing']]) if applications else 0
    
    # Build system prompt with user context
    system_prompt = f"""You are CareerAI, a friendly and knowledgeable AI career coach assistant. You are chatting with {user_name}.

## User Profile:
- Name: {user_name}
- Target Role: {target_role}
- Current Level: {current_level}
- Career Readiness Score: {readiness_score}%
- Skills: {skills_str}
- Skill Gaps to Work On: {gaps_str}
- Current Learning Plan: {plan_info}
- Job Applications: {apps_count} total, {active_apps} active

## Your Capabilities:
- Answer questions about career development, job hunting, and skill building
- Provide personalized advice based on the user's profile and goals
- Help with interview preparation, resume tips, and job search strategies
- Explain technical concepts and learning paths
- Motivate and encourage the user in their career journey

## Guidelines:
- Be conversational, helpful, and encouraging
- Reference the user's specific situation when relevant
- Give actionable advice
- Be concise but thorough
- Use the user's name occasionally to be more personal
- If asked about something you don't have data for, acknowledge it and provide general guidance"""

    # Get chat history from database
    chat_history = db.get_chat_history(user_id, limit=20)
    
    # Add user message to history
    chat_history.append({"role": "user", "content": message})
    
    # Save user message to database
    db.save_chat_message(user_id, 'user', message)
    
    # Keep only last 10 messages for context to LLM
    context_messages = chat_history[-10:] if len(chat_history) > 10 else chat_history
    
    # Get AI response
    response = llm.chat(context_messages, system_prompt, temperature=0.7, max_tokens=1500)
    
    # Save assistant response to database
    db.save_chat_message(user_id, 'assistant', response)
    
    # Save to memory for future reference
    try:
        content = f"User asked: {message[:100]}... AI responded about career guidance."
        embedding = get_embedding_generator().generate(content)
        db.save_memory(user_id, content, embedding, 'interaction', {'type': 'chat'})
    except Exception as e:
        print(f"Error saving chat memory: {e}")
    
    return jsonify({
        "status": "success",
        "response": response,
        "user_context": {
            "name": user_name,
            "target_role": target_role,
            "readiness_score": readiness_score
        }
    })


@app.route('/api/agent/chat/clear', methods=['POST'])
def clear_chat():
    """Clear chat history for a user"""
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    # Clear from database
    db.clear_chat_history(user_id)
    
    return jsonify({"status": "success", "message": "Chat history cleared"})


@app.route('/api/agent/chat/history', methods=['GET'])
def get_chat_history():
    """Get chat history for a user"""
    user_id = request.args.get('user_id', type=int)
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    # Get from database
    history = db.get_chat_history(user_id, limit=50)
    
    return jsonify({
        "status": "success",
        "history": history,
        "count": len(history)
    })


# ==========================================
# RESUME ENDPOINTS
# ==========================================

@app.route('/api/resume/generate', methods=['POST'])
def generate_resume():
    """Generate a new resume from user profile"""
    data = request.json
    user_id = data.get('user_id')
    target_role = data.get('target_role')
    target_company = data.get('target_company')
    job_description = data.get('job_description')
    generate_pdf = data.get('generate_pdf', True)
    
    if not user_id or not target_role:
        return jsonify({"error": "user_id and target_role are required"}), 400
    
    try:
        # Get user data
        user_profile = db.get_user_profile(user_id)
        skills = db.get_user_skills(user_id)
        
        # Get experience, education, and projects from profile
        experience = user_profile.get('experience', []) if user_profile else []
        education = user_profile.get('education', []) if user_profile else []
        projects = user_profile.get('projects', []) if user_profile else []
        
        # Generate resume using STRICT schema
        result = resume_agent.generate_structured_resume(
            user_profile=user_profile,
            skills=skills,
            experience=experience,
            education=education,
            target_role=target_role,
            job_description=job_description,
            projects=projects
        )
        
        if result.get('status') != 'success':
            return jsonify(result), 500
        
        resume_data = result.get('resume_data')
        
        # Save to database
        resume_id = db.create_resume(
            user_id=user_id,
            role_type=target_role,
            resume_data=resume_data,
            target_company=target_company,
            based_on_jd=job_description,
            match_score=result.get('match_score', 0),
            emphasis_areas=result.get('emphasis_areas')
        )
        
        # Generate PDF using HTML template if requested
        pdf_result = None
        if generate_pdf and resume_data:
            version_query = db.execute_query(
                "SELECT version FROM resumes WHERE id = %s",
                (resume_id,)
            )
            version = version_query[0]['version'] if version_query else 1
            
            filename = f"resume_v{version}_{target_role.replace(' ', '_').lower()}.pdf"
            pdf_result = html_pdf_generator.generate_pdf(
                resume_data=resume_data,
                filename=filename,
                user_id=user_id
            )
            
            # Update database with PDF path
            if pdf_result.get('status') == 'success':
                db.update_resume_pdf_path(resume_id, pdf_result.get('file_path'))
        
        return jsonify({
            "status": "success",
            "resume_id": resume_id,
            "resume_data": resume_data,
            "pdf_path": pdf_result.get('file_path') if pdf_result else None,
            "message": "Resume generated successfully"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/tailor', methods=['POST'])
def tailor_resume():
    """Tailor existing resume to job description"""
    data = request.json
    user_id = data.get('user_id')
    resume_id = data.get('resume_id')
    job_description = data.get('job_description')
    target_role = data.get('target_role')
    target_company = data.get('target_company', '')
    generate_pdf = data.get('generate_pdf', True)
    
    if not user_id or not job_description or not target_role:
        return jsonify({"error": "user_id, job_description, and target_role are required"}), 400
    
    try:
        # Get base resume
        if resume_id:
            base_resume_record = db.get_resume(resume_id)
            base_resume = base_resume_record.get('resume_data') if base_resume_record else None
        else:
            # Get latest resume
            latest = db.get_latest_resume(user_id)
            base_resume = latest.get('resume_data') if latest else None
        
        if not base_resume:
            return jsonify({"error": "No resume found to tailor"}), 404
        
        # Tailor resume using new agent method
        result = resume_agent.tailor_to_job_description(
            existing_resume=base_resume,
            job_description=job_description,
            target_role=target_role,
            target_company=target_company
        )
        
        if result.get('status') != 'success':
            return jsonify(result), 500
        
        tailored_resume = result.get('resume_data')
        
        # Save tailored version
        new_resume_id = db.create_resume(
            user_id=user_id,
            role_type=target_role,
            resume_data=tailored_resume,
            target_company=target_company,
            based_on_jd=job_description,
            match_score=result.get('match_score', 0),
            emphasis_areas=result.get('emphasis_areas')
        )
        
        # Generate PDF using HTML template
        pdf_result = None
        if generate_pdf and tailored_resume:
            version_query = db.execute_query(
                "SELECT version FROM resumes WHERE id = %s",
                (new_resume_id,)
            )
            version = version_query[0]['version'] if version_query else 1
            
            company_slug = target_company.replace(' ', '_').lower() if target_company else target_role.replace(' ', '_').lower()
            filename = f"resume_v{version}_{company_slug}.pdf"
            pdf_result = html_pdf_generator.generate_pdf(
                resume_data=tailored_resume,
                filename=filename,
                user_id=user_id
            )
            
            if pdf_result.get('status') == 'success':
                db.update_resume_pdf_path(new_resume_id, pdf_result.get('file_path'))
        
        return jsonify({
            "status": "success",
            "resume_id": new_resume_id,
            "resume_data": tailored_resume,
            "pdf_path": pdf_result.get('file_path') if pdf_result else None,
            "match_score": result.get('match_score'),
            "missing_skills": result.get('missing_skills', []),
            "emphasis_areas": result.get('emphasis_areas', []),
            "message": "Resume tailored successfully"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/analyze', methods=['POST'])
def analyze_resume_match():
    """Analyze resume match against job description"""
    data = request.json
    user_id = data.get('user_id')
    resume_id = data.get('resume_id')
    job_description = data.get('job_description')
    
    if not job_description:
        return jsonify({"error": "job_description is required"}), 400
    
    try:
        # Get resume
        if resume_id:
            resume_record = db.get_resume(resume_id)
        elif user_id:
            resume_record = db.get_latest_resume(user_id)
        else:
            return jsonify({"error": "Either user_id or resume_id is required"}), 400
        
        if not resume_record:
            return jsonify({"error": "Resume not found"}), 404
        
        resume_data = resume_record.get('resume_data')
        
        # Analyze match
        result = resume_agent.analyze_resume_match(
            resume_data=resume_data,
            job_description=job_description
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/list/<int:user_id>', methods=['GET'])
def list_resumes(user_id):
    """List all resumes for a user"""
    active_only = request.args.get('active_only', 'false').lower() == 'true'
    
    try:
        resumes = db.get_user_resumes(user_id, active_only=active_only)
        return jsonify({
            "status": "success",
            "resumes": resumes,
            "count": len(resumes)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/<int:resume_id>', methods=['GET'])
def get_resume_detail(resume_id):
    """Get detailed resume information"""
    try:
        resume = db.get_resume(resume_id)
        if not resume:
            return jsonify({"error": "Resume not found"}), 404
        
        return jsonify({
            "status": "success",
            "resume": resume
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/<int:resume_id>', methods=['DELETE'])
def deactivate_resume_endpoint(resume_id):
    """Deactivate a resume"""
    try:
        db.deactivate_resume(resume_id)
        return jsonify({
            "status": "success",
            "message": "Resume deactivated"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/improve', methods=['POST'])
def suggest_improvements():
    """Suggest resume improvements based on feedback"""
    data = request.json
    user_id = data.get('user_id')
    resume_id = data.get('resume_id')
    target_role = data.get('target_role', '')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    try:
        # Get resume
        if resume_id:
            resume_record = db.get_resume(resume_id)
        else:
            resume_record = db.get_latest_resume(user_id)
        
        if not resume_record:
            return jsonify({"error": "Resume not found"}), 404
        
        # Get feedback history
        feedback_history = db.get_user_feedback(user_id, limit=10)
        
        # Get improvement suggestions
        result = resume_agent.suggest_resume_improvements(
            resume_data=resume_record.get('resume_data'),
            target_role=target_role or resume_record.get('role_type', ''),
            feedback_history=feedback_history
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/preview/<int:resume_id>', methods=['GET'])
def preview_resume(resume_id):
    """Get HTML preview of resume"""
    try:
        resume_record = db.get_resume(resume_id)
        
        if not resume_record:
            return jsonify({"error": "Resume not found"}), 404
        
        resume_data = resume_record.get('resume_data')
        
        # Generate HTML preview
        html_preview = html_pdf_generator.generate_html_preview(resume_data)
        
        return html_preview, 200, {'Content-Type': 'text/html'}
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/data/<int:resume_id>', methods=['GET'])
def get_resume_data(resume_id):
    """Get resume data as JSON for the browser template"""
    try:
        resume_record = db.get_resume(resume_id)
        
        if not resume_record:
            return jsonify({"error": "Resume not found"}), 404
        
        resume_data = resume_record.get('resume_data')
        
        return jsonify({
            "status": "success",
            "resume_data": resume_data,
            "resume_id": resume_id,
            "role_type": resume_record.get('role_type'),
            "version": resume_record.get('version', 1)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/view/<int:resume_id>', methods=['GET'])
def view_resume_in_template(resume_id):
    """
    Redirect to resume-format.html with resume data
    This allows viewing the resume in the custom template layout
    """
    import base64
    import json
    
    try:
        resume_record = db.get_resume(resume_id)
        
        if not resume_record:
            return jsonify({"error": "Resume not found"}), 404
        
        resume_data = resume_record.get('resume_data')
        
        # Encode resume data as base64 for URL
        encoded_data = base64.b64encode(json.dumps(resume_data).encode()).decode()
        
        # Redirect to the HTML template with data parameter
        return redirect(f'/resume-format.html?data={encoded_data}')
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/download/<int:resume_id>', methods=['GET'])
def download_resume(resume_id):
    """Download resume PDF"""
    try:
        resume_record = db.get_resume(resume_id)
        
        if not resume_record:
            return jsonify({"error": "Resume not found"}), 404
        
        pdf_path = resume_record.get('file_path')
        
        if not pdf_path or not os.path.exists(pdf_path):
            # Generate PDF on the fly if not exists
            resume_data = resume_record.get('resume_data')
            result = html_pdf_generator.generate_pdf(
                resume_data=resume_data,
                filename=f"resume_{resume_id}.pdf"
            )
            pdf_path = result.get('file_path')
        
        if pdf_path and os.path.exists(pdf_path):
            return send_file(
                pdf_path,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=os.path.basename(pdf_path)
            )
        
        return jsonify({"error": "PDF file not found"}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume/pdf/<int:resume_id>', methods=['GET'])
def view_resume_pdf(resume_id):
    """View resume PDF in browser (inline, not download)"""
    try:
        resume_record = db.get_resume(resume_id)
        
        if not resume_record:
            return jsonify({"error": "Resume not found"}), 404
        
        pdf_path = resume_record.get('file_path')
        print(f"[view_resume_pdf] Resume ID: {resume_id}")
        print(f"[view_resume_pdf] PDF path from DB: {pdf_path}")
        print(f"[view_resume_pdf] Path exists: {os.path.exists(pdf_path) if pdf_path else 'N/A'}")
        
        if not pdf_path or not os.path.exists(pdf_path):
            print(f"[view_resume_pdf] PDF not found, generating new one...")
            # Generate PDF on the fly if not exists
            resume_data = resume_record.get('resume_data')
            result = html_pdf_generator.generate_pdf(
                resume_data=resume_data,
                filename=f"resume_{resume_id}.pdf"
            )
            pdf_path = result.get('file_path')
            print(f"[view_resume_pdf] Generated new PDF at: {pdf_path}")
            
            # Update database with new path
            if pdf_path and os.path.exists(pdf_path):
                db.update_resume_pdf_path(resume_id, pdf_path)
        
        if pdf_path and os.path.exists(pdf_path):
            print(f"[view_resume_pdf] Serving PDF from: {pdf_path}")
            # Send as inline (view in browser) not attachment
            response = send_file(
                pdf_path,
                mimetype='application/pdf'
            )
            response.headers['Content-Disposition'] = f'inline; filename="{os.path.basename(pdf_path)}"'
            return response
        
        return jsonify({"error": "PDF file not found", "attempted_path": pdf_path}), 404
    
    except Exception as e:
        print(f"[view_resume_pdf] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == '__main__':
    print(f"Starting Career Agent Service on port {Config.SERVICE_PORT}")
    app.run(
        host='0.0.0.0',
        port=Config.SERVICE_PORT,
        debug=False,
        use_reloader=False
    )
