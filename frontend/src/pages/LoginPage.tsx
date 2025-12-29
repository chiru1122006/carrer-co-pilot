import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await login(email, password)
      navigate('/app')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 relative overflow-hidden">
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
              Welcome back
            </h1>
            <p className="text-[15px] text-[#6b7280] leading-relaxed">
              Continue your career journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] animate-fade-in">
              <p className="text-sm text-[#dc2626]">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Enter your password"
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
                  Sign in
                  <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <p className="mt-8 text-center text-[15px] text-[#6b7280]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#111111] font-medium hover:underline underline-offset-2 transition-all">
              Sign up
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
