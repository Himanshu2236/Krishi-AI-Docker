import { useState, useEffect } from 'react'
import { weatherAPI } from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import { Card, LoadingSpinner, SectionHeader, Badge } from '../components/UI'
import {
  CloudSun, Droplets, Wind, Eye, Thermometer, CloudRain, Search,
  MapPin, AlertTriangle, Compass, CheckCircle2, RefreshCw, Gauge,
  Calendar, Sun, CloudLightning
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const POPULAR_HUBS = [
  'Pune, Maharashtra',
  'Nashik, Maharashtra',
  'Nagpur, Maharashtra',
  'Indore, MP',
  'Ludhiana, Punjab',
  'Karnal, Haryana',
  'Jaipur, Rajasthan',
  'Rajkot, Gujarat',
  'Guntur, AP',
]

const hourlyData = [
  { time: '6 AM', temp: 21, humidity: 82 },
  { time: '9 AM', temp: 25, humidity: 72 },
  { time: '12 PM', temp: 29, humidity: 58 },
  { time: '3 PM', temp: 31, humidity: 52 },
  { time: '6 PM', temp: 27, humidity: 64 },
  { time: '9 PM', temp: 23, humidity: 76 },
]

export default function WeatherDashboard() {
  const { lang, t } = useLanguage()
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    fetchWeatherData('Pune')
  }, [])

  const fetchWeatherData = async (loc) => {
    setLoading(true)
    setGeoError('')
    try {
      // Use the comprehensive /weather/full endpoint
      const res = await weatherAPI.getFull(loc)
      if (res?.data) {
        setWeather(res.data)
      } else {
        // Fallback to separate endpoints
        const [currRes, foreRes] = await Promise.allSettled([
          weatherAPI.getCurrent(loc),
          weatherAPI.getForecast(loc),
        ])
        const curr = currRes.status === 'fulfilled' ? currRes.value.data : {}
        const fore = foreRes.status === 'fulfilled' ? foreRes.value.data : {}
        setWeather({
          ...curr,
          forecast: fore.forecast || [],
          farming_suggestions: curr.farming_suggestions || [],
        })
      }
    } catch (err) {
      // Fallback
      const res = await weatherAPI.getCurrent(loc).catch(() => null)
      if (res?.data) setWeather(res.data)
    } finally {
      setLoading(false)
      setSearchLoading(false)
      setGeoLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    fetchWeatherData(searchQuery.trim())
    setSearchQuery('')
  }

  const handleSelectHub = (hub) => {
    fetchWeatherData(hub)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(lang === 'hi' ? 'आपके ब्राउज़र में स्थान सेवा उपलब्ध नहीं है।' : 'Geolocation is not supported by your browser.')
      return
    }

    setGeoLoading(true)
    setGeoError('')
    setStatusMessage(lang === 'hi' ? 'स्थान अनुमति का अनुरोध किया जा रहा है...' : 'Requesting location permission...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          // OpenWeatherMap reverse geocoding or query by lat,lon
          const query = `${latitude.toFixed(2)},${longitude.toFixed(2)}`
          setStatusMessage(lang === 'hi' ? `स्थान प्राप्त हुआ (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)` : `Located (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`)
          await fetchWeatherData(query)
        } catch {
          setGeoError(lang === 'hi' ? 'स्थान के लिए मौसम डेटा प्राप्त नहीं हो सका।' : 'Could not fetch weather for your coordinates.')
        } finally {
          setGeoLoading(false)
          setTimeout(() => setStatusMessage(''), 4000)
        }
      },
      (error) => {
        setGeoLoading(false)
        setStatusMessage('')
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError(lang === 'hi' ? 'स्थान अनुमति अस्वीकृत की गई। आप ऊपर अपना शहर खोज सकते हैं।' : 'Location permission was denied. You can manually enter your city above.')
        } else {
          setGeoError(lang === 'hi' ? 'स्थान प्राप्त करने में त्रुटि हुई।' : 'Unable to retrieve location. Please check device settings.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const weatherEmoji = (desc = '') => {
    const d = desc.toLowerCase()
    if (d.includes('thunder') || d.includes('lightning')) return '⛈️'
    if (d.includes('rain') || d.includes('drizzle')) return '🌧️'
    if (d.includes('cloud')) return '⛅'
    if (d.includes('sun') || d.includes('clear')) return '☀️'
    if (d.includes('fog') || d.includes('mist') || d.includes('haze')) return '🌫️'
    return '🌤️'
  }

  if (loading && !weather) {
    return <LoadingSpinner text={lang === 'hi' ? 'मौसम डेटा प्राप्त किया जा रहा है...' : 'Loading agricultural weather forecast...'} />
  }

  const isLive = weather?.data_source === 'openweathermap'

  return (
    <div className="space-y-6 fade-in-up max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-sky-500/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <CloudSun className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {t('weather')}
                </h1>
                <div className="flex items-center gap-2 text-sky-100 text-xs md:text-sm mt-0.5">
                  <MapPin className="w-4 h-4 text-sky-200" />
                  <span className="font-medium">{weather?.location || 'India'}</span>
                  <span className="text-white/40">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isLive ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'}`}>
                    {isLive ? '● Live OpenWeather API' : '● Indicative Reference Data'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sky-100/90 text-sm max-w-xl">
              {lang === 'hi'
                ? 'कृषि-विशिष्ट मौसम पूर्वानुमान, वर्षा विश्लेषण और खेत के लिए समय पर सिंचाई सलाह।'
                : 'Real-time agro-meteorological monitoring, precipitation forecasts, and actionable field advisories.'
              }
            </p>
          </div>

          {/* Location Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-white/40">
              <Search className="w-4 h-4 text-white/70 ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lang === 'hi' ? 'शहर या जिला खोजें...' : 'Search city or district...'}
                className="bg-transparent text-white placeholder-white/60 text-sm outline-none px-2 py-1 w-44 md:w-52"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="bg-white text-blue-700 hover:bg-sky-50 font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
              >
                {searchLoading ? '...' : lang === 'hi' ? 'खोजें' : 'Search'}
              </button>
            </form>

            {/* Geolocation Button */}
            <button
              onClick={handleUseMyLocation}
              disabled={geoLoading}
              title="Locate via device GPS"
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-medium px-4 py-2.5 rounded-2xl text-xs transition-all shadow-xs disabled:opacity-50"
            >
              <Compass className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
              <span className="whitespace-nowrap">{geoLoading ? t('locating') : t('useMyLocation')}</span>
            </button>
          </div>
        </div>

        {/* Status / Error Toast */}
        {geoError && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-xs text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-200" />
            <span>{geoError}</span>
          </div>
        )}
        {statusMessage && (
          <div className="mt-4 p-3 bg-white/20 border border-white/30 rounded-xl text-xs text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-300" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Quick Hub Pills */}
        <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-sky-200 text-xs font-semibold whitespace-nowrap">
            {lang === 'hi' ? 'प्रमुख कृषि केंद्र:' : 'Major Agro Hubs:'}
          </span>
          {POPULAR_HUBS.map(hub => (
            <button
              key={hub}
              onClick={() => handleSelectHub(hub)}
              className="bg-white/10 hover:bg-white/25 border border-white/20 text-white/90 px-3 py-1 rounded-full whitespace-nowrap transition-all"
            >
              {hub.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather Card */}
        <Card className="lg:col-span-1 overflow-hidden">
          <div className="p-6 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge color={isLive ? 'green' : 'orange'}>
                  {isLive ? 'Verified OpenWeather' : 'Indicative Model'}
                </Badge>
                <h3 className="text-xl font-bold text-gray-900 mt-2">
                  {weather?.location}
                </h3>
                <p className="text-gray-500 text-xs">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="text-6xl drop-shadow-sm">
                {weatherEmoji(weather?.description)}
              </div>
            </div>

            <div className="text-center py-2">
              <div className="text-6xl font-extrabold text-gray-900 tracking-tight">
                {weather?.temperature}°<span className="text-3xl text-gray-500 font-normal">C</span>
              </div>
              <p className="text-lg font-semibold text-gray-700 capitalize mt-1">
                {weather?.description}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Feels like {weather?.feels_like ?? weather?.feelsLike ?? weather?.temperature}°C
              </p>
            </div>

            {/* Micro Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 bg-blue-50/60 rounded-xl">
                <Droplets className="w-4 h-4 text-blue-500" />
                <div>
                  <span className="text-gray-400 block text-[10px]">Humidity</span>
                  <span className="font-bold text-gray-800">{weather?.humidity}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-sky-50/60 rounded-xl">
                <Wind className="w-4 h-4 text-sky-500" />
                <div>
                  <span className="text-gray-400 block text-[10px]">Wind Speed</span>
                  <span className="font-bold text-gray-800">{weather?.wind_speed ?? weather?.windSpeed ?? 12} km/h</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-indigo-50/60 rounded-xl">
                <CloudRain className="w-4 h-4 text-indigo-500" />
                <div>
                  <span className="text-gray-400 block text-[10px]">Precipitation</span>
                  <span className="font-bold text-gray-800">{weather?.rainfall ?? 0} mm</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-teal-50/60 rounded-xl">
                <Gauge className="w-4 h-4 text-teal-500" />
                <div>
                  <span className="text-gray-400 block text-[10px]">Pressure</span>
                  <span className="font-bold text-gray-800">{weather?.pressure ?? 1013} hPa</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 7-Day Agricultural Forecast */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <SectionHeader
              title={t('forecast7Day')}
              subtitle="Daily high/low temperature, sky conditions, and expected humidity"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {(weather?.forecast || []).map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-3 rounded-2xl bg-gray-50/70 hover:bg-green-50/60 border border-gray-100 hover:border-green-200 transition-all text-center group"
                >
                  <span className="text-xs font-bold text-gray-600 mb-1">{f.day}</span>
                  <span className="text-3xl my-2 group-hover:scale-110 transition-transform">{f.icon || '🌤️'}</span>
                  <p className="text-sm font-extrabold text-gray-900">{f.high}°</p>
                  <p className="text-xs text-gray-400 font-medium">{f.low}°</p>
                  {f.humidity !== undefined && (
                    <span className="text-[10px] text-blue-600 mt-2 font-semibold">
                      💧{f.humidity}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Hourly Trend Chart */}
      <Card>
        <div className="p-6">
          <SectionHeader
            title="Diurnal Agro-Climatic Trend"
            subtitle="Hourly temperature and relative humidity progression"
          />
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="temp" stroke="#f97316" fill="url(#tempGradient)" strokeWidth={2.5} name="Temperature (°C)" />
              <Area type="monotone" dataKey="humidity" stroke="#0284c7" fill="url(#humGradient)" strokeWidth={2.5} name="Humidity (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Weather-based Farming Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic Farming Suggestions */}
        <Card>
          <div className="p-6">
            <SectionHeader
              title={lang === 'hi' ? '🌾 मौसम-आधारित कृषि सलाह' : '🌾 Weather-Based Farming Advisory'}
              subtitle={lang === 'hi' ? 'वर्तमान मौसम परिस्थितियों के आधार पर व्यावहारिक मार्गदर्शन' : 'Dynamic recommendations tailored to current conditions'}
            />
            <div className="space-y-3">
              {(weather?.farming_suggestions && weather.farming_suggestions.length > 0) ? (
                weather.farming_suggestions.map((sug, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs md:text-sm text-emerald-900 leading-relaxed">
                    <span className="text-base flex-shrink-0 mt-0.5">🌾</span>
                    <span>{sug}</span>
                  </div>
                ))
              ) : (
                [
                  'Irrigate light soils in evening hours to minimize evaporative loss under sunny conditions.',
                  'Maintain clean drainage channels across field perimeters to prevent post-rain water stagnation.',
                  'Scout lower leaf canopy for early fungal leaf spots under humid mornings.',
                  'Optimal temperature window for top dressing of urea in wheat, paddy, and maize.',
                ].map((sug, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs md:text-sm text-emerald-900 leading-relaxed">
                    <span className="text-base flex-shrink-0 mt-0.5">🌾</span>
                    <span>{sug}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Severe Weather Safety & Warnings */}
        <Card>
          <div className="p-6">
            <SectionHeader
              title={lang === 'hi' ? '⚠️ मौसम चेतावनियां और सुरक्षा' : '⚠️ Weather Warnings & Field Safety'}
              subtitle={lang === 'hi' ? 'फसल और कृषि यंत्र सुरक्षा' : 'Active alerts & crop protection checklist'}
            />
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{lang === 'hi' ? 'कीटनाशक छिड़काव सावधानी' : 'Spraying Window Caution'}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {lang === 'hi'
                    ? 'हवा की गति 15 किमी/घंटा से अधिक होने पर छिड़काव न करें ताकि दवा का बहाव व्यर्थ न जाए।'
                    : 'Avoid pesticide and herbicide spray when wind velocity exceeds 15 km/h to prevent spray drift and uneven application.'
                  }
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'hi' ? 'सिंचाई दक्षता' : 'Micro-Irrigation Scheduling'}</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {lang === 'hi'
                    ? 'ड्रिप सिंचाई प्रणाली अपनाएं और मिट्टी में नमी की जांच के उपरांत ही अगला पानी दें।'
                    : 'Check soil moisture at 15cm root depth before next irrigation cycle. High ambient humidity reduces transpiration demands.'
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
