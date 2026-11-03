import { useState, useEffect } from 'react'
import { weatherAPI } from '../services/api'
import { mockWeather } from '../services/mockData'
import { Card, LoadingSpinner, StatCard, SectionHeader } from '../components/UI'
import { CloudSun, Droplets, Wind, Eye, Thermometer, CloudRain, Search, MapPin, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const hourlyData = [
  { time: '6AM', temp: 22, humidity: 80 }, { time: '9AM', temp: 26, humidity: 70 },
  { time: '12PM', temp: 30, humidity: 60 }, { time: '3PM', temp: 28, humidity: 62 },
  { time: '6PM', temp: 25, humidity: 68 }, { time: '9PM', temp: 23, humidity: 75 },
]

const weatherAlerts = [
  { type: 'warning', icon: '🌧️', title: 'Heavy Rain Advisory', desc: 'Heavy to very heavy rainfall expected in next 3 days. Protect sensitive crops.', severity: 'Moderate' },
  { type: 'info', icon: '💨', title: 'Wind Advisory', desc: 'Strong winds (40-50 km/h) expected on Friday. Stake tall plants.', severity: 'Low' },
]

export default function WeatherDashboard() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [currRes, forecastRes] = await Promise.allSettled([
          weatherAPI.getCurrent('Pune'),
          weatherAPI.getForecast('Pune'),
        ])
        const currentData = currRes.status === 'fulfilled' && currRes.value?.data ? currRes.value.data : mockWeather
        const forecastData = forecastRes.status === 'fulfilled' && forecastRes.value?.data?.forecast ? forecastRes.value.data.forecast : mockWeather.forecast

        setWeather({
          ...mockWeather,
          ...currentData,
          forecast: forecastData,
        })
      } catch {
        setWeather(mockWeather)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    try {
      const [currRes, forecastRes] = await Promise.allSettled([
        weatherAPI.getCurrent(searchQuery),
        weatherAPI.getForecast(searchQuery),
      ])
      const currentData = currRes.status === 'fulfilled' && currRes.value?.data ? currRes.value.data : { ...mockWeather, location: searchQuery }
      const forecastData = forecastRes.status === 'fulfilled' && forecastRes.value?.data?.forecast ? forecastRes.value.data.forecast : mockWeather.forecast

      setWeather({
        ...mockWeather,
        ...currentData,
        forecast: forecastData,
      })
    } catch {
      setWeather({ ...mockWeather, location: searchQuery })
    } finally {
      setSearchLoading(false)
      setSearchQuery('')
    }
  }

  if (loading) return <LoadingSpinner text="Loading weather data..." />

  const weatherEmoji = (desc) => {
    if (desc?.includes('Rain')) return '🌧️'
    if (desc?.includes('Cloud')) return '⛅'
    if (desc?.includes('Sun') || desc?.includes('Clear')) return '☀️'
    return '🌤️'
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CloudSun className="w-6 h-6" />
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Weather Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 text-sky-100 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{weather?.location}</span>
            </div>
          </div>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <Search className="w-4 h-4 text-white/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="bg-transparent text-white placeholder-white/60 text-sm outline-none w-40"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              {searchLoading ? '...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {/* Current weather hero */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <div className="p-6 text-center">
            <div className="text-8xl mb-3">{weatherEmoji(weather?.description)}</div>
            <div className="text-5xl font-bold text-gray-900 mb-1">{weather?.temperature}°C</div>
            <p className="text-gray-600 font-medium">{weather?.description}</p>
            <p className="text-gray-400 text-sm mt-1">Feels like {weather?.feelsLike}°C</p>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>{weather?.humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Wind className="w-4 h-4 text-gray-400" />
                <span>{weather?.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Eye className="w-4 h-4 text-purple-500" />
                <span>{weather?.visibility} km</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <CloudRain className="w-4 h-4 text-teal-500" />
                <span>{weather?.rainfall} mm</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 7-day forecast */}
        <Card className="md:col-span-2">
          <div className="p-5">
            <SectionHeader title="7-Day Forecast" />
            <div className="grid grid-cols-7 gap-2">
              {weather?.forecast.map(({ day, high, low, icon, description }) => (
                <div key={day} className="flex flex-col items-center p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-center">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{day}</p>
                  <span className="text-2xl mb-2">{icon}</span>
                  <p className="text-sm font-bold text-gray-900">{high}°</p>
                  <p className="text-xs text-gray-400">{low}°</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Hourly temp / humidity */}
      <Card>
        <div className="p-5">
          <SectionHeader title="Today's Hourly Trend" subtitle="Temperature & humidity throughout the day" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="temp" stroke="#f97316" fill="url(#tempGrad)" strokeWidth={2} name="Temp (°C)" />
              <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fill="url(#humGrad)" strokeWidth={2} name="Humidity (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Alerts + Farm tips */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="p-5">
            <SectionHeader title="Weather Alerts" />
            {weatherAlerts.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">✅ No active weather alerts</p>
            ) : (
              <div className="space-y-3">
                {weatherAlerts.map((alert, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex items-start gap-3
                    ${alert.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                    <span className="text-2xl">{alert.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${alert.type === 'warning' ? 'text-amber-800' : 'text-blue-800'}`}>{alert.title}</p>
                      <p className={`text-xs mt-1 ${alert.type === 'warning' ? 'text-amber-700' : 'text-blue-700'}`}>{alert.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <SectionHeader title="Farming Advisory" />
            <div className="space-y-3">
              {[
                { emoji: '💧', tip: 'Reduce irrigation frequency — humid weather expected this week.' },
                { emoji: '🌾', tip: 'Good time for land preparation with moderate temperatures.' },
                { emoji: '🧪', tip: 'Apply fungicide preventively before predicted rain.' },
                { emoji: '🚜', tip: 'Complete harvesting before Thursday\'s heavy rain.' },
                { emoji: '🌱', tip: 'Optimal conditions for transplanting seedlings this week.' },
              ].map(({ emoji, tip }) => (
                <div key={tip} className="flex items-start gap-2 text-sm text-gray-600 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-lg">{emoji}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
