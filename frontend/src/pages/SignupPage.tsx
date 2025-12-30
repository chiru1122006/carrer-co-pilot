import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    setIsLoading(true)
    
    try {
      await register(name, email, password)
      navigate('/onboarding')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Passwords match', valid: password === confirmPassword && confirmPassword.length > 0 }
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle background shapes */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#f5f0e8] rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-[#faf7f2] rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <div className="w-full max-w-[440px] relative animate-fade-in-up">
        {/* Logo Header */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="w-9 h-9 rounded-lg bg-[#111111] flex items-center justify-center transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-xl font-semibold text-[#111111] tracking-tight">Career AI</span>
        </Link>

        {/* Authentication Card */}
        <div className="bg-[#faf7f2] rounded-[20px] border border-[#e5e5e5] p-10 shadow-sm">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold text-[#111111] mb-2 tracking-tight">
              Create your account
            </h1>
            <p className="text-[15px] text-[#6b7280] leading-relaxed">
              Start building your career roadmap
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] animate-fade-in">
              <p className="text-sm text-[#dc2626]">{error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-[#111111]">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9ca3af] group-focus-within:text-[#6b7280] transition-colors" strokeWidth={2} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#f3f3f3] transition-all text-[15px]"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#111111]">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9ca3af] group-focus-within:text-[#6b7280] transition-colors" strokeWidth={2} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#f3f3f3] transition-all text-[15px]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#111111]">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9ca3af] group-focus-within:text-[#6b7280] transition-colors" strokeWidth={2} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#f3f3f3] transition-all text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={2} /> : <Eye className="w-[18px] h-[18px]" strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#111111]">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9ca3af] group-focus-within:text-[#6b7280] transition-colors" strokeWidth={2} />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#f3f3f3] transition-all text-[15px]"
                />
              </div>
            </div>

            {/* Password Requirements Checklist */}
            {(password.length > 0 || confirmPassword.length > 0) && (
              <div className="space-y-2.5 pt-2 animate-fade-in">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2.5">
                    <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all ${
                      check.valid 
                        ? 'bg-[#dcfce7] text-[#16a34a]' 
                        : 'bg-[#f3f3f3] text-[#9ca3af]'
                    }`}>
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                    </div>
                    <span className={`text-sm transition-colors ${
                      check.valid ? 'text-[#16a34a] font-medium' : 'text-[#9ca3af]'
                    }`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-6 rounded-xl font-semibold bg-[#111111] text-white hover:bg-[#000000] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <p className="mt-8 text-center text-[15px] text-[#6b7280]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#111111] font-medium hover:underline underline-offset-2 transition-all">
              Sign in
            </Link>
          </p>
        </div>

        {/* Optional: Privacy Notice */}
        <p className="mt-6 text-center text-xs text-[#9ca3af] px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
