"""
KRISHI AI – Module Verification Script
Run this from the project root to verify all ML/AI modules load correctly.

Usage:
    cd "C:\\Users\\himan\\Downloads\\Krishi AI"
    python verify_all_modules.py

This script uses ONLY synchronous checks to avoid asyncio issues on Windows.
All modules are verified by importing and running their sync components.
"""
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# Add backend to path
BACKEND_DIR = os.path.join(os.path.dirname(__file__), "backend")
sys.path.insert(0, BACKEND_DIR)

PASS = "✓"
FAIL = "✗"
WARN = "⚠"

results = []

def check(name, fn):
    try:
        fn()
        print(f"  {PASS} {name}")
        results.append((name, True, None))
    except Exception as e:
        print(f"  {FAIL} {name}: {e}")
        results.append((name, False, str(e)))

print("\n" + "="*60)
print("  KRISHI AI – Module Verification")
print("="*60)

# ─── MODULE 1: Crop Recommendation ──────────────────────────────────────────
print("\n[1] Crop Recommendation (Random Forest ML)\n")

def test_crop_import():
    from app.services.crop_service import recommend_crop, get_model, CropRecommendRequest
check("Import crop_service", test_crop_import)

def test_crop_model_load():
    from app.services.crop_service import get_model
    model = get_model()
    assert model is not None, "Model artifact is None – check ml-models/crop-recommendation/crop_model.joblib"
    assert "model" in model, "Model artifact missing 'model' key"
    assert "classes" in model, "Model artifact missing 'classes' key"
    acc = model.get("metrics", {}).get("accuracy", 0)
    print(f"        Model accuracy: {acc*100:.2f}%  |  Classes: {len(model['classes'])}")
check("Load crop_model.joblib", test_crop_model_load)

def test_crop_prediction():
    from app.services.crop_service import recommend_crop, CropRecommendRequest
    req = CropRecommendRequest(
        nitrogen=90, phosphorus=42, potassium=43,
        temperature=20.9, humidity=82.0, ph=6.5, rainfall=202.9
    )
    result = recommend_crop(req)
    assert result["recommended_crop"], "No crop recommendation returned"
    assert 0 < result["confidence"] <= 1.0, f"Invalid confidence: {result['confidence']}"
    print(f"        Predicted: {result['recommended_crop']} ({result['confidence']*100:.1f}% confidence)")
    print(f"        Model used: {result['model_used'][:60]}")
check("Crop prediction (Rice/Paddy test inputs)", test_crop_prediction)

def test_crop_metadata():
    from app.services.crop_service import get_crop_metadata
    meta = get_crop_metadata("wheat")
    assert meta["title"], "No title in metadata"
    assert "growing_conditions" in meta, "Missing growing_conditions"
    assert "water_requirements" in meta, "Missing water_requirements"
check("Crop metadata (wheat)", test_crop_metadata)

# ─── MODULE 2: Disease Detection (CNN) ──────────────────────────────────────
print("\n[2] Disease Detection (PyTorch CNN)\n")

def test_disease_import():
    from app.services.disease_service import (
        load_disease_model, detect_disease_from_bytes, preprocess_image
    )
check("Import disease_service", test_disease_import)

def test_disease_model_load():
    from app.services.disease_service import load_disease_model
    result = load_disease_model()
    # Returns (model, classes) or (model, classes, metadata)
    model, classes = result[0], result[1]
    assert model is not None, "PyTorch model is None – check ml-models/disease-detection/plant_disease_model.pth"
    assert classes, "Classes list is empty"
    print(f"        PyTorch model loaded  |  Classes: {len(classes)}")
    print(f"        Sample classes: {list(classes)[:3]}")
check("Load plant_disease_model.pth", test_disease_model_load)

