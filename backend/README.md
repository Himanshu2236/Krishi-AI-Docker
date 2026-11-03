# 🌾 KRISHI AI – Backend

FastAPI, MongoDB, and AI-powered backend service for the Krishi AI platform.

## 🚀 Features

- **JWT Authentication**: User registration, login, profile management, and password hashing with bcrypt.
- **Crop Recommendation**: Rule-based & ML-ready recommendation based on NPK, pH, and climate metrics.
- **Plant Disease Detection**: Image upload analysis with treatments & preventions.
- **Fertilizer Recommendation**: Tailored nutrient dosages and application schedules.
- **AI Farming Chatbot**: Groq API (Llama 3.3) integration with bilingual support (Hindi & English).
- **Weather Dashboard API**: Integration with OpenWeatherMap & agricultural forecast advisories.
- **Mandi Market Prices**: Real-time commodity price tracking across Indian markets.
- **Government Schemes**: Searchable database of agriculture subsidies and welfare programs.
- **Dashboard Aggregation**: Activity history, stats, yield analytics, and price comparison.

---

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB (async via Motor & PyMongo)
- **Validation**: Pydantic v2
- **Auth**: Python-Jose (JWT), Passlib (Bcrypt)
- **AI Engine**: Groq API (Llama-3.3-70b-versatile)
- **Documentation**: Swagger UI (`/docs`), ReDoc (`/redoc`)

---

## 📦 Setup & Run

### 1. Create Virtual Environment & Install Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your variables:

```bash
cp .env.example .env
```

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=krishi_ai
JWT_SECRET_KEY=your-secure-random-secret-key-here
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
OPENWEATHER_API_KEY=your-openweather-api-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Run FastAPI Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 🐳 Run with Docker

```bash
docker build -t krishi-backend .
docker run -p 8000:8000 --env-file .env krishi-backend
```

---

## 📑 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login and get JWT | No |
| `GET` | `/api/auth/profile` | Current user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile | Yes |
| `POST` | `/api/crops/recommend` | Get crop suggestions | Yes |
| `GET` | `/api/crops/history` | Crop query history | Yes |
| `POST` | `/api/disease/predict` | Predict plant disease from image | Yes |
| `GET` | `/api/disease/history` | Scan history | Yes |
| `POST` | `/api/fertilizer/recommend` | Fertilizer dosage & plan | Yes |
| `POST` | `/api/chat/message` | Ask AI chatbot | Yes |
| `GET` | `/api/chat/sessions` | List chat sessions | Yes |
| `GET` | `/api/chat/history/{session_id}` | Chat messages in session | Yes |
| `GET` | `/api/weather/current` | Current weather | Yes |
| `GET` | `/api/weather/forecast` | 7-day forecast | Yes |
| `GET` | `/api/mandi/prices` | Filtered mandi rates | Yes |
| `GET` | `/api/mandi/states` | List of states | Yes |
| `GET` | `/api/mandi/commodities` | List of commodities | Yes |
| `GET` | `/api/schemes` | List government schemes | Yes |
| `GET` | `/api/schemes/{id}` | Scheme details | Yes |
| `GET` | `/api/dashboard/stats` | Aggregated farmer dashboard stats | Yes |
