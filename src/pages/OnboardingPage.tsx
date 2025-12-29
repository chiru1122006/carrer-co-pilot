import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, 
  GraduationCap, 
  Target, 
  Briefcase, 
  ArrowRight, 
  ArrowLeft,
  Check
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface OnboardingData {
  education_level: string
  field_of_study: string
  target_role: string
  experience_years: number
  interests: string[]
  skills: string[]
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

const fieldOptions = [
  'Computer Science',
  'Engineering',
  'Business',
  'Design',
  'Data Science',
  'Marketing',
  'Finance',
  'Healthcare',
  'Other'
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

const interestOptions = [
  'Web Development',
  'Mobile Apps',
  'AI/ML',
  'Cloud Computing',
  'Cybersecurity',
  'Blockchain',
  'Game Development',
  'IoT',
  'AR/VR',
  'Data Engineering'
]

const skillOptions = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'SQL',
  'AWS',
  'Docker',
  'Git',
  'Machine Learning',
  'Data Analysis',
  'API Design',
  'System Design',
  'Agile/Scrum'
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    education_level: '',
    field_of_study: '',
    target_role: '',
    experience_years: 0,
    interests: [],
    skills: []
  })
  
  const { user } = useAuth()
  const navigate = useNavigate()

  const totalSteps = 4

  const updateData = (field: keyof OnboardingData, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: 'interests' | 'skills', item: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Update user profile
      await api.put('/profile', {
        education_level: data.education_level,
        field_of_study: data.field_of_study,
        target_role: data.target_role,
        experience_years: data.experience_years,
        interests: data.interests
      })

      // Add skills
      for (const skill of data.skills) {
        await api.post('/skills', {
          name: skill,
          level: 'beginner',
          is_target: false
        })
      }

      // Create initial goal
      await api.post('/goals', {
        title: `Become a ${data.target_role}`,
        description: `My goal is to become a ${data.target_role} and build expertise in ${data.interests.slice(0, 3).join(', ')}`,
        target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Onboarding failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.education_level && data.field_of_study
      case 2:
        return data.target_role
      case 3:
        return data.interests.length > 0
      case 4:
        return data.skills.length > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.name || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's set up your career profile
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all
                  ${s < step ? 'bg-green-500 text-white' : ''}
                  ${s === step ? 'gradient-primary text-white' : ''}
                  ${s > step ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : ''}
                `}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Step 1: Education */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
                  <p className="text-gray-600 dark:text-gray-400">Tell us about your background</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Education Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {educationOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateData('education_level', option)}
                        className={`p-3 rounded-xl border-2 text-left transition-all
                          ${data.education_level === option
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                          }
                        `}
                      >
                        <span className={data.education_level === option ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}>
                          {option}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Field of Study
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {fieldOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateData('field_of_study', option)}
                        className={`p-3 rounded-xl border-2 text-center transition-all
                          ${data.field_of_study === option
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                          }
                        `}
                      >
                        <span className={`text-sm ${data.field_of_study === option ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                          {option}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Career Goal */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Career Goal</h2>
                  <p className="text-gray-600 dark:text-gray-400">What role are you targeting?</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Target Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateData('target_role', option)}
                        className={`p-4 rounded-xl border-2 text-left transition-all
                          ${data.target_role === option
                            ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-accent-300'
                          }
                        `}
                      >
                        <span className={data.target_role === option ? 'text-accent-700 dark:text-accent-300' : 'text-gray-700 dark:text-gray-300'}>
                          {option}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Years of Experience
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.experience_years}
                    onChange={(e) => updateData('experience_years', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>0 years</span>
                    <span className="font-medium text-primary-600 dark:text-primary-400">
                      {data.experience_years} year{data.experience_years !== 1 ? 's' : ''}
                    </span>
                    <span>10+ years</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interests</h2>
                  <p className="text-gray-600 dark:text-gray-400">Select areas you want to explore</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {interestOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArrayItem('interests', option)}
                    className={`px-4 py-2 rounded-full border-2 transition-all
                      ${data.interests.includes(option)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-300'
                      }
                    `}
                  >
                    {data.interests.includes(option) && <Check className="w-4 h-4 inline mr-1" />}
                    {option}
                  </button>
                ))}
              </div>
              
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Selected: {data.interests.length} / {interestOptions.length}
              </p>
            </div>
          )}

          {/* Step 4: Skills */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Skills</h2>
                  <p className="text-gray-600 dark:text-gray-400">What do you already know?</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {skillOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArrayItem('skills', option)}
                    className={`px-4 py-2 rounded-full border-2 transition-all
                      ${data.skills.includes(option)
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-300'
                      }
                    `}
                  >
                    {data.skills.includes(option) && <Check className="w-4 h-4 inline mr-1" />}
                    {option}
                  </button>
                ))}
              </div>
              
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Selected: {data.skills.length} / {skillOptions.length}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 gradient-primary text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/25 transition-all"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="flex items-center gap-2 px-6 py-2 gradient-primary text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/25 transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
