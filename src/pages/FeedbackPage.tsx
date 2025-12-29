import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Brain, 
  RefreshCw,
  Building2,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Minus,
  X,
  ChevronRight,
  Lightbulb
} from 'lucide-react'
import api from '../services/api'
import type { Feedback } from '../types'
import { formatRelativeTime } from '../lib/utils'

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newFeedback, setNewFeedback] = useState({
    source: 'rejection' as const,
    company: '',
    role: '',
    message: ''
  })

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await api.get('/feedback')
      setFeedbackList(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeFeedback = async (id: number) => {
    setIsAnalyzing(true)
    try {
      const response = await api.post(`/agent/analyze-feedback/${id}`)
      if (response.data.success) {
        fetchFeedback()
      }
    } catch (error) {
      console.error('Failed to analyze feedback:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/feedback', newFeedback)
      setNewFeedback({ source: 'rejection', company: '', role: '', message: '' })
      setShowAddModal(false)
      fetchFeedback()
    } catch (error) {
      console.error('Failed to add feedback:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return
    try {
      await api.delete(`/feedback/${id}`)
      fetchFeedback()
    } catch (error) {
      console.error('Failed to delete feedback:', error)
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-5 h-5 text-green-500" />
      case 'negative':
        return <ThumbsDown className="w-5 h-5 text-red-500" />
      default:
        return <Minus className="w-5 h-5 text-gray-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'negative':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'rejection':
        return '❌'
      case 'interview':
        return '🎤'
      case 'mentor':
        return '👨‍🏫'
      case 'self':
        return '📝'
      case 'ai':
        return '🤖'
      default:
        return '💬'
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feedback & Insights</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Turn rejections and feedback into growth opportunities
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Feedback
        </button>
      </div>

      {/* Insight Card */}
      <div className="glass-card p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Feedback Analysis Insight
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {feedbackList.length === 0 
                ? 'Add your first feedback to start getting AI-powered insights on how to improve.'
                : feedbackList.filter(f => f.sentiment === 'negative').length > feedbackList.length / 2
                ? 'We noticed some challenging feedback. Let our AI analyze patterns and suggest improvement areas.'
                : 'Great job collecting feedback! Keep adding more to help our AI identify growth opportunities.'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {feedbackList.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Feedback</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {feedbackList.filter(f => f.sentiment === 'positive').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Positive</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {feedbackList.filter(f => f.sentiment === 'negative').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Negative</p>
        </div>
      </div>

      {/* Feedback List */}
      {feedbackList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MessageSquare className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No feedback yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Record rejection emails, interview feedback, or self-reflections to get AI-powered insights.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Your First Feedback
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <div key={feedback.id} className="glass-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getSourceIcon(feedback.source)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}>
                        {feedback.sentiment}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {feedback.source}
                      </span>
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        {formatRelativeTime(feedback.created_at)}
                      </span>
                    </div>
                    
                    {(feedback.company || feedback.role) && (
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                        <Building2 className="w-4 h-4" />
                        <span>{feedback.company}</span>
                        {feedback.role && <span>• {feedback.role}</span>}
                      </div>
                    )}

                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {feedback.message}
                    </p>

                    {feedback.analysis ? (
                      <div className="p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                          <span className="text-sm font-medium text-accent-700 dark:text-accent-300">
                            AI Analysis
                          </span>
                        </div>
                        <p className="text-sm text-accent-600 dark:text-accent-400 mb-3">
                          {feedback.analysis}
                        </p>
                        {feedback.action_items && feedback.action_items.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-accent-700 dark:text-accent-300">
                              Action Items:
                            </p>
                            {feedback.action_items.map((item, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <ChevronRight className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-accent-600 dark:text-accent-400">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAnalyzeFeedback(feedback.id)}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            Analyze with AI
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Feedback Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="glass-card p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Feedback
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source
                </label>
                <select
                  value={newFeedback.source}
                  onChange={(e) => setNewFeedback({ ...newFeedback, source: e.target.value as typeof newFeedback.source })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="rejection">Rejection Email</option>
                  <option value="interview">Interview Feedback</option>
                  <option value="mentor">Mentor Feedback</option>
                  <option value="self">Self Reflection</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    value={newFeedback.company}
                    onChange={(e) => setNewFeedback({ ...newFeedback, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role (optional)
                  </label>
                  <input
                    type="text"
                    value={newFeedback.role}
                    onChange={(e) => setNewFeedback({ ...newFeedback, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feedback Message
                </label>
                <textarea
                  value={newFeedback.message}
                  onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                  required
                  rows={5}
                  placeholder="Paste the feedback or write your reflection here..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Add Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
