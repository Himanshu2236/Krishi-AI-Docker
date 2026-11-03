import { useState, useEffect } from 'react'
import { schemesAPI } from '../services/api'
import { mockSchemes } from '../services/mockData'
import { Card, LoadingSpinner, SectionHeader, Badge } from '../components/UI'
import { FileText, Search, ExternalLink, ChevronDown, ChevronUp, CheckCircle, Clock, Building2 } from 'lucide-react'

const categories = ['All', 'Income Support', 'Crop Insurance', 'Credit & Finance', 'Soil Management', 'Irrigation']

function SchemeCard({ scheme }) {
  const [expanded, setExpanded] = useState(false)

  const categoryColor = {
    'Income Support': 'green',
    'Crop Insurance': 'blue',
    'Credit & Finance': 'orange',
    'Soil Management': 'purple',
    'Irrigation': 'teal',
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge color={categoryColor[scheme.category] || 'gray'}>{scheme.category}</Badge>
              <Badge color={scheme.status === 'Active' ? 'green' : 'gray'}>
                {scheme.status === 'Active' ? '✓ Active' : scheme.status}
              </Badge>
            </div>
            <h3 className="font-bold text-gray-900 text-base leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>{scheme.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Building2 className="w-3.5 h-3.5" />
          <span>{scheme.ministry}</span>
        </div>

        <div className="bg-green-50 rounded-xl p-3 mb-3 border border-green-100">
          <p className="text-xs font-semibold text-green-700 mb-1">💰 Benefit</p>
          <p className="text-sm font-medium text-green-800">{scheme.benefit}</p>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <span><span className="font-medium text-gray-700">Eligibility:</span> {scheme.eligibility}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Clock className="w-4 h-4 text-amber-500" />
          <span><span className="font-medium">Deadline:</span> {scheme.deadline}</span>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 fade-in-up">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">📋 About this scheme</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{scheme.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">📄 Documents Required</h4>
              <div className="flex flex-wrap gap-2">
                {scheme.documents.map(d => (
                  <span key={d} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{d}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 font-medium transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Show Less' : 'Show More'}
          </button>
          <div className="flex-1" />
          <a
            href={scheme.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors border border-green-100"
          >
            Apply Now <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Card>
  )
}

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await schemesAPI.getSchemes({
          category: activeCategory !== 'All' ? activeCategory : undefined,
          search: search || undefined,
        })
        if (res?.data?.schemes?.length) {
          setSchemes(res.data.schemes)
        } else {
          setSchemes(mockSchemes)
        }
      } catch {
        setSchemes(mockSchemes)
      } finally {
        setLoading(false)
      }
    }
    fetchSchemes()
  }, [])

  const filtered = schemes.filter(s => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) return <LoadingSpinner text="Loading government schemes..." />

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Government Schemes</h1>
        </div>
        <p className="text-purple-100">Discover agricultural subsidies, insurance, and schemes you're eligible for</p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schemes by name or keyword..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200/50'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: schemes.length, label: 'Total Schemes', emoji: '📋' },
          { value: schemes.filter(s => s.status === 'Active').length, label: 'Active Schemes', emoji: '✅' },
          { value: filtered.length, label: 'Matching Results', emoji: '🔍' },
        ].map(({ value, label, emoji }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Scheme cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {filtered.map(scheme => <SchemeCard key={scheme.id} scheme={scheme} />)}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-semibold text-gray-600">No schemes found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term or category</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
        <strong>Disclaimer:</strong> Scheme information is for guidance only. Visit official government portals for accurate and up-to-date details before applying.
      </div>
    </div>
  )
}
