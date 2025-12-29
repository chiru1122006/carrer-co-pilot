import { useState, useEffect } from 'react'
import { 
  Briefcase, 
  ExternalLink, 
  Plus, 
  Brain, 
  RefreshCw,
  Building2,
  Calendar,
  Percent,
  X,
  Check,
  Clock,
  TrendingUp
} from 'lucide-react'
import api from '../services/api'
import type { Application } from '../types'
import { getStatusColor, formatDate } from '../lib/utils'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMatching, setIsMatching] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newApp, setNewApp] = useState({
    company: '',
    role: '',
    job_url: '',
    deadline: '',
    notes: ''
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications')
      setApplications(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMatchOpportunities = async () => {
    setIsMatching(true)
    try {
      const response = await api.post('/agent/match-opportunities')
      if (response.data.success) {
        fetchApplications()
      }
    } catch (error) {
      console.error('Failed to match opportunities:', error)
    } finally {
      setIsMatching(false)
    }
  }

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/applications', newApp)
      setNewApp({ company: '', role: '', job_url: '', deadline: '', notes: '' })
      setShowAddModal(false)
      fetchApplications()
    } catch (error) {
      console.error('Failed to add application:', error)
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/applications/${id}`, { status })
      fetchApplications()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    try {
      await api.delete(`/applications/${id}`)
      fetchApplications()
    } catch (error) {
      console.error('Failed to delete application:', error)
    }
  }

  const statusOptions = [
    { value: 'saved', label: 'Saved', icon: Clock },
    { value: 'applied', label: 'Applied', icon: Check },
    { value: 'interviewing', label: 'Interviewing', icon: Building2 },
    { value: 'offered', label: 'Offered', icon: TrendingUp },
    { value: 'rejected', label: 'Rejected', icon: X },
  ]

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Applications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your job applications
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleMatchOpportunities}
            disabled={isMatching}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isMatching ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Matching...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                AI Match
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 gradient-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Application
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusOptions.map((status) => (
          <div key={status.value} className="glass-card p-4 text-center">
            <status.icon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {applications.filter(a => a.status === status.value).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{status.label}</p>
          </div>
        ))}
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your job applications or let AI find matching opportunities
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleMatchOpportunities}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Brain className="w-5 h-5" />
              Find Matches
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-xl"
            >
              <Plus className="w-5 h-5" />
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.id} className="glass-card p-6 card-hover">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {app.role}
                      </h3>
                      {app.match_percentage > 0 && (
                        <span className={`flex items-center gap-1 text-sm font-medium ${getMatchColor(app.match_percentage)}`}>
                          <Percent className="w-4 h-4" />
                          {app.match_percentage}% match
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{app.company}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {app.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due {formatDate(app.deadline)}
                        </span>
                      )}
                      {app.job_url && (
                        <a 
                          href={app.job_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Job
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={app.status}
                    onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(app.status)}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {app.ai_tips && (
                <div className="mt-4 p-3 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                    <span className="text-sm font-medium text-accent-700 dark:text-accent-300">AI Tips</span>
                  </div>
                  <p className="text-sm text-accent-600 dark:text-accent-400">{app.ai_tips}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="glass-card p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Application
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={newApp.company}
                  onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={newApp.role}
                  onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job URL (optional)
                </label>
                <input
                  type="url"
                  value={newApp.job_url}
                  onChange={(e) => setNewApp({ ...newApp, job_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deadline (optional)
                </label>
                <input
                  type="date"
                  value={newApp.deadline}
                  onChange={(e) => setNewApp({ ...newApp, deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
