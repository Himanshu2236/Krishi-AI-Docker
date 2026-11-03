"""Dashboard stats service."""
from datetime import datetime, timezone
from app.database.connection import get_collection


async def get_dashboard_stats(user_id: str) -> dict:
    """Aggregate dashboard statistics for a user."""
    crop_col = await get_collection("crop_recommendations")
    disease_col = await get_collection("disease_detections")
    fert_col = await get_collection("fertilizer_recommendations")
    chat_col = await get_collection("chat_history")

    total_recommendations = await crop_col.count_documents({"user_id": user_id})
    diseases_detected = await disease_col.count_documents({"user_id": user_id})
    total_fertilizer = await fert_col.count_documents({"user_id": user_id})
    total_chats = await chat_col.count_documents({"user_id": user_id, "role": "user"})

    # Recent activities – merge last items from multiple collections
    activities = []

    # Crop recommendations
    cursor = crop_col.find({"user_id": user_id}).sort("created_at", -1).limit(3)
    async for doc in cursor:
        activities.append({
            "id": len(activities) + 1,
            "type": "crop",
            "action": "Crop Recommendation",
            "detail": f"{doc['recommended_crop']} recommended ({round(doc['confidence'] * 100)}% match)",
            "time": _relative_time(doc["created_at"]),
            "icon": "🌾",
            "sort_key": doc["created_at"],
        })

    # Disease detections
    cursor = disease_col.find({"user_id": user_id}).sort("created_at", -1).limit(3)
    async for doc in cursor:
        activities.append({
            "id": len(activities) + 1,
            "type": "disease",
            "action": "Disease Detection",
            "detail": f"{doc['disease']} detected in {doc['plant']}",
            "time": _relative_time(doc["created_at"]),
            "icon": "🔬",
            "sort_key": doc["created_at"],
        })

    # Sort by date, take top 5
    activities.sort(key=lambda x: x["sort_key"], reverse=True)
    for i, act in enumerate(activities):
        act["id"] = i + 1
        del act["sort_key"]
    activities = activities[:5]

    # If no activities exist, return default
    if not activities:
        activities = [
            {"id": 1, "type": "info", "action": "Welcome", "detail": "Start using Krishi AI features to see activity here!", "time": "just now", "icon": "🌱"},
        ]

    # Mock chart data (these will be computed from real data in Part 3)
    crop_yield_data = [
        {"month": "Jun", "yield_value": 28}, {"month": "Jul", "yield_value": 32},
        {"month": "Aug", "yield_value": 30}, {"month": "Sep", "yield_value": 35},
        {"month": "Oct", "yield_value": 38}, {"month": "Nov", "yield_value": 40},
    ]
    price_comparison_data = [
        {"crop": "Wheat", "current": 2200, "last_month": 2100, "last_year": 1950},
        {"crop": "Rice", "current": 3500, "last_month": 3200, "last_year": 2800},
        {"crop": "Tomato", "current": 1000, "last_month": 800, "last_year": 600},
        {"crop": "Onion", "current": 1800, "last_month": 2200, "last_year": 1500},
    ]

    return {
        "total_recommendations": total_recommendations + total_fertilizer,
        "diseases_detected": diseases_detected,
        "weather_alerts": 2,
        "schemes_eligible": 5,
        "recent_activities": activities,
        "crop_yield_data": crop_yield_data,
        "price_comparison_data": price_comparison_data,
    }


def _relative_time(dt: datetime) -> str:
    """Convert datetime to relative time string."""
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = diff.total_seconds()
    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        mins = int(seconds // 60)
        return f"{mins} minute{'s' if mins != 1 else ''} ago"
    elif seconds < 86400:
        hours = int(seconds // 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    else:
        days = int(seconds // 86400)
        return f"{days} day{'s' if days != 1 else ''} ago"
