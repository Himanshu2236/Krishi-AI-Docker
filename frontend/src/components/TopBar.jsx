import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { Menu, Bell, Search, ChevronDown, User, LogOut, Settings, Languages, Check, X } from 'lucide-react'

const pageTitles = {
  en: {
    '/dashboard': 'Dashboard',
    '/crop-recommendation': 'Crop Recommendation',
    '/disease-detection': 'Disease Detection',
    '/fertilizer': 'Fertilizer Recommendation',
    '/chatbot': 'AI Farming Chatbot',
    '/weather': 'Weather Dashboard',
    '/mandi-prices': 'Mandi Prices',
    '/schemes': 'Government Schemes',
    '/profile': 'My Profile',
  },
  hi: {
    '/dashboard': 'डैशबोर्ड',
    '/crop-recommendation': 'फसल सिफारिश',
    '/disease-detection': 'रोग पहचान',
    '/fertilizer': 'उर्वरक सलाहकार',
    '/chatbot': 'कृषि AI चैटबॉट',
    '/weather': 'मौसम पूर्वानुमान',
    '/mandi-prices': 'मंडी भाव',
    '/schemes': 'सरकारी योजनाएं',
    '/profile': 'मेरी प्रोफाइल',
  },
}

const mockNotifications = [
  { id: 1, title: 'Weather Alert', desc: 'Rain expected in your region within 48 hours.', time: '10m ago', unread: true },
  { id: 2, title: 'PM-KISAN Update', desc: 'Next installment release dates published.', time: '2h ago', unread: true },
  { id: 3, title: 'Mandi Rate Rise', desc: 'Wheat price up by ₹50/quintal in Indore mandi.', time: '1d ago', unread: false },
]

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { lang, toggleLang, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const currentTitles = pageTitles[lang] || pageTitles.en
  const pageTitle = currentTitles[location.pathname] || 'Krishi AI'
  const unreadCount = notifications.filter(n => n.unread).length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        aria-label="Toggle Menu"
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h2 className="font-semibold text-gray-800 text-base md:text-lg flex-1 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {pageTitle}
      </h2>

      {/* Language Toggle Button */}
      <button
        onClick={toggleLang}
        title={lang === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-green-400 bg-gray-50 hover:bg-green-50 text-xs font-semibold text-gray-700 hover:text-green-800 transition-all shadow-2xs"
      >
        <Languages className="w-3.5 h-3.5 text-green-600" />
        <span className={lang === 'en' ? 'text-green-700 font-bold' : 'text-gray-400'}>EN</span>
        <span className="text-gray-300">/</span>
        <span className={lang === 'hi' ? 'text-green-700 font-bold' : 'text-gray-400'}>हिं</span>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false) }}
          aria-label="Notifications"
          className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-green-50/40' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false) }}
          aria-label="User Menu"
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
            {user?.name || 'Farmer'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-800 truncate">{user?.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-500" />
                {t('myProfile')}
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
