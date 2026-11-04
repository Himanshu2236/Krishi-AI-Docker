import { useState, useEffect } from 'react'
import { schemesAPI } from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import { Card, LoadingSpinner, SectionHeader, Badge, EmptyState } from '../components/UI'
import {
  FileText, Search, ExternalLink, ChevronDown, ChevronUp, CheckCircle2,
  Clock, Building2, ShieldCheck, ListOrdered, FileCheck
} from 'lucide-react'

const categories = [
  'All',
  'Income Support',
  'Crop Insurance',
  'Credit & Finance',
  'Soil Management',
  'Irrigation',
  'Market Access',
  'Organic Farming',
]

function SchemeCard({ scheme, lang }) {
  const [expanded, setExpanded] = useState(false)

  const categoryColor = {
    'Income Support': 'green',
    'Crop Insurance': 'blue',
    'Credit & Finance': 'orange',
    'Soil Management': 'purple',
    'Irrigation': 'teal',
    'Market Access': 'red',
    'Organic Farming': 'green',
  }

  return (
    <Card className="overflow-hidden border border-gray-100/80 hover:border-purple-200 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge color={categoryColor[scheme.category] || 'gray'}>{scheme.category}</Badge>
              <Badge color={scheme.status === 'Active' ? 'green' : 'gray'}>
                {scheme.status === 'Active' ? '● Active Govt Scheme' : scheme.status}
              </Badge>
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {scheme.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{scheme.ministry}</span>
        </div>

        {/* Benefits Card */}
        <div className="bg-emerald-50/80 rounded-2xl p-3.5 mb-3 border border-emerald-100">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            💰 {lang === 'hi' ? 'वित्तीय / योजना लाभ:' : 'Key Financial / Physical Benefit:'}
          </p>
          <p className="text-xs md:text-sm font-semibold text-emerald-950 leading-relaxed">
            {scheme.benefit}
          </p>
        </div>

        {/* Eligibility */}
        <div className="flex items-start gap-2.5 text-xs md:text-sm text-gray-700 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-gray-900">{lang === 'hi' ? 'पात्रता:' : 'Eligibility:'} </span>
            <span className="text-gray-600">{scheme.eligibility}</span>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>
            <strong className="text-gray-700">{lang === 'hi' ? 'समय सीमा:' : 'Cut-off / Timeline:'}</strong> {scheme.deadline}
          </span>
        </div>

        {/* Expanded Detailed Section */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 fade-in-up">
            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                {lang === 'hi' ? 'योजना का विवरण' : 'Scheme Overview'}
              </h4>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {scheme.description}
              </p>
            </div>

            {/* Documents */}
            {scheme.documents && scheme.documents.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  {lang === 'hi' ? 'आवश्यक दस्तावेज (Checklist)' : 'Mandatory Required Documents'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.documents.map((d, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-50 text-blue-800 border border-blue-100 px-2.5 py-1 rounded-xl font-medium"
                    >
                      ✓ {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Application Procedure */}
            {scheme.application_procedure && scheme.application_procedure.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-purple-600" />
                  {lang === 'hi' ? 'आवेदन प्रक्रिया (चरण-दर-चरण)' : 'Official Application Procedure'}
                </h4>
                <div className="space-y-1.5">
                  {scheme.application_procedure.map((step, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-purple-50/60 border border-purple-100/60 rounded-xl text-xs text-purple-950 leading-relaxed"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-purple-700 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? (lang === 'hi' ? 'संक्षिप्त करें' : 'Hide Details') : (lang === 'hi' ? 'विस्तार से देखें' : 'View Full Details & Steps')}
          </button>
          <div className="flex-1" />
          <a
            href={scheme.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <span>{lang === 'hi' ? 'आधिकारिक पोर्टल' : 'Official Portal'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Card>
  )
}

export default function GovernmentSchemes() {
  const { lang, t } = useLanguage()
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    fetchSchemes()
  }, [activeCategory])

  const fetchSchemes = async () => {
    setLoading(true)
    try {
      const res = await schemesAPI.getSchemes({
        category: activeCategory !== 'All' ? activeCategory : undefined,
        search: search || undefined,
      })
      if (res?.data?.schemes) {
        setSchemes(res.data.schemes)
      }
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchSchemes()
  }

  const filtered = schemes.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.benefit?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q)
    )
  })

  if (loading && !schemes.length) {
    return <LoadingSpinner text={lang === 'hi' ? 'सरकारी योजनाएं लोड हो रही हैं...' : 'Loading verified government agricultural schemes...'} />
  }

  return (
    <div className="space-y-6 fade-in-up max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-purple-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {t('govtSchemes')}
                </h1>
                <p className="text-purple-100 text-xs md:text-sm">
                  {lang === 'hi'
                    ? 'किसानों के लिए प्रत्यक्ष लाभ अंतरण (DBT), फसल बीमा, रियायती ऋण एवं सिंचाई सब्सिडी'
                    : 'Direct Benefit Transfer (DBT), crop insurance, subsidized credit, and irrigation subsidies'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-white/40 max-w-xl">
          <Search className="w-4 h-4 text-white/70 ml-2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'hi' ? 'योजना का नाम, सब्सिडी या कीवर्ड खोजें...' : 'Search by scheme name, subsidy, or keyword...'}
            className="bg-transparent text-white placeholder-white/60 text-xs md:text-sm outline-none px-2 py-1 flex-1"
          />
          <button
            type="submit"
            className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
          >
            {lang === 'hi' ? 'खोजें' : 'Search'}
          </button>
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap
              ${activeCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{schemes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">{lang === 'hi' ? 'कुल योजनाएं' : 'Total Schemes'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-black text-emerald-600">{schemes.filter(s => s.status === 'Active').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">{lang === 'hi' ? 'सक्रिय नामांकन' : 'Active Enrollment'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-black text-purple-600">{filtered.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">{lang === 'hi' ? 'मैचिंग परिणाम' : 'Matching Results'}</p>
        </div>
      </div>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(scheme => (
          <SchemeCard key={scheme.id} scheme={scheme} lang={lang} />
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon="📋"
          title={lang === 'hi' ? 'कोई योजना नहीं मिली' : 'No schemes match your query'}
          description={lang === 'hi' ? 'कृपया अन्य श्रेणी या कीवर्ड का चयन करें।' : 'Try clearing your search keyword or switching to another category.'}
        />
      )}

      {/* Advisory Footer */}
      <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>{lang === 'hi' ? 'सत्यापित सरकारी स्रोत:' : 'Official Government Portals:'}</strong>{' '}
          {lang === 'hi'
            ? 'सभी योजना दिशानिर्देश कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार के आधिकारिक पोर्टल्स से लिए गए हैं। आवेदन केवल आधिकारिक .gov.in या .nic.in डोमेन अथवा नजदीकी CSC केंद्र से ही करें।'
            : 'All scheme procedures adhere to guidelines published by the Ministry of Agriculture & Farmers Welfare, Govt of India. Always apply through authentic .gov.in or .nic.in domains or authorized Common Service Centres (CSC).'
          }
        </p>
      </div>
    </div>
  )
}