def test_disease_prediction_bytes():
    """Create a minimal valid PNG and run disease prediction."""
    import io
    from PIL import Image
    from app.services.disease_service import detect_disease_from_bytes
    # Create a 64x64 green leaf-coloured image
    img = Image.new("RGB", (64, 64), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_bytes = buf.getvalue()
    result = detect_disease_from_bytes(img_bytes)
    assert result.get("crop"), "No crop in result"
    assert result.get("disease"), "No disease in result"
    assert 0 <= result.get("confidence", 0) <= 1.0, "Invalid confidence"
    print(f"        Detected: {result['crop']} – {result['disease']}")
    print(f"        Confidence: {result['confidence']*100:.1f}%")
check("Disease prediction (synthetic leaf image)", test_disease_prediction_bytes)

# ─── MODULE 3: Fertilizer Recommendation ────────────────────────────────────
print("\n[3] Fertilizer Recommendation (ICAR Rule Engine)\n")

def test_fertilizer_import():
    from app.services.fertilizer_service import (
        recommend_fertilizer, evaluate_nutrient_status, FertilizerRecommendRequest
    )
check("Import fertilizer_service", test_fertilizer_import)

def test_nutrient_analysis():
    from app.services.fertilizer_service import evaluate_nutrient_status
    # evaluate_nutrient_status(value: float, nutrient: str) -> str
    n_status = evaluate_nutrient_status(60.0, "nitrogen")
    p_status = evaluate_nutrient_status(30.0, "phosphorus")
    k_status = evaluate_nutrient_status(20.0, "potassium")
    assert n_status, "No nitrogen status returned"
    assert p_status, "No phosphorus status returned"
    assert k_status, "No potassium status returned"
    print(f"        N: {n_status}, P: {p_status}, K: {k_status}")
check("Nutrient deficiency analysis (Wheat)", test_nutrient_analysis)

def test_fertilizer_schemas_import():
    from app.schemas.fertilizer import (
        FertilizerRecommendRequest, FertilizerRecommendResponse,
        NutrientDeficiencyAnalysis, FertilizerOption, FertilizerScheduleItem
    )
check("Fertilizer Pydantic schemas", test_fertilizer_schemas_import)

# ─── MODULE 4: Groq AI Chatbot ──────────────────────────────────────────────
print("\n[4] Groq AI Chatbot (Official SDK)\n")

def test_groq_import():
    from app.services.chat_service import (
        chat_with_ai, get_groq_client, SYSTEM_PROMPT_EN, SYSTEM_PROMPT_HI
    )
check("Import chat_service (Groq SDK)", test_groq_import)

def test_groq_system_prompts():
    from app.services.chat_service import SYSTEM_PROMPT_EN, SYSTEM_PROMPT_HI
    assert "KRISHI AI" in SYSTEM_PROMPT_EN, "EN prompt missing KRISHI AI identifier"
    assert "KRISHI AI" in SYSTEM_PROMPT_HI, "HI prompt missing KRISHI AI identifier"
    assert "KVK" in SYSTEM_PROMPT_EN, "EN prompt missing KVK safety rule"
    assert len(SYSTEM_PROMPT_EN) > 200, "EN system prompt too short"
check("System prompts (EN + HI bilingual)", test_groq_system_prompts)

def test_groq_client_config():
    from app.services.chat_service import get_groq_client
    from app.core.config import settings
    client = get_groq_client()
    if client is None:
        key_preview = (settings.GROQ_API_KEY or "")[:8]
        print(f"        {WARN} No Groq client (key starts with: '{key_preview}...' – update GROQ_API_KEY in backend/.env)")
    else:
        print(f"        {PASS} Groq AsyncGroq client initialized with model: {settings.GROQ_MODEL}")
check("Groq client initialization", test_groq_client_config)

def test_groq_fallbacks():
    from app.services.chat_service import AGRI_FALLBACKS
    assert "en" in AGRI_FALLBACKS, "Missing English fallbacks"
    assert "hi" in AGRI_FALLBACKS, "Missing Hindi fallbacks"
    assert len(AGRI_FALLBACKS["en"]) >= 4, "Need at least 4 English fallback responses"
    assert len(AGRI_FALLBACKS["hi"]) >= 4, "Need at least 4 Hindi fallback responses"
    print(f"        EN fallbacks: {len(AGRI_FALLBACKS['en'])}, HI fallbacks: {len(AGRI_FALLBACKS['hi'])}")
check("Agronomic fallback responses", test_groq_fallbacks)

# ─── MODULE 5: External Agricultural Integrations ───────────────────────────
print("\n[5] External Agricultural Integrations (Weather, Mandi, Schemes)\n")

def test_mandi_service():
    from app.services.mandi_service import get_prices, get_states, get_districts, get_markets
    res = get_prices(commodity="Wheat")
    assert "prices" in res, "No prices returned"
    assert len(res["prices"]) > 0, "Wheat records missing"
    assert "data_source" in res, "Missing data provenance source label"
    assert res["live_available"] is False, "Reference data must not falsely claim to be live"
    assert len(get_states()) >= 5, "Need at least 5 states"
    assert len(get_districts()) >= 5, "Need at least 5 districts"
    print(f"        Mandi prices loaded: {len(res['prices'])} wheat records | States: {len(get_states())}")
check("Mandi prices service (Agmarknet reference)", test_mandi_service)

def test_schemes_service():
    from app.services.schemes_service import get_all_schemes, get_scheme_by_id
    schemes = get_all_schemes()
    assert len(schemes) >= 7, f"Expected 7 schemes, got {len(schemes)}"
    titles = [s["title"].lower() for s in schemes]
    for required in ["pm-kisan", "fasal bima", "kisan credit card", "soil health card", "sinchayee"]:
        assert any(required in t for t in titles), f"Missing core scheme: {required}"
    pmkisan = get_scheme_by_id("1")
    assert pmkisan and pmkisan.get("application_procedure"), "PM-KISAN missing application procedure"
    assert pmkisan.get("documents"), "PM-KISAN missing required documents"
    print(f"        Schemes loaded: {len(schemes)} schemes with application procedures & documents")
check("Government schemes service (7 verified schemes)", test_schemes_service)

def test_weather_advisory_logic():
    from app.services.weather_service import _farming_suggestions, WEATHER_ICONS
    suggestions = _farming_suggestions(
        {"temperature": 32, "humidity": 85, "wind_speed": 10, "rainfall": 0, "main": "Clouds"},
        [{"main": "Rain"}, {"main": "Rain"}]
    )
    assert len(suggestions) > 0, "Failed to generate farming suggestions"
    assert len(WEATHER_ICONS) >= 8, "Weather icon dictionary incomplete"
    print(f"        Weather advisory engine generated {len(suggestions)} dynamic recommendations")
check("Weather-based farming advisory engine", test_weather_advisory_logic)

# ─── MODULE 6: Backend Core ──────────────────────────────────────────────────
print("\n[6] Backend Core Infrastructure\n")

def test_main_app():
    from app.main import app
    assert app.title.startswith("KRISHI AI"), "Unexpected app title"
    # Use OpenAPI schema – the definitive source of all registered routes
    schema = app.openapi()
    routes = list(schema.get("paths", {}).keys())
    expected = ["/api/crops/recommend", "/api/disease/predict", "/api/fertilizer/recommend",
                "/api/chat/message", "/api/auth/login", "/api/auth/register"]
    for route in expected:
        assert route in routes, f"Missing route: {route}"
    print(f"        FastAPI app loaded  |  API routes: {len(routes)}")
check("FastAPI app + all routes registered", test_main_app)

def test_schemas():
    from app.schemas.crop import CropRecommendRequest, CropRecommendResponse
    from app.schemas.disease import DiseaseDetectResponse
    from app.schemas.fertilizer import FertilizerRecommendRequest, FertilizerRecommendResponse
    from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
    from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
check("All Pydantic schemas importable", test_schemas)

def test_config():
    from app.core.config import settings
    assert settings.MONGODB_URI, "MONGODB_URI not configured"
    assert settings.JWT_SECRET_KEY, "JWT_SECRET_KEY not configured"
    print(f"        ENV: {settings.APP_ENV}  |  Port: {settings.APP_PORT}  |  DB: {settings.MONGODB_DB_NAME}")
check("App configuration (settings)", test_config)

# ─── Final Report ─────────────────────────────────────────────────────────────
print("\n" + "="*60)
passed = sum(1 for _, ok, _ in results if ok)
failed = sum(1 for _, ok, _ in results if not ok)
print(f"  RESULT: {passed}/{len(results)} checks passed  |  {failed} failed")
print("="*60)

if failed:
    print("\n  Failed checks:")
    for name, ok, err in results:
        if not ok:
            print(f"    {FAIL} {name}: {err}")
    sys.exit(1)
else:
    print("\n  All checks passed! KRISHI AI modules are ready.\n")
    print("  Next steps:")
    print("  1. Create backend/.env with your GROQ_API_KEY and MONGODB_URI")
    print("  2. Run backend:  cd backend && uvicorn app.main:app --reload --port 8000")
    print("  3. Run frontend: cd frontend && npx vite")
    print("  4. Open:         http://localhost:5173")
    sys.exit(0)
