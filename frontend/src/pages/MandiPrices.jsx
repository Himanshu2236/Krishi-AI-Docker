import { useState, useEffect } from 'react'
import { mandiAPI } from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import { Card, LoadingSpinner, SectionHeader, Badge, EmptyState } from '../components/UI'
import {
  TrendingUp, TrendingDown, Search, MapPin, Calendar, RefreshCw,
  SlidersHorizontal, AlertCircle, Info, ExternalLink, X
} from 'lucide-react'

export default function MandiPrices() {
  const { lang, t } = useLanguage()
  const [prices, setPrices] = useState([])
  const [states, setStates] = useState([])
  const [commodities, setCommodities] = useState([])
  const [districts, setDistricts] = useState([])
  const [markets, setMarkets] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedState, setSelectedState] = useState('')
  const [selectedCommodity, setSelectedCommodity] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedMarket, setSelectedMarket] = useState('')
  const [search, setSearch] = useState('')
  const [dataMeta, setDataMeta] = useState(null)

  useEffect(() => {
    loadFilterOptions()
    loadPrices()
  }, [])

  useEffect(() => {
    // When state changes, update available districts
    if (selectedState) {
      mandiAPI.getDistricts(selectedState).then(res => {
        setDistricts(res?.data?.districts || [])
      }).catch(() => {})
      setSelectedDistrict('')
      setSelectedMarket('')
    } else {
      mandiAPI.getDistricts().then(res => setDistricts(res?.data?.districts || [])).catch(() => {})
    }
  }, [selectedState])

  useEffect(() => {
    // When state or district changes, update available markets
    mandiAPI.getMarkets({ state: selectedState || undefined, district: selectedDistrict || undefined })
      .then(res => setMarkets(res?.data?.markets || []))
      .catch(() => {})
  }, [selectedState, selectedDistrict])

  const loadFilterOptions = async () => {
    try {
      const [sRes, cRes, dRes] = await Promise.allSettled([
        mandiAPI.getStates(),
        mandiAPI.getCommodities(),
        mandiAPI.getDistricts(),
      ])
      if (sRes.status === 'fulfilled') setStates(sRes.value?.data?.states || [])
      if (cRes.status === 'fulfilled') setCommodities(cRes.value?.data?.commodities || [])
      if (dRes.status === 'fulfilled') setDistricts(dRes.value?.data?.districts || [])
    } catch {}
  }

  const loadPrices = async (overrideParams = {}) => {
    setLoading(true)
    try {
      const params = {
        state: overrideParams.state !== undefined ? overrideParams.state : (selectedState || undefined),
        commodity: overrideParams.commodity !== undefined ? overrideParams.commodity : (selectedCommodity || undefined),
        district: overrideParams.district !== undefined ? overrideParams.district : (selectedDistrict || undefined),
        market: overrideParams.market !== undefined ? overrideParams.market : (selectedMarket || undefined),
        search: overrideParams.search !== undefined ? overrideParams.search : (search || undefined),
      }
      const res = await mandiAPI.getPrices(params)
      if (res?.data) {
        setPrices(res.data.prices || [])
        setDataMeta({
          source: res.data.data_source,
          note: res.data.data_note,
          lastUpdated: res.data.last_updated,
          isLive: res.data.live_available,
        })
      }
    } catch {
      // Keep existing data
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilter = () => {
    loadPrices()
  }

  const handleResetFilters = () => {
    setSelectedState('')
    setSelectedCommodity('')
    setSelectedDistrict('')
    setSelectedMarket('')
    setSearch('')
    loadPrices({ state: undefined, commodity: undefined, district: undefined, market: undefined, search: undefined })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadPrices()
    } finally {
      setRefreshing(false)
    }
  }

  // Summary statistics computed from loaded prices
  const highestPriced = prices.length ? [...prices].sort((a, b) => b.modal_price - a.modal_price)[0] : null
  const lowestPriced = prices.length ? [...prices].sort((a, b) => a.modal_price - b.modal_price)[0] : null
  const avgPrice = prices.length ? Math.round(prices.reduce((sum, p) => sum + p.modal_price, 0) / prices.length) : 0

  if (loading && !prices.length) {
    return <LoadingSpinner text={lang === 'hi' ? 'मंडी भाव लोड किए जा रहे हैं...' : 'Loading official mandi rates...'} />
  }

  return (
    <div className="space-y-6 fade-in-up max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-orange-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {t('mandiPrices')}
                </h1>
                <p className="text-orange-100 text-xs md:text-sm">
                  {lang === 'hi'
                    ? 'कृषि उपज मंडी समितियों (APMC) और न्यूनतम समर्थन मूल्य (MSP) का आधिकारिक संदर्भ'
                    : 'Regulated APMC market records & MSP reference values across Indian states'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-medium px-4 py-2.5 rounded-2xl text-xs transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? (lang === 'hi' ? 'ताज़ा हो रहा...' : 'Refreshing...') : t('refresh')}</span>
            </button>
            <a
              href="https://agmarknet.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white text-orange-700 hover:bg-orange-50 font-semibold px-4 py-2.5 rounded-2xl text-xs transition-all shadow-xs"
            >
              <span>AGMARKNET</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Data Provenance Badge */}
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-orange-100">
            <Info className="w-4 h-4 text-orange-200" />
            <span>
              <strong>{lang === 'hi' ? 'डेटा स्रोत:' : 'Data Source:'}</strong> {dataMeta?.source || 'Agmarknet Reference / MSP 2024-25'}
            </span>
          </div>
          {dataMeta?.lastUpdated && (
            <span className="text-orange-200/90 text-[11px]">
              {lang === 'hi' ? 'अंतिम अद्यतन:' : 'Synchronized:'} {new Date(dataMeta.lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Mandatory Regulatory Notice: No Fake Live Prices */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">
            {lang === 'hi' ? 'महत्वपूर्ण अस्वीकरण (पारदर्शिता सूचना)' : 'Authenticity Notice: No Speculative Live Market Bids'}
          </p>
          <p className="text-amber-800 leading-relaxed">
            {lang === 'hi'
              ? 'KRISHI AI कभी भी फर्जी लाइव मार्केट कीमतें उत्पन्न नहीं करता है। नीचे प्रदर्शित मूल्य एगमार्कनेट (Agmarknet) के आधिकारिक संदर्भ और 2024-25 न्यूनतम समर्थन मूल्य (MSP) पर आधारित हैं। फसल बेचने से पहले अपनी स्थानीय APMC मंडी या agmarknet.nic.in पर पुष्टि अवश्य करें।'
              : 'KRISHI AI never fabricates live speculative market quotes. The data below represents verified reference modal benchmarks and official MSP 2024-25 records. Always cross-verify with your local APMC physical yard or the official portal (agmarknet.nic.in) before finalizing farmgate transactions.'
            }
          </p>
        </div>
      </div>

      {/* High-level Market Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">{lang === 'hi' ? 'शीर्ष मूल्य फसल' : 'Highest Quoted'}</p>
          <p className="font-bold text-gray-900 text-sm mt-0.5 truncate">{highestPriced?.commodity || '—'}</p>
          <p className="text-lg font-extrabold text-green-700 mt-1">₹{highestPriced?.modal_price?.toLocaleString('en-IN') || 0}<span className="text-xs font-normal text-gray-400">/q</span></p>
          <p className="text-[11px] text-gray-400 truncate">{highestPriced?.market}, {highestPriced?.state}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">{lang === 'hi' ? 'किफायती / न्यूनतम' : 'Lowest Quoted'}</p>
          <p className="font-bold text-gray-900 text-sm mt-0.5 truncate">{lowestPriced?.commodity || '—'}</p>
          <p className="text-lg font-extrabold text-gray-800 mt-1">₹{lowestPriced?.modal_price?.toLocaleString('en-IN') || 0}<span className="text-xs font-normal text-gray-400">/q</span></p>
          <p className="text-[11px] text-gray-400 truncate">{lowestPriced?.market}, {lowestPriced?.state}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">{lang === 'hi' ? 'औसत मॉडल मूल्य' : 'Average Modal Rate'}</p>
          <p className="font-bold text-gray-900 text-sm mt-0.5">{lang === 'hi' ? 'सभी मंडियां' : 'All Mandis'}</p>
          <p className="text-lg font-extrabold text-blue-700 mt-1">₹{avgPrice.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-400">/q</span></p>
          <p className="text-[11px] text-gray-400">{prices.length} {lang === 'hi' ? 'रिकॉर्ड्स' : 'commodities tracked'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">{lang === 'hi' ? 'कवरेज' : 'Market Coverage'}</p>
          <p className="font-bold text-gray-900 text-sm mt-0.5">{states.length} {lang === 'hi' ? 'राज्य' : 'States'}</p>
          <p className="text-lg font-extrabold text-purple-700 mt-1">{markets.length || 20}+ <span className="text-xs font-normal text-gray-400">APMCs</span></p>
          <p className="text-[11px] text-gray-400">Agmarknet verified</p>
        </div>
      </div>

      {/* Comprehensive Filter Bar (Search + State + District + Market + Commodity) */}
      <Card>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-600" />
              {lang === 'hi' ? 'मंडी एवं फसल फिल्टर' : 'Filter & Search Mandi Records'}
            </span>
            {(selectedState || selectedCommodity || selectedDistrict || selectedMarket || search) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'फिल्टर हटाएं' : 'Reset All'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleApplyFilter()}
                placeholder={lang === 'hi' ? 'फसल या मंडी खोजें...' : 'Search crop/market...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-gray-700"
            >
              <option value="">{t('allStates')}</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-gray-700"
            >
              <option value="">{t('allDistricts')}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Market Filter */}
            <select
              value={selectedMarket}
              onChange={e => setSelectedMarket(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-gray-700"
            >
              <option value="">{t('allMarkets')}</option>
              {markets.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* Commodity Filter */}
            <select
              value={selectedCommodity}
              onChange={e => setSelectedCommodity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-gray-700"
            >
              <option value="">{t('allCommodities')}</option>
              {commodities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleApplyFilter}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-orange-500/20 transition-all"
            >
              {lang === 'hi' ? 'फिल्टर लागू करें' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </Card>

      {/* Main Prices Table */}
      <Card>
        <div className="p-5 md:p-6">
          <SectionHeader
            title={`${lang === 'hi' ? 'फसल बाजार भाव' : 'Agricultural Market Records'} (${prices.length} ${lang === 'hi' ? 'परिणाम' : 'entries'})`}
            subtitle={lang === 'hi' ? 'न्यूनतम, अधिकतम एवं मॉडल मूल्य (₹ प्रति क्विंटल)' : 'Minimum, maximum and modal rates in ₹ per quintal'}
          />

          {prices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Crop / Variety</th>
                    <th className="py-3 px-3">State & District</th>
                    <th className="py-3 px-3">Market Yard</th>
                    <th className="py-3 px-3 text-right">Min Price</th>
                    <th className="py-3 px-3 text-right">Modal Price</th>
                    <th className="py-3 px-3 text-right">Max Price</th>
                    <th className="py-3 px-3 text-center">Trend</th>
                    <th className="py-3 px-3 text-center">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {prices.map((p, i) => {
                    const isAboveMin = p.modal_price > p.min_price + 100
                    return (
                      <tr key={i} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-gray-900 text-sm">{p.commodity}</p>
                          <p className="text-[11px] text-gray-400">{p.variety || 'Standard'}</p>
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge color="gray">{p.state}</Badge>
                          {p.district && <p className="text-[11px] text-gray-500 mt-1">{p.district}</p>}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                            <span>{p.market}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-medium text-gray-500">
                          ₹{p.min_price?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-extrabold text-green-700 text-sm bg-green-50 px-2 py-1 rounded-lg">
                            ₹{p.modal_price?.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-medium text-gray-500">
                          ₹{p.max_price?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {isAboveMin ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-[11px] font-semibold">
                              <TrendingUp className="w-3.5 h-3.5" /> High
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 text-[11px] font-semibold">
                              <TrendingDown className="w-3.5 h-3.5" /> Baseline
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {p.source || 'Agmarknet'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="🌾"
              title={lang === 'hi' ? 'कोई मंडी भाव नहीं मिला' : 'No matching mandi records'}
              description={lang === 'hi' ? 'कृपया अपने फिल्टर बदलकर पुनः प्रयास करें।' : 'Try relaxing your state, crop, or district search filters.'}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
