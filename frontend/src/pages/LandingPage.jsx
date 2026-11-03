import { useNavigate } from 'react-router-dom'
import { Sprout, Microscope, CloudSun, TrendingUp, MessageSquareText, FileText, FlaskConical, ChevronRight, CheckCircle, Leaf, Star, Users, Award, ArrowRight } from 'lucide-react'

const features = [
  { icon: Sprout, title: 'Crop Recommendation', description: 'AI-powered crop suggestions based on soil NPK, pH, temperature, humidity, and rainfall data.', color: 'bg-green-50 text-green-600' },
  { icon: Microscope, title: 'Disease Detection', description: 'Upload crop images to instantly detect diseases and get treatment recommendations.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: FlaskConical, title: 'Fertilizer Advisor', description: 'Get precise fertilizer recommendations based on soil health and crop requirements.', color: 'bg-teal-50 text-teal-600' },
  { icon: MessageSquareText, title: 'AI Farming Chatbot', description: 'Chat in Hindi or English with our AI assistant for farming guidance, anytime, anywhere.', color: 'bg-lime-50 text-lime-600' },
  { icon: CloudSun, title: 'Weather Dashboard', description: 'Real-time weather data and 7-day forecasts tailored for agricultural planning.', color: 'bg-sky-50 text-sky-600' },
  { icon: TrendingUp, title: 'Mandi Prices', description: 'Live market prices from mandis across India to help you sell at the best rate.', color: 'bg-orange-50 text-orange-600' },
  { icon: FileText, title: 'Government Schemes', description: 'Discover and apply for government subsidies and agricultural schemes you\'re eligible for.', color: 'bg-purple-50 text-purple-600' },
]

const steps = [
  { number: '01', title: 'Create Account', description: 'Register your free account with basic farmer details.', icon: '👤' },
  { number: '02', title: 'Enter Farm Data', description: 'Input your soil, location, and crop information.', icon: '📋' },
  { number: '03', title: 'Get AI Insights', description: 'Receive personalized recommendations powered by AI.', icon: '🤖' },
  { number: '04', title: 'Grow Better', description: 'Apply insights for improved yield and profitability.', icon: '🌱' },
]

const benefits = [
  'AI-powered crop recommendations with 90%+ accuracy',
  'Real-time disease detection via image analysis',
  'Live mandi prices from 5000+ markets',
  'Chatbot support in Hindi and English',
  '24/7 access to expert farming knowledge',
  'Government scheme eligibility checker',
  'Weather-integrated farming calendar',
  'Free for all Indian farmers',
]

const stats = [
  { value: '2L+', label: 'Farmers Helped' },
  { value: '95%', label: 'Accuracy Rate' },
  { value: '5000+', label: 'Mandi Markets' },
  { value: '50+', label: 'Crop Varieties' },
]

const testimonials = [
  { name: 'Ramesh Patel', location: 'Gujarat', text: 'Krishi AI helped me select the right crop for my field. My yield increased by 40% this season!', rating: 5, crop: 'Cotton Farmer' },
  { name: 'Sunita Devi', location: 'Punjab', text: 'The disease detection feature saved my wheat crop. I identified rust disease early and treated it in time.', rating: 5, crop: 'Wheat Farmer' },
  { name: 'Mohan Kumar', location: 'Maharashtra', text: 'Mandi prices feature is excellent. I sold my onions at the best price by checking different markets.', rating: 5, crop: 'Onion Farmer' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Krishi <span className="text-gray-800">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-green-600 transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-green-600 transition-colors">Benefits</a>
            <a href="#testimonials" className="hover:text-green-600 transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors px-3 py-2"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-medium bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition-colors shadow-md shadow-green-200/50"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="pt-28 pb-20 px-4 bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in-up">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full pulse-green"></span>
                Powered by Groq AI & Llama Models
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Smart Farming for{' '}
                <span className="gradient-text">Every Indian</span>{' '}
                Farmer
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Krishi AI combines cutting-edge artificial intelligence with deep agricultural knowledge to empower Indian farmers with real-time insights, disease detection, market prices, and personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-green-300/40 text-base"
                >
                  Start for Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-xl border border-gray-200 transition-all text-base"
                >
                  Sign In
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {['R', 'S', 'M', 'P', 'A'].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-green-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{l}</div>
                  ))}
                </div>
                <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">2 Lakh+</span> farmers already using Krishi AI</p>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative hidden lg:block">
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 shadow-2xl shadow-green-300/30">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { emoji: '🌾', title: 'Wheat', detail: 'Best crop for your soil', score: '92%' },
                    { emoji: '🔬', title: 'Disease', detail: 'Early Blight detected', score: '87%' },
                    { emoji: '🌤️', title: 'Weather', detail: 'Partly cloudy, 28°C', score: 'Today' },
                    { emoji: '📈', title: 'Wheat Price', detail: '₹2,200/quintal', score: '+5%' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white border border-white/20">
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <div className="text-xs font-medium opacity-80 mb-1">{item.title}</div>
                      <div className="text-sm font-semibold">{item.detail}</div>
                      <div className="mt-2 text-xs bg-white/20 rounded-full px-2 py-0.5 inline-block">{item.score}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-white/20 rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">🤖</div>
                    <div>
                      <p className="text-sm font-medium">Krishi AI Bot</p>
                      <p className="text-xs opacity-80">गेहूं की बुवाई का सबसे अच्छा समय अक्टूबर-नवंबर है।</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="py-12 bg-green-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center text-white">
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</div>
                <div className="text-green-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Sprout className="w-4 h-4" /> Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Everything You Need to Farm Smarter
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From AI-powered recommendations to real-time market data, Krishi AI provides all the tools modern farmers need.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm card-hover">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              How Krishi AI Works
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">Get started in minutes and start making smarter farming decisions</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ number, title, description, icon }, idx) => (
              <div key={number} className="relative">
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-green-200 z-0 -translate-y-1/2" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-white border-2 border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md text-4xl">
                    {icon}
                  </div>
                  <div className="text-green-600 font-bold text-sm mb-2">{number}</div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="benefits" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4" /> Why Krishi AI?
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Built for Indian Farmers, by AI Experts
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We combine the power of Llama AI models with deep knowledge of Indian agricultural practices to give you the most relevant, actionable insights.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {benefits.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
              <div className="space-y-4">
                {[
                  { label: 'Crop Recommendation Accuracy', value: 92 },
                  { label: 'Disease Detection Rate', value: 87 },
                  { label: 'Farmer Satisfaction', value: 96 },
                  { label: 'Yield Improvement', value: 35 },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 font-medium">{label}</span>
                      <span className="text-green-600 font-bold">{value}%</span>
                    </div>
                    <div className="h-2.5 bg-green-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Users className="w-4 h-4" /> Farmer Stories
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Trusted by Farmers Across India
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ name, location, text, rating, crop }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                <div className="flex mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-500 text-xs">{crop} · {location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ready to Transform Your Farm?
          </h2>
          <p className="text-green-100 text-lg mb-8">Join 2 lakh+ farmers already using Krishi AI to grow smarter</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 bg-white hover:bg-green-50 text-green-700 font-semibold px-8 py-3.5 rounded-xl transition-all text-base shadow-lg"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 bg-green-500/30 hover:bg-green-500/40 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-base border border-white/30"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">Krishi AI</span>
              </div>
              <p className="text-sm leading-relaxed">Intelligent Agriculture Assistant for Indian farmers.</p>
            </div>
            {[
              { title: 'Features', links: ['Crop Recommendation', 'Disease Detection', 'Fertilizer Advisor', 'AI Chatbot'] },
              { title: 'Resources', links: ['Mandi Prices', 'Weather', 'Govt. Schemes', 'Farming Guide'] },
              { title: 'Support', links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white font-semibold mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map(l => (
                    <li key={l}><a href="#" className="text-sm hover:text-green-400 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 Krishi AI. All rights reserved.</p>
            <p className="text-sm">Made with ❤️ for Indian Farmers</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
