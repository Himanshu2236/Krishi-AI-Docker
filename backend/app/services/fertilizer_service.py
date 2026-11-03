"""
Fertilizer recommendation service.
Rule-based until ML model is trained.
"""
from datetime import datetime, timezone
from app.database.connection import get_collection
from app.schemas.fertilizer import FertilizerRecommendRequest

# ── Fertilizer database ────────────────────────────────────────────────────
FERTILIZER_DB = {
    "Wheat": {
        "optimal_npk": {"N": 120, "P": 60, "K": 40},
        "base": "DAP (Di-Ammonium Phosphate)",
        "organic": "Vermicompost @ 5 tonnes/hectare as basal dose",
        "alternatives": ["Urea + SSP combination", "NPK 20-20-0", "Compost + Urea"],
    },
    "Rice": {
        "optimal_npk": {"N": 100, "P": 50, "K": 50},
        "base": "NPK 20-20-20",
        "organic": "Green manure (Dhaincha) + FYM @ 10 t/ha",
        "alternatives": ["DAP + MOP", "Urea + SSP + MOP", "IFFCO Nano Urea"],
    },
    "Tomato": {
        "optimal_npk": {"N": 100, "P": 60, "K": 80},
        "base": "NPK 19-19-19 (Water Soluble)",
        "organic": "Neem cake @ 500 kg/ha + Vermicompost",
        "alternatives": ["DAP + SOP", "Calcium Ammonium Nitrate", "Micro-nutrient mix"],
    },
    "Potato": {
        "optimal_npk": {"N": 120, "P": 80, "K": 100},
        "base": "10-26-26 Complex",
        "organic": "FYM @ 25 t/ha + Bone meal",
        "alternatives": ["DAP + MOP", "SSP + Urea + MOP", "NPK 15-15-15"],
    },
    "Cotton": {
        "optimal_npk": {"N": 80, "P": 40, "K": 40},
        "base": "DAP + Urea",
        "organic": "Castor cake @ 500 kg/ha + Vermicompost",
        "alternatives": ["NPK 20-20-0", "SSP + Urea", "Ammonium Sulphate"],
    },
    "default": {
        "optimal_npk": {"N": 100, "P": 50, "K": 50},
        "base": "NPK 20-20-20 Complex",
        "organic": "Vermicompost @ 5 tonnes/hectare + Neem cake",
        "alternatives": ["DAP + MOP", "Urea + SSP", "Compost-based nutrients"],
    },
}


def recommend_fertilizer(data: FertilizerRecommendRequest) -> dict:
    """Rule-based fertilizer recommendation."""
    crop_key = data.crop if data.crop in FERTILIZER_DB else "default"
    info = FERTILIZER_DB[crop_key]
    optimal = info["optimal_npk"]

    # Calculate deficit
    n_need = max(0, optimal["N"] - data.nitrogen)
    p_need = max(0, optimal["P"] - data.phosphorus)
    k_need = max(0, optimal["K"] - data.potassium)

    # Dosage per hectare scaled to area
    total_n = round(n_need * data.area)
    total_p = round(p_need * data.area)
    total_k = round(k_need * data.area)
    total_dose = total_n + total_p + total_k

    # Build schedule
    schedule = [
        {"stage": "Basal", "timing": "At sowing", "amount": f"{round(total_dose * 0.4)} kg"},
        {"stage": "Top dress 1", "timing": "30 days after sowing", "amount": f"{round(total_dose * 0.35)} kg"},
        {"stage": "Top dress 2", "timing": "60 days after sowing", "amount": f"{round(total_dose * 0.25)} kg"},
    ]

    return {
        "recommended": info["base"],
        "npk_needed": {"N": round(n_need), "P": round(p_need), "K": round(k_need)},
        "dosage": f"{total_dose} kg for {data.area} ha",
        "schedule": schedule,
        "alternatives": info["alternatives"],
        "organic_option": info["organic"],
    }


async def save_recommendation(user_id: str, input_data: dict, result: dict) -> str:
    col = await get_collection("fertilizer_recommendations")
    doc = {
        "user_id": user_id,
        "input_data": input_data,
        "recommended": result["recommended"],
        "npk_needed": result["npk_needed"],
        "dosage": result["dosage"],
        "created_at": datetime.now(timezone.utc),
    }
    res = await col.insert_one(doc)
    return str(res.inserted_id)
