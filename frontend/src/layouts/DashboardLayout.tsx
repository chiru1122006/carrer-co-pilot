import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  User, 
  Target, 
  Map, 
  Briefcase, 
  MessageSquare,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Bot,
  Settings,
  FileText
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Tooltip } from '../components'

const navItems = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/profile', label: 'Profile', icon: User },
  { path: '/app/skills', label: 'Skill Gap', icon: Target },
  { path: '/app/roadmap', label: 'Roadmap', icon: Map },
  { path: '/app/resume', label: 'Resume', icon: FileText },
  { path: '/app/applications', label: 'Applications', icon: Briefcase },
  { path: '/app/feedback', label: 'Feedback', icon: MessageSquare },
  { path: '/app/chat', label: 'AI Coach', icon: Bot },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-claude-text">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-white border-r border-[#e5e5e5] shadow-sm
        transform transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`
            flex items-center justify-between p-4 border-b border-[#e5e5e5]
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}>
            <Link to="/app" className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-lg bg-[#111111] text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                AI
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-semibold text-[#111111]">Career AI</span>
              )}
            </Link>
            <button 
              className="lg:hidden text-[#6b7280] hover:text-[#111111] transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.path)
              const NavLink = (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors
                    ${sidebarCollapsed ? 'justify-center px-3' : ''}
                    ${active
                      ? 'bg-[#faf7f2] text-[#111111] font-medium'
                      : 'text-[#6b7280] hover:bg-[#f3f3f3] hover:text-[#111111]'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#111111]' : ''}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {active && (
                        <ChevronRight className="w-4 h-4 ml-auto text-[#111111]" />
                      )}
                    </>
                  )}
                </Link>
              )
              
              return sidebarCollapsed ? (
                <Tooltip key={item.path} content={item.label} side="right">
                  {NavLink}
                </Tooltip>
              ) : NavLink
            })}
          </nav>

          {/* Collapse button - desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-full py-3 border-t border-[#e5e5e5] text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f3f3] transition-all"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </div>
            )}
          </button>

          {/* User section */}
          <div className={`p-3 border-t border-[#e5e5e5] ${sidebarCollapsed ? 'px-2' : ''}`}>
            <div className={`
              flex items-center gap-3 p-3 rounded-lg bg-[#faf7f2] mb-3
              ${sidebarCollapsed ? 'justify-center p-2' : ''}
            `}>
              <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-medium flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111111] truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-[#6b7280] truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              )}
            </div>

            {sidebarCollapsed ? (
              <div className="flex flex-col gap-2">
                <Tooltip content="Settings" side="right">
                  <button className="w-full flex items-center justify-center p-2 rounded-lg text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f3f3] transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </Tooltip>
                <Tooltip content="Logout" side="right">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center p-2 rounded-lg text-[#6b7280] hover:text-red-500 hover:bg-[#f3f3f3] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[#6b7280] hover:text-red-500 hover:bg-[#f3f3f3] transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign out</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Mobile header */}
        <header className="sticky top-0 z-30 lg:hidden">
          <div className="bg-white border-b border-[#e5e5e5] flex items-center justify-between px-4 py-3 shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f3f3] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
                AI
              </div>
              <span className="font-semibold text-[#111111]">Career AI</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={`${location.pathname === '/app/chat' ? 'h-screen' : 'p-4 lg:p-8'}`}>
          <div className={location.pathname === '/app/chat' ? 'h-full' : 'animate-fade-in-up'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
