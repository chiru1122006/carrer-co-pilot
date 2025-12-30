import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Download, 
  Brain, 
  RefreshCw,
  Target,
  Sparkles,
  X,
  ChevronRight,
  Building2,
  AlertCircle,
  Check,
  FileCheck,
  Percent,
  Lightbulb,
  Edit3,
  Eye
} from 'lucide-react'
import { resumeApi } from '../services/api'
import type { Resume, ResumeMatchAnalysis } from '../types'
import { formatDate } from '../lib/utils'

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTailoring, setIsTailoring] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showTailorModal, setShowTailorModal] = useState(false)
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ResumeMatchAnalysis | null>(null)
  const [generateSuccess, setGenerateSuccess] = useState(false)
  const [tailorSuccess, setTailorSuccess] = useState(false)
  
  const [generateForm, setGenerateForm] = useState({
    target_role: '',
    target_company: '',
    job_description: ''
  })
  
  const [tailorForm, setTailorForm] = useState({
    target_role: '',
    target_company: '',
    job_description: '',
    resume_id: null as number | null
  })
  
  const [analyzeForm, setAnalyzeForm] = useState({
    job_description: '',
    resume_id: null as number | null
  })

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const data = await resumeApi.getAll()
      setResumes(data)
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    try {
      await resumeApi.generate(
        generateForm.target_role,
        generateForm.target_company || undefined,
        generateForm.job_description || undefined
      )
      setGenerateSuccess(true)
      setTimeout(() => {
        setShowGenerateModal(false)
        setGenerateSuccess(false)
        setGenerateForm({ target_role: '', target_company: '', job_description: '' })
        fetchResumes()
      }, 1500)
    } catch (error) {
      console.error('Failed to generate resume:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTailor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTailoring(true)
    try {
      await resumeApi.tailor(
        tailorForm.job_description,
        tailorForm.target_role,
        tailorForm.target_company || undefined,
        tailorForm.resume_id || undefined
      )
      setTailorSuccess(true)
      setTimeout(() => {
        setShowTailorModal(false)
        setTailorSuccess(false)
        setTailorForm({ target_role: '', target_company: '', job_description: '', resume_id: null })
        fetchResumes()
      }, 1500)
    } catch (error) {
      console.error('Failed to tailor resume:', error)
    } finally {
      setIsTailoring(false)
    }
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)
    try {
      const result = await resumeApi.analyze(
        analyzeForm.job_description,
        analyzeForm.resume_id || undefined
      )
      setAnalysisResult(result)
    } catch (error) {
      console.error('Failed to analyze resume:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this resume?')) return
    try {
      await resumeApi.deactivate(id)
      fetchResumes()
    } catch (error) {
      console.error('Failed to deactivate resume:', error)
    }
  }

  const getMatchBadgeStyle = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#111111] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6b7280]">Loading resumes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] -m-4 lg:-m-8">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#111111]">
                Resume Builder
              </h1>
              <p className="text-[#6b7280] mt-1 text-sm">
                AI-powered resume generation, tailoring, and optimization
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAnalyzeModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e5e5] text-[#111111] rounded-lg text-sm font-medium hover:bg-[#f3f3f3] transition-colors"
              >
                <Target className="w-4 h-4" />
                Analyze Match
              </button>
              <button
                onClick={() => setShowTailorModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e5e5] text-[#111111] rounded-lg text-sm font-medium hover:bg-[#f3f3f3] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Tailor Resume
              </button>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white rounded-lg text-sm font-medium hover:bg-[#000000] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-5 border border-[#e5e5e5] hover:border-[#111111] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#6b7280]" />
              <span className="text-xs text-[#6b7280] font-medium">Total Resumes</span>
            </div>
            <p className="text-2xl font-semibold text-[#111111]">{resumes.length}</p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-[#e5e5e5] hover:border-[#111111] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-4 h-4 text-[#6b7280]" />
              <span className="text-xs text-[#6b7280] font-medium">Active</span>
            </div>
            <p className="text-2xl font-semibold text-[#111111]">
              {resumes.filter(r => r.is_active).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-[#e5e5e5] hover:border-[#111111] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-[#6b7280]" />
              <span className="text-xs text-[#6b7280] font-medium">PDFs Generated</span>
            </div>
            <p className="text-2xl font-semibold text-[#111111]">
              {resumes.filter(r => r.pdf_generated).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-[#e5e5e5] hover:border-[#111111] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-[#6b7280]" />
              <span className="text-xs text-[#6b7280] font-medium">Avg Match</span>
            </div>
            <p className="text-2xl font-semibold text-[#111111]">
              {resumes.length > 0 
                ? Math.round(resumes.reduce((acc, r) => acc + r.match_score, 0) / resumes.length)
                : 0}%
            </p>
          </div>
        </div>

        {/* Resume List */}
        {resumes.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-12 text-center">
            <div className="w-16 h-16 bg-[#f3f3f3] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[#6b7280]" />
            </div>
            <h3 className="text-lg font-medium text-[#111111] mb-2">No resumes yet</h3>
            <p className="text-[#6b7280] mb-6 max-w-md mx-auto">
              Generate your first AI-powered resume tailored to your target role
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] text-white rounded-lg font-medium hover:bg-[#000000] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate Resume
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-xl border border-[#e5e5e5] hover:border-[#111111] transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#111111]">
                          {resume.role_type}
                        </h3>
                        <span className="px-2 py-0.5 bg-[#f3f3f3] text-[#6b7280] text-xs font-medium rounded">
                          v{resume.version}
                        </span>
                        {resume.is_active && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#6b7280]">
                        {resume.target_company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {resume.target_company}
                          </span>
                        )}
                        <span>Created {formatDate(resume.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {resume.match_score > 0 && (
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getMatchBadgeStyle(resume.match_score)}`}>
                          {resume.match_score}% Match
                        </span>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedResume(resume)
                            setShowDetailModal(true)
                          }}
                          className="p-2 text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f3f3] rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        {resume.pdf_generated && (
                          <a
                            href={resumeApi.viewPdf(resume.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#6b7280] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View PDF"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                        )}
                        {resume.pdf_generated && (
                          <a
                            href={resumeApi.downloadPdf(resume.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f3f3] rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(resume.id)}
                          className="p-2 text-[#6b7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Emphasis Areas */}
                  {resume.emphasis_areas && resume.emphasis_areas.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {resume.emphasis_areas.slice(0, 5).map((area, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#faf7f2] text-[#6b7280] text-xs rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e5e5e5]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#111111]">Generate Resume</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-2 hover:bg-[#f3f3f3] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              {generateSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-medium text-[#111111]">Resume Generated!</h3>
                  <p className="text-[#6b7280] mt-1">Your new resume is ready</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Target Role *
                    </label>
                    <input
                      type="text"
                      value={generateForm.target_role}
                      onChange={(e) => setGenerateForm({ ...generateForm, target_role: e.target.value })}
                      placeholder="e.g., Frontend Developer"
                      className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Target Company (optional)
                    </label>
                    <input
                      type="text"
                      value={generateForm.target_company}
                      onChange={(e) => setGenerateForm({ ...generateForm, target_company: e.target.value })}
                      placeholder="e.g., Google"
                      className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Job Description (optional)
                    </label>
                    <textarea
                      value={generateForm.job_description}
                      onChange={(e) => setGenerateForm({ ...generateForm, job_description: e.target.value })}
                      placeholder="Paste job description to tailor the resume..."
                      rows={5}
                      className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || !generateForm.target_role}
                    className="w-full py-3 bg-[#111111] text-white rounded-lg font-medium hover:bg-[#000000] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Generate Resume
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Tailor Modal */}
      {showTailorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e5e5e5]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#111111]">Tailor Resume</h2>
                <button
                  onClick={() => setShowTailorModal(false)}
                  className="p-2 hover:bg-[#f3f3f3] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleTailor} className="p-6 space-y-4">
              {tailorSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-medium text-[#111111]">Resume Tailored!</h3>
                  <p className="text-[#6b7280] mt-1">A new version has been created</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Base Resume (optional)
                    </label>
                    <select
                      value={tailorForm.resume_id || ''}
                      onChange={(e) => setTailorForm({ ...tailorForm, resume_id: e.target.value ? Number(e.target.value) : null })}
                      className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent"
                    >
                      <option value="">Latest Resume</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.role_type} v{r.version}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Target Role *
                    </label>
                    <input
                      type="text"
                      value={tailorForm.target_role}
                      onChange={(e) => setTailorForm({ ...tailorForm, target_role: e.target.value })}
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Target Company
                    </label>
                    <input
                      type="text"
                      value={tailorForm.target_company}
                      onChange={(e) => setTailorForm({ ...tailorForm, target_company: e.target.value })}
                      placeholder="e.g., Meta"
                      className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Job Description *
                    </label>
                    <textarea
                      value={tailorForm.job_description}
                      onChange={(e) => setTailorForm({ ...tailorForm, job_description: e.target.value })}
                      placeholder="Paste the job description here..."
                      rows={6}
                      className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isTailoring || !tailorForm.target_role || !tailorForm.job_description}
                    className="w-full py-3 bg-[#111111] text-white rounded-lg font-medium hover:bg-[#000000] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isTailoring ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Tailoring...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Tailor Resume
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Analyze Modal */}
      {showAnalyzeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e5e5e5]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#111111]">Analyze Resume Match</h2>
                <button
                  onClick={() => {
                    setShowAnalyzeModal(false)
                    setAnalysisResult(null)
                  }}
                  className="p-2 hover:bg-[#f3f3f3] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {!analysisResult ? (
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Select Resume
                    </label>
                    <select
                      value={analyzeForm.resume_id || ''}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, resume_id: e.target.value ? Number(e.target.value) : null })}
                      className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent"
                    >
                      <option value="">Latest Resume</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.role_type} v{r.version}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Job Description *
                    </label>
                    <textarea
                      value={analyzeForm.job_description}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, job_description: e.target.value })}
                      placeholder="Paste the job description to analyze match..."
                      rows={8}
                      className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing || !analyzeForm.job_description}
                    className="w-full py-3 bg-[#111111] text-white rounded-lg font-medium hover:bg-[#000000] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        Analyze Match
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center pb-6 border-b border-[#e5e5e5]">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                      analysisResult.overall_match_score >= 80 ? 'bg-emerald-100' :
                      analysisResult.overall_match_score >= 60 ? 'bg-amber-100' : 'bg-red-100'
                    }`}>
                      <span className={`text-3xl font-bold ${
                        analysisResult.overall_match_score >= 80 ? 'text-emerald-700' :
                        analysisResult.overall_match_score >= 60 ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {analysisResult.overall_match_score}%
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-[#111111]">Match Score</h3>
                    <p className="text-[#6b7280] text-sm mt-1">{analysisResult.application_advice}</p>
                  </div>

                  {/* Category Scores */}
                  <div>
                    <h4 className="font-medium text-[#111111] mb-3">Category Breakdown</h4>
                    <div className="space-y-3">
                      {Object.entries(analysisResult.category_scores).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-[#6b7280] capitalize">{key.replace('_', ' ')}</span>
                            <span className="font-medium text-[#111111]">{value}%</span>
                          </div>
                          <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                value >= 80 ? 'bg-emerald-500' :
                                value >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Critical Gaps */}
                  {analysisResult.gaps.critical.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Critical Gaps
                      </h4>
                      <ul className="space-y-1">
                        {analysisResult.gaps.critical.map((gap, idx) => (
                          <li key={idx} className="text-sm text-red-600">• {gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResult.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#111111] mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Recommendations
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-3 bg-[#faf7f2] rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm text-[#111111]">{rec.area}</span>
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-[#e5e5e5] text-[#6b7280]'
                              }`}>
                                {rec.priority}
                              </span>
                            </div>
                            <p className="text-sm text-[#6b7280]">{rec.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setAnalysisResult(null)}
                    className="w-full py-3 bg-[#111111] text-white rounded-lg font-medium hover:bg-[#000000] transition-colors"
                  >
                    Analyze Another
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e5e5e5]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#111111]">
                    {selectedResume.role_type}
                  </h2>
                  <p className="text-sm text-[#6b7280]">
                    Version {selectedResume.version} • Created {formatDate(selectedResume.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-[#f3f3f3] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {selectedResume.resume_data && (
                <>
                  {/* Summary */}
                  <div>
                    <h4 className="font-medium text-[#111111] mb-2">Professional Summary</h4>
                    <p className="text-[#6b7280] text-sm">{selectedResume.resume_data.summary}</p>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-medium text-[#111111] mb-2">Skills</h4>
                    <div className="space-y-2">
                      {/* Handle array format from new backend */}
                      {Array.isArray(selectedResume.resume_data.skills) ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedResume.resume_data.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-[#f3f3f3] text-[#111111] text-xs rounded">
                              {skill.name} ({skill.level}%)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <>
                          {selectedResume.resume_data.skills?.technical && selectedResume.resume_data.skills.technical.length > 0 && (
                            <div>
                              <span className="text-xs text-[#6b7280] font-medium">Technical:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedResume.resume_data.skills.technical.map((skill, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-[#f3f3f3] text-[#111111] text-xs rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedResume.resume_data.skills?.tools && selectedResume.resume_data.skills.tools.length > 0 && (
                            <div>
                              <span className="text-xs text-[#6b7280] font-medium">Tools:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedResume.resume_data.skills.tools.map((tool, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-[#faf7f2] text-[#6b7280] text-xs rounded">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  {selectedResume.resume_data.experience && selectedResume.resume_data.experience.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#111111] mb-2">Experience</h4>
                      <div className="space-y-4">
                        {selectedResume.resume_data.experience.map((exp, idx) => (
                          <div key={idx} className="border-l-2 border-[#e5e5e5] pl-4">
                            <div className="font-medium text-[#111111]">{exp.title || exp.role}</div>
                            <div className="text-sm text-[#6b7280]">{exp.company} • {exp.duration}</div>
                            <ul className="mt-2 space-y-1">
                              {(exp.achievements || exp.points || []).map((ach, i) => (
                                <li key={i} className="text-sm text-[#6b7280]">• {ach}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {selectedResume.resume_data.projects && selectedResume.resume_data.projects.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#111111] mb-2">Projects</h4>
                      <div className="space-y-3">
                        {selectedResume.resume_data.projects.map((proj, idx) => (
                          <div key={idx} className="p-3 bg-[#faf7f2] rounded-lg">
                            <div className="font-medium text-[#111111]">{proj.name || proj.title}</div>
                            {proj.description && <div className="text-sm text-[#6b7280] mt-1">{proj.description}</div>}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(proj.technologies || proj.tech_stack || []).map((tech, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white text-[#6b7280] text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            {(proj.highlights || proj.points) && (proj.highlights || proj.points)!.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {(proj.highlights || proj.points)!.map((point, i) => (
                                  <li key={i} className="text-sm text-[#6b7280]">• {point}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
                {selectedResume.pdf_generated && (
                  <a
                    href={resumeApi.viewPdf(selectedResume.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View PDF
                  </a>
                )}
                {selectedResume.pdf_generated && (
                  <a
                    href={resumeApi.downloadPdf(selectedResume.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-[#111111] text-white rounded-lg font-medium hover:bg-[#000000] transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setTailorForm({
                      ...tailorForm,
                      resume_id: selectedResume.id,
                      target_role: selectedResume.role_type
                    })
                    setShowTailorModal(true)
                  }}
                  className="flex-1 py-3 bg-white border border-[#e5e5e5] text-[#111111] rounded-lg font-medium hover:bg-[#f3f3f3] transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Create Tailored Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
