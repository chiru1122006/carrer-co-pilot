import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, 
  GraduationCap, 
  Target, 
  Briefcase, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Heart
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

const stepInfo = [
  { number: 1, label: 'Education', icon: GraduationCap },
  { number: 2, label: 'Career Goal', icon: Target },
  { number: 3, label: 'Interests', icon: Heart },
  { number: 4, label: 'Skills', icon: Briefcase }
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
        career_goal: data.target_role,
        current_level: data.experience_years > 3 ? 'advanced' : data.experience_years > 1 ? 'intermediate' : 'beginner',
        education: [{
          level: data.education_level,
          field: data.field_of_study
        }],
        interests: data.interests
      })

      // Add skills using bulk endpoint
      if (data.skills.length > 0) {
        await api.post('/skills/bulk', {
          skills: data.skills.map(skill => ({
            skill_name: skill,
            level: 'beginner',
            category: 'general'
          }))
        })
      }

      // Create initial goal with correct field names
      await api.post('/goals', {
        target_role: data.target_role,
        timeline: '6 months',
        priority: 'high',
        notes: `My goal is to become a ${data.target_role} and build expertise in ${data.interests.slice(0, 3).join(', ')}`
      })

      navigate('/app')
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
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle background shapes */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#f5f0e8] rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-[#faf7f2] rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <div className="w-full max-w-[900px] relative animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#111111] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-[32px] font-semibold text-[#111111] mb-3 tracking-tight">
            Let's set up your career profile
          </h1>
          <p className="text-[16px] text-[#6b7280] leading-relaxed max-w-[500px] mx-auto">
            This helps us personalize your AI guidance, {user?.name || 'there'}
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-3 mb-8">
            {stepInfo.map((stepItem, index) => {
              const isCompleted = stepItem.number < step
              const isActive = stepItem.number === step
              const Icon = stepItem.icon

              return (
                <div key={stepItem.number} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#dcfce7] text-[#16a34a] border-2 border-[#16a34a]'
                          : isActive
                          ? 'bg-[#111111] text-white border-2 border-[#111111]'
                          : 'bg-white text-[#9ca3af] border-2 border-[#e5e5e5]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" strokeWidth={2.5} />
                      ) : (
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors ${
                        isActive ? 'text-[#111111]' : 'text-[#9ca3af]'
                      }`}
                    >
                      {stepItem.label}
                    </span>
                  </div>
                  {index < stepInfo.length - 1 && (
                    <div
                      className={`w-16 h-[2px] mx-3 mb-6 transition-all duration-300 ${
                        stepItem.number < step ? 'bg-[#16a34a]' : 'bg-[#e5e5e5]'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Step Container */}
        <div className="bg-[#faf7f2] rounded-[20px] border border-[#e5e5e5] p-10 shadow-sm min-h-[500px] relative">
          {/* Step 1: Education */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-[24px] font-semibold text-[#111111] mb-2">
                  Tell us about your education
                </h2>
                <p className="text-[15px] text-[#6b7280]">
                  This helps us understand your background
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-4">
                    Education Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {educationOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateData('education_level', option)}
                        className={`p-4 rounded-xl text-left transition-all duration-200 ${
                          data.education_level === option
                            ? 'bg-white border-2 border-[#111111] shadow-sm'
                            : 'bg-white border-2 border-[#e5e5e5] hover:border-[#6b7280]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[15px] ${
                              data.education_level === option
                                ? 'text-[#111111] font-medium'
                                : 'text-[#6b7280]'
                            }`}
                          >
                            {option}
                          </span>
                          {data.education_level === option && (
                            <Check className="w-5 h-5 text-[#111111]" strokeWidth={2.5} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-4">
                    Field of Study
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {fieldOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateData('field_of_study', option)}
                        className={`p-3.5 rounded-xl text-center transition-all duration-200 ${
                          data.field_of_study === option
                            ? 'bg-white border-2 border-[#111111] shadow-sm'
                            : 'bg-white border-2 border-[#e5e5e5] hover:border-[#6b7280]'
                        }`}
                      >
                        <span
                          className={`text-sm ${
                            data.field_of_study === option
                              ? 'text-[#111111] font-medium'
                              : 'text-[#6b7280]'
                          }`}
                        >
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
              <div className="mb-8">
                <h2 className="text-[24px] font-semibold text-[#111111] mb-2">
                  What's your career goal?
                </h2>
                <p className="text-[15px] text-[#6b7280]">
                  Choose the role you're working towards
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-4">
                    Target Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateData('target_role', option)}
                        className={`p-4 rounded-xl text-left transition-all duration-200 ${
                          data.target_role === option
                            ? 'bg-white border-2 border-[#111111] shadow-sm'
                            : 'bg-white border-2 border-[#e5e5e5] hover:border-[#6b7280]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[15px] ${
                              data.target_role === option
                                ? 'text-[#111111] font-medium'
                                : 'text-[#6b7280]'
                            }`}
                          >
                            {option}
                          </span>
                          {data.target_role === option && (
                            <Check className="w-5 h-5 text-[#111111]" strokeWidth={2.5} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-4">
                    Years of Experience
                  </label>
                  <div className="bg-white p-6 rounded-xl border border-[#e5e5e5]">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={data.experience_years}
                      onChange={(e) => updateData('experience_years', parseInt(e.target.value))}
                      className="w-full h-2 bg-[#f3f3f3] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#111111] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-[#9ca3af]">0 years</span>
                      <span className="text-lg font-semibold text-[#111111]">
                        {data.experience_years} year{data.experience_years !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm text-[#9ca3af]">10+ years</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-[24px] font-semibold text-[#111111] mb-2">
                  What interests you?
                </h2>
                <p className="text-[15px] text-[#6b7280]">
                  Select the areas you want to explore
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {interestOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArrayItem('interests', option)}
                    className={`px-5 py-3 rounded-full transition-all duration-200 text-[15px] ${
                      data.interests.includes(option)
                        ? 'bg-[#111111] text-white border-2 border-[#111111]'
                        : 'bg-white text-[#6b7280] border-2 border-[#e5e5e5] hover:border-[#6b7280]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {data.interests.includes(option) && (
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      )}
                      {option}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white rounded-xl border border-[#e5e5e5]">
                <p className="text-sm text-[#6b7280]">
                  Selected: <span className="font-medium text-[#111111]">{data.interests.length}</span> of {interestOptions.length}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Skills */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-[24px] font-semibold text-[#111111] mb-2">
                  What are your current skills?
                </h2>
                <p className="text-[15px] text-[#6b7280]">
                  Tell us what you already know
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {skillOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArrayItem('skills', option)}
                    className={`px-5 py-3 rounded-full transition-all duration-200 text-[15px] ${
                      data.skills.includes(option)
                        ? 'bg-[#111111] text-white border-2 border-[#111111]'
                        : 'bg-white text-[#6b7280] border-2 border-[#e5e5e5] hover:border-[#6b7280]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {data.skills.includes(option) && (
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      )}
                      {option}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white rounded-xl border border-[#e5e5e5]">
                <p className="text-sm text-[#6b7280]">
                  Selected: <span className="font-medium text-[#111111]">{data.skills.length}</span> of {skillOptions.length}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10 pt-8 border-t border-[#e5e5e5]">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-[#6b7280] hover:text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[15px]"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#111111] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000000] active:scale-[0.99] transition-all text-[15px]"
              >
                Continue
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#111111] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#000000] active:scale-[0.99] transition-all text-[15px]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-5 h-5" strokeWidth={2} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Optional: Help text */}
        <p className="mt-6 text-center text-sm text-[#9ca3af]">
          Your information helps us create a personalized learning path
        </p>
      </div>
    </div>
  )
}
