import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { authAPI, cropAPI, diseaseAPI, dashboardAPI } from '../services/api'
import { Card, Button, InputField, SectionHeader, Badge, EmptyState, LoadingSpinner } from '../components/UI'
import {
  User, Camera, Save, MapPin, Phone, Mail, Sprout, CalendarDays,
  Shield, Bell, Edit3, Check, History, Microscope, AlertCircle, ArrowUpRight
} from 'lucide-react'

const cropOptions = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Soybean', 'Groundnut', 'Mustard', 'Chilli']

export default function UserProfile() {
  const { user, updateUser } = useAuth()
  const { lang, t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    farmSize: user?.farmSize || user?.farm_size || '',
    primaryCrops: user?.primaryCrops || user?.primary_crops || [],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [errors, setErrors] = useState({})

  // User History State
  const [cropHistory, setCropHistory] = useState([])
  const [diseaseHistory, setDiseaseHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [activeHistoryTab, setActiveHistoryTab] = useState('crops')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        farmSize: user.farmSize || user.farm_size || '',
        primaryCrops: user.primaryCrops || user.primary_crops || [],
      })
    }
    loadHistories()
  }, [user])

  const loadHistories = async () => {
    setHistoryLoading(true)
    try {
      const [cRes, dRes] = await Promise.allSettled([
        cropAPI.getHistory(),
        diseaseAPI.getHistory(),
      ])
      if (cRes.status === 'fulfilled' && cRes.value?.data?.history) {
        setCropHistory(cRes.value.data.history)
      }
      if (dRes.status === 'fulfilled' && dRes.value?.data?.history) {
        setDiseaseHistory(dRes.value.data.history)
      }
    } catch {} finally {
      setHistoryLoading(false)
    }
  }

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
    if (!form.name.trim()) errs.name = lang === 'hi' ? 'नाम आवश्यक है' : 'Name is required'
    if (!form.email) errs.email = lang === 'hi' ? 'ईमेल आवश्यक है' : 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = lang === 'hi' ? 'अमान्य ईमेल प्रारूप' : 'Invalid email format'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    setSaveError('')
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone ? form.phone.replace(/\s/g, '') : undefined,
        location: form.location,
        farm_size: form.farmSize,
        primary_crops: form.primaryCrops,
      }
      const res = await authAPI.updateProfile(payload)
      if (res?.data) {
        updateUser(res.data)
      } else {
        updateUser({ ...user, ...form })
      }
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3500)
    } catch (err) {
      setSaveError(err.response?.data?.detail || (lang === 'hi' ? 'प्रोफ़ाइल सहेजने में विफल' : 'Failed to update profile.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 fade-in-up max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-green-600/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'K'}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {user?.name || 'Farmer Profile'}
              </h1>
              <p className="text-green-100 text-xs md:text-sm mt-0.5">
                {user?.location ? `📍 ${user.location}` : (lang === 'hi' ? 'पंजीकृत किसान' : 'Registered Farmer')} • {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md
              ${editing
                ? 'bg-white text-green-700 hover:bg-green-50 shadow-green-900/20'
                : 'bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-md'
              }`}
          >
            {editing ? (
              saving ? (lang === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...') : <><Save className="w-4 h-4" /> {t('save')}</>
            ) : (
              <><Edit3 className="w-4 h-4" /> {lang === 'hi' ? 'प्रोफ़ाइल बदलें' : 'Edit Profile'}</>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'hi' ? 'आपकी किसान प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई है।' : 'Farmer profile updated successfully!'}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Farm Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 font-medium">Crop Scans</p>
          <p className="text-2xl font-black text-green-700 mt-1">{cropHistory.length}</p>
          <p className="text-[11px] text-gray-400">ML Recommendations</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 font-medium">Disease Detections</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{diseaseHistory.length}</p>
          <p className="text-[11px] text-gray-400">CNN Leaf Scans</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 font-medium">Primary Crops</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{form.primaryCrops.length}</p>
          <p className="text-[11px] text-gray-400">Cultivated</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 font-medium">Holding Size</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{form.farmSize || '—'}</p>
          <p className="text-[11px] text-gray-400">Cultivable land</p>
        </div>
      </div>

      {/* Profile Edit / Display Form */}
      <Card>
        <div className="p-6 space-y-6">
          <SectionHeader
            title={lang === 'hi' ? 'किसान विवरण एवं जोत जानकारी' : 'Farmer & Farm Details'}
            subtitle={lang === 'hi' ? 'सटीक एआई सिफारिशों के लिए अपनी जानकारी अद्यतित रखें' : 'Keep parameters updated for tailored agronomic recommendations'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label={lang === 'hi' ? 'पूरा नाम' : 'Full Name'}
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={!editing}
              error={errors.name}
              placeholder="e.g. Ramesh Kumar"
            />
            <InputField
              label={lang === 'hi' ? 'ईमेल पता' : 'Email Address'}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={!editing}
              error={errors.email}
              placeholder="ramesh@example.com"
            />
            <InputField
              label={lang === 'hi' ? 'मोबाइल नंबर' : 'Phone / Mobile'}
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              disabled={!editing}
              placeholder="+91 98765 43210"
            />
            <InputField
              label={lang === 'hi' ? 'स्थान (तहसील, जिला, राज्य)' : 'Farm Location (District, State)'}
              name="location"
              value={form.location}
              onChange={handleChange}
              disabled={!editing}
              placeholder="e.g. Pune, Maharashtra"
            />
            <InputField
              label={lang === 'hi' ? 'कुल कृषि भूमि (एकड़ / हेक्टेयर)' : 'Farm Size (Acres / Hectares)'}
              name="farmSize"
              value={form.farmSize}
              onChange={handleChange}
              disabled={!editing}
              placeholder="e.g. 5 acres / 2 hectares"
            />
          </div>

          {/* Crops selection */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              {lang === 'hi' ? 'प्रमुख उगाई जाने वाली फसलें' : 'Primary Cultivated Crops'}
            </label>
            <div className="flex flex-wrap gap-2">
              {cropOptions.map(crop => (
                <button
                  type="button"
                  key={crop}
                  onClick={() => editing && toggleCrop(crop)}
                  disabled={!editing}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border
                    ${form.primaryCrops.includes(crop)
                      ? 'bg-green-600 text-white border-green-600 shadow-xs'
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
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setEditing(false); setErrors({}) }}>
                {t('cancel')}
              </Button>
              <Button loading={saving} onClick={handleSave}>
                <Save className="w-4 h-4" />
                {t('save')}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* User History Records: Real Recommendations & Disease Detections */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {lang === 'hi' ? 'किसान परामर्श इतिहास' : 'Your Consultation History'}
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                {lang === 'hi' ? 'कृषि एआई द्वारा उत्पन्न वास्तविक सिफारिशें और रोग निदान' : 'Actual historical records saved from your AI recommendations and leaf scans'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveHistoryTab('crops')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeHistoryTab === 'crops' ? 'bg-white text-green-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              >
                🌾 Crop Records ({cropHistory.length})
              </button>
              <button
                onClick={() => setActiveHistoryTab('diseases')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeHistoryTab === 'diseases' ? 'bg-white text-green-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              >
                🔬 Disease Scans ({diseaseHistory.length})
              </button>
            </div>
          </div>

          {historyLoading ? (
            <LoadingSpinner size="sm" text="Loading saved consultations..." />
          ) : activeHistoryTab === 'crops' ? (
            cropHistory.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {cropHistory.map((h, i) => (
                  <div key={i} className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 rounded-xl px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        🌾
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{h.recommended_crop}</p>
                        <p className="text-xs text-gray-500">
                          Match Confidence: <span className="text-green-700 font-bold">{Math.round((h.confidence || 0.9) * 100)}%</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {h.created_at ? new Date(h.created_at).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🌾"
                title={lang === 'hi' ? 'कोई फसल सिफारिश इतिहास नहीं' : 'No crop recommendation history yet'}
                description={lang === 'hi' ? 'फसल सिफारिश पृष्ठ पर जाकर मिट्टी के आंकड़े दर्ज करें।' : 'Run your first crop recommendation using the 7 soil & climate parameters.'}
              />
            )
          ) : (
            diseaseHistory.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {diseaseHistory.map((h, i) => (
                  <div key={i} className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 rounded-xl px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        🔬
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{h.disease || 'Leaf Spot'}</p>
                        <p className="text-xs text-gray-500">
                          Plant: <span className="font-semibold text-gray-700">{h.plant || h.crop || 'Plant'}</span> • Confidence: <span className="text-emerald-700 font-bold">{Math.round((h.confidence || 0.85) * 100)}%</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {h.created_at ? new Date(h.created_at).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🔬"
                title={lang === 'hi' ? 'कोई रोग पहचान इतिहास नहीं' : 'No plant disease scans yet'}
                description={lang === 'hi' ? 'रोग पहचान पृष्ठ पर पत्ती की तस्वीर अपलोड करें।' : 'Upload a diseased leaf photograph on the Disease Detection page.'}
              />
            )
          )}
        </div>
      </Card>
    </div>
  )
}
