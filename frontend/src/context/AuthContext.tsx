import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '../types'
import { authApi, profileApi } from '../services/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        const userData = await authApi.getMe()
        setUser(userData)
      } catch {
        localStorage.removeItem('auth_token')
      }
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    const { user: userData, token } = await authApi.login(email, password)
    localStorage.setItem('auth_token', token)
    setUser(userData)
  }

  const register = async (name: string, email: string, password: string) => {
    const { user: userData, token } = await authApi.register(name, email, password)
    localStorage.setItem('auth_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  // Refresh user data from API - use this after profile updates
  const refreshUser = async (): Promise<User | null> => {
    const token = localStorage.getItem('auth_token')
    if (!token) return null
    
    try {
      const userData = await profileApi.get()
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
