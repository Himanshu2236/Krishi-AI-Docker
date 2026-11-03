"""
Crop recommendation service.
Uses a rule-based approach until the ML model is trained (Part 3).
"""
from datetime import datetime, timezone
from bson import ObjectId
from app.database.connection import get_collection
from app.schemas.crop import CropRecommendRequest

# ── Crop knowledge base ────────────────────────────────────────────────────
CROP_DB = {
    "Rice": {
        "n": (60, 120), "p": (35, 60), "k": (35, 60),
        "ph": (5.5, 7.0), "temp": (20, 35), "hum": (60, 95), "rain": (150, 300),
        "tips": [
            "Best sowing: June–July (Kharif)", "Requires standing water for first 45 days",
            "Apply Urea in 3 splits", "Expected yield: 40–50 quintals/hectare",
        ],
    },
    "Wheat": {
        "n": (80, 150), "p": (40, 80), "k": (30, 60),
        "ph": (6.0, 7.5), "temp": (10, 25), "hum": (40, 70), "rain": (50, 150),
        "tips": [
            "Best sowing: October–November (Rabi)", "Requires well-drained loamy soil",
            "Irrigation: 5–6 times", "Expected yield: 35–40 quintals/hectare",
        ],
    },
    "Maize": {
        "n": (60, 120), "p": (30, 60), "k": (30, 50),
        "ph": (5.5, 7.5), "temp": (18, 35), "hum": (50, 80), "rain": (60, 120),
        "tips": [
            "Can be grown in Kharif and Rabi", "Needs well-drained fertile soil",
            "Earthing up at knee-high stage", "Expected yield: 40–60 quintals/hectare",
        ],
    },
    "Cotton": {
        "n": (40, 100), "p": (20, 50), "k": (20, 40),
        "ph": (6.0, 8.0), "temp": (25, 40), "hum": (40, 65), "rain": (50, 100),
        "tips": [
            "Sowing: April–May", "Requires deep black cotton soil",
            "Apply 50 kg Potash/ha", "Pick at 60% boll opening",
        ],
    },
    "Sugarcane": {
        "n": (100, 200), "p": (40, 80), "k": (50, 100),
        "ph": (6.0, 8.0), "temp": (25, 40), "hum": (60, 85), "rain": (100, 200),
        "tips": [
            "Plant: February–March", "Needs heavy irrigation",
            "Earthing up at 3 months", "Harvest at 12–14 months",
        ],
    },
    "Tomato": {
        "n": (50, 110), "p": (40, 80), "k": (40, 80),
        "ph": (6.0, 7.0), "temp": (18, 30), "hum": (50, 80), "rain": (40, 100),
        "tips": [
            "Transplant 4-week-old seedlings", "Stake plants for support",
            "Harvest when fruits turn red", "Spray fungicide preventively",
        ],
    },
    "Potato": {
        "n": (60, 130), "p": (50, 100), "k": (60, 120),
        "ph": (5.5, 6.5), "temp": (15, 25), "hum": (60, 80), "rain": (40, 80),
        "tips": [
            "Plant: October–November", "Earthing up twice",
            "Stop irrigation 10 days before harvest", "Use certified seed tubers",
        ],
    },
    "Onion": {
        "n": (50, 100), "p": (30, 60), "k": (30, 60),
        "ph": (6.0, 7.0), "temp": (15, 30), "hum": (50, 70), "rain": (30, 80),
        "tips": [
            "Transplant at 6-week stage", "Apply Sulphur @ 25 kg/ha",
            "Stop irrigation before harvest", "Cure bulbs for 7–10 days",
        ],
    },
    "Soybean": {
        "n": (20, 60), "p": (40, 80), "k": (20, 50),
        "ph": (6.0, 7.5), "temp": (20, 35), "hum": (50, 80), "rain": (60, 150),
        "tips": [
            "Sow: June–July", "Treat seeds with Rhizobium",
            "Needs good drainage", "Harvest when 95% pods brown",
        ],
    },
    "Mustard": {
        "n": (40, 80), "p": (20, 50), "k": (10, 30),
        "ph": (6.0, 7.5), "temp": (10, 25), "hum": (30, 60), "rain": (20, 60),
        "tips": [
            "Sow: October", "Irrigation at branching & pod formation",
            "Apply Sulphur 20 kg/ha", "Harvest at 75% pod maturity",
        ],
    },
}


def _score(val, low, high):
    """0-1 score: 1 if inside range, decreasing linearly outside."""
    if low <= val <= high:
        return 1.0
    if val < low:
        return max(0, 1 - (low - val) / max(low, 1))
    return max(0, 1 - (val - high) / max(high, 1))


def recommend_crop(data: CropRecommendRequest) -> dict:
    """Rule-based crop recommendation scoring."""
    scores = {}
    for crop, ranges in CROP_DB.items():
        s = (
            _score(data.nitrogen, *ranges["n"])
            + _score(data.phosphorus, *ranges["p"])
            + _score(data.potassium, *ranges["k"])
            + _score(data.ph, *ranges["ph"])
            + _score(data.temperature, *ranges["temp"])
            + _score(data.humidity, *ranges["hum"])
            + _score(data.rainfall, *ranges["rain"])
        ) / 7.0
        scores[crop] = round(s, 4)

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_crop, best_score = ranked[0]
    alternatives = [{"crop": c, "confidence": s} for c, s in ranked[1:4]]

    crop_info = CROP_DB[best_crop]
    reasoning = (
        f"Based on the soil NPK levels (N={data.nitrogen}, P={data.phosphorus}, K={data.potassium}), "
        f"pH {data.ph}, temperature {data.temperature}°C, humidity {data.humidity}%, "
        f"and rainfall {data.rainfall}mm, {best_crop} is the best-matched crop for your field conditions."
    )

    return {
        "recommended_crop": best_crop,
        "confidence": round(best_score, 2),
        "alternatives": alternatives,
        "reasoning": reasoning,
        "tips": crop_info["tips"],
    }


async def save_recommendation(user_id: str, input_data: dict, result: dict) -> str:
    """Persist a crop recommendation in history."""
    col = await get_collection("crop_recommendations")
    doc = {
        "user_id": user_id,
        "input_data": input_data,
        "recommended_crop": result["recommended_crop"],
        "confidence": result["confidence"],
        "alternatives": result["alternatives"],
        "reasoning": result["reasoning"],
        "tips": result["tips"],
        "created_at": datetime.now(timezone.utc),
    }
    res = await col.insert_one(doc)
    return str(res.inserted_id)


async def get_user_history(user_id: str, limit: int = 20) -> list:
    col = await get_collection("crop_recommendations")
    cursor = col.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    items = []
    async for doc in cursor:
        items.append({
            "id": str(doc["_id"]),
            "input_data": doc["input_data"],
            "recommended_crop": doc["recommended_crop"],
            "confidence": doc["confidence"],
            "created_at": doc["created_at"].isoformat(),
        })
    return items
