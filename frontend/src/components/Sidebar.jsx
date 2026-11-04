import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import {
  LayoutDashboard, Sprout, Microscope, FlaskConical, MessageSquareText,
  CloudSun, TrendingUp, FileText, User, ChevronLeft, ChevronRight,
  LogOut, X, Leaf
} from 'lucide-react'

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/crop-recommendation', icon: Sprout, label: t('cropRecommendation') },
    { to: '/disease-detection', icon: Microscope, label: t('diseaseDetection') },
    { to: '/fertilizer', icon: FlaskConical, label: t('fertilizerAdvisor') },
    { to: '/chatbot', icon: MessageSquareText, label: t('aiChatbot') },
    { to: '/weather', icon: CloudSun, label: t('weather') },
    { to: '/mandi-prices', icon: TrendingUp, label: t('mandiPrices') },
    { to: '/schemes', icon: FileText, label: t('govtSchemes') },
    { to: '/profile', icon: User, label: t('myProfile') },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30
        flex flex-col shadow-xl transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Header */}
      <div className={`flex items-center h-16 border-b border-gray-100 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-green-700 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Krishi AI</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-xs">
            <Leaf className="w-5 h-5 text-white" />
          </div>
        )}
        {/* Mobile close */}
        <button onClick={onClose} aria-label="Close menu" className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User mini-card */}
      {!isCollapsed && user && (
        <div className="mx-3 mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.location || 'Farmer'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-green-600 text-white shadow-md shadow-green-200'
                    : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }
                  ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={onToggleCollapse}
        aria-label="Toggle sidebar width"
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-xs hover:bg-green-50 text-gray-500 hover:text-green-600"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logout */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? t('logout') : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </aside>
  )
}
