// API Types
export interface User {
  id: number
  name: string
  email: string
  career_goal?: string
  current_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  readiness_score: number
  onboarding_completed: boolean
  avatar_url?: string
  education_level?: string
  field_of_study?: string
  target_role?: string
  experience_years?: number
  education?: Education[]
  experience?: Experience[]
  interests?: string[]
}

export interface Education {
  degree: string
  institution: string
  year: number
  field?: string
}

export interface Experience {
  title: string
  company: string
  duration: string
  description?: string
}

export interface Skill {
  id: number
  skill_name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: string
  years_experience?: number
}

export interface Goal {
  id: number
  target_role: string
  target_company?: string
  timeline?: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'achieved' | 'paused' | 'abandoned'
  skill_gaps?: SkillGap[]
}

export interface SkillGap {
  id: number
  skill_name: string
  current_level: 'none' | 'beginner' | 'intermediate' | 'advanced'
  required_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  priority: 'high' | 'medium' | 'low'
  status: 'not_started' | 'in_progress' | 'completed'
}

export interface Task {
  id: number
  title: string
  type?: 'learn' | 'practice' | 'build' | 'review'
  completed: boolean
  estimated_hours?: number
}

export interface Plan {
  id: number
  week_number: number
  title: string
  description?: string
  tasks: Task[]
  milestones?: string[]
  ai_notes?: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  progress_percentage: number
}

export interface Application {
  id: number
  company: string
  role: string
  job_url?: string
  match_percentage: number
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
  deadline?: string
  applied_date?: string
  resume_version?: string
  ai_tips?: string
  notes?: string
}

export interface Feedback {
  id: number
  source: 'interview' | 'rejection' | 'self' | 'mentor' | 'ai' | 'application'
  company?: string
  role?: string
  message: string
  analysis?: string
  sentiment: 'positive' | 'neutral' | 'negative'
  action_items?: string[]
  created_at: string
}

export interface Resume {
  id: number
  version: number
  role_type: string
  target_company?: string
  resume_data: ResumeData
  file_path?: string
  pdf_generated: boolean
  based_on_jd?: string
  match_score: number
  emphasis_areas?: string[]
  is_active: boolean
  created_at: string
}

export interface ResumeData {
  header?: {
    name: string
    title: string
  }
  contact: {
    name?: string
    email: string
    phone?: string
    address?: string
    location?: string
    linkedin?: string
    website?: string
    github?: string
    portfolio?: string
  }
  summary: string
  skills: Array<{
    name: string
    level: number
  }> | {
    technical?: string[]
    tools?: string[]
    soft_skills?: string[]
  }
  experience: Array<{
    title?: string
    role?: string
    company: string
    duration: string
    location?: string
    achievements?: string[]
    points?: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
    details?: string
  }>
  projects?: Array<{
    name?: string
    title?: string
    description?: string
    technologies?: string[]
    tech_stack?: string[]
    highlights?: string[]
    points?: string[]
  }>
  certifications?: string[]
}

export interface ResumeMatchAnalysis {
  overall_match_score: number
  category_scores: {
    technical_skills: number
    experience_level: number
    education: number
    soft_skills: number
    domain_knowledge: number
  }
  matching_elements: {
    skills: string[]
    experiences: string[]
    keywords: string[]
  }
  gaps: {
    critical: string[]
    nice_to_have: string[]
  }
  recommendations: Array<{
    area: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }>
  ats_optimization: {
    keyword_coverage: number
    missing_keywords: string[]
    formatting_suggestions: string[]
  }
  application_advice: string
}

export interface Opportunity {
  id: number
  title: string
  company: string
  description?: string
  requirements?: string[]
  location?: string
  job_type: 'full-time' | 'part-time' | 'internship' | 'contract' | 'remote'
  salary_range?: string
  deadline?: string
  match_percentage?: number
}

export interface DashboardData {
  user: User
  target_role?: string
  goal?: Goal
  readiness_score: number
  skill_gaps_count: number
  current_plan?: Plan
  stats: {
    total_plans: number
    completed_plans: number
    total_tasks?: number
    completed_tasks?: number
    completion_rate?: number
  }
  next_action?: {
    action: string
    priority: string
    message: string
  }
  insights?: string[]
  agent_data?: unknown
}

// Agent Types
export interface AgentInsight {
  type: 'skill_gap' | 'recommendation' | 'achievement' | 'opportunity'
  title: string
  description: string
  action?: string
  priority?: 'high' | 'medium' | 'low'
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  message?: string
  data?: T
  errors?: Record<string, string>
}

export interface AuthResponse {
  user: User
  token: string
}
