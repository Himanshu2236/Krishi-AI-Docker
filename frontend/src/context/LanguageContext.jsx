import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext(null)

const translations = {
  en: {
    dashboard: 'Dashboard',
    cropRecommendation: 'Crop Recommendation',
    diseaseDetection: 'Disease Detection',
    fertilizerAdvisor: 'Fertilizer Recommendation',
    aiChatbot: 'AI Farming Chatbot',
    weather: 'Weather Dashboard',
    mandiPrices: 'Mandi Prices',
    govtSchemes: 'Government Schemes',
    myProfile: 'My Profile',
    logout: 'Logout',
    settings: 'Settings',
    search: 'Search...',
    welcome: 'Welcome',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    apply: 'Apply Now',
    refresh: 'Refresh',
    allStates: 'All States',
    allCommodities: 'All Commodities',
    allDistricts: 'All Districts',
    allMarkets: 'All Markets',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    modalPrice: 'Modal Price',
    useMyLocation: 'Use My Location',
    locating: 'Locating...',
    farmingAdvisory: 'Farming Advisory',
    todayWeather: "Today's Weather",
    forecast7Day: '7-Day Forecast',
    quickActions: 'Quick Actions',
    recentActivities: 'Recent Activities',
    viewAll: 'View All',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    cropRecommendation: 'फसल सिफारिश',
    diseaseDetection: 'रोग पहचान',
    fertilizerAdvisor: 'उर्वरक सलाहकार',
    aiChatbot: 'कृषि AI चैटबॉट',
    weather: 'मौसम पूर्वानुमान',
    mandiPrices: 'मंडी भाव',
    govtSchemes: 'सरकारी योजनाएं',
    myProfile: 'मेरी प्रोफाइल',
    logout: 'लॉगआउट',
    settings: 'सेटिंग्स',
    search: 'खोजें...',
    welcome: 'स्वागत है',
    loading: 'लोड हो रहा है...',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    apply: 'आवेदन करें',
    refresh: 'ताज़ा करें',
    allStates: 'सभी राज्य',
    allCommodities: 'सभी फसलें',
    allDistricts: 'सभी जिले',
    allMarkets: 'सभी मंडियां',
    minPrice: 'न्यूनतम भाव',
    maxPrice: 'अधिकतम भाव',
    modalPrice: 'मॉडल भाव',
    useMyLocation: 'मेरी वर्तमान लोकेशन लें',
    locating: 'खोज रहे हैं...',
    farmingAdvisory: 'कृषि सलाह',
    todayWeather: 'आज का मौसम',
    forecast7Day: '7-दिवसीय पूर्वानुमान',
    quickActions: 'त्वरित कार्य',
    recentActivities: 'हाल की गतिविधियां',
    viewAll: 'सभी देखें',
  },
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('krishi_lang') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('krishi_lang', lang)
  }, [lang])

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key
  }

  const toggleLang = () => {
    setLang(l => (l === 'en' ? 'hi' : 'en'))
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      toggleLang: () => {},
      t: (k) => k,
    }
  }
  return context
}
