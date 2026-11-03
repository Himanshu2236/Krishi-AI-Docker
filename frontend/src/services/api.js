import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT bearer token if user is signed in
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('krishi_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user?.token || user?.access_token) {
          config.headers.Authorization = `Bearer ${user.token || user.access_token}`
        }
      } catch {}
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      localStorage.removeItem('krishi_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout').catch(() => {}),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

// ─── Crop Recommendation ──────────────────────────────────────────────────────
export const cropAPI = {
  recommend: (data) => api.post('/crops/recommend', data),
  getHistory: () => api.get('/crops/history'),
}

// ─── Disease Detection ────────────────────────────────────────────────────────
export const diseaseAPI = {
  detect: (formData) =>
    api.post('/disease/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHistory: () => api.get('/disease/history'),
}

// ─── Fertilizer ───────────────────────────────────────────────────────────────
export const fertilizerAPI = {
  recommend: (data) => api.post('/fertilizer/recommend', data),
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────
export const chatbotAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: (sessionId) => api.get('/chat/history', { params: { session_id: sessionId } }),
  getSessions: () => api.get('/chat/sessions'),
}

// ─── Weather ──────────────────────────────────────────────────────────────────
export const weatherAPI = {
  getCurrent: (location) => api.get('/weather/current', { params: { location } }),
  getForecast: (location) => api.get('/weather/forecast', { params: { location } }),
  getFull: (location) => api.get('/weather/full', { params: { location } }),
}

// ─── Mandi Prices ─────────────────────────────────────────────────────────────
export const mandiAPI = {
  getPrices: (params) => api.get('/mandi/prices', { params }),
  getStates: () => api.get('/mandi/states'),
  getCommodities: () => api.get('/mandi/commodities'),
  getDistricts: (state) => api.get('/mandi/districts', { params: { state } }),
  getMarkets: (params) => api.get('/mandi/markets', { params }),
}

// ─── Government Schemes ───────────────────────────────────────────────────────
export const schemesAPI = {
  getSchemes: (params) => api.get('/schemes', { params }),
  getScheme: (id) => api.get(`/schemes/${id}`),
}

// ─── Dashboard & User ─────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}

export const userAPI = {
  updateProfile: (data) => api.put('/auth/profile', data),
  getDashboardStats: () => api.get('/dashboard/stats'),
}

export default api
