import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const checkSession = async () => {
      const stored = localStorage.getItem('krishi_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setUser(parsed)

          // If token exists, refresh profile from FastAPI backend
          if (parsed?.token || parsed?.access_token) {
            try {
              const res = await authAPI.getProfile()
              if (res?.data) {
                const refreshed = {
                  ...res.data,
                  token: parsed.token || parsed.access_token,
                }
                setUser(refreshed)
                localStorage.setItem('krishi_user', JSON.stringify(refreshed))
              }
            } catch (apiErr) {
              // If backend is unreachable or token is invalid, keep stored if not 401
              if (apiErr?.response?.status === 401) {
                localStorage.removeItem('krishi_user')
                setUser(null)
              }
            }
          }
        } catch {
          localStorage.removeItem('krishi_user')
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkSession()
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('krishi_user', JSON.stringify(userData))
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    localStorage.removeItem('krishi_user')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('krishi_user', JSON.stringify(updated))
  }

  const refreshProfile = async () => {
    try {
      const res = await authAPI.getProfile()
      if (res?.data) {
        updateUser(res.data)
      }
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
