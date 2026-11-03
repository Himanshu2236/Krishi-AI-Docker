import { useState } from 'react'
import { fertilizerAPI } from '../services/api'
import { mockFertilizerRecommendation } from '../services/mockData'
import { Card, Button, LoadingSpinner, SectionHeader, Badge } from '../components/UI'
import { FlaskConical, Beaker, CheckCircle, AlertCircle, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react'

const cropTypes = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Tomato',
  'Chilli', 'Pepper', 'Soybean', 'Chickpea', 'Mustard', 'Groundnut', 'Onion',
]

const soilTypes = ['Alluvial', 'Black Soil', 'Red Soil', 'Clay', 'Loamy', 'Sandy', 'Laterite']
const growthStages = ['Basal / Sowing', 'Seedling', 'Vegetative / Tillering', 'Flowering / Panicle', 'Maturity']

const initialForm = {
  crop: '', soilType: '', growthStage: 'Basal / Sowing',
  nitrogen: '', phosphorus: '', potassium: '',
  ph: '', organicMatter: '', area: '1',
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
        <p className="text-teal-100">Explainable agronomic recommendations based on ICAR standards, soil test deficits, and pH correction.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <SectionHeader title="Farm & Soil Details" subtitle="Input available NPK and soil reaction" />
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{apiError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Crop info */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Target Crop</label>
                <select name="crop" value={form.crop} onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white ${errors.crop ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}>
                  <option value="">Select target crop</option>
                  {cropTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.crop && <p className="text-xs text-red-500">{errors.crop}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Soil Type</label>
                  <select name="soilType" value={form.soilType} onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white ${errors.soilType ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}>
                    <option value="">Select soil texture</option>
                    {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.soilType && <p className="text-xs text-red-500">{errors.soilType}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Growth Stage</label>
                  <select name="growthStage" value={form.growthStage} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100">
                    {growthStages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Soil NPK */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-blue-500" /> Soil Available Nutrients (kg/ha)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'nitrogen', label: 'Nitrogen (N)', color: 'text-blue-600', max: 500 },
                    { name: 'phosphorus', label: 'Phosphorus (P)', color: 'text-orange-500', max: 300 },
                    { name: 'potassium', label: 'Potassium (K)', color: 'text-purple-600', max: 600 },
                  ].map(({ name, label, color, max }) => (
                    <div key={name} className="space-y-1">
                      <label className={`text-xs font-bold ${color}`}>{label}</label>
                      <input type="number" name={name} placeholder={`0–${max}`} value={form[name]} onChange={handleChange} step="any"
                        className={`w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white ${errors[name] ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`} />
                      {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Soil pH</label>
                  <input type="number" name="ph" placeholder="e.g. 6.8" value={form.ph} onChange={handleChange} step="0.1"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white ${errors.ph ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`} />
                  {errors.ph && <p className="text-xs text-red-500">{errors.ph}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Organic C %</label>
                  <input type="number" name="organicMatter" placeholder="Optional" value={form.organicMatter} onChange={handleChange} step="0.1"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Farm Area (ha)</label>
                  <input type="number" name="area" placeholder="1.0" value={form.area} onChange={handleChange} step="0.1"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white ${errors.area ? 'border-red-300' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`} />
                  {errors.area && <p className="text-xs text-red-500">{errors.area}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" loading={loading} className="flex-1">
                  <FlaskConical className="w-4 h-4" />
                  Calculate Fertilizers
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Result */}
        {loading && <Card><LoadingSpinner text="Analyzing ICAR nutrient benchmarks..." /></Card>}

        {result && !loading && (
          <div className="space-y-4">
            {/* Deficiency Analysis */}
            {result.nutrient_deficiency && (
              <Card>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-emerald-600" /> Nutrient Deficiency Analysis
                    </h3>
                    <Badge color="green">{result.crop || 'Crop'} Plan</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
                      <span className="text-xs text-blue-800 font-semibold block">Nitrogen (N)</span>
                      <span className="text-xs text-gray-600 block mt-0.5">{result.nutrient_deficiency.nitrogen_status}</span>
                      <span className="text-xs font-bold text-blue-700 mt-1 block">
                        -{result.nutrient_deficiency.deficits?.N ?? result.npk_needed?.N ?? 0} kg/ha
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 text-center">
                      <span className="text-xs text-orange-800 font-semibold block">Phosphorus (P)</span>
                      <span className="text-xs text-gray-600 block mt-0.5">{result.nutrient_deficiency.phosphorus_status}</span>
                      <span className="text-xs font-bold text-orange-700 mt-1 block">
                        -{result.nutrient_deficiency.deficits?.P ?? result.npk_needed?.P ?? 0} kg/ha
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-center">
                      <span className="text-xs text-purple-800 font-semibold block">Potassium (K)</span>
                      <span className="text-xs text-gray-600 block mt-0.5">{result.nutrient_deficiency.potassium_status}</span>
                      <span className="text-xs font-bold text-purple-700 mt-1 block">
                        -{result.nutrient_deficiency.deficits?.K ?? result.npk_needed?.K ?? 0} kg/ha
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    {result.nutrient_deficiency.summary}
                  </p>
                </div>
              </Card>
            )}

            {/* Fertilizer Options */}
            {result.fertilizer_options && result.fertilizer_options.length > 0 ? (
              <Card>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> Prescribed Fertilizer Options
                  </h3>
                  <div className="space-y-2.5">
                    {result.fertilizer_options.map((opt, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">{opt.name}</span>
                          <Badge color={opt.category === 'Chemical' ? 'blue' : opt.category === 'Organic' ? 'green' : 'purple'}>
                            {opt.category}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-emerald-700">Dose: {opt.dosage}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{opt.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="p-5 text-center">
                  <h2 className="text-xl font-bold text-gray-900">{result.recommended}</h2>
                  <Badge color="green" className="mt-2">{result.dosage}</Badge>
                </div>
              </Card>
            )}

            {/* Split Application Schedule */}
            {result.schedule && (
              <Card>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3">📅 Split Application Schedule</h3>
                  <div className="space-y-2.5">
                    {result.schedule.map(({ stage, timing, amount, instructions }) => (
                      <div key={stage} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-bold text-gray-800">{stage}</p>
                          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                            {amount}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{timing}</p>
                        {instructions && (
                          <p className="text-xs text-gray-600 mt-1 italic">{instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Soil Improvement Suggestions */}
            {result.soil_improvement_suggestions && result.soil_improvement_suggestions.length > 0 && (
              <Card>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" /> Soil Improvement & pH Guidance
                  </h3>
                  <ul className="space-y-2">
                    {result.soil_improvement_suggestions.map((sugg, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100/60 leading-relaxed">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>{sugg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
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
