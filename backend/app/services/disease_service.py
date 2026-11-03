"""
Disease detection service.
Uses a mock/rule-based approach until the TensorFlow model is trained (Part 3).
"""
import random
from datetime import datetime, timezone
from app.database.connection import get_collection

# ── Disease knowledge base ──────────────────────────────────────────────────
DISEASE_DB = {
    "Early Blight": {
        "plant": "Tomato",
        "confidence_range": (0.82, 0.95),
        "severity": "Moderate",
        "description": "Early blight is a common fungal disease caused by Alternaria solani. It causes dark spots with concentric rings on older leaves, starting from lower canopy.",
        "treatment": [
            "Remove and destroy infected leaves immediately",
            "Apply copper-based fungicide (Bordeaux mixture 1%)",
            "Spray Mancozeb 75 WP @ 2.5 g/L water at 10-day intervals",
            "Ensure proper plant spacing for air circulation",
        ],
        "prevention": [
            "Use disease-resistant varieties (Arka Rakshak, Arka Samrat)",
            "Practice 3-year crop rotation",
            "Avoid overhead irrigation",
            "Apply mulch to prevent soil splash",
        ],
    },
    "Late Blight": {
        "plant": "Potato",
        "confidence_range": (0.78, 0.92),
        "severity": "Severe",
        "description": "Late blight caused by Phytophthora infestans. Causes large water-soaked lesions on leaves that turn brown/black. Can destroy entire crop in days.",
        "treatment": [
            "Spray Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5 g/L immediately",
            "Remove and burn all infected plants",
            "Do not compost infected material",
            "Apply systemic fungicide every 7 days during wet weather",
        ],
        "prevention": [
            "Use certified disease-free seed tubers",
            "Avoid planting near previous season's potato fields",
            "Ensure good drainage and airflow",
            "Monitor weather — high humidity + cool nights = risk",
        ],
    },
    "Bacterial Leaf Blight": {
        "plant": "Rice",
        "confidence_range": (0.75, 0.90),
        "severity": "Moderate",
        "description": "Caused by Xanthomonas oryzae. Yellow to white lesions appear at leaf tips and margins, progressing along the leaf veins.",
        "treatment": [
            "Drain standing water to reduce humidity",
            "Apply Streptocycline @ 0.01% + Copper oxychloride @ 0.25%",
            "Reduce nitrogen application by 25%",
            "Clip infected leaf tips before transplanting",
        ],
        "prevention": [
            "Use BLB-resistant varieties (Improved Samba Mahsuri)",
            "Balanced NPK fertilisation — avoid excess nitrogen",
            "Remove crop residues after harvest",
            "Quarantine infected seed lots",
        ],
    },
    "Powdery Mildew": {
        "plant": "Wheat",
        "confidence_range": (0.80, 0.93),
        "severity": "Mild",
        "description": "White powdery fungal growth on leaves and stems caused by Blumeria graminis. Reduces photosynthesis and weakens plants.",
        "treatment": [
            "Spray Sulphur 80 WP @ 2 g/L water",
            "Apply Propiconazole 25 EC @ 1 ml/L at first signs",
            "Remove severely infected lower leaves",
            "Ensure adequate potassium nutrition",
        ],
        "prevention": [
            "Grow resistant varieties (HD 2967, PBW 343)",
            "Avoid excess nitrogen fertilisation",
            "Maintain proper spacing between rows",
            "Timely sowing to avoid late-season stress",
        ],
    },
    "Healthy": {
        "plant": "General",
        "confidence_range": (0.90, 0.99),
        "severity": "None",
        "description": "No disease detected. The plant appears healthy with good foliage colour and no visible symptoms of infection.",
        "treatment": [
            "No treatment needed — plant is healthy",
            "Continue regular monitoring for early detection",
            "Maintain current cultural practices",
        ],
        "prevention": [
            "Continue balanced fertilisation",
            "Maintain proper irrigation schedule",
            "Monitor weekly for early disease signs",
            "Practice crop rotation",
        ],
    },
}


def detect_disease(filename: str = "") -> dict:
    """
    Simulate disease detection.
    In Part 3 this will be replaced by TensorFlow CNN inference.
    """
    # Select a random disease (simulating ML prediction)
    disease_name = random.choice(list(DISEASE_DB.keys()))
    info = DISEASE_DB[disease_name]
    conf = round(random.uniform(*info["confidence_range"]), 2)

    return {
        "disease": disease_name,
        "confidence": conf,
        "plant": info["plant"],
        "severity": info["severity"],
        "description": info["description"],
        "treatment": info["treatment"],
        "prevention": info["prevention"],
    }


async def save_detection(user_id: str, result: dict, filename: str = "") -> str:
    col = await get_collection("disease_detections")
    doc = {
        "user_id": user_id,
        "disease": result["disease"],
        "confidence": result["confidence"],
        "plant": result["plant"],
        "severity": result["severity"],
        "description": result["description"],
        "treatment": result["treatment"],
        "prevention": result["prevention"],
        "image_filename": filename,
        "created_at": datetime.now(timezone.utc),
    }
    res = await col.insert_one(doc)
    return str(res.inserted_id)


async def get_user_history(user_id: str, limit: int = 20) -> list:
    col = await get_collection("disease_detections")
    cursor = col.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    items = []
    async for doc in cursor:
        items.append({
            "id": str(doc["_id"]),
            "disease": doc["disease"],
            "plant": doc["plant"],
            "confidence": doc["confidence"],
            "severity": doc["severity"],
            "created_at": doc["created_at"].isoformat(),
            "image_filename": doc.get("image_filename", ""),
        })
    return items
