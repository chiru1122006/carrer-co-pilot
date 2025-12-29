import { useState, useEffect } from 'react'
import { 
  Map, 
  Calendar, 
  CheckCircle, 
  Circle, 
  Clock, 
  Brain, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react'
import api from '../services/api'
import type { Plan, Task } from '../types'
import { formatDate } from '../lib/utils'

export default function RoadmapPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

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
      if (response.data.success) {
        fetchPlans()
      }
    } catch (error) {
      console.error('Failed to generate roadmap:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleTask = async (planId: number, taskId: number, completed: boolean) => {
    try {
      // Update task completion status
      await api.put(`/plans/${planId}/tasks/${taskId}`, { completed })
      fetchPlans()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/30'
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Roadmap</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your personalized weekly learning plan
          </p>
        </div>
        <button
          onClick={handleGenerateRoadmap}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Generate Roadmap
            </>
          )}
        </button>
      </div>

      {/* Progress Overview */}
      {plans.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Overall Progress
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {plans.filter(p => p.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {plans.filter(p => p.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-500 dark:text-gray-400">
                {plans.filter(p => p.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="gradient-primary h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${plans.length > 0 
                  ? (plans.filter(p => p.status === 'completed').length / plans.length) * 100 
                  : 0}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      {plans.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Map className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No roadmap yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Generate your personalized learning roadmap based on your skills, goals, and available time.
          </p>
          <button
            onClick={handleGenerateRoadmap}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Brain className="w-5 h-5" />
            Generate My Roadmap
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Weeks */}
          <div className="space-y-6">
            {plans.map((plan) => (
              <div key={plan.id} className="relative pl-20">
                {/* Timeline dot */}
                <div className={`absolute left-6 w-5 h-5 rounded-full border-4 
                  ${plan.status === 'completed' 
                    ? 'bg-green-500 border-green-200 dark:border-green-800' 
                    : plan.status === 'in_progress'
                    ? 'bg-blue-500 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-300 border-gray-100 dark:bg-gray-600 dark:border-gray-800'
                  }`}
                />

                {/* Week Card */}
                <div className="glass-card overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => toggleWeek(plan.week_number)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                          ${plan.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : plan.status === 'in_progress'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          W{plan.week_number}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {plan.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.tasks.filter(t => t.completed).length} / {plan.tasks.length} tasks completed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                        {plan.status.replace('_', ' ')}
                      </span>
                      {expandedWeek === plan.week_number ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedWeek === plan.week_number && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                      {plan.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {plan.description}
                        </p>
                      )}

                      {/* Tasks */}
                      <div className="space-y-3 mb-6">
                        {plan.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors
                              ${task.completed 
                                ? 'bg-green-50 dark:bg-green-900/10' 
                                : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                              }`}
                          >
                            <button
                              onClick={() => handleToggleTask(plan.id, task.id, !task.completed)}
                              className="flex-shrink-0"
                            >
                              {task.completed ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-400 hover:text-primary-500" />
                              )}
                            </button>
                            <span className="text-lg">{getTaskTypeIcon(task.type)}</span>
                            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </span>
                            {task.estimated_hours && (
                              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4" />
                                {task.estimated_hours}h
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Milestones */}
                      {plan.milestones && plan.milestones.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Milestones
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {plan.milestones.map((milestone, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm"
                              >
                                🎯 {milestone}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Notes */}
                      {plan.ai_notes && (
                        <div className="p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                            <span className="text-sm font-medium text-accent-700 dark:text-accent-300">
                              AI Tips
                            </span>
                          </div>
                          <p className="text-sm text-accent-600 dark:text-accent-400">
                            {plan.ai_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
