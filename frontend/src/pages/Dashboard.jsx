import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI, weatherAPI } from '../services/api'
import { mockDashboardStats, mockWeather } from '../services/mockData'
import { StatCard, Card, LoadingSpinner, SectionHeader } from '../components/UI'
import {
  Sprout, Microscope, FlaskConical, CloudSun, TrendingUp, FileText,
  MessageSquareText, ArrowRight, AlertTriangle, CheckCircle2
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const quickActions = [
  { label: 'Crop Recommendation', icon: Sprout, to: '/crop-recommendation', color: 'bg-green-500', desc: 'Get AI suggestions' },
  { label: 'Disease Detection', icon: Microscope, to: '/disease-detection', color: 'bg-emerald-500', desc: 'Upload plant image' },
  { label: 'Fertilizer Advisor', icon: FlaskConical, to: '/fertilizer', color: 'bg-teal-500', desc: 'Nutrient guidance' },
  { label: 'AI Chatbot', icon: MessageSquareText, to: '/chatbot', color: 'bg-lime-600', desc: 'Ask anything' },
  { label: 'Weather', icon: CloudSun, to: '/weather', color: 'bg-sky-500', desc: '7-day forecast' },
  { label: 'Mandi Prices', icon: TrendingUp, to: '/mandi-prices', color: 'bg-orange-500', desc: 'Live market rates' },
  { label: 'Govt. Schemes', icon: FileText, to: '/schemes', color: 'bg-purple-500', desc: 'Subsidies & schemes' },
]

const activityIconMap = {
  crop: '🌾',
  disease: '🔬',
  weather: '🌧️',
  fertilizer: '🌱',
  mandi: '📊',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, weatherRes] = await Promise.allSettled([
          dashboardAPI.getStats(),
          weatherAPI.getCurrent(user?.location || 'Pune')
        ])

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          const d = statsRes.value.data
          setStats({
            totalRecommendations: d.total_recommendations ?? 24,
            diseasesDetected: d.diseases_detected ?? 8,
            weatherAlerts: d.weather_alerts ?? 2,
            schemesEligible: d.schemes_eligible ?? 5,
            recentActivities: d.recent_activities?.length ? d.recent_activities : mockDashboardStats.recentActivities,
            cropYieldData: d.crop_yield_data?.map(item => ({ month: item.month, yield: item.yield_value })) || mockDashboardStats.cropYieldData,
            priceComparisonData: d.price_comparison_data || mockDashboardStats.priceComparisonData,
          })
        } else {
          setStats(mockDashboardStats)
        }

        if (weatherRes.status === 'fulfilled' && weatherRes.value?.data) {
          setWeather(weatherRes.value.data)
        } else {
          setWeather(mockWeather)
        }
      } catch {
        setStats(mockDashboardStats)
        setWeather(mockWeather)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />

  return (
    <div className="space-y-6 fade-in-up">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {greeting}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-green-100">
              {user?.location && `📍 ${user.location} · `}
              Here's an overview of your farm today.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/20 min-w-[180px]">
            <div className="text-4xl">
              {weather?.description?.includes('Rain') ? '🌧️' : weather?.description?.includes('Cloud') ? '⛅' : '☀️'}
            </div>
            <div>
              <p className="text-2xl font-bold">{weather?.temperature}°C</p>
              <p className="text-green-200 text-sm">{weather?.description}</p>
              <p className="text-green-200 text-xs">{weather?.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="AI Recommendations" value={stats.totalRecommendations} subtitle="Total generated" icon={Sprout} color="green" trend={12} />
        <StatCard title="Diseases Detected" value={stats.diseasesDetected} subtitle="This season" icon={Microscope} color="red" trend={-8} />
        <StatCard title="Weather Alerts" value={stats.weatherAlerts} subtitle="Active alerts" icon={CloudSun} color="blue" />
        <StatCard title="Eligible Schemes" value={stats.schemesEligible} subtitle="Govt. schemes" icon={FileText} color="purple" />
      </div>

      {/* Quick actions */}
      <Card>
        <div className="p-5">
          <SectionHeader title="Quick Actions" subtitle="Jump to any feature instantly" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {quickActions.map(({ label, icon: Icon, to, color, desc }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-all group text-center"
              >
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-800 leading-tight">{label}</span>
                <span className="text-xs text-gray-400 mt-0.5">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Yield trend */}
        <Card>
          <div className="p-5">
            <SectionHeader title="Crop Yield Trend" subtitle="Monthly yield (quintals/hectare)" />
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.cropYieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Price comparison */}
        <Card>
          <div className="p-5">
            <SectionHeader title="Market Price Comparison" subtitle="₹/quintal vs last month & year" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.priceComparisonData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="crop" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                  formatter={(v) => [`₹${v}`, '']}
                />
                <Legend />
                <Bar dataKey="current" name="Current" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastMonth" name="Last Month" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastYear" name="Last Year" fill="#bbf7d0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent activities + weather */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activities */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-5">
              <SectionHeader
                title="Recent Activities"
                subtitle="Your latest farming actions"
                action={
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </button>
                }
              />
              <div className="space-y-3">
                {stats.recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{act.action}</p>
                      <p className="text-xs text-gray-500 truncate">{act.detail}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Weather overview */}
        <Card>
          <div className="p-5">
            <SectionHeader title="Weather" subtitle={weather?.location} />
            <div className="space-y-3">
              {[
                { label: 'Humidity', value: `${weather?.humidity}%`, emoji: '💧' },
                { label: 'Wind Speed', value: `${weather?.windSpeed} km/h`, emoji: '💨' },
                { label: 'Rainfall', value: `${weather?.rainfall} mm`, emoji: '🌧️' },
                { label: 'UV Index', value: weather?.uvIndex, emoji: '☀️' },
                { label: 'Feels Like', value: `${weather?.feelsLike}°C`, emoji: '🌡️' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <span>{emoji}</span> {label}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {stats.weatherAlerts > 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-700">Weather Alert</p>
                  <p className="text-xs text-amber-600">Heavy rain expected in 3 days</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
