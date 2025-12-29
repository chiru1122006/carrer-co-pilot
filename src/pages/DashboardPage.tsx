import { useState, useEffect } from 'react'
import { 
  Target, 
  TrendingUp, 
  Brain, 
  Sparkles, 
  ChevronRight,
  Zap,
  BookOpen,
  Briefcase,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import type { AgentInsight } from '../types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [readinessScore, setReadinessScore] = useState<number | null>(null)
  const [insights, setInsights] = useState<AgentInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [stats, setStats] = useState({
    skillsCount: 0,
    goalsCount: 0,
    plansCount: 0,
    applicationsCount: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [skillsRes, goalsRes, plansRes, applicationsRes] = await Promise.all([
        api.get('/skills'),
        api.get('/goals'),
        api.get('/plans'),
        api.get('/applications')
      ])

      setStats({
        skillsCount: skillsRes.data.data?.length || 0,
        goalsCount: goalsRes.data.data?.length || 0,
        plansCount: plansRes.data.data?.length || 0,
        applicationsCount: applicationsRes.data.data?.length || 0
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await api.post('/agent/analyze')
      if (response.data.success) {
        setReadinessScore(response.data.data.readiness_score)
        setInsights(response.data.data.insights || [])
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const statCards = [
    { label: 'Skills', value: stats.skillsCount, icon: Zap, color: 'primary' },
    { label: 'Goals', value: stats.goalsCount, icon: Target, color: 'accent' },
    { label: 'Plans', value: stats.plansCount, icon: BookOpen, color: 'green' },
    { label: 'Applications', value: stats.applicationsCount, icon: Briefcase, color: 'orange' }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.target_role ? `Your journey to ${user.target_role}` : 'Your AI-powered career dashboard'}
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Run AI Analysis
            </>
          )}
        </button>
      </div>

      {/* Readiness Score Card */}
      <div className="glass-card p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48 mx-auto lg:mx-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(readinessScore || 0) * 2.83} 283`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {readinessScore !== null ? `${readinessScore}%` : '--'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Readiness</span>
              </div>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Career Readiness Score
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {readinessScore !== null 
                ? readinessScore >= 80 
                  ? 'Excellent! You\'re well-prepared for your target role.'
                  : readinessScore >= 60
                  ? 'Good progress! Focus on filling the remaining skill gaps.'
                  : 'Keep learning! Follow your roadmap to improve your score.'
                : 'Click "Run AI Analysis" to calculate your career readiness score based on your profile, skills, and goals.'
              }
            </p>
            {user?.target_role && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                <Target className="w-4 h-4" />
                <span className="font-medium">Target: {user.target_role}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-6 card-hover">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4
              ${stat.color === 'primary' ? 'bg-primary-100 dark:bg-primary-900/30' : ''}
              ${stat.color === 'accent' ? 'bg-accent-100 dark:bg-accent-900/30' : ''}
              ${stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : ''}
              ${stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' : ''}
            `}>
              <stat.icon className={`w-6 h-6
                ${stat.color === 'primary' ? 'text-primary-600 dark:text-primary-400' : ''}
                ${stat.color === 'accent' ? 'text-accent-600 dark:text-accent-400' : ''}
                ${stat.color === 'green' ? 'text-green-600 dark:text-green-400' : ''}
                ${stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : ''}
              `} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Agent Insights */}
      {insights.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Insights
            </h2>
          </div>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${insight.type === 'skill_gap' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                  ${insight.type === 'recommendation' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                  ${insight.type === 'achievement' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                  ${insight.type === 'opportunity' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                `}>
                  <Brain className={`w-5 h-5
                    ${insight.type === 'skill_gap' ? 'text-red-600 dark:text-red-400' : ''}
                    ${insight.type === 'recommendation' ? 'text-blue-600 dark:text-blue-400' : ''}
                    ${insight.type === 'achievement' ? 'text-green-600 dark:text-green-400' : ''}
                    ${insight.type === 'opportunity' ? 'text-purple-600 dark:text-purple-400' : ''}
                  `} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <button className="flex items-center gap-1 mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      {insight.action}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Update Profile', icon: '👤', path: '/dashboard/profile' },
            { label: 'View Skill Gaps', icon: '🎯', path: '/dashboard/skills' },
            { label: 'Check Roadmap', icon: '🗺️', path: '/dashboard/roadmap' },
            { label: 'Browse Jobs', icon: '💼', path: '/dashboard/applications' }
          ].map((action) => (
            <a
              key={action.label}
              href={action.path}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
