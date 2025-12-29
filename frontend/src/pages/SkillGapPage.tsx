import { useState, useEffect } from 'react'
import { 
  Target, 
  ArrowRight, 
  RefreshCw,
  Brain,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  X,
  BookOpen,
  Youtube,
  FileText,
  Plus,
  Trash2,
  Lightbulb,
  Check
} from 'lucide-react'
import api, { skillsApi } from '../services/api'
import type { Skill } from '../types'
import { Skeleton } from '../components'

interface SkillGap {
  id?: number
  skill_name?: string
  name?: string
  current_level: string | null
  required_level: string
  priority: 'high' | 'medium' | 'low'
  status?: string
  target_role?: string
}

interface LearningResource {
  title: string
  type: 'course' | 'video' | 'article' | 'documentation'
  url: string
  platform: string
}

const LEARNING_RESOURCES: Record<string, LearningResource[]> = {
  'Node.js': [
    { title: 'Node.js Official Docs', type: 'documentation', url: 'https://nodejs.org/docs', platform: 'nodejs.org' },
    { title: 'The Complete Node.js Developer Course', type: 'course', url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/', platform: 'Udemy' },
    { title: 'Node.js Crash Course', type: 'video', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', platform: 'YouTube' },
  ],
  'TypeScript': [
    { title: 'TypeScript Handbook', type: 'documentation', url: 'https://www.typescriptlang.org/docs/', platform: 'typescriptlang.org' },
    { title: 'Understanding TypeScript', type: 'course', url: 'https://www.udemy.com/course/understanding-typescript/', platform: 'Udemy' },
    { title: 'TypeScript Tutorial for Beginners', type: 'video', url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs', platform: 'YouTube' },
  ],
  'React': [
    { title: 'React Official Docs', type: 'documentation', url: 'https://react.dev/', platform: 'react.dev' },
    { title: 'React - The Complete Guide', type: 'course', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', platform: 'Udemy' },
    { title: 'React Tutorial for Beginners', type: 'video', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', platform: 'YouTube' },
  ],
  'Python': [
    { title: 'Python Official Docs', type: 'documentation', url: 'https://docs.python.org/3/', platform: 'python.org' },
    { title: 'Complete Python Bootcamp', type: 'course', url: 'https://www.udemy.com/course/complete-python-bootcamp/', platform: 'Udemy' },
    { title: 'Python Tutorial for Beginners', type: 'video', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', platform: 'YouTube' },
  ],
  'Docker': [
    { title: 'Docker Official Docs', type: 'documentation', url: 'https://docs.docker.com/', platform: 'docker.com' },
    { title: 'Docker & Kubernetes Complete Guide', type: 'course', url: 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/', platform: 'Udemy' },
    { title: 'Docker Tutorial for Beginners', type: 'video', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', platform: 'YouTube' },
  ],
  'AWS': [
    { title: 'AWS Documentation', type: 'documentation', url: 'https://docs.aws.amazon.com/', platform: 'aws.amazon.com' },
    { title: 'AWS Certified Solutions Architect', type: 'course', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate/', platform: 'Udemy' },
    { title: 'AWS Tutorial for Beginners', type: 'video', url: 'https://www.youtube.com/watch?v=k1RI5locZE4', platform: 'YouTube' },
  ],
  'System Design': [
    { title: 'System Design Primer', type: 'article', url: 'https://github.com/donnemartin/system-design-primer', platform: 'GitHub' },
    { title: 'Grokking System Design Interview', type: 'course', url: 'https://www.educative.io/courses/grokking-the-system-design-interview', platform: 'Educative' },
    { title: 'System Design Interview Guide', type: 'video', url: 'https://www.youtube.com/watch?v=UzLMhqg3_Wc', platform: 'YouTube' },
  ],
  'default': [
    { title: 'freeCodeCamp', type: 'course', url: 'https://www.freecodecamp.org/', platform: 'freeCodeCamp' },
    { title: 'MDN Web Docs', type: 'documentation', url: 'https://developer.mozilla.org/', platform: 'Mozilla' },
    { title: 'Programming Tutorials', type: 'video', url: 'https://www.youtube.com/results?search_query=programming+tutorial', platform: 'YouTube' },
  ]
}

// Helper functions for styling
const getLevelColor = (level: string | null): string => {
  switch (level?.toLowerCase()) {
    case 'expert':
      return 'bg-gray-900 text-white'
    case 'advanced':
      return 'bg-gray-700 text-white'
    case 'intermediate':
      return 'bg-gray-500 text-white'
    case 'beginner':
      return 'bg-gray-300 text-gray-800'
    default:
      return 'bg-gray-200 text-gray-600'
  }
}

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-50 text-red-700 border border-red-200'
    case 'medium':
      return 'bg-amber-50 text-amber-700 border border-amber-200'
    case 'low':
      return 'bg-gray-100 text-gray-700 border border-gray-200'
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200'
  }
}

export default function SkillGapPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' })
  const [showResourcesModal, setShowResourcesModal] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Fetch both skills and skill gaps from database
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [skillsResponse, gapsResponse] = await Promise.all([
        api.get('/skills'),
        skillsApi.getGaps()
      ])
      setSkills(skillsResponse.data.data || [])
      setSkillGaps(gapsResponse.skillGaps || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSkillGaps = async () => {
    try {
      const gapsResponse = await skillsApi.getGaps()
      setSkillGaps(gapsResponse.skillGaps || [])
    } catch (error) {
      console.error('Failed to fetch skill gaps:', error)
    }
  }

  const handleAnalyzeGaps = async () => {
    setIsAnalyzing(true)
    try {
      const response = await api.post('/agent/skill-gaps')
      if (response.data.status === 'success') {
        await fetchSkillGaps()
      }
    } catch (error) {
      console.error('Failed to analyze skill gaps:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleViewResources = (skillName: string) => {
    setSelectedSkill(skillName)
    setShowResourcesModal(true)
  }

  const getResourcesForSkill = (skillName: string): LearningResource[] => {
    const exactMatch = LEARNING_RESOURCES[skillName]
    if (exactMatch) return exactMatch
    
    for (const key of Object.keys(LEARNING_RESOURCES)) {
      if (skillName.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(skillName.toLowerCase())) {
        return LEARNING_RESOURCES[key]
      }
    }
    
    return LEARNING_RESOURCES['default']
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Youtube className="w-4 h-4" />
      case 'course': return <BookOpen className="w-4 h-4" />
      case 'documentation': return <FileText className="w-4 h-4" />
      default: return <ExternalLink className="w-4 h-4" />
    }
  }

  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [addSkillError, setAddSkillError] = useState<string | null>(null)
  const [addSkillSuccess, setAddSkillSuccess] = useState(false)

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkill.name.trim()) return
    
    const isDuplicate = skills.some(
      s => s.skill_name.toLowerCase() === newSkill.name.trim().toLowerCase()
    )
    if (isDuplicate) {
      setAddSkillError('This skill already exists')
      setTimeout(() => setAddSkillError(null), 3000)
      return
    }

    setIsAddingSkill(true)
    setAddSkillError(null)
    
    try {
      await api.post('/skills', {
        skill_name: newSkill.name.trim(),
        level: newSkill.level,
        category: 'general'
      })
      setNewSkill({ name: '', level: 'beginner' })
      setAddSkillSuccess(true)
      setTimeout(() => setAddSkillSuccess(false), 2000)
      await fetchData()
    } catch (error: any) {
      console.error('Failed to add skill:', error)
      setAddSkillError(error.response?.data?.message || 'Failed to add skill')
      setTimeout(() => setAddSkillError(null), 3000)
    } finally {
      setIsAddingSkill(false)
    }
  }

  const handleDeleteSkill = async (id: number) => {
    try {
      await api.delete(`/skills/${id}`)
      await fetchData()
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
      <div className="min-h-screen bg-white">
        {/* Header Skeleton */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton width={300} height={32} className="mb-2 bg-gray-200" />
                <Skeleton width={400} height={20} className="bg-gray-200" />
              </div>
              <Skeleton width={180} height={44} className="bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-[#faf7f2] rounded-xl border border-gray-200 p-6">
              <Skeleton height={400} className="bg-gray-200" />
            </div>
            <div className="bg-[#faf7f2] rounded-xl border border-gray-200 p-6">
              <Skeleton height={400} className="bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Skill Gap Analysis
              </h1>
              <p className="text-base text-gray-600">
                Understand what to learn next and why
              </p>
            </div>
            <button
              onClick={handleAnalyzeGaps}
              disabled={isAnalyzing}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze Skill Gaps
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Current Skills Panel */}
          <section className="bg-[#faf7f2] rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Current Skills
                </h2>
                <p className="text-sm text-gray-600">
                  {skills.length} {skills.length === 1 ? 'skill' : 'skills'} in your profile
                </p>
              </div>
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="Add a new skill..."
                  disabled={isAddingSkill}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                  disabled={isAddingSkill}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  type="submit"
                  disabled={isAddingSkill || !newSkill.name.trim()}
                  className="px-4 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingSkill ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
              </div>
              {addSkillError && (
                <p className="text-sm text-red-600 mt-2">{addSkillError}</p>
              )}
              {addSkillSuccess && (
                <p className="text-sm text-gray-700 mt-2 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Skill added successfully
                </p>
              )}
            </form>

            {/* Skills List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {skills.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm">
                    No skills added yet
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Add your first skill above to get started
                  </p>
                </div>
              ) : (
                skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {skill.skill_name}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                        {skill.level}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Skill Gaps Panel */}
          <section className="bg-[#faf7f2] rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Skill Gaps
              </h2>
              <p className="text-sm text-gray-600">
                What you need to improve to reach your target role
              </p>
            </div>

            {skillGaps.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-2">
                  No skill gaps identified yet
                </p>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                  Click "Analyze Skill Gaps" to let AI identify what skills you need for your target role
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {skillGaps.map((gap: SkillGap, index: number) => (
                  <div
                    key={gap.id || index}
                    className="p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-medium text-gray-900">
                        {gap.skill_name || gap.name}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                        {gap.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(gap.current_level || 'beginner')}`}>
                        {gap.current_level || 'None'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(gap.required_level)}`}>
                        {gap.required_level}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gray-900 h-full rounded-full transition-all duration-500"
                        style={{ width: `${getProgressWidth(gap.current_level, gap.required_level)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Learning Recommendations Section */}
        {skillGaps.length > 0 && (
          <section className="bg-[#faf7f2] rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Recommended Learning Path
              </h2>
              <p className="text-sm text-gray-600">
                Prioritized resources to close your gaps
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillGaps.slice(0, 6).map((gap: SkillGap, index: number) => (
                <div
                  key={gap.id || index}
                  className="p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group cursor-pointer"
                  onClick={() => handleViewResources(gap.skill_name || gap.name || '')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {gap.skill_name || gap.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {gap.current_level || 'beginner'} → {gap.required_level}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-900 font-medium group-hover:gap-2 transition-all">
                    View resources
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Resources Modal */}
      {showResourcesModal && selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Learn {selectedSkill}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Curated resources to help you improve
                </p>
              </div>
              <button
                onClick={() => setShowResourcesModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-3">
              {getResourcesForSkill(selectedSkill).map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg bg-[#faf7f2] border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:text-gray-900 group-hover:border-gray-300 transition-all">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-900 truncate">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {resource.platform} • {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 bg-[#faf7f2]">
              <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-2">
                <Lightbulb className="w-4 h-4 text-gray-400" />
                Tip: Dedicate 1-2 hours daily to practice for faster progress
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
