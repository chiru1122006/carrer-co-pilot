import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Brain, 
  RefreshCw,
  Building2,
  ThumbsUp,
  ThumbsDown,
  X,
  ChevronRight,
  Lightbulb,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import api from '../services/api'
import type { Feedback } from '../types'
import { formatRelativeTime } from '../lib/utils'
import { Skeleton } from '../components'

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null)
  const [analyzeSuccess, setAnalyzeSuccess] = useState<number | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
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
      console.log('Feedback API response:', response.data)
      const feedbackData = response.data.data || []
      console.log('Parsed feedback data:', feedbackData)
      setFeedbackList(feedbackData)
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeFeedback = async (id: number) => {
    setIsAnalyzing(id)
    setAnalyzeError(null)
    try {
      const response = await api.post(`/agent/analyze-feedback/${id}`)
      console.log('Feedback analysis response:', response.data)
      if (response.data.status === 'success') {
        setAnalyzeSuccess(id)
        setTimeout(() => setAnalyzeSuccess(null), 3000)
        await fetchFeedback()
      }
    } catch (error: any) {
      console.error('Failed to analyze feedback:', error)
      setAnalyzeError(error.response?.data?.message || 'Failed to analyze feedback')
      setTimeout(() => setAnalyzeError(null), 5000)
    } finally {
      setIsAnalyzing(null)
    }
  }

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      await api.post('/feedback', newFeedback)
      setNewFeedback({ source: 'rejection', company: '', role: '', message: '' })
      setAddSuccess(true)
      setTimeout(() => {
        setAddSuccess(false)
        setShowAddModal(false)
      }, 1500)
      await fetchFeedback()
    } catch (error) {
      console.error('Failed to add feedback:', error)
    } finally {
      setIsAdding(false)
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
        return <ThumbsUp className="w-4 h-4" />
      case 'negative':
        return <ThumbsDown className="w-4 h-4" />
      default:
        return null
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'negative':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
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
      <div className="min-h-screen bg-white">
        {/* Header Skeleton */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton width={240} height={32} className="mb-2" />
                <Skeleton width={300} height={20} />
              </div>
              <Skeleton width={140} height={40} className="rounded-lg" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <div className="bg-[#faf7f2] border border-gray-200 rounded-2xl p-6">
            <Skeleton height={80} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#faf7f2] border border-gray-200 rounded-xl p-5">
                <Skeleton height={60} />
              </div>
            ))}
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <Skeleton height={120} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Feedback & Insights
              </h1>
              <p className="text-sm text-gray-600">
                Turn feedback into actionable improvements
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Insight Summary Card */}
          <div className="bg-[#faf7f2] border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  AI Insight
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feedbackList.length === 0 
                    ? 'Add your first feedback to start receiving AI-powered insights on areas for improvement.'
                    : (feedbackList.filter(f => f.sentiment === 'negative').length > feedbackList.length / 2
                      ? "We've noticed some challenging feedback. Our AI can help analyze patterns and suggest focused improvement areas."
                      : 'Great work collecting feedback! Continue adding more entries to help our AI identify growth opportunities and skill development paths.')}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#faf7f2] border border-gray-200 rounded-xl p-5 text-center hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <p className="text-2xl font-semibold text-gray-900">
                  {feedbackList.length}
                </p>
              </div>
              <p className="text-sm text-gray-600">Total Feedback</p>
            </div>
            <div className="bg-[#faf7f2] border border-gray-200 rounded-xl p-5 text-center hover:border-green-300 transition-colors">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <p className="text-2xl font-semibold text-green-700">
                  {feedbackList.filter(f => f.sentiment === 'positive').length}
                </p>
              </div>
              <p className="text-sm text-gray-600">Positive</p>
            </div>
            <div className="bg-[#faf7f2] border border-gray-200 rounded-xl p-5 text-center hover:border-red-300 transition-colors">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ThumbsDown className="w-4 h-4 text-red-600" />
                <p className="text-2xl font-semibold text-red-700">
                  {feedbackList.filter(f => f.sentiment === 'negative').length}
                </p>
              </div>
              <p className="text-sm text-gray-600">Negative</p>
            </div>
          </div>

          {/* Feedback List */}
          {feedbackList.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No feedback yet
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                Record rejection emails, interview feedback, or self-reflections to receive AI-powered insights and actionable recommendations.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First Feedback
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <div 
                  key={feedback.id} 
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Emoji Icon */}
                    <div className="text-2xl flex-shrink-0">
                      {getSourceIcon(feedback.source)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getSentimentColor(feedback.sentiment)}`}>
                          {getSentimentIcon(feedback.sentiment)}
                          <span className="capitalize">{feedback.sentiment}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs bg-gray-50 text-gray-600 border border-gray-200 capitalize">
                          {feedback.source}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(feedback.created_at)}
                        </span>
                      </div>

                      {/* Meta Info */}
                      {(feedback.company || feedback.role) && (
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{feedback.company}</span>
                          {feedback.role && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>{feedback.role}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Message */}
                      <p className="text-gray-900 mb-4 leading-relaxed">
                        {feedback.message}
                      </p>

                      {/* AI Analysis Block */}
                      {feedback.analysis ? (
                        <div className="bg-[#faf7f2] border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-900">
                              AI Insight
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            {feedback.analysis}
                          </p>
                          {feedback.action_items && feedback.action_items.length > 0 && (
                            <div className="pt-3 border-t border-gray-200 space-y-2">
                              <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                Action Items
                              </p>
                              {feedback.action_items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-start gap-2">
                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-700">
                                    {item}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAnalyzeFeedback(feedback.id)}
                            disabled={isAnalyzing === feedback.id}
                            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAnalyzing === feedback.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Analyzing...</span>
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4" />
                                <span className="border-b border-gray-300 hover:border-gray-900">
                                  Analyze with AI
                                </span>
                              </>
                            )}
                          </button>
                          {analyzeSuccess === feedback.id && (
                            <p className="text-sm text-green-700">✓ Analysis complete!</p>
                          )}
                          {analyzeError && isAnalyzing === null && (
                            <p className="text-sm text-red-700">{analyzeError}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                      aria-label="Delete feedback"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Feedback Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                Add Feedback
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddFeedback} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Source
                </label>
                <select
                  value={newFeedback.source}
                  onChange={(e) => setNewFeedback({ ...newFeedback, source: e.target.value as typeof newFeedback.source })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
                >
                  <option value="rejection">❌ Rejection Email</option>
                  <option value="interview">🎤 Interview Feedback</option>
                  <option value="mentor">👨‍🏫 Mentor Feedback</option>
                  <option value="self">📝 Self Reflection</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Company <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newFeedback.company}
                    onChange={(e) => setNewFeedback({ ...newFeedback, company: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
                    placeholder="e.g., Google"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Role <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newFeedback.role}
                    onChange={(e) => setNewFeedback({ ...newFeedback, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
                    placeholder="e.g., SWE Intern"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Feedback Message
                </label>
                <textarea
                  value={newFeedback.message}
                  onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                  required
                  rows={6}
                  placeholder="Paste the feedback or write your reflection here..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isAdding}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !newFeedback.message.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : addSuccess ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Added!
                    </>
                  ) : (
                    'Add Feedback'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
