// Reusable card component
export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  )
}

// Stat card with icon
export function StatCard({ title, value, subtitle, icon: Icon, color = 'green', trend }) {
  const colorMap = {
    green: { bg: 'bg-green-50', icon: 'bg-green-600', text: 'text-green-600' },
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-600' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-500' },
    red: { bg: 'bg-red-50', icon: 'bg-red-500', text: 'text-red-500' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-600' },
  }
  const c = colorMap[color] || colorMap.green

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// Loading spinner
export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeMap = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' }
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sizeMap[size]} border-4 border-green-200 border-t-green-600 rounded-full animate-spin`} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  )
}

// Error message
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-gray-700 font-medium">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-green-600 hover:text-green-700 font-medium underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}

// Badge
export function Badge({ children, color = 'green' }) {
  const colorMap = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color] || colorMap.green}`}>
      {children}
    </span>
  )
}

// Section header
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// Input field
export function InputField({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
          } bg-white`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Select field
export function SelectField({ label, options, error, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none bg-white
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
          }`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Button
export function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200/50',
    secondary: 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200/50',
    ghost: 'hover:bg-gray-100 text-gray-600',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}

// Confidence bar
export function ConfidenceBar({ value, label, color = 'green' }) {
  const percent = Math.round(value * 100)
  const colorMap = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  }
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{percent}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color] || colorMap.green} rounded-full transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// Empty state
export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-5xl">{icon}</span>
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
    </div>
  )
}
