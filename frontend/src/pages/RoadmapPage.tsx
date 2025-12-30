import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Brain, 
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import api from '../services/api'
import type { Plan } from '../types'

export default function RoadmapPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans')
      setPlans(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true)
    try {
      const response = await api.post('/agent/roadmap')
      if (response.data.status === 'success') {
        fetchPlans()
      }
    } catch (error) {
      console.error('Failed to generate roadmap:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleTask = async (planId: number, taskIndex: number, completed: boolean) => {
    try {
      await api.post(`/plans/${planId}/task`, { task_index: taskIndex, completed })
      fetchPlans()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(weekNumber)) {
        next.delete(weekNumber)
      } else {
        next.add(weekNumber)
      }
      return next
    })
  }

  const getTaskTypeIcon = (type?: string) => {
    switch (type) {
      case 'learn':
        return '📚'
      case 'practice':
        return '💻'
      case 'build':
        return '🔨'
      case 'review':
        return '📝'
      default:
        return '✨'
    }
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border border-amber-200'
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Pending'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your roadmap...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-[1000px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Learning Roadmap
              </h1>
              <p className="text-sm text-gray-600">
                Your personalized AI-generated learning plan
              </p>
            </div>
            <button
              onClick={handleGenerateRoadmap}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Roadmap'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-6 py-8">
        {plans.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No roadmap yet
            </h3>
            <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Generate your personalized learning roadmap based on your skills, goals, and available time.
            </p>
            <button
              onClick={handleGenerateRoadmap}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate My Roadmap'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Overview Card */}
            <div className="bg-[#faf7f2] rounded-2xl p-6 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-5">
                Progress Overview
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">
                    {plans.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">
                    {plans.filter(p => p.status === 'in_progress').length}
                  </div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">
                    {plans.filter(p => p.status === 'pending').length}
                  </div>
                  <div className="text-xs text-gray-600">Upcoming</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-gray-900 transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${plans.length > 0 
                      ? (plans.filter(p => p.status === 'completed').length / plans.length) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Weekly Roadmap Timeline */}
            <div className="space-y-4">
              {plans.map((plan) => {
                const isExpanded = expandedWeeks.has(plan.week_number)
                
                return (
                  <div 
                    key={plan.id} 
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:border-gray-300"
                  >
                    {/* Week Header */}
                    <button
                      onClick={() => toggleWeek(plan.week_number)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-700">
                            W{plan.week_number}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {plan.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {plan.tasks.filter(t => t.completed).length} of {plan.tasks.length} tasks completed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(plan.status)}`}>
                          {getStatusLabel(plan.status)}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        <div className="p-6 bg-[#faf7f2]">
                          {/* Description */}
                          {plan.description && (
                            <p className="text-sm text-gray-700 leading-relaxed mb-6">
                              {plan.description}
                            </p>
                          )}

                          {/* Tasks List */}
                          <div className="space-y-2 mb-6">
                            {plan.tasks.map((task, taskIndex) => (
                              <div
                                key={task.id || taskIndex}
                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                                  task.completed 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <button
                                  onClick={() => handleToggleTask(plan.id, taskIndex, !task.completed)}
                                  className="flex-shrink-0 transition-transform hover:scale-110"
                                >
                                  {task.completed ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400" />
                                  )}
                                </button>
                                <span className="text-base flex-shrink-0">
                                  {getTaskTypeIcon(task.type)}
                                </span>
                                <span className={`flex-1 text-sm ${
                                  task.completed 
                                    ? 'line-through text-gray-500' 
                                    : 'text-gray-900'
                                }`}>
                                  {task.title}
                                </span>
                                {task.estimated_hours && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                    <Clock className="w-3.5 h-3.5" />
                                    {task.estimated_hours}h
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Milestones */}
                          {plan.milestones && plan.milestones.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-xs font-medium text-gray-700 mb-3">
                                Milestones
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {plan.milestones.map((milestone, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-700"
                                  >
                                    🎯 {milestone}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Notes */}
                          {plan.ai_notes && (
                            <div className="p-4 rounded-xl bg-white border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-gray-600" />
                                <span className="text-xs font-medium text-gray-700">
                                  AI Insight
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {plan.ai_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
