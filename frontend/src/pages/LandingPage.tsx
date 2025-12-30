import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Brain, 
  ChevronRight, 
  Check,
  Zap,
  Users,
  Award,
  ArrowRight
} from 'lucide-react'

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Our agents deeply analyze your profile to understand your unique strengths and growth areas.',
      gradient: 'from-primary-500/20 to-primary-600/10'
    },
    {
      icon: Target,
      title: 'Skill Gap Detection',
      description: 'Automatically identify missing skills and get prioritized learning recommendations.',
      gradient: 'from-red-500/20 to-red-600/10'
    },
    {
      icon: TrendingUp,
      title: 'Smart Roadmaps',
      description: 'AI-generated weekly learning plans tailored to your goals and timeline.',
      gradient: 'from-green-500/20 to-green-600/10'
    },
    {
      icon: Zap,
      title: 'Opportunity Matching',
      description: 'Get matched with jobs and internships that align with your skills and aspirations.',
      gradient: 'from-yellow-500/20 to-yellow-600/10'
    },
    {
      icon: Users,
      title: 'Feedback Learning',
      description: 'Turn rejections into insights. Our AI learns from your journey to improve recommendations.',
      gradient: 'from-accent-500/20 to-accent-600/10'
    },
    {
      icon: Award,
      title: 'Career Readiness Score',
      description: 'Track your progress with a dynamic score that reflects your job-market readiness.',
      gradient: 'from-orange-500/20 to-orange-600/10'
    }
  ]

  const steps = [
    { step: 1, title: 'Profile', desc: 'Tell us about yourself', color: 'from-primary-500 to-primary-600' },
    { step: 2, title: 'Plan', desc: 'AI creates your roadmap', color: 'from-accent-500 to-accent-600' },
    { step: 3, title: 'Act', desc: 'Learn and apply', color: 'from-green-500 to-green-600' },
    { step: 4, title: 'Improve', desc: 'Grow from feedback', color: 'from-orange-500 to-orange-600' }
  ]

  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CareerAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-claude-text-secondary hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 rounded-full font-medium bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-glow transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[128px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Powered by Agentic AI
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up leading-tight">
              Your AI Career Companion That{' '}
              <span className="text-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">Thinks, Plans & Grows</span>{' '}
              With You
            </h1>
            
            <p className="text-xl text-claude-text-secondary mb-10 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
              Not just a chatbot. A true AI agent that understands your journey, 
              reasons about your career path, and takes action to help you succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-delay-200">
              <Link
                to="/signup"
                className="group px-8 py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-glow transition-all flex items-center gap-2"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Start Your Career Journey
                <ArrowRight className={`w-5 h-5 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 text-claude-text-secondary hover:text-white font-medium transition-colors flex items-center gap-2"
              >
                Learn More
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Animated Flow Diagram */}
          <div className="mt-24 animate-fade-in-up animate-delay-300">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
              {steps.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br ${step.color} shadow-lg animate-float`} 
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      {step.step}
                    </div>
                    <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-claude-text-muted">{step.desc}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-6 h-6 text-white/20 mx-4 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-claude-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              An AI System That Actually{' '}
              <span className="text-gradient">Thinks</span>
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Our multi-agent architecture observes, reasons, plans, and acts - just like a real career mentor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-claude-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Architecture Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 md:p-12 overflow-hidden relative">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="grid md:grid-cols-2 gap-12 items-center relative">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Real Agentic Intelligence
                </h2>
                <p className="text-claude-text-secondary mb-6">
                  Unlike simple chatbots, our system uses multiple specialized AI agents that work together:
                </p>
                <ul className="space-y-4">
                  {[
                    'Reasoning Agent - Analyzes your profile and decides career paths',
                    'Skill Gap Agent - Identifies what you need to learn',
                    'Planner Agent - Creates personalized roadmaps',
                    'Feedback Agent - Learns from your journey to improve',
                    'Memory System - Remembers your context and grows with you'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 group">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-500/30 transition-colors">
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-claude-text-secondary group-hover:text-white transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-white/5 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-12 h-12 text-primary-400 animate-pulse-slow" />
                    </div>
                    <p className="text-lg font-medium text-claude-text-secondary">
                      Observe → Reason → Plan → Act → Learn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary-500/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent-500/20 rounded-full blur-[60px] pointer-events-none" />
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg text-claude-text-secondary mb-8 relative">
              Join thousands of students and professionals using AI to accelerate their career growth.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-glow transition-all relative"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">CareerAI</span>
          </div>
          <p className="text-sm text-claude-text-muted">
            © 2025 CareerAI. Built with ❤️ and AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
