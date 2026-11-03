import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button, InputField } from '../components/UI'

const states = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', state: '', password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.phone) errs.phone = 'Phone is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter valid 10-digit mobile number'
    if (!form.state) errs.state = 'Please select your state'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
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
      const res = await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\s/g, ''),
        password: form.password,
        state: form.state,
      })

      const userData = res.data.user
      userData.token = res.data.access_token
      login(userData)
      navigate('/dashboard')
    } catch (err) {
      if (err.message === 'Network Error' || !err.response) {
        // Fallback demo account if backend server is not running
        login({
          id: '1',
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.state,
          farmSize: '',
          primaryCrops: [],
          token: 'mock_token_123',
          joinDate: new Date().toISOString().split('T')[0],
        })
        navigate('/dashboard')
        return
      }
      setApiError(err?.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-green-100/50 border border-gray-100 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Create Account</h2>
        <p className="text-gray-500 text-sm">Join Krishi AI — free for all farmers</p>
      </div>

      {apiError && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Full Name" name="name" type="text" placeholder="Ramesh Kumar" value={form.name} onChange={handleChange} error={errors.name} autoComplete="name" />
        <InputField label="Email Address" name="email" type="email" placeholder="ramesh@example.com" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
        <InputField label="Mobile Number" name="phone" type="tel" placeholder="9876543210" value={form.phone} onChange={handleChange} error={errors.phone} autoComplete="tel" />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">State</label>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white
              ${errors.state ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}
          >
            <option value="">Select your state</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              className={`w-full px-4 py-2.5 pr-12 rounded-xl border text-sm outline-none bg-white
                ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white
              ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>

        <p className="text-xs text-gray-500">
          By registering, you agree to our{' '}
          <a href="#" className="text-green-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
        </p>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          <UserPlus className="w-4 h-4" />
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">Sign in</Link>
      </p>
    </div>
  )
}
