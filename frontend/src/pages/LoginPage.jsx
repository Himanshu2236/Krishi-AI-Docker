import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { mockUser } from '../services/mockData'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button, InputField } from '../components/UI'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setApiError('')
    try {
      // Real API call to FastAPI backend
      const res = await authAPI.login({
        email: form.email.trim(),
        password: form.password,
      })

      const userData = res.data.user
      userData.token = res.data.access_token
      login(userData)
      navigate('/dashboard')
    } catch (err) {
      // If network error (backend not running yet) or demo credentials
      if (err.message === 'Network Error' || !err.response) {
        // Fallback to demo mode if backend is not started
        login({ ...mockUser, email: form.email })
        navigate('/dashboard')
        return
      }
      setApiError(err?.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const useDemoCredentials = () => {
    setForm({ email: 'ramesh@example.com', password: 'farmer123' })
    setErrors({})
    setApiError('')
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-green-100/50 border border-gray-100 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome back</h2>
        <p className="text-gray-500 text-sm">Sign in to your Krishi AI account</p>
      </div>

      {apiError && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="Email Address"
          name="email"
          type="email"
          placeholder="ramesh@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              className={`w-full px-4 py-2.5 pr-12 rounded-xl border text-sm transition-all outline-none
                ${errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                } bg-white`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        <div className="flex justify-end">
          <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">Forgot password?</a>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </form>

      <div className="mt-4">
        <button
          onClick={useDemoCredentials}
          className="w-full py-2.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors font-medium"
        >
          🌾 Use Demo Credentials
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
          Register for free
        </Link>
      </p>
    </div>
  )
}
