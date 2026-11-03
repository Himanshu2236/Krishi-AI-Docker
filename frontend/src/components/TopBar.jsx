import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, Bell, Search, ChevronDown, User, LogOut, Settings } from 'lucide-react'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/crop-recommendation': 'Crop Recommendation',
  '/disease-detection': 'Disease Detection',
  '/fertilizer': 'Fertilizer Recommendation',
  '/chatbot': 'AI Farming Chatbot',
  '/weather': 'Weather Dashboard',
  '/mandi-prices': 'Mandi Prices',
  '/schemes': 'Government Schemes',
  '/profile': 'My Profile',
}

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const pageTitle = pageTitles[location.pathname] || 'Krishi AI'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-10">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h2 className="font-semibold text-gray-800 text-lg flex-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {pageTitle}
      </h2>

      {/* Search bar — hidden on small screens */}
      <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-56">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
            {user?.name}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2">
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="w-4 h-4" />
                My Profile
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
