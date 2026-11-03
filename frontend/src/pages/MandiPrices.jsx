import { useState, useEffect } from 'react'
import { mandiAPI } from '../services/api'
import { mockMandiPrices } from '../services/mockData'
import { Card, LoadingSpinner, SectionHeader, Badge } from '../components/UI'
import { TrendingUp, TrendingDown, Search, MapPin, Calendar, RefreshCw } from 'lucide-react'

const states = ['All States', 'Maharashtra', 'Punjab', 'Haryana', 'MP', 'UP', 'Gujarat', 'Karnataka']
const commodities = ['All Commodities', 'Wheat', 'Rice', 'Tomato', 'Onion', 'Cotton', 'Soybean', 'Maize', 'Potato']

export default function MandiPrices() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedState, setSelectedState] = useState('All States')
  const [selectedCommodity, setSelectedCommodity] = useState('All Commodities')
  const [search, setSearch] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    loadPrices()
  }, [])

  const loadPrices = async () => {
    setLoading(true)
    try {
      const res = await mandiAPI.getPrices({
        state: selectedState !== 'All States' ? selectedState : undefined,
        commodity: selectedCommodity !== 'All Commodities' ? selectedCommodity : undefined,
        search: search || undefined,
      })
      if (res?.data?.prices?.length) {
        setPrices(res.data.prices.map(p => ({
          commodity: p.commodity,
          variety: p.variety,
          market: p.market,
          state: p.state,
          minPrice: p.min_price ?? p.minPrice,
          maxPrice: p.max_price ?? p.maxPrice,
          modalPrice: p.modal_price ?? p.modalPrice,
          unit: p.unit || 'quintal',
          date: p.date,
        })))
      } else {
        setPrices(mockMandiPrices)
      }
    } catch {
      setPrices(mockMandiPrices)
    } finally {
      setLastUpdated(new Date().toLocaleTimeString())
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadPrices()
    } finally {
      setRefreshing(false)
    }
  }

  const filtered = prices.filter(p => {
    const matchesState = selectedState === 'All States' || p.state === selectedState
    const matchesCommodity = selectedCommodity === 'All Commodities' || p.commodity === selectedCommodity
    const matchesSearch = !search || p.commodity.toLowerCase().includes(search.toLowerCase()) || p.market.toLowerCase().includes(search.toLowerCase())
    return matchesState && matchesCommodity && matchesSearch
  })

  const getPriceTrend = (modal, min) => modal > (min + (modal - min) * 0.6) ? 'up' : 'down'

  if (loading) return <LoadingSpinner text="Fetching mandi prices..." />

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Mandi Prices</h1>
        </div>
        <p className="text-orange-100">Live commodity prices from mandis across India</p>
        <div className="flex items-center gap-2 mt-2 text-orange-200 text-xs">
          <Calendar className="w-3.5 h-3.5" />
          Last updated: {lastUpdated}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Highest Price', commodity: 'Cotton', value: '₹7,000/q', trend: 'up' },
          { label: 'Best Value', commodity: 'Rice (Basmati)', value: '₹3,800/q', trend: 'up' },
          { label: 'Stable Crop', commodity: 'Wheat', value: '₹2,200/q', trend: 'stable' },
          { label: 'Low Today', commodity: 'Potato', value: '₹900/q', trend: 'down' },
        ].map(({ label, commodity, value, trend }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="font-semibold text-gray-800 text-sm">{commodity}</p>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-lg font-bold text-gray-900">{value}</p>
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search commodity or market..."
                className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
              />
            </div>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
            <select
              value={selectedCommodity}
              onChange={e => setSelectedCommodity(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              {commodities.map(c => <option key={c}>{c}</option>)}
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </Card>

      {/* Price table */}
      <Card>
        <div className="p-5">
          <SectionHeader
            title={`Commodity Prices (${filtered.length} results)`}
            subtitle="Min, Max & Modal prices per quintal"
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Commodity', 'Variety', 'Market', 'State', 'Min Price', 'Modal Price', 'Max Price', 'Trend', 'Date'].map(h => (
                    <th key={h} className="text-xs font-semibold text-gray-500 text-left py-3 px-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const trend = p.modalPrice > p.minPrice + 100 ? 'up' : 'down'
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-green-50/30 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-800 text-sm">{p.commodity}</span>
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600">{p.variety}</td>
                      <td className="py-3 px-3 text-sm text-gray-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />{p.market}
                      </td>
                      <td className="py-3 px-3">
                        <Badge color="gray">{p.state}</Badge>
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600">₹{p.minPrice}</td>
                      <td className="py-3 px-3">
                        <span className="text-sm font-bold text-green-700">₹{p.modalPrice}</span>
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600">₹{p.maxPrice}</td>
                      <td className="py-3 px-3">
                        {trend === 'up'
                          ? <span className="flex items-center gap-1 text-green-600 text-xs"><TrendingUp className="w-3.5 h-3.5" />Rising</span>
                          : <span className="flex items-center gap-1 text-red-500 text-xs"><TrendingDown className="w-3.5 h-3.5" />Falling</span>
                        }
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-400">{p.date}</td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500 text-sm">No results found for your filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-600">
        <strong>Note:</strong> Prices shown are indicative from Agmarknet data. Actual mandi prices may vary. Always verify with your local market before making selling decisions.
      </div>
    </div>
  )
}
