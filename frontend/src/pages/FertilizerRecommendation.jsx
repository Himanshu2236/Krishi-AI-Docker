import { useState } from 'react'
import { fertilizerAPI } from '../services/api'
import { mockFertilizerRecommendation } from '../services/mockData'
import { Card, Button, LoadingSpinner, SectionHeader, Badge } from '../components/UI'
import { FlaskConical, Leaf, Droplets, Beaker, Info } from 'lucide-react'

const cropTypes = [
  'Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato',
  'Onion', 'Soybean', 'Groundnut', 'Mustard', 'Sunflower', 'Turmeric', 'Banana',
]

const soilTypes = ['Sandy', 'Loamy', 'Clayey', 'Black Cotton', 'Red', 'Laterite', 'Alluvial']
const growthStages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting/Grain Filling', 'Maturity']

const initialForm = {
  crop: '', soilType: '', growthStage: '',
  nitrogen: '', phosphorus: '', potassium: '',
  ph: '', organicMatter: '', area: '',
}

export default function FertilizerRecommendation() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [apiError, setApiError] = useState('')

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.crop) errs.crop = 'Select a crop'
    if (!form.soilType) errs.soilType = 'Select soil type'
    if (!form.growthStage) errs.growthStage = 'Select growth stage'
    if (!form.nitrogen) errs.nitrogen = 'Required'
    if (!form.phosphorus) errs.phosphorus = 'Required'
    if (!form.potassium) errs.potassium = 'Required'
    if (!form.ph) errs.ph = 'Required'
    if (!form.area) errs.area = 'Required'
    return errs
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
        crop: form.crop,
        soil_type: form.soilType,
        growth_stage: form.growthStage,
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        ph: parseFloat(form.ph),
        organic_matter: form.organicMatter ? parseFloat(form.organicMatter) : undefined,
        area: parseFloat(form.area),
      }
      const res = await fertilizerAPI.recommend(payload)
      if (res?.data) {
        setResult(res.data)
      } else {
        setResult(mockFertilizerRecommendation)
      }
    } catch (err) {
      if (err.message === 'Network Error' || !err.response) {
        setResult(mockFertilizerRecommendation)
      } else {
        setApiError(err?.response?.data?.detail || 'Failed to get recommendation. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setForm(initialForm); setResult(null); setErrors({}); setApiError('') }

  return (
    <div className="space-y-6 fade-in-up max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-teal-600 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Fertilizer Recommendation</h1>
        </div>
        <p className="text-teal-100">Get precise fertilizer recommendations based on your soil health and crop type.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <SectionHeader title="Farm Details" />
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{apiError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Crop info */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Crop Type</label>
                <select name="crop" value={form.crop} onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white ${errors.crop ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}>
                  <option value="">Select crop</option>
                  {cropTypes.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.crop && <p className="text-xs text-red-500">{errors.crop}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Soil Type</label>
                  <select name="soilType" value={form.soilType} onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white ${errors.soilType ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}>
                    <option value="">Select type</option>
                    {soilTypes.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {errors.soilType && <p className="text-xs text-red-500">{errors.soilType}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Growth Stage</label>
                  <select name="growthStage" value={form.growthStage} onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white ${errors.growthStage ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}>
                    <option value="">Select stage</option>
                    {growthStages.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {errors.growthStage && <p className="text-xs text-red-500">{errors.growthStage}</p>}
                </div>
              </div>

              {/* Soil NPK */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-blue-500" /> Current Soil Nutrient Levels (mg/kg)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'nitrogen', label: 'N', color: 'text-blue-600' },
                    { name: 'phosphorus', label: 'P', color: 'text-orange-500' },
                    { name: 'potassium', label: 'K', color: 'text-purple-600' },
                  ].map(({ name, label, color }) => (
                    <div key={name} className="space-y-1">
                      <label className={`text-xs font-bold ${color}`}>{label}</label>
                      <input type="number" name={name} placeholder="0–300" value={form[name]} onChange={handleChange} step="any"
                        className={`w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white ${errors[name] ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`} />
                      {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">pH</label>
                  <input type="number" name="ph" placeholder="0–14" value={form.ph} onChange={handleChange} step="0.1"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white ${errors.ph ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`} />
                  {errors.ph && <p className="text-xs text-red-500">{errors.ph}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Organic %</label>
                  <input type="number" name="organicMatter" placeholder="0–10" value={form.organicMatter} onChange={handleChange} step="0.1"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Area (ha)</label>
                  <input type="number" name="area" placeholder="e.g. 2" value={form.area} onChange={handleChange} step="0.1"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white ${errors.area ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`} />
                  {errors.area && <p className="text-xs text-red-500">{errors.area}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" loading={loading} className="flex-1">
                  <FlaskConical className="w-4 h-4" />
                  Get Recommendation
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Result */}
        {loading && <Card><LoadingSpinner text="Calculating fertilizer requirements..." /></Card>}

        {result && !loading && (
          <div className="space-y-4">
            <Card>
              <div className="p-6">
                <div className="text-center mb-5">
                  <div className="text-5xl mb-3">🧪</div>
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{result.recommended}</h2>
                  <p className="text-gray-500 text-sm">Recommended Fertilizer</p>
                  <Badge color="green" className="mt-2">{result.dosage}</Badge>
                </div>
                {/* NPK needs */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {Object.entries(result.npk_needed).map(([k, v]) => (
                    <div key={k} className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                      <p className="text-xl font-bold text-green-700">{v}</p>
                      <p className="text-xs text-gray-500 font-medium">{k === 'N' ? 'Nitrogen' : k === 'P' ? 'Phosphorus' : 'Potassium'}</p>
                      <p className="text-xs text-gray-400">kg/ha needed</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 mb-4">📅 Application Schedule</h3>
                <div className="space-y-3">
                  {result.schedule.map(({ stage, timing, amount }) => (
                    <div key={stage} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">{stage.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{stage}</p>
                        <p className="text-xs text-gray-500">{timing}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">{amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 mb-3">🌿 Organic Option</h3>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm text-amber-800">{result.organic_option}</p>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 mt-4">Alternative Fertilizers</h3>
                <div className="flex flex-wrap gap-2">
                  {result.alternatives.map(a => <Badge key={a} color="blue">{a}</Badge>)}
                </div>
              </div>
            </Card>
          </div>
        )}

        {!result && !loading && (
          <Card>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🧪</div>
              <h3 className="font-semibold text-gray-700 text-lg mb-2">Smart Fertilizer Advice</h3>
              <p className="text-gray-500 text-sm">Fill in your crop and soil details to receive precision fertilizer recommendations tailored to your field.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
