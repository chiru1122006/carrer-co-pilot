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
  RefreshCw,
  ArrowUpRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import type { AgentInsight } from '../types'

// Progress Ring Component
const ProgressRing = ({ value, size = 160, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#111111"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-semibold text-[#111111]">{value}</div>
        <div className="text-sm text-[#9ca3af] mt-1">Score</div>
      </div>
    </div>
  )
}

// Progress Bar Component
const ProgressBar = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#6b7280]">{label}</span>
        <span className="text-xs font-medium text-[#111111]">{value}%</span>
      </div>
      <div className="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#111111] rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// Skeleton Component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-[#e5e5e5] rounded ${className}`} />
)

export default function DashboardPage() {
  const { user } = useAuth()
  const [readinessScore, setReadinessScore] = useState<number | null>(null)
  const [readinessBreakdown, setReadinessBreakdown] = useState<{
    skills?: number
    education?: number
    goals?: number
    progress?: number
    applications?: number
  } | null>(null)
  const [insights, setInsights] = useState<AgentInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisSuccess, setAnalysisSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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
      const [skillsRes, goalsRes, plansRes, applicationsRes, profileRes] = await Promise.all([
        api.get('/skills'),
        api.get('/goals'),
        api.get('/plans'),
        api.get('/applications'),
        api.get('/profile')
      ])

      setStats({
        skillsCount: skillsRes.data.data?.length || 0,
        goalsCount: goalsRes.data.data?.length || 0,
        plansCount: plansRes.data.data?.length || 0,
        applicationsCount: applicationsRes.data.data?.length || 0
      })
      
      // Get readiness score from profile if available
      const profile = profileRes.data.data
      if (profile?.readiness_score) {
        setReadinessScore(profile.readiness_score)
      }
      
      // Get readiness history with breakdown
      if (profile?.readiness_history && profile.readiness_history.length > 0) {
        const latestReadiness = profile.readiness_history[0]
        if (latestReadiness.breakdown) {
          setReadinessBreakdown(latestReadiness.breakdown)
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalysisSuccess(false)
    try {
      const response = await api.post('/agent/analyze')
      console.log('=== Full Analysis Response ===')
      console.log('response.data:', JSON.stringify(response.data, null, 2))
      
      if (response.data.status === 'success') {
        const data = response.data.data
        console.log('=== Extracted Data ===')
        console.log('data:', JSON.stringify(data, null, 2))
        
        // Extract readiness score
        const score = data?.readiness_score || data?.reasoning?.analysis?.readiness_score || 0
        console.log('Readiness score:', score)
        setReadinessScore(score)
        
        // Extract insights - handle both array of strings and array of objects
        const rawInsights = data?.insights || []
        console.log('=== Raw Insights ===')
        console.log('Type:', Array.isArray(rawInsights) ? 'Array' : typeof rawInsights)
        console.log('Length:', rawInsights.length)
        console.log('Content:', JSON.stringify(rawInsights, null, 2))
        
        if (rawInsights.length === 0) {
          console.warn('⚠️ No insights returned from API')
        }
        
        // Convert insights to proper format
        const formattedInsights: AgentInsight[] = rawInsights.map((insight: any) => {
          console.log('Processing insight:', typeof insight, insight)
          
          // If insight is already an object with the right structure
          if (typeof insight === 'object' && insight !== null && insight.title) {
            console.log('✓ Insight is already formatted')
            return insight
          }
          
          // If insight is a string, convert it to proper format
          if (typeof insight === 'string') {
            console.log('✓ Converting string insight to object')
            return {
              type: 'recommendation' as const,
              title: insight.includes('🎉') ? 'Great Progress!' : 
                     insight.includes('🎯') ? 'Focus Area' :
                     insight.includes('🚀') ? 'Job Ready' :
                     insight.includes('📝') ? 'Active Applications' :
                     insight.includes('👍') ? 'Good Progress' :
                     insight.includes('💪') ? 'Keep Going' :
                     'Career Insight',
              description: insight.replace(/^[^\s]+\s/, '') // Remove emoji
            }
          }
          
          console.log('⚠️ Unexpected insight format, converting to string')
          return {
            type: 'recommendation' as const,
            title: 'Career Insight',
            description: String(insight)
          }
        })
        
        console.log('=== Formatted Insights ===')
        console.log('Count:', formattedInsights.length)
        console.log('Content:', JSON.stringify(formattedInsights, null, 2))
        
        setInsights(formattedInsights)
        setAnalysisSuccess(true)
        setTimeout(() => setAnalysisSuccess(false), 3000)
        
        // Refresh dashboard data to get updated scores
        await fetchDashboardData()
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const statCards = [
    { label: 'Skills', value: stats.skillsCount, icon: Zap },
    { label: 'Goals', value: stats.goalsCount, icon: Target },
    { label: 'Plans', value: stats.plansCount, icon: BookOpen },
    { label: 'Applications', value: stats.applicationsCount, icon: Briefcase }
  ]

  const breakdownItems = [
    { label: 'Skills', value: readinessBreakdown?.skills || 0 },
    { label: 'Education', value: readinessBreakdown?.education || 0 },
    { label: 'Goals', value: readinessBreakdown?.goals || 0 },
    { label: 'Progress', value: readinessBreakdown?.progress || 0 },
    { label: 'Applications', value: readinessBreakdown?.applications || 0 }
  ]

  const getInsightIcon = (type: string) => {
    switch(type) {
      case 'skill_gap': return { icon: Target, color: '#dc2626' }
      case 'recommendation': return { icon: Sparkles, color: '#2563eb' }
      case 'achievement': return { icon: TrendingUp, color: '#16a34a' }
      case 'opportunity': return { icon: Briefcase, color: '#9333ea' }
      default: return { icon: Brain, color: '#6b7280' }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#e5e5e5] bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#111111]">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-sm text-[#6b7280] mt-1">
                Your AI-powered career overview
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all bg-[#111111] text-white hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Run AI Analysis
                </>
              )}
            </button>
          </div>
          {analysisSuccess && (
            <div className="mt-3 text-sm text-[#16a34a] flex items-center gap-1.5 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Analysis complete
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Readiness Score Card */}
        <section className="bg-[#faf7f2] border border-[#e5e5e5] rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Score Circle */}
            <div className="flex-shrink-0">
              {isLoading ? (
                <Skeleton className="w-40 h-40 rounded-full" />
              ) : (
                <ProgressRing
                  value={readinessScore ?? user?.readiness_score ?? 0}
                  size={160}
                  strokeWidth={8}
                />
              )}
            </div>

            {/* Score Details */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#111111] mb-2">
                Career Readiness Score
              </h2>
              <p className="text-sm text-[#6b7280] mb-6 max-w-2xl leading-relaxed">
                {(readinessScore ?? user?.readiness_score ?? 0) >= 80 
                  ? 'Excellent progress. You\'re well-positioned for your target role. Continue refining your expertise.'
                  : (readinessScore ?? user?.readiness_score ?? 0) >= 60
                  ? 'You\'re making good progress. Focus on addressing the remaining skill gaps to strengthen your profile.'
                  : (readinessScore ?? user?.readiness_score ?? 0) > 0
                  ? 'Keep building your skills. Follow your personalized roadmap to improve your readiness.'
                  : 'Run an AI analysis to calculate your career readiness score and receive personalized insights.'
                }
              </p>
              
              {/* Breakdown */}
              {readinessBreakdown && (
                <div className="space-y-4 mb-6">
                  {breakdownItems.map((item) => (
                    <ProgressBar key={item.label} value={item.value} label={item.label} />
                  ))}
                </div>
              )}
              
              {user?.target_role && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5e5e5]">
                  <Target className="w-4 h-4 text-[#6b7280]" />
                  <span className="text-sm text-[#111111]">Target: {user.target_role}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-[#faf7f2] border border-[#e5e5e5] rounded-xl p-6 hover:shadow-sm transition-shadow"
            >
              <stat.icon className="w-5 h-5 text-[#6b7280] mb-4" />
              <div className="text-3xl font-semibold text-[#111111]">
                {isLoading ? '-' : stat.value}
              </div>
              <div className="text-sm text-[#9ca3af] mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Agent Insights */}
        {insights.length > 0 && (
          <section className="bg-[#faf7f2] border border-[#e5e5e5] rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#6b7280]" />
              <h2 className="text-xl font-semibold text-[#111111]">
                AI Insights
              </h2>
            </div>
            <div className="space-y-3">
              {insights.map((insight, index) => {
                const { icon: Icon, color } = getInsightIcon(insight.type)
                return (
                  <div 
                    key={index}
                    className="bg-white border border-[#e5e5e5] rounded-xl p-5 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#faf7f2]">
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#111111] mb-1">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-[#6b7280] leading-relaxed">
                          {insight.description}
                        </p>
                        {insight.action && (
                          <button className="flex items-center gap-1 mt-3 text-sm text-[#111111] hover:text-[#6b7280] transition-colors">
                            {insight.action}
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="bg-[#faf7f2] border border-[#e5e5e5] rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-[#111111] mb-6">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Update Profile', emoji: '👤', path: '/app/profile', desc: 'Keep your information current' },
              { label: 'View Skill Gaps', emoji: '🎯', path: '/app/skills', desc: 'Identify areas to improve' },
              { label: 'Learning Roadmap', emoji: '🗺️', path: '/app/roadmap', desc: 'Follow your learning path' },
              { label: 'Job Applications', emoji: '💼', path: '/app/applications', desc: 'Browse opportunities' }
            ].map((action) => (
              <a
                key={action.label}
                href={action.path}
                className="group bg-white border border-[#e5e5e5] rounded-xl p-5 hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-3">{action.emoji}</div>
                <div className="font-medium text-[#111111] flex items-center gap-1 mb-1">
                  {action.label}
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{action.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
