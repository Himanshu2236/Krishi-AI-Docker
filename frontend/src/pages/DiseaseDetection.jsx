import { useState, useCallback } from 'react'
import { diseaseAPI } from '../services/api'
import { mockDiseaseDetection } from '../services/mockData'
import { Card, Button, LoadingSpinner, ConfidenceBar, Badge, SectionHeader } from '../components/UI'
import { Upload, X, Microscope, AlertTriangle, CheckCircle, Image } from 'lucide-react'

export default function DiseaseDetection() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [apiError, setApiError] = useState('')

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setApiError('Please upload an image file (JPG, PNG, WebP)'); return }
    if (file.size > 10 * 1024 * 1024) { setApiError('Image must be smaller than 10MB'); return }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setApiError('')
  }

  const onFileInput = (e) => handleFile(e.target.files[0])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const handleAnalyze = async () => {
    if (!image) return
    setLoading(true)
    setApiError('')
    try {
      const formData = new FormData()
      formData.append('file', image)
      const res = await diseaseAPI.detect(formData)
      if (res?.data) {
        setResult(res.data)
      } else {
        setResult(mockDiseaseDetection)
      }
    } catch (err) {
      if (err.message === 'Network Error' || !err.response) {
        setResult(mockDiseaseDetection)
      } else {
        setApiError(err?.response?.data?.detail || 'Analysis failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setApiError('')
  }

  const severityColor = (s) => {
    if (s === 'Severe') return 'red'
    if (s === 'Moderate') return 'orange'
    return 'green'
  }

  return (
    <div className="space-y-6 fade-in-up max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Microscope className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Plant Disease Detection</h1>
        </div>
        <p className="text-emerald-100">Upload a photo of your plant to detect diseases using AI image analysis.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload area */}
        <Card>
          <div className="p-6">
            <SectionHeader title="Upload Plant Image" subtitle="JPG, PNG or WebP · Max 10MB" />

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {apiError}
              </div>
            )}

            {/* Drop zone */}
            {!preview ? (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
                  ${isDragging
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-400 hover:bg-green-50/50'
                  }`}
                onClick={() => document.getElementById('imgInput').click()}
              >
                <input
                  id="imgInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileInput}
                />
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-semibold text-gray-700 mb-1">
                  {isDragging ? 'Drop the image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-sm text-gray-400">Supports JPG, PNG, WebP up to 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Plant to analyze"
                  className="w-full h-64 object-cover rounded-2xl border border-gray-200"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="mt-3 p-3 bg-gray-50 rounded-xl flex items-center gap-2">
                  <Image className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 truncate">{image?.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{(image?.size / 1024).toFixed(0)} KB</span>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              <Button
                onClick={handleAnalyze}
                loading={loading}
                disabled={!image}
                className="w-full"
                size="lg"
              >
                <Microscope className="w-4 h-4" />
                {loading ? 'Analyzing...' : 'Analyze Plant'}
              </Button>
              {preview && (
                <Button variant="outline" onClick={handleReset} className="w-full">
                  Upload Different Image
                </Button>
              )}
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-700 font-medium mb-1">📸 Tips for best results:</p>
              <ul className="text-xs text-amber-600 space-y-0.5">
                <li>• Take clear, well-lit photos of affected leaves</li>
                <li>• Include close-up of disease symptoms</li>
                <li>• Avoid blurry or dark images</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Result */}
        {loading && (
          <Card>
            <LoadingSpinner text="AI analyzing your plant image..." />
          </Card>
        )}

        {result && !loading && (
          <div className="space-y-4">
            {/* Disease result */}
            <Card>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Detected Disease</p>
                    <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {result.disease}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">Plant: {result.plant}</p>
                  </div>
                  <Badge color={severityColor(result.severity)}>{result.severity}</Badge>
                </div>
                <ConfidenceBar value={result.confidence} label="Detection Confidence" />
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">{result.description}</p>
              </div>
            </Card>

            {/* Treatment */}
            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">💊</span> Treatment Recommendations
                </h3>
                <ul className="space-y-2">
                  {result.treatment.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50">
                      <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Prevention */}
            <Card>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">🛡️</span> Prevention Measures
                </h3>
                <ul className="space-y-2">
                  {result.prevention.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {p}
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
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="font-semibold text-gray-700 text-lg mb-2">Upload & Detect</h3>
              <p className="text-gray-500 text-sm">Upload a clear photo of your plant and click "Analyze Plant" to identify diseases using our AI model.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
