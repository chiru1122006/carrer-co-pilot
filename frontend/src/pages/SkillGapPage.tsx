import { useState, useEffect } from 'react'
import { 
  Target, 
  ArrowUp, 
  ArrowRight, 
  RefreshCw,
  Brain,
  Zap,
  TrendingUp,
  ChevronRight
} from 'lucide-react'
import api from '../services/api'
import type { Skill } from '../types'
import { getLevelColor, getPriorityColor } from '../lib/utils'

interface SkillGapData {
  current_skills: Skill[]
  target_skills: { name: string; required_level: string }[]
  gaps: {
    name: string
    current_level: string | null
    required_level: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

export default function SkillGapPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [gapData, setGapData] = useState<SkillGapData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' })

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills')
      setSkills(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeGaps = async () => {
    setIsAnalyzing(true)
    try {
      const response = await api.post('/agent/skill-gap')
      if (response.data.success) {
        setGapData(response.data.data)
      }
    } catch (error) {
      console.error('Failed to analyze skill gaps:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkill.name.trim()) return

    try {
      await api.post('/skills', {
        name: newSkill.name,
        level: newSkill.level,
        is_target: false
      })
      setNewSkill({ name: '', level: 'beginner' })
      fetchSkills()
    } catch (error) {
      console.error('Failed to add skill:', error)
    }
  }

  const handleDeleteSkill = async (id: number) => {
    try {
      await api.delete(`/skills/${id}`)
      fetchSkills()
    } catch (error) {
      console.error('Failed to delete skill:', error)
    }
  }

  const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert']

  const getProgressWidth = (current: string | null, required: string) => {
    const currentIndex = current ? levelOrder.indexOf(current) : -1
    const requiredIndex = levelOrder.indexOf(required)
    if (requiredIndex === 0) return 100
    return Math.max(0, ((currentIndex + 1) / (requiredIndex + 1)) * 100)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skill Gap Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Identify and close the gaps between your current skills and target role
          </p>
        </div>
        <button
          onClick={handleAnalyzeGaps}
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
              Analyze Skill Gaps
            </>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Skills */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Skills
              </h2>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {skills.length} skills
            </span>
          </div>

          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="Add a skill..."
              className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Add
            </button>
          </form>

          {/* Skills List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {skills.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No skills added yet. Add your first skill above.
              </p>
            ) : (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {skill.skill_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                      {skill.level}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Skill Gaps
            </h2>
          </div>

          {!gapData ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Click "Analyze Skill Gaps" to identify what skills you need to develop
              </p>
            </div>
          ) : gapData.gaps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-green-600 dark:text-green-400 font-medium">
                Great! No skill gaps detected.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {gapData.gaps.map((gap, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {gap.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                      {gap.priority} priority
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <span className={`px-2 py-0.5 rounded-full ${getLevelColor(gap.current_level || 'beginner')}`}>
                      {gap.current_level || 'None'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className={`px-2 py-0.5 rounded-full ${getLevelColor(gap.required_level)}`}>
                      {gap.required_level}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="gradient-primary h-2 rounded-full transition-all"
                      style={{ width: `${getProgressWidth(gap.current_level, gap.required_level)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning Recommendations */}
      {gapData && gapData.gaps.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recommended Learning Path
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gapData.gaps.slice(0, 6).map((gap, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Learn {gap.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                    P{index + 1}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Improve from {gap.current_level || 'beginner'} to {gap.required_level}
                </p>
                <button className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  View resources
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
