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
      description: 'Our agents deeply analyze your profile to understand your unique strengths and growth areas.'
    },
    {
      icon: Target,
      title: 'Skill Gap Detection',
      description: 'Automatically identify missing skills and get prioritized learning recommendations.'
    },
    {
      icon: TrendingUp,
      title: 'Smart Roadmaps',
      description: 'AI-generated weekly learning plans tailored to your goals and timeline.'
    },
    {
      icon: Zap,
      title: 'Opportunity Matching',
      description: 'Get matched with jobs and internships that align with your skills and aspirations.'
    },
    {
      icon: Users,
      title: 'Feedback Learning',
      description: 'Turn rejections into insights. Our AI learns from your journey to improve recommendations.'
    },
    {
      icon: Award,
      title: 'Career Readiness Score',
      description: 'Track your progress with a dynamic score that reflects your job-market readiness.'
    }
  ]

  const steps = [
    { step: 1, title: 'Profile', desc: 'Tell us about yourself' },
    { step: 2, title: 'Plan', desc: 'AI creates your roadmap' },
    { step: 3, title: 'Act', desc: 'Learn and apply' },
    { step: 4, title: 'Improve', desc: 'Grow from feedback' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">CareerAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 gradient-primary text-white rounded-full font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Powered by Agentic AI
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
              Your AI Career Companion That{' '}
              <span className="gradient-text">Thinks, Plans & Grows</span>{' '}
              With You
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-delay-1">
              Not just a chatbot. A true AI agent that understands your journey, 
              reasons about your career path, and takes action to help you succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
              <Link
                to="/signup"
                className="group px-8 py-4 gradient-primary text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/25 transition-all flex items-center gap-2"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Start Your Career Journey
                <ArrowRight className={`w-5 h-5 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 text-gray-700 dark:text-gray-300 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
              >
                Learn More
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Animated Flow Diagram */}
          <div className="mt-20 animate-fade-in-delay-3">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
              {steps.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl
                      ${index === 0 ? 'bg-primary-500' : ''}
                      ${index === 1 ? 'bg-accent-500' : ''}
                      ${index === 2 ? 'bg-green-500' : ''}
                      ${index === 3 ? 'bg-orange-500' : ''}
                      animate-float
                    `} style={{ animationDelay: `${index * 0.2}s` }}>
                      {step.step}
                    </div>
                    <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-2 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              An AI System That Actually{' '}
              <span className="gradient-text">Thinks</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our multi-agent architecture observes, reasons, plans, and acts - just like a real career mentor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Architecture Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Real Agentic Intelligence
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
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
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Brain className="w-24 h-24 text-primary-500 mx-auto mb-4 animate-pulse-slow" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
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
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of students and professionals using AI to accelerate their career growth.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 gradient-primary text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/25 transition-all"
          >
            Start Free Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">CareerAI</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 CareerAI. Built with ❤️ and AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
