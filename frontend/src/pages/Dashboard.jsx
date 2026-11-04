import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { dashboardAPI, weatherAPI } from '../services/api'
import { StatCard, Card, LoadingSpinner, SectionHeader, Badge } from '../components/UI'
import {
  Sprout, Microscope, FlaskConical, CloudSun, TrendingUp, FileText,
  MessageSquareText, ArrowRight, AlertTriangle, CheckCircle2,
  Calendar, MapPin, Sparkles
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const { lang, t } = useLanguage()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  const quickActions = [
    { label: t('cropRecommendation'), icon: Sprout, to: '/crop-recommendation', color: 'bg-green-600', desc: 'Random Forest ML' },
    { label: t('diseaseDetection'), icon: Microscope, to: '/disease-detection', color: 'bg-emerald-600', desc: 'PyTorch CNN' },
    { label: t('fertilizerAdvisor'), icon: FlaskConical, to: '/fertilizer', color: 'bg-teal-600', desc: 'ICAR RDF Engine' },
    { label: t('aiChatbot'), icon: MessageSquareText, to: '/chatbot', color: 'bg-lime-700', desc: 'Groq Llama 3' },
    { label: t('weather'), icon: CloudSun, to: '/weather', color: 'bg-sky-600', desc: 'OpenWeather' },
    { label: t('mandiPrices'), icon: TrendingUp, to: '/mandi-prices', color: 'bg-orange-600', desc: 'Agmarknet / MSP' },
    { label: t('govtSchemes'), icon: FileText, to: '/schemes', color: 'bg-purple-600', desc: 'DBT & Subsidies' },
  ]

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
            totalRecommendations: d.total_recommendations ?? 0,
            diseasesDetected: d.diseases_detected ?? 0,
            weatherAlerts: d.weather_alerts ?? 1,
            schemesEligible: d.schemes_eligible ?? 7,
            recentActivities: d.recent_activities?.length ? d.recent_activities : [
              { id: 1, type: 'crop', action: 'Welcome to Krishi AI', detail: 'Get started with Crop Recommendation or Disease Detection', time: 'Just now', icon: '🌱' }
            ],
            cropYieldData: d.crop_yield_data?.map(item => ({ month: item.month, yield: item.yield_value })) || [
              { month: 'Jun', yield: 28 }, { month: 'Jul', yield: 32 }, { month: 'Aug', yield: 30 },
              { month: 'Sep', yield: 35 }, { month: 'Oct', yield: 38 }, { month: 'Nov', yield: 40 },
            ],
            priceComparisonData: d.price_comparison_data || [
              { crop: 'Wheat', current: 2275, lastMonth: 2150, lastYear: 2050 },
              { crop: 'Rice', current: 3500, lastMonth: 3200, lastYear: 2800 },
              { crop: 'Tomato', current: 1200, lastMonth: 900, lastYear: 800 },
              { crop: 'Onion', current: 1800, lastMonth: 2200, lastYear: 1600 },
            ],
          })
        }

        if (weatherRes.status === 'fulfilled' && weatherRes.value?.data) {
          setWeather(weatherRes.value.data)
        }
      } catch {} finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const hour = new Date().getHours()
  const greeting = lang === 'hi'
    ? (hour < 12 ? 'शुभ प्रभात' : hour < 17 ? 'शुभ दोपहर' : 'शुभ संध्या')
    : (hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening')

  if (loading && !stats) return <LoadingSpinner text={lang === 'hi' ? 'डैशबोर्ड लोड हो रहा है...' : 'Loading your farm dashboard...'} />

  return (
    <div className="space-y-6 fade-in-up max-w-6xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-green-600/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-green-100 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>KRISHI AI • Intelligent Agriculture Assistant</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'Farmer'}! 👋
            </h1>
            <p className="text-green-100 text-xs md:text-sm">
              {user?.location ? `📍 ${user.location} • ` : ''}
              {lang === 'hi'
                ? 'आपके खेत, फसल स्वास्थ्य, मौसम और मंडी भाव का त्वरित सारांश।'
                : "Real-time crop health, meteorological overview, and market analytics for your farm."
              }
            </p>
          </div>

          {/* Micro Weather Badge in Hero */}
          {weather && (
            <div
              onClick={() => navigate('/weather')}
              className="flex items-center gap-4 bg-white/15 hover:bg-white/25 cursor-pointer backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all shadow-inner"
            >
              <div className="text-4xl drop-shadow-sm">
                {weather.description?.includes('Rain') ? '🌧️' : weather.description?.includes('Cloud') ? '⛅' : '☀️'}
              </div>
              <div>
                <p className="text-2xl font-black">{weather.temperature}°C</p>
                <p className="text-green-100 text-xs font-medium capitalize">{weather.description}</p>
                <p className="text-green-200/80 text-[11px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {weather.location}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={lang === 'hi' ? 'एआई सिफारिशें' : 'AI Crop Suggestions'}
          value={stats?.totalRecommendations ?? 0}
          subtitle="Trained Random Forest"
          icon={Sprout}
          color="green"
        />
        <StatCard
          title={lang === 'hi' ? 'रोग पहचान स्कैन' : 'Plant Disease Scans'}
          value={stats?.diseasesDetected ?? 0}
          subtitle="PyTorch CNN (23 classes)"
          icon={Microscope}
          color="red"
        />
        <StatCard
          title={lang === 'hi' ? 'सक्रिय मौसम चेतावनियां' : 'Active Weather Alerts'}
          value={stats?.weatherAlerts ?? 1}
          subtitle="OpenWeather Engine"
          icon={CloudSun}
          color="blue"
        />
        <StatCard
          title={lang === 'hi' ? 'सरकारी योजनाएं' : 'Eligible Govt Schemes'}
          value={stats?.schemesEligible ?? 7}
          subtitle="PM-KISAN, PMFBY, KCC"
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Quick Actions Navigation */}
      <Card>
        <div className="p-5 md:p-6">
          <SectionHeader
            title={t('quickActions')}
            subtitle={lang === 'hi' ? 'किसी भी कृषि मॉड्यूल पर तुरंत जाएं' : 'Instant access to all intelligent farming tools'}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {quickActions.map(({ label, icon: Icon, to, color, desc }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="flex flex-col items-center p-3.5 rounded-2xl hover:bg-green-50/60 border border-gray-100 hover:border-green-200 transition-all group text-center"
              >
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-2.5 shadow-md shadow-green-900/10 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 leading-tight">{label}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Projection Chart */}
        <Card>
          <div className="p-5 md:p-6">
            <SectionHeader
              title={lang === 'hi' ? 'फसल उपज प्रवृत्ति' : 'Crop Yield Benchmark'}
              subtitle="Average yield progression (quintals / hectare)"
            />
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={stats?.cropYieldData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Yield (q/ha)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Mandi Benchmark Chart */}
        <Card>
          <div className="p-5 md:p-6">
            <SectionHeader
              title={lang === 'hi' ? 'मंडी मूल्य तुलना' : 'Market Price Benchmark'}
              subtitle="Current modal price vs historical benchmark (₹/quintal)"
            />
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stats?.priceComparisonData || []} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="crop" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}
                  formatter={(v) => [`₹${v}`, '']}
                />
                <Legend />
                <Bar dataKey="current" name="Current (₹)" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastMonth" name="Last Month" fill="#86efac" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastYear" name="Last Year" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activities & Quick Weather Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-5 md:p-6">
              <SectionHeader
                title={t('recentActivities')}
                subtitle={lang === 'hi' ? 'हाल ही में किए गए परामर्श' : 'Latest consultations and diagnoses'}
                action={
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-xs text-green-700 hover:text-green-800 font-bold flex items-center gap-1"
                  >
                    {t('viewAll')} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                }
              />
              <div className="space-y-3">
                {(stats?.recentActivities || []).map((act, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl hover:bg-gray-50/80 border border-transparent hover:border-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {act.icon || '🌱'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-bold text-gray-900">{act.action}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{act.detail}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Weather Mini-Panel */}
        <Card>
          <div className="p-5 md:p-6 space-y-4">
            <SectionHeader
              title={lang === 'hi' ? 'मौसम संक्षेप' : 'Meteorological Status'}
              subtitle={weather?.location || 'Pune, India'}
            />
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-2">💧 Humidity</span>
                <span className="font-bold text-gray-800">{weather?.humidity ?? 65}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-2">💨 Wind Velocity</span>
                <span className="font-bold text-gray-800">{weather?.wind_speed ?? weather?.windSpeed ?? 12} km/h</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-2">🌧️ Rain (1h)</span>
                <span className="font-bold text-gray-800">{weather?.rainfall ?? 0} mm</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-2">🌡️ Feels Like</span>
                <span className="font-bold text-gray-800">{weather?.feels_like ?? weather?.feelsLike ?? 28}°C</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/weather')}
              className="w-full py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs rounded-xl transition-colors border border-sky-200"
            >
              {lang === 'hi' ? 'विस्तृत 7-दिवसीय पूर्वानुमान देखें →' : 'View Full 7-Day Weather & Advisory →'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
