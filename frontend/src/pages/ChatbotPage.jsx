import { useState, useRef, useEffect } from 'react'
import { chatbotAPI } from '../services/api'
import { mockChatHistory, suggestedQuestions } from '../services/mockData'
import { Button, LoadingSpinner } from '../components/UI'
import { Send, Plus, Trash2, MessageSquareText, Globe, ChevronRight, Bot, User } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
]

// Mock AI responses
const mockResponses = {
  en: [
    "Based on your soil conditions, I recommend wheat cultivation this Rabi season. Ensure proper irrigation every 15-20 days.",
    "For tomato early blight, apply Mancozeb 75 WP @ 2.5g/L water. Also remove infected leaves immediately.",
    "The current MSP for wheat is ₹2,275 per quintal as set by the government for 2024-25.",
    "PM-KISAN provides ₹6,000/year support. Register at pmkisan.gov.in with your Aadhaar and land records.",
    "For nitrogen deficiency, symptoms include yellowing of lower leaves. Apply Urea @ 50 kg/acre as top dressing.",
    "To improve soil health, incorporate green manure crops like Dhaincha before sowing, and practice crop rotation.",
  ],
  hi: [
    "आपकी मिट्टी की स्थिति के आधार पर, मैं इस रबी सीजन में गेहूं की खेती की सलाह देता हूं। हर 15-20 दिन में सिंचाई सुनिश्चित करें।",
    "टमाटर की अर्ली ब्लाइट के लिए, मैनकोजेब 75 WP @ 2.5 ग्राम/लीटर पानी में मिलाकर स्प्रे करें।",
    "2024-25 के लिए गेहूं का एमएसपी ₹2,275 प्रति क्विंटल निर्धारित है।",
    "पीएम-किसान ₹6,000/वर्ष की सहायता देता है। pmkisan.gov.in पर आधार और भूमि रिकॉर्ड के साथ पंजीकरण करें।",
    "नाइट्रोजन की कमी में निचली पत्तियां पीली होती हैं। टॉप ड्रेसिंग के रूप में यूरिया @ 50 किग्रा/एकड़ डालें।",
    "मिट्टी की सेहत सुधारने के लिए बुवाई से पहले हरी खाद की फसल जैसे ढैंचा उगाएं और फसल चक्र अपनाएं।",
  ],
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-green-600" />
      </div>
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-3">
        <div className="flex items-center gap-1.5 h-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-green-400 rounded-full typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-green-600' : 'bg-green-100'}`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-green-600" />
        }
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-green-600 text-white rounded-br-none shadow-md shadow-green-200/40'
            : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-none'
          }`}>
          {msg.content}
        </div>
        <p className="text-xs text-gray-400 px-1">{msg.time}</p>
      </div>
    </div>
  )
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: "Namaste! 🌾 I'm Krishi AI, your intelligent farming assistant. I can help you with crop recommendations, disease management, fertilizer advice, government schemes, and more. Ask me anything about farming!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [language, setLanguage] = useState('en')
  const [sessions, setSessions] = useState(mockChatHistory)
  const [activeSession, setActiveSession] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    // Load sessions from API if available
    const loadSessions = async () => {
      try {
        const res = await chatbotAPI.getSessions()
        if (res?.data?.sessions?.length) {
          setSessions(res.data.sessions)
        }
      } catch {}
    }
    loadSessions()
  }, [])

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(m => [...m, userMsg])
    setInput('')
    setTyping(true)

    try {
      const res = await chatbotAPI.sendMessage({
        message: content,
        language,
        session_id: activeSession,
      })

      const replyText = res?.data?.reply
      if (res?.data?.session_id && !activeSession) {
        setActiveSession(res.data.session_id)
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText || mockResponses[language][0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(m => [...m, botMsg])
    } catch {
      // Fallback response if offline
      const responses = mockResponses[language]
      const responseText = responses[Math.floor(Math.random() * responses.length)]
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(m => [...m, botMsg])
    } finally {
      setTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startNewChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: "Namaste! 🌾 Starting a new conversation. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
    setActiveSession(null)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden fade-in-up">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex flex-col border-r border-gray-100 bg-gray-50`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">Chat History</h2>
          <button
            onClick={startNewChat}
            className="flex items-center gap-1 text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className={`w-full text-left p-3 rounded-xl hover:bg-white transition-all border ${activeSession === s.id ? 'bg-white border-green-200 shadow-sm' : 'border-transparent'}`}
            >
              <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{s.preview}</p>
              <p className="text-xs text-gray-300 mt-1">{s.date}</p>
            </button>
          ))}
        </div>

        {/* Language selector */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Language
          </p>
          <div className="flex gap-2">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${language === l.code ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'}`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-gray-100 px-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <MessageSquareText className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Krishi AI Bot</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full pulse-green inline-block"></span>
                Online · {LANGUAGES.find(l => l.code === language)?.label}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
          {typing && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-400 mb-2">💡 Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors flex items-center gap-1"
                >
                  {q}
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'hi' ? 'अपना सवाल यहाँ लिखें...' : 'Ask about farming, crops, diseases...'}
                rows={1}
                className="w-full bg-transparent px-4 py-3 text-sm resize-none outline-none text-gray-800 placeholder-gray-400 max-h-32"
                style={{ minHeight: '48px' }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="w-11 h-11 bg-green-600 hover:bg-green-700 text-white rounded-2xl flex items-center justify-center shadow-md shadow-green-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
