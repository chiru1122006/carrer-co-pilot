import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SkillGapPage from './pages/SkillGapPage'
import RoadmapPage from './pages/RoadmapPage'
import ApplicationsPage from './pages/ApplicationsPage'
import FeedbackPage from './pages/FeedbackPage'
import ChatPage from './pages/ChatPage'
import ResumePage from './pages/ResumePage'

// Layout
import DashboardLayout from './layouts/DashboardLayout'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected Routes */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            
            <Route path="/app" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="skills" element={<SkillGapPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="resume" element={<ResumePage />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
