"""
Comprehensive test script for KRISHI AI FastAPI backend and AI/ML modules.
"""
import sys
import os
import io
import asyncio
import numpy as np
import cv2

os.environ["PYTHONUNBUFFERED"] = "1"
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import hash_password, verify_password


async def run_tests():
    print("=" * 65, flush=True)
    print("🌾 KRISHI AI BACKEND & ML/AI TEST SUITE", flush=True)
    print("=" * 65, flush=True)
    
    # 1. Test Password Hashing & Security Utilities
    print("\n[1/11] Testing Password Hashing & Security...", flush=True)
    pwd = "secretFarmer123"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed), "Password verification failed"
    assert not verify_password("wrong", hashed), "False positive in password verification"
    print("✅ Password hashing verified!", flush=True)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 2. Test Root & Health endpoints
        print("\n[2/11] Testing Health & Root endpoints...", flush=True)
        res = await client.get("/")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        assert res.json()["app"] == "Krishi AI API"
        
        res = await client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"
        print("✅ Root and Health checks passed!", flush=True)

        # 3. Register & Login test user to get valid token
        print("\n[3/11] Registering & Authenticating Test Farmer...", flush=True)
        unique_email = f"farmer_{os.getpid()}_{np.random.randint(1000, 9999)}@krishiai.org"
        reg_payload = {
            "name": "Ramesh Kumar Patel",
            "email": unique_email,
            "phone": "9876543210",
            "password": "FarmerPassword@123",
            "state": "Maharashtra"
        }
        reg_res = await client.post("/api/auth/register", json=reg_payload)
        assert reg_res.status_code in (200, 201), f"Registration failed ({reg_res.status_code}): {reg_res.text}"
        reg_json = reg_res.json()
        token = reg_json.get("access_token") or reg_json.get("token") or reg_json.get("data", {}).get("token")
        
        assert token, f"Could not obtain token: {reg_json}"
        auth_headers = {"Authorization": f"Bearer {token}"}
        print(f"✅ User registered & authenticated (Email: {unique_email})", flush=True)

        # 4. Test Module 1: Crop Recommendation (Random Forest Classifier)
        print("\n[4/11] Testing Module 1: Crop Recommendation ML Inference...", flush=True)
        crop_payload = {
            "nitrogen": 90.0,
            "phosphorus": 42.0,
            "potassium": 43.0,
            "ph": 6.5,
            "temperature": 20.8,
            "humidity": 82.0,
            "rainfall": 202.9
        }
        res = await client.post("/api/crops/recommend", json=crop_payload, headers=auth_headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        crop_data = res.json()
        assert "recommended_crop" in crop_data
        assert "confidence" in crop_data
        assert crop_data["confidence"] > 0
        assert "crop_info" in crop_data
        assert "growing_conditions" in crop_data
        assert "water_requirements" in crop_data
        print(f"✅ Recommended Crop: {crop_data['recommended_crop']} (Confidence: {round(crop_data['confidence']*100, 1)}%)", flush=True)
        print(f"   Scientific Name: {crop_data['crop_info']['scientific_name']} | Season: {crop_data['crop_info']['season']}", flush=True)
        print(f"   Water Need: {crop_data['water_requirements']['irrigation_need']} ({crop_data['water_requirements']['estimated_water_mm']})", flush=True)

        # 5. Test Module 2: Disease Detection (PyTorch CNN & OpenCV)
        print("\n[5/11] Testing Module 2: Crop Disease Detection (PyTorch CNN)...", flush=True)
        synthetic_img = np.zeros((224, 224, 3), dtype=np.uint8)
        synthetic_img[:, :, 1] = 180  # green leaf background
        synthetic_img[50:120, 50:120, 0] = 60  # subtle lesions
        synthetic_img[50:120, 50:120, 2] = 120
        _, encoded_jpeg = cv2.imencode(".jpg", synthetic_img)
        img_bytes = encoded_jpeg.tobytes()

        files = {"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}
        res = await client.post("/api/disease/predict", files=files, headers=auth_headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        disease_data = res.json()
        assert "crop" in disease_data
        assert "disease" in disease_data
        assert "confidence" in disease_data
        assert "symptoms" in disease_data
        assert "possible_causes" in disease_data
        assert "prevention_methods" in disease_data
        assert "suggested_management_practices" in disease_data
        print(f"✅ Disease Prediction: {disease_data['disease']} on {disease_data['crop']} (Confidence: {round(disease_data['confidence']*100, 1)}%)", flush=True)
        print(f"   Symptoms: {disease_data['symptoms'][:80]}...", flush=True)
        print(f"   Management: {len(disease_data['suggested_management_practices'])} practice(s) advised", flush=True)

        # 6. Test Module 3: Fertilizer Recommendation (ICAR Rule-Based Engine)
        print("\n[6/11] Testing Module 3: Fertilizer Recommendation (ICAR Engine)...", flush=True)
        fert_payload = {
            "crop": "Wheat",
            "soil_type": "Alluvial",
            "growth_stage": "Basal / Sowing",
            "nitrogen": 45.0,
            "phosphorus": 20.0,
            "potassium": 25.0,
            "ph": 5.8,  # slightly acidic
            "area": 2.0
        }
        res = await client.post("/api/fertilizer/recommend", json=fert_payload, headers=auth_headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        fert_data = res.json()
        assert "nutrient_deficiency" in fert_data
        assert "fertilizer_options" in fert_data
        assert "application_guidance" in fert_data
        assert "soil_improvement_suggestions" in fert_data
        print(f"✅ Fertilizer Recommendation: {fert_data['recommended']}", flush=True)
        print(f"   Deficits: N={fert_data['nutrient_deficiency']['deficits']['N']} kg/ha, P={fert_data['nutrient_deficiency']['deficits']['P']} kg/ha, K={fert_data['nutrient_deficiency']['deficits']['K']} kg/ha", flush=True)
        print(f"   Options: {len(fert_data['fertilizer_options'])} options provided", flush=True)
        print(f"   pH Guidance: {fert_data['soil_improvement_suggestions'][0][:80]}...", flush=True)

        # 7. Test Module 4: Groq AI Farming Chatbot (English & Hindi)
        print("\n[7/11] Testing Module 4: Groq AI Farming Chatbot...", flush=True)
        # English
        chat_payload_en = {
            "message": "What is the recommended irrigation schedule for wheat in sandy loam soil?",
            "language": "en"
        }
        res_en = await client.post("/api/chat/message", json=chat_payload_en, headers=auth_headers)
        assert res_en.status_code == 200, f"Expected 200, got {res_en.status_code}: {res_en.text}"
        chat_data_en = res_en.json()
        assert "reply" in chat_data_en
        assert len(chat_data_en["reply"]) > 10
        session_id = chat_data_en["session_id"]
        print(f"✅ Chatbot (English): Reply length {len(chat_data_en['reply'])} chars (Session: {session_id[:8]}...)", flush=True)

        # Hindi
        chat_payload_hi = {
            "message": "टमाटर में झुलसा रोग के रोकथाम के उपाय क्या हैं?",
            "language": "hi",
            "session_id": session_id
        }
        res_hi = await client.post("/api/chat/message", json=chat_payload_hi, headers=auth_headers)
        assert res_hi.status_code == 200, f"Expected 200, got {res_hi.status_code}: {res_hi.text}"
        chat_data_hi = res_hi.json()
        assert "reply" in chat_data_hi
        print(f"✅ Chatbot (Hindi): Contextual reply received ({len(chat_data_hi['reply'])} chars)", flush=True)

        # 8. Test Mandi Prices Service
        print("\n[8/11] Testing Mandi Market Prices...", flush=True)
        from app.services.mandi_service import get_prices, get_states
        mandi_res = get_prices(state="Maharashtra")
        assert mandi_res["total"] > 0
        states = get_states()
        assert "Maharashtra" in states
        print(f"✅ Mandi prices fetched: {mandi_res['total']} commodities listed for Maharashtra", flush=True)

        # 9. Test Government Schemes Service
        print("\n[9/11] Testing Government Schemes...", flush=True)
        from app.services.schemes_service import get_all_schemes, get_scheme_by_id
        schemes = get_all_schemes()
        assert len(schemes) >= 5
        first_scheme = get_scheme_by_id("1")
        assert first_scheme["title"] == "PM-KISAN Samman Nidhi"
        print(f"✅ Government schemes loaded: {len(schemes)} schemes available", flush=True)

        # 10. Test Weather Service
        print("\n[10/11] Testing Weather Service...", flush=True)
        from app.services.weather_service import get_current_weather, get_forecast
        w = await get_current_weather("Pune")
        assert "temperature" in w
        f = await get_forecast("Pune")
        assert len(f["forecast"]) > 0
        print(f"✅ Weather verified: {w['location']} - {w['temperature']}°C ({w['description']}), {len(f['forecast'])}-day forecast", flush=True)

        # 11. Test Input Validation & Protected Route Guard
        print("\n[11/11] Testing Validation and Security Guards...", flush=True)
        val_res = await client.post("/api/auth/register", json={"email": "invalid-email"})
        assert val_res.status_code == 422
        
        guard_res = await client.get("/api/auth/profile")
        assert guard_res.status_code in (401, 403)
        print("✅ 422 validation and unauthenticated 401 guard verified!", flush=True)

    print("\n" + "=" * 65, flush=True)
    print("🎉 ALL 11 TEST SUITES PASSED FLAWLESSLY!", flush=True)
    print("=" * 65, flush=True)


if __name__ == "__main__":
    asyncio.run(run_tests())
