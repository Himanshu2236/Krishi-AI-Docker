import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Card, Button, InputField, SectionHeader, Badge } from '../components/UI'
import { User, Camera, Save, MapPin, Phone, Mail, Crop, CalendarDays, Shield, Bell, Edit3, Check } from 'lucide-react'

const cropOptions = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Soybean', 'Groundnut']

export default function UserProfile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    farmSize: user?.farmSize || '',
    primaryCrops: user?.primaryCrops || [],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const toggleCrop = (crop) => {
    setForm(f => ({
      ...f,
      primaryCrops: f.primaryCrops.includes(crop)
        ? f.primaryCrops.filter(c => c !== crop)
        : [...f.primaryCrops, crop],
    }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const res = await authAPI.updateProfile({
        name: form.name.trim(),
        phone: form.phone ? form.phone.replace(/\s/g, '') : undefined,
        location: form.location,
        farm_size: form.farmSize,
        primary_crops: form.primaryCrops,
      })
      if (res?.data) {
        updateUser(res.data)
      } else {
        updateUser(form)
      }
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      updateUser(form)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const statsData = [
    { label: 'Recommendations', value: '24', icon: '🌾' },
    { label: 'Disease Scans', value: '8', icon: '🔬' },
    { label: 'Chats', value: '47', icon: '💬' },
    { label: 'Member Since', value: user?.joinDate || '2024', icon: '📅' },
  ]

  return (
    <div className="space-y-6 fade-in-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>My Profile</h1>
        </div>
        <p className="text-green-100">Manage your account details and farm information</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          <Check className="w-4 h-4" />
          Profile updated successfully!
        </div>
      )}

      {/* Profile card */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6 pb-6 border-b border-gray-100">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-green-200/40">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {editing && (
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{user?.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-gray-500 text-sm">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user?.email}</span>
                {user?.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user?.location}</span>}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(user?.primaryCrops || []).map(c => <Badge key={c} color="green">{c}</Badge>)}
              </div>
            </div>

            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${editing
                  ? 'bg-green-600 text-white shadow-md shadow-green-200/50 hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {editing ? (
                saving ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving</> : <><Save className="w-4 h-4" />Save</>
              ) : (
                <><Edit3 className="w-4 h-4" />Edit Profile</>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statsData.map(({ label, value, icon }) => (
              <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Form fields */}
          <div className="grid md:grid-cols-2 gap-5">
            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={!editing}
              error={errors.name}
              placeholder="Your full name"
            />
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={!editing}
              error={errors.email}
              placeholder="your@email.com"
            />
            <InputField
              label="Mobile Number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              disabled={!editing}
              placeholder="+91 XXXXX XXXXX"
            />
            <InputField
              label="Location (City, State)"
              name="location"
              value={form.location}
              onChange={handleChange}
              disabled={!editing}
              placeholder="e.g. Pune, Maharashtra"
            />
            <InputField
              label="Farm Size"
              name="farmSize"
              value={form.farmSize}
              onChange={handleChange}
              disabled={!editing}
              placeholder="e.g. 5 acres"
            />
          </div>

          {/* Primary crops */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Primary Crops</label>
            <div className="flex flex-wrap gap-2">
              {cropOptions.map(crop => (
                <button
                  key={crop}
                  onClick={() => editing && toggleCrop(crop)}
                  disabled={!editing}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                    ${form.primaryCrops.includes(crop)
                      ? 'bg-green-600 text-white border-green-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                    }
                    ${!editing ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              <Button loading={saving} onClick={handleSave}>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => { setEditing(false); setErrors({}) }}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Settings cards */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <div className="p-5">
            <SectionHeader title="Security" />
            <div className="space-y-3">
              {[
                { label: 'Change Password', desc: 'Update your account password', icon: Shield },
                { label: 'Two-Factor Auth', desc: 'Add extra security to your account', icon: Shield },
              ].map(({ label, desc, icon: Icon }) => (
                <button key={label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left transition-colors">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <SectionHeader title="Notifications" />
            <div className="space-y-3">
              {[
                { label: 'Weather Alerts', desc: 'Get notified about severe weather', default: true },
                { label: 'Market Price Updates', desc: 'Daily mandi price notifications', default: true },
                { label: 'Scheme Deadlines', desc: 'Reminders for scheme applications', default: false },
                { label: 'AI Recommendations', desc: 'Weekly crop & fertilizer tips', default: true },
              ].map(({ label, desc, default: on }) => (
                <div key={label} className="flex items-center justify-between p-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${on ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow ${on ? 'left-5' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Danger zone */}
      <Card>
        <div className="p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Danger Zone</h3>
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Delete Account</p>
              <p className="text-xs text-red-600 mt-0.5">Permanently delete your account and all data</p>
            </div>
            <button className="text-sm font-medium text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
