import { useState, useEffect } from 'react'
import { 
  User, 
  GraduationCap, 
  Target, 
  Heart,
  Save,
  Upload,
  Plus,
  X,
  Check
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { profileApi } from '../services/api'
import { Skeleton } from '../components'

export default function ProfilePage() {
  const { refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    education_level: '',
    field_of_study: '',
    target_role: '',
    experience_years: 0
  })

  // Fetch profile data from API on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsInitialLoading(true)
    try {
      const profileData = await profileApi.get()
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        education_level: profileData.education_level || '',
        field_of_study: profileData.field_of_study || '',
        target_role: profileData.target_role || '',
        experience_years: profileData.experience_years || 0
      })
      setInterests(profileData.interests || [])
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'experience_years' ? parseInt(value) || 0 : value 
    }))
    setIsSaved(false)
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest('')
      setIsSaved(false)
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest))
    setIsSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await profileApi.update({
        ...formData,
        interests
      })
      // Re-fetch profile from API to ensure UI reflects DB state
      await fetchProfile()
      // Also refresh the context user
      await refreshUser()
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const educationOptions = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Bootcamp Graduate',
    'Self-taught'
  ]

  const roleOptions = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'DevOps Engineer',
    'Machine Learning Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst'
  ]

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header skeleton */}
          <div className="mb-12 pb-8 border-b border-[#e5e5e5]">
            <Skeleton width={120} height={32} className="mb-2" />
            <Skeleton width={280} height={20} />
          </div>
          
          {/* Card skeletons */}
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#faf7f2] border border-[#e5e5e5] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
                  <div>
                    <Skeleton width={150} height={20} className="mb-2" />
                    <Skeleton width={220} height={16} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Skeleton height={44} className="rounded-lg" />
                  <Skeleton height={44} className="rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <header className="mb-12 pb-8 border-b border-[#e5e5e5]">
          <h1 className="text-3xl font-semibold text-[#111111] mb-2">Profile</h1>
          <p className="text-[#6b7280]">
            Manage your career information
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <section className="bg-[#faf7f2] border border-[#e5e5e5] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center">
                <User className="w-5 h-5 text-[#6b7280]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#111111]">Basic Information</h2>
                <p className="text-sm text-[#9ca3af]">Your personal details</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111111]">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2 focus:ring-offset-[#faf7f2] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111111]">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-2.5 bg-[#f3f3f3] border border-[#e5e5e5] rounded-lg text-[#6b7280] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Education Card */}
          <section className="bg-[#faf7f2] border border-[#e5e5e5] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#6b7280]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#111111]">Education</h2>
                <p className="text-sm text-[#9ca3af]">Your educational background</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111111]">
                  Education Level
                </label>
                <select
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2 focus:ring-offset-[#faf7f2] appearance-none cursor-pointer transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center'
                  }}
                >
                  <option value="">Select level</option>
                  {educationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111111]">
                  Field of Study
                </label>
                <input
                  type="text"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2 focus:ring-offset-[#faf7f2] transition-all"
                />
              </div>
            </div>
          </section>

          {/* Career Goals Card */}
          <section className="bg-[#faf7f2] border border-[#e5e5e5] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center">
                <Target className="w-5 h-5 text-[#6b7280]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#111111]">Career Goals</h2>
                <p className="text-sm text-[#9ca3af]">Your target role and experience</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111111]">
                  Target Role
                </label>
                <select
                  name="target_role"
                  value={formData.target_role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2 focus:ring-offset-[#faf7f2] appearance-none cursor-pointer transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center'
                  }}
                >
                  <option value="">Select role</option>
                  {roleOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111111]">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2 focus:ring-offset-[#faf7f2] transition-all"
                />
              </div>
            </div>
          </section>

          {/* Interests Card */}
          <section className="bg-[#faf7f2] border border-[#e5e5e5] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#6b7280]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#111111]">Interests</h2>
                <p className="text-sm text-[#9ca3af]">Topics you're interested in</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {interests.length === 0 && (
                <p className="text-sm text-[#9ca3af]">No interests added yet</p>
              )}
              {interests.map(interest => (
                <span 
                  key={interest}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e5e5e5] text-[#111111] text-sm hover:border-[#6b7280] transition-all group"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="text-[#9ca3af] hover:text-[#111111] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                placeholder="Add an interest..."
                className="flex-1 px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2 focus:ring-offset-[#faf7f2] transition-all"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                disabled={!newInterest.trim()}
                className="px-5 py-2.5 rounded-lg bg-white border border-[#e5e5e5] text-[#6b7280] hover:bg-[#f3f3f3] hover:border-[#111111] hover:text-[#111111] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-[#e5e5e5] disabled:hover:text-[#6b7280]"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* Resume Upload Card */}
          <section className="bg-[#faf7f2] border border-[#e5e5e5] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center">
                <Upload className="w-5 h-5 text-[#6b7280]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#111111]">Resume</h2>
                <p className="text-sm text-[#9ca3af]">Upload your resume for AI analysis</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-12 text-center bg-white hover:border-[#6b7280] hover:bg-[#fafafa] transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-lg bg-[#faf7f2] border border-[#e5e5e5] flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:border-[#6b7280] transition-all">
                <Upload className="w-6 h-6 text-[#6b7280] group-hover:text-[#111111] transition-colors" />
              </div>
              <p className="text-[#111111] mb-2 font-medium">
                Drag and drop your resume here, or click to browse
              </p>
              <p className="text-sm text-[#9ca3af]">
                PDF, DOC, or DOCX (max 5MB)
              </p>
            </div>
          </section>

          {/* Save Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-6">
            {isSaved && (
              <span className="flex items-center gap-2 text-[#16a34a] font-medium">
                <Check className="w-4 h-4" />
                Profile saved successfully
              </span>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all bg-[#111111] text-white hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
