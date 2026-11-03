"""
Comprehensive test script for KRISHI AI FastAPI backend.
"""
import sys
import asyncio

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import hash_password, verify_password, create_access_token

async def run_tests():
    print("=" * 60)
    print("🌾 KRISHI AI BACKEND TEST SUITE")
    print("=" * 60)
    
    # 1. Test Password Hashing & Security Utilities
    print("\n[1/10] Testing Password Hashing & JWT...")
    pwd = "secretFarmer123"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed), "Password verification failed"
    assert not verify_password("wrong", hashed), "False positive in password verification"
    
    token = create_access_token({"sub": "test_user_123"})
    assert token and isinstance(token, str), "Token generation failed"
    print("✅ Password hashing and JWT token creation verified!")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 2. Test Root & Health endpoints
        print("\n[2/10] Testing Health & Root endpoints...")
        res = await client.get("/")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        assert res.json()["app"] == "Krishi AI API"
        
        res = await client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"
        print("✅ Root and Health checks passed!")

        # 3. Test Crop Recommendation (Unit & Service logic)
        print("\n[3/10] Testing Crop Recommendation logic...")
        from app.services.crop_service import recommend_crop
        from app.schemas.crop import CropRecommendRequest
        sample_crop_input = CropRecommendRequest(
            nitrogen=90, phosphorus=42, potassium=43,
            ph=6.5, temperature=20.8, humidity=82.0, rainfall=202.9
        )
        crop_res = recommend_crop(sample_crop_input)
        assert "recommended_crop" in crop_res
        assert crop_res["confidence"] > 0
        print(f"✅ Crop recommendation result: {crop_res['recommended_crop']} ({round(crop_res['confidence']*100)}% confidence)")

        # 4. Test Disease Detection Logic
        print("\n[4/10] Testing Disease Detection logic...")
        from app.services.disease_service import detect_disease
        disease_res = detect_disease("sample_leaf.jpg")
        assert "disease" in disease_res
        assert "treatment" in disease_res
        print(f"✅ Disease detection result: {disease_res['disease']} on {disease_res['plant']} (Severity: {disease_res['severity']})")

        # 5. Test Fertilizer Recommendation Logic
        print("\n[5/10] Testing Fertilizer Recommendation logic...")
        from app.services.fertilizer_service import recommend_fertilizer
        from app.schemas.fertilizer import FertilizerRecommendRequest
        fert_input = FertilizerRecommendRequest(
            crop="Wheat", soil_type="Loamy", growth_stage="Seedling",
            nitrogen=60, phosphorus=30, potassium=20, ph=6.5, area=2.0
        )
        fert_res = recommend_fertilizer(fert_input)
        assert "recommended" in fert_res
        assert len(fert_res["schedule"]) > 0
        print(f"✅ Fertilizer recommendation result: {fert_res['recommended']} (Dosage: {fert_res['dosage']})")

        # 6. Test Mandi Prices Service
        print("\n[6/10] Testing Mandi Market Prices...")
        from app.services.mandi_service import get_prices, get_states
        mandi_res = get_prices(state="Maharashtra")
        assert mandi_res["total"] > 0
        states = get_states()
        assert "Maharashtra" in states
        print(f"✅ Mandi prices fetched: {mandi_res['total']} commodities listed for Maharashtra")

        # 7. Test Government Schemes Service
        print("\n[7/10] Testing Government Schemes...")
        from app.services.schemes_service import get_all_schemes, get_scheme_by_id
        schemes = get_all_schemes()
        assert len(schemes) >= 5
        first_scheme = get_scheme_by_id("1")
        assert first_scheme["title"] == "PM-KISAN Samman Nidhi"
        print(f"✅ Government schemes loaded: {len(schemes)} schemes available")

        # 8. Test Weather Service
        print("\n[8/10] Testing Weather Service...")
        from app.services.weather_service import get_current_weather, get_forecast
        w = await get_current_weather("Pune")
        assert "temperature" in w
        f = await get_forecast("Pune")
        assert len(f["forecast"]) > 0
        print(f"✅ Weather verified: {w['location']} - {w['temperature']}°C ({w['description']}), {len(f['forecast'])}-day forecast")

        # 9. Test Input Validation & Centralized Error Handling
        print("\n[9/10] Testing Validation Error Handling...")
        res = await client.post("/api/auth/register", json={"email": "invalid-email"})
        assert res.status_code == 422, f"Expected 422, got {res.status_code}"
        body = res.json()
        assert body["success"] is False
        assert "errors" in body
        print(f"✅ 422 Validation error captured and formatted properly: {len(body['errors'])} error(s)")

        # 10. Test Protected Route without Token (Expect 401/403)
        print("\n[10/10] Testing Protected Route Guard...")
        res = await client.get("/api/auth/profile")
        assert res.status_code in (401, 403), f"Expected 401/403, got {res.status_code}"
        print("✅ Protected endpoint security verified (unauthenticated requests blocked)")

    print("\n" + "=" * 60)
    print("🎉 ALL 10 TEST SUITES PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
