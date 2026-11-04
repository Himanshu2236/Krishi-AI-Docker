"""
KRISHI AI – Comprehensive Backend Test Suite
Executed via Pytest.
"""
import io
import os
import sys
import pytest
from PIL import Image

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


# ─── 1. Authentication & Security Tests ──────────────────────────────────────
def test_password_hashing():
    from app.core.security import hash_password, verify_password
    raw_pwd = "FarmerSecurePassword123!"
    hashed = hash_password(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_lifecycle():
    from app.core.security import create_access_token, decode_token
    payload = {"sub": "654321654321654321654321", "email": "farmer@krishi.ai"}
    token = create_access_token(payload)
    assert isinstance(token, str) and len(token) > 20
    decoded = decode_token(token)
    assert decoded["sub"] == payload["sub"]
    assert decoded["email"] == payload["email"]
    assert "exp" in decoded


# ─── 2. Crop Recommendation ML Tests ─────────────────────────────────────────
def test_crop_model_loading():
    from app.services.crop_service import get_model
    artifact = get_model()
    assert artifact is not None, "Crop model artifact failed to load"
    assert "model" in artifact, "Missing 'model' object in artifact"
    assert "classes" in artifact, "Missing 'classes' array in artifact"
    assert len(artifact["classes"]) == 22, f"Expected 22 crop classes, got {len(artifact['classes'])}"


def test_crop_recommendation_inference():
    from app.services.crop_service import recommend_crop, CropRecommendRequest
    req = CropRecommendRequest(
        nitrogen=90.0,
        phosphorus=42.0,
        potassium=43.0,
        temperature=20.9,
        humidity=82.0,
        ph=6.5,
        rainfall=202.9,
    )
    result = recommend_crop(req)
    assert "recommended_crop" in result
    assert result["recommended_crop"] == "Rice (Paddy)"
    assert 0.0 < result["confidence"] <= 1.0
    assert "crop_info" in result
    assert "growing_conditions" in result
    assert "water_requirements" in result
    assert len(result["alternatives"]) > 0


# ─── 3. Plant Disease Detection CNN Tests ────────────────────────────────────
def test_disease_model_loading():
    from app.services.disease_service import load_disease_model
    model, classes, metadata = load_disease_model()
    assert model is not None, "PyTorch CNN model failed to load"
    assert len(classes) == 23, f"Expected 23 disease classes, got {len(classes)}"
    assert isinstance(metadata, dict) and len(metadata) > 0


def test_disease_detection_from_image_bytes():
    from app.services.disease_service import detect_disease_from_bytes
    # Generate synthetic 64x64 green leaf image
    img = Image.new("RGB", (64, 64), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    result = detect_disease_from_bytes(img_bytes)
    assert "crop" in result and result["crop"]
    assert "disease" in result and result["disease"]
    assert 0.0 <= result["confidence"] <= 1.0
    assert "symptoms" in result
    assert "prevention_methods" in result
    assert "suggested_management_practices" in result


# ─── 4. Fertilizer Recommendation Tests ──────────────────────────────────────
def test_nutrient_deficiency_evaluation():
    from app.services.fertilizer_service import evaluate_nutrient_status
    assert evaluate_nutrient_status(30.0, "nitrogen") == "Deficient (Low)"
    assert evaluate_nutrient_status(60.0, "nitrogen") == "Optimal (Medium)"
    assert evaluate_nutrient_status(120.0, "nitrogen") == "Surplus (High)"


def test_fertilizer_recommendation_output():
    from app.services.fertilizer_service import (
        evaluate_nutrient_status, DEFAULT_RDF, CROP_RDF
    )
    assert "wheat" in CROP_RDF
    assert "rice" in CROP_RDF
    assert "tomato" in CROP_RDF
    assert "N" in CROP_RDF["wheat"]
    assert "P" in CROP_RDF["wheat"]
    assert "K" in CROP_RDF["wheat"]


# ─── 5. Groq Chatbot Service Tests ───────────────────────────────────────────
def test_groq_system_prompts_and_fallbacks():
    from app.services.chat_service import SYSTEM_PROMPT_EN, SYSTEM_PROMPT_HI, AGRI_FALLBACKS
    assert "KRISHI AI" in SYSTEM_PROMPT_EN
    assert "KRISHI AI" in SYSTEM_PROMPT_HI
    assert "KVK" in SYSTEM_PROMPT_EN
    assert len(AGRI_FALLBACKS["en"]) >= 4
    assert len(AGRI_FALLBACKS["hi"]) >= 4


# ─── 6. Mandi Prices Service Tests ───────────────────────────────────────────
def test_mandi_prices_filtering_and_provenance():
    from app.services.mandi_service import get_prices, get_states, get_commodities, get_districts
    states = get_states()
    assert len(states) >= 8
    commodities = get_commodities()
    assert "Wheat" in commodities
    assert "Rice" in commodities

    wheat_prices = get_prices(commodity="Wheat")
    assert wheat_prices["total"] > 0
    assert wheat_prices["live_available"] is False, "Must not claim reference data as live"
    assert "data_source" in wheat_prices


# ─── 7. Government Schemes Service Tests ─────────────────────────────────────
def test_government_schemes_content():
    from app.services.schemes_service import get_all_schemes, get_scheme_by_id
    schemes = get_all_schemes()
    assert len(schemes) >= 7
    scheme_ids = [s["id"] for s in schemes]
    assert "1" in scheme_ids  # PM-KISAN
    assert "2" in scheme_ids  # PMFBY
    assert "3" in scheme_ids  # KCC
    assert "4" in scheme_ids  # Soil Health Card
    assert "5" in scheme_ids  # PMKSY

    pm_kisan = get_scheme_by_id("1")
    assert pm_kisan is not None
    assert len(pm_kisan["documents"]) > 0
    assert len(pm_kisan["application_procedure"]) > 0
    assert pm_kisan["link"].startswith("https://")


# ─── 8. Weather Advisory Service Tests ───────────────────────────────────────
def test_weather_advisory_generation():
    from app.services.weather_service import _farming_suggestions
    mock_curr = {"temperature": 35, "humidity": 85, "wind_speed": 18, "rainfall": 15, "main": "Rain"}
    mock_forecast = [{"main": "Rain"}, {"main": "Rain"}]
    suggestions = _farming_suggestions(mock_curr, mock_forecast)
    assert len(suggestions) > 0
    # Should flag high humidity/rain
    combined = " ".join(suggestions).lower()
    assert "rain" in combined or "drainage" in combined or "wind" in combined or "fungal" in combined


# ─── 9. Backend FastAPI Routes Check ────────────────────────────────────────
def test_all_api_routes_registered():
    from app.main import app
    schema = app.openapi()
    paths = schema.get("paths", {})
    
    required_routes = [
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/profile",
        "/api/crops/recommend",
        "/api/crops/history",
        "/api/disease/predict",
        "/api/fertilizer/recommend",
        "/api/chat/message",
        "/api/chat/history",
        "/api/weather/current",
        "/api/weather/forecast",
        "/api/weather/full",
        "/api/mandi/prices",
        "/api/mandi/states",
        "/api/mandi/commodities",
        "/api/schemes",
        "/api/dashboard/stats",
        "/api/health",
    ]
    for route in required_routes:
        assert route in paths, f"Route missing from FastAPI OpenAPI: {route}"
