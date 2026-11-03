# 🌾 Krishi AI – Intelligent Agriculture Assistant

An AI-powered agriculture platform designed for Indian farmers, providing crop recommendations, disease detection, market prices, government schemes, and more.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Backend | Python 3.10+, FastAPI, Uvicorn |
| Database | MongoDB, Motor (Async), PyMongo |
| Authentication | JWT (Python-Jose), Bcrypt (Passlib) |
| AI | Groq API, Llama 3.3 Models |
| ML *(Part 3)* | Scikit-learn, TensorFlow, OpenCV |
| Deployment | Docker, Docker Compose |

## 📁 Project Structure

```
Krishi AI/
├── frontend/                    # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   ├── TopBar.jsx       # Header with user menu
│   │   │   └── UI.jsx           # Shared UI primitives
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx   # Dashboard layout wrapper
│   │   │   └── AuthLayout.jsx   # Login/Register layout
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CropRecommendation.jsx
│   │   │   ├── DiseaseDetection.jsx
│   │   │   ├── FertilizerRecommendation.jsx
│   │   │   ├── ChatbotPage.jsx
│   │   │   ├── WeatherDashboard.jsx
│   │   │   ├── MandiPrices.jsx
│   │   │   ├── GovernmentSchemes.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── services/
│   │   │   ├── api.js           # Centralized Axios API service
│   │   │   └── mockData.js      # Mock data for development
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                     # FastAPI backend (Part 2)
│   └── app/
│       ├── main.py
│       ├── routers/
│       ├── models/
│       └── services/
│
├── ml-models/                   # ML model files (Part 2)
│   ├── crop-recommendation/
│   └── disease-detection/
│
├── docs/                        # Documentation
├── .env.example
├── .gitignore
└── README.md
```

## 🎯 Features (Part 1 – Frontend)

- ✅ **Landing Page** – Hero, features, how it works, testimonials, CTA
- ✅ **Authentication** – Login & Registration with form validation
- ✅ **Dashboard** – Stats, charts, quick actions, weather overview
- ✅ **Crop Recommendation** – NPK, pH, climate inputs → AI recommendation
- ✅ **Disease Detection** – Drag & drop image upload → disease analysis
- ✅ **Fertilizer Recommendation** – Soil data → fertilizer schedule
- ✅ **AI Chatbot** – ChatGPT-style interface with Hindi/English support
- ✅ **Weather Dashboard** – Current weather, 7-day forecast, alerts
- ✅ **Mandi Prices** – Live commodity prices table with filtering
- ✅ **Government Schemes** – Searchable scheme cards with details
- ✅ **User Profile** – Edit profile, farm info, notifications

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & pip
- MongoDB (local or MongoDB Atlas connection string)

---

### 1. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at **http://localhost:5173**

---

### 2. Run the Backend (FastAPI)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be running at:
- **API Root**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### Demo Login
Use the "Use Demo Credentials" button on the login page, or:
- Email: `ramesh@example.com`
- Password: `farmer123`

---

## 🌿 Design System

| Color | Value | Usage |
|-------|-------|-------|
| Forest Green | `#16a34a` | Primary actions, active states |
| Light Green | `#4ade80` | Accents, charts |
| Green Dark | `#14532d` | Text emphasis |
| White | `#ffffff` | Background |
| Gray 50 | `#f9fafb` | Card backgrounds |

---

## 🚧 Part 3 – Machine Learning & Deployment

- Custom trained Scikit-learn Crop Recommendation model (`.pkl`)
- TensorFlow / Keras CNN Plant Disease Detection model (`.h5` / `.keras`)
- Docker Compose multi-container orchestration (Frontend + Backend + MongoDB)


---

Made with ❤️ for Indian Farmers
