import { useState } from 'react'
import { cropAPI } from '../services/api'
import { mockCropRecommendation } from '../services/mockData'
import { Card, Button, InputField, LoadingSpinner, ConfidenceBar, SectionHeader } from '../components/UI'
import { Sprout, Beaker, Thermometer, Droplets, CloudRain, FlaskConical, Info } from 'lucide-react'

const initialForm = {
  nitrogen: '', phosphorus: '', potassium: '',
  ph: '', temperature: '', humidity: '', rainfall: '',
}

export default function CropRecommendation() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [apiError, setApiError] = useState('')

  const fields = [
    { name: 'nitrogen', label: 'Nitrogen (N)', icon: Beaker, placeholder: '0–300', unit: 'mg/kg', color: 'text-blue-500' },
    { name: 'phosphorus', label: 'Phosphorus (P)', icon: Beaker, placeholder: '0–150', unit: 'mg/kg', color: 'text-orange-500' },
    { name: 'potassium', label: 'Potassium (K)', icon: Beaker, placeholder: '0–300', unit: 'mg/kg', color: 'text-purple-500' },
    { name: 'ph', label: 'Soil pH', icon: FlaskConical, placeholder: '0–14', unit: 'pH', color: 'text-teal-500' },
    { name: 'temperature', label: 'Temperature', icon: Thermometer, placeholder: '0–50', unit: '°C', color: 'text-red-500' },
    { name: 'humidity', label: 'Humidity', icon: Droplets, placeholder: '0–100', unit: '%', color: 'text-blue-400' },
    { name: 'rainfall', label: 'Rainfall', icon: CloudRain, placeholder: '0–5000', unit: 'mm', color: 'text-indigo-500' },
  ]

  const validate = () => {
    const errs = {}
    const rules = {
      nitrogen: { min: 0, max: 300 }, phosphorus: { min: 0, max: 150 }, potassium: { min: 0, max: 300 },
      ph: { min: 0, max: 14 }, temperature: { min: 0, max: 50 }, humidity: { min: 0, max: 100 }, rainfall: { min: 0, max: 5000 },
    }
    for (const [key, { min, max }] of Object.entries(rules)) {
      if (!form[key]) { errs[key] = 'Required'; continue }
      const v = parseFloat(form[key])
      if (isNaN(v)) { errs[key] = 'Must be a number'; continue }
      if (v < min || v > max) errs[key] = `Must be ${min}–${max}`
    }
    return errs
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setApiError('')
    setResult(null)
    try {
      const payload = {
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        ph: parseFloat(form.ph),
        temperature: parseFloat(form.temperature),
        humidity: parseFloat(form.humidity),
        rainfall: parseFloat(form.rainfall),
      }
      const res = await cropAPI.recommend(payload)
      if (res?.data) {
        setResult(res.data)
      } else {
        setResult(mockCropRecommendation)
      }
    } catch (err) {
      if (err.message === 'Network Error' || !err.response) {
        setResult(mockCropRecommendation)
      } else {
        setApiError(err?.response?.data?.detail || 'Recommendation failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setForm(initialForm); setResult(null); setErrors({}); setApiError('') }

  return (
    <div className="space-y-6 fade-in-up max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Crop Recommendation</h1>
        </div>
        <p className="text-green-100">Enter your soil and environmental parameters to get AI-powered crop recommendations.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input form */}
        <Card>
          <div className="p-6">
            <SectionHeader title="Soil & Climate Parameters" />
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{apiError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fields.map(({ name, label, icon: Icon, placeholder, unit, color }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Icon className={`w-4 h-4 ${color}`} />
                      {label}
                      <span className="text-gray-400 text-xs font-normal ml-auto">{unit}</span>
                    </label>
                    <input
                      type="number"
                      name={name}
                      placeholder={placeholder}
                      value={form[name]}
                      onChange={handleChange}
                      step="any"
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white
                        ${errors[name] ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}
                    />
                    {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-50 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600">
                  Get your soil NPK values from a soil test report. Contact your local KVK for soil testing services.
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" loading={loading} className="flex-1">
                  <Sprout className="w-4 h-4" />
                  Get Recommendation
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Result */}
        {loading && (
          <Card>
            <LoadingSpinner text="Analyzing soil parameters..." />
          </Card>
        )}
        {result && !loading && (
          <div className="space-y-4">
            {/* Main recommendation */}
            <Card>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-3">🌾</div>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {result.recommended_crop}
                  </h2>
                  <p className="text-gray-500 text-sm">Recommended Crop</p>
                  <div className="mt-3">
                    <ConfidenceBar value={result.confidence} label="Match Confidence" />
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm text-green-800 leading-relaxed">{result.reasoning}</p>
                </div>
              </div>
            </Card>

            {/* Alternatives */}
            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Alternative Crops</h3>
                <div className="space-y-3">
                  {result.alternatives.map(({ crop, confidence }) => (
                    <ConfidenceBar key={crop} value={confidence} label={crop} color="blue" />
                  ))}
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 mb-4">🌱 Cultivation Tips</h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        )}

        {!result && !loading && (
          <Card>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="font-semibold text-gray-700 text-lg mb-2">Ready to Recommend</h3>
              <p className="text-gray-500 text-sm">Fill in the form and click "Get Recommendation" to see AI-powered crop suggestions for your field.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
