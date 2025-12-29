import axios, { AxiosError } from 'axios'
import type { ApiResponse, AuthResponse, User, Skill, Goal, Plan, Application, Feedback, DashboardData, Opportunity } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password })
    return data.data!
  },
  
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password })
    return data.data!
  },
  
  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me')
    return data.data!
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  }
}

// Profile API
export const profileApi = {
  get: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/profile')
    return data.data!
  },
  
  update: async (profileData: Partial<User>): Promise<void> => {
    await api.put('/profile', profileData)
  },
  
  completeOnboarding: async (onboardingData: unknown): Promise<void> => {
    await api.post('/profile/onboarding', onboardingData)
  }
}

// Skills API
export const skillsApi = {
  getAll: async (): Promise<Skill[]> => {
    const { data } = await api.get<ApiResponse<Skill[]>>('/skills')
    return data.data!
  },
  
  getGaps: async (): Promise<{ skillGaps: Array<{
    id: number
    skill_name: string
    current_level: string | null
    required_level: string
    priority: 'high' | 'medium' | 'low'
    status: string
    target_role?: string
  }>, total: number }> => {
    const { data } = await api.get<ApiResponse<{ skillGaps: Array<{
      id: number
      skill_name: string
      current_level: string | null
      required_level: string
      priority: 'high' | 'medium' | 'low'
      status: string
      target_role?: string
    }>, total: number }>>('/skills/gaps')
    return data.data || { skillGaps: [], total: 0 }
  },
  
  add: async (skill: Partial<Skill>): Promise<{ id: number }> => {
    const { data } = await api.post<ApiResponse<{ id: number }>>('/skills', skill)
    return data.data!
  },
  
  update: async (id: number, skill: Partial<Skill>): Promise<void> => {
    await api.put(`/skills/${id}`, skill)
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/skills/${id}`)
  },
  
  bulkAdd: async (skills: Partial<Skill>[]): Promise<void> => {
    await api.post('/skills/bulk', { skills })
  }
}

// Goals API
export const goalsApi = {
  getAll: async (): Promise<Goal[]> => {
    const { data } = await api.get<ApiResponse<Goal[]>>('/goals')
    return data.data!
  },
  
  getPrimary: async (): Promise<Goal | null> => {
    const { data } = await api.get<ApiResponse<Goal>>('/goals/primary')
    return data.data || null
  },
  
  create: async (goal: Partial<Goal>): Promise<{ id: number }> => {
    const { data } = await api.post<ApiResponse<{ id: number }>>('/goals', goal)
    return data.data!
  },
  
  update: async (id: number, goal: Partial<Goal>): Promise<void> => {
    await api.put(`/goals/${id}`, goal)
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/goals/${id}`)
  },
  
  getSkillGaps: async (goalId: number): Promise<unknown[]> => {
    const { data } = await api.get<ApiResponse<unknown[]>>(`/goals/${goalId}/gaps`)
    return data.data!
  }
}

// Plans API
export const plansApi = {
  getAll: async (goalId?: number): Promise<Plan[]> => {
    const params = goalId ? { goal_id: goalId } : {}
    const { data } = await api.get<ApiResponse<Plan[]>>('/plans', { params })
    return data.data!
  },
  
  getCurrent: async (): Promise<Plan | null> => {
    const { data } = await api.get<ApiResponse<Plan>>('/plans/current')
    return data.data || null
  },
  
  getSummary: async (): Promise<unknown> => {
    const { data } = await api.get<ApiResponse<unknown>>('/plans/summary')
    return data.data!
  },
  
  update: async (id: number, planData: Partial<Plan>): Promise<void> => {
    await api.put(`/plans/${id}`, planData)
  },
  
  updateTask: async (planId: number, taskId: number, completed: boolean): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>(`/plans/${planId}/task`, { task_id: taskId, completed })
    return data.data!
  }
}

// Applications API
export const applicationsApi = {
  getAll: async (status?: string): Promise<Application[]> => {
    const params = status ? { status } : {}
    const { data } = await api.get<ApiResponse<Application[]>>('/applications', { params })
    return data.data!
  },
  
  getStats: async (): Promise<unknown> => {
    const { data } = await api.get<ApiResponse<unknown>>('/applications/stats')
    return data.data!
  },
  
  getOpportunities: async (): Promise<Opportunity[]> => {
    const { data } = await api.get<ApiResponse<Opportunity[]>>('/applications/opportunities')
    return data.data!
  },
  
  create: async (application: Partial<Application>): Promise<{ id: number }> => {
    const { data } = await api.post<ApiResponse<{ id: number }>>('/applications', application)
    return data.data!
  },
  
  update: async (id: number, application: Partial<Application>): Promise<void> => {
    await api.put(`/applications/${id}`, application)
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/applications/${id}`)
  }
}

// Feedback API
export const feedbackApi = {
  getAll: async (source?: string, limit?: number): Promise<Feedback[]> => {
    const params: Record<string, unknown> = {}
    if (source) params.source = source
    if (limit) params.limit = limit
    const { data } = await api.get<ApiResponse<Feedback[]>>('/feedback', { params })
    return data.data!
  },
  
  getStats: async (): Promise<unknown> => {
    const { data } = await api.get<ApiResponse<unknown>>('/feedback/stats')
    return data.data!
  },
  
  create: async (feedback: Partial<Feedback>): Promise<{ id: number }> => {
    const { data } = await api.post<ApiResponse<{ id: number }>>('/feedback', feedback)
    return data.data!
  },
  
  update: async (id: number, feedback: Partial<Feedback>): Promise<void> => {
    await api.put(`/feedback/${id}`, feedback)
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/feedback/${id}`)
  }
}

// Agent API
export const agentApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await api.get<ApiResponse<DashboardData>>('/agent/dashboard')
    return data.data!
  },
  
  runAnalysis: async (): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>('/agent/analyze')
    return data.data!
  },
  
  analyzeAndPlan: async (): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>('/agent/plan')
    return data.data!
  },
  
  analyzeSkillGaps: async (targetRole?: string): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>('/agent/skill-gaps', { target_role: targetRole })
    return data.data!
  },
  
  generateRoadmap: async (timeline?: string): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>('/agent/roadmap', { timeline })
    return data.data!
  },
  
  processFeedback: async (feedbackData: unknown): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>('/agent/feedback', feedbackData)
    return data.data!
  },
  
  generateWeeklyReport: async (reportData: unknown): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>('/agent/weekly-report', reportData)
    return data.data!
  },
  
  calculateReadiness: async (): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>('/agent/readiness')
    return data.data!
  },
  
  getOpportunities: async (): Promise<Opportunity[]> => {
    const { data } = await api.get<ApiResponse<Opportunity[]>>('/agent/opportunities')
    return data.data!
  },
  
  // Chat API
  chat: async (message: string): Promise<{ response: string; context: unknown }> => {
    const { data } = await api.post<ApiResponse<{ response: string; context: unknown }>>('/agent/chat', { message })
    return data.data!
  },
  
  getChatHistory: async (): Promise<{ history: Array<{ role: string; content: string }> }> => {
    const { data } = await api.get<ApiResponse<{ history: Array<{ role: string; content: string }> }>>('/agent/chat/history')
    return data.data!
  },
  
  clearChatHistory: async (): Promise<void> => {
    await api.post('/agent/chat/clear')
  }
}

export default api
