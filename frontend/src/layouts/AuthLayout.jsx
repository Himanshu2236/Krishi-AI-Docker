import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthLayout() {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg shadow-green-200">
            <span className="text-3xl">🌾</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Krishi <span className="text-green-600">AI</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Intelligent Agriculture Assistant</p>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
