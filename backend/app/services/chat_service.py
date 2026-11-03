"""
Chatbot service – uses Groq API with Llama model.
Falls back to built-in responses when GROQ_API_KEY is not set.
"""
import uuid
import httpx
from datetime import datetime, timezone
from app.core.config import settings
from app.database.connection import get_collection
from loguru import logger

SYSTEM_PROMPT_EN = """You are Krishi AI, an intelligent agriculture assistant for Indian farmers.
You provide expert advice on:
- Crop cultivation (sowing, irrigation, harvesting)
- Disease and pest management
- Fertilizer and nutrient management
- Government schemes (PM-KISAN, PMFBY, KCC etc.)
- Market prices and selling strategies
- Weather-based farming decisions
- Organic farming practices
- Water conservation techniques

Be practical, concise, and helpful. Use Indian farming context and local crop names.
If you're unsure, say so and suggest the farmer consult their local KVK or agriculture officer."""

SYSTEM_PROMPT_HI = """आप कृषि AI हैं, भारतीय किसानों के लिए एक बुद्धिमान कृषि सहायक।
आप निम्नलिखित विषयों पर विशेषज्ञ सलाह देते हैं:
- फसल उगाना (बुवाई, सिंचाई, कटाई)
- रोग और कीट प्रबंधन
- उर्वरक और पोषक तत्व प्रबंधन
- सरकारी योजनाएं (पीएम-किसान, पीएमएफबीवाई, केसीसी आदि)
- बाजार भाव और बिक्री रणनीतियां
- मौसम आधारित कृषि निर्णय
- जैविक खेती
- जल संरक्षण तकनीकें

व्यावहारिक, संक्षिप्त और सहायक रहें। भारतीय कृषि संदर्भ और स्थानीय फसल नामों का उपयोग करें।"""

# Fallback responses when Groq is not available
FALLBACK_RESPONSES = {
    "en": [
        "Based on typical conditions for your region, I recommend consulting your local KVK for soil testing before deciding on crops. Generally, wheat works well in Rabi season with proper irrigation at 15-20 day intervals.",
        "For best results, apply balanced NPK fertilizers based on soil test recommendations. Organic options like vermicompost and green manure are also excellent for long-term soil health.",
        "The PM-KISAN scheme provides ₹6,000/year to eligible farmers in three installments. Register at pmkisan.gov.in with your Aadhaar and land records.",
        "For disease management, always start with prevention: use resistant varieties, practice crop rotation, and maintain proper spacing. If disease appears, identify it early and apply recommended fungicides.",
        "Water conservation is critical for Indian farming. Consider drip irrigation for horticultural crops and laser land leveling for field crops. Both save 30-50% water.",
    ],
    "hi": [
        "आपके क्षेत्र की सामान्य स्थितियों के आधार पर, मैं फसल चुनने से पहले मिट्टी परीक्षण के लिए आपके स्थानीय KVK से सलाह लेने की सिफारिश करता हूं। आम तौर पर, रबी सीजन में 15-20 दिन के अंतराल पर सिंचाई के साथ गेहूं अच्छा होता है।",
        "सर्वोत्तम परिणामों के लिए, मिट्टी परीक्षण की सिफारिशों के आधार पर संतुलित NPK उर्वरक डालें। वर्मीकम्पोस्ट और हरी खाद जैसे जैविक विकल्प भी दीर्घकालिक मिट्टी स्वास्थ्य के लिए उत्कृष्ट हैं।",
        "पीएम-किसान योजना पात्र किसानों को तीन किस्तों में ₹6,000/वर्ष प्रदान करती है। pmkisan.gov.in पर अपने आधार और भूमि रिकॉर्ड के साथ पंजीकरण करें।",
        "रोग प्रबंधन के लिए, हमेशा रोकथाम से शुरू करें: प्रतिरोधी किस्में उगाएं, फसल चक्र अपनाएं, और उचित दूरी बनाए रखें।",
        "भारतीय कृषि के लिए जल संरक्षण अत्यंत महत्वपूर्ण है। बागवानी फसलों के लिए ड्रिप सिंचाई और खेती की फसलों के लिए लेजर लैंड लेवलिंग पर विचार करें।",
    ],
}


async def chat_with_ai(user_id: str, message: str, language: str = "en", session_id: str | None = None) -> dict:
    """Send message to Groq AI and return response. Falls back to local responses if Groq is unavailable."""

    if not session_id:
        session_id = str(uuid.uuid4())

    system_prompt = SYSTEM_PROMPT_HI if language == "hi" else SYSTEM_PROMPT_EN

    # Build message history from DB (last 10 messages in session)
    chat_col = await get_collection("chat_history")
    history_cursor = chat_col.find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_at", -1).limit(10)

    history_messages = []
    async for doc in history_cursor:
        history_messages.append({"role": doc["role"], "content": doc["content"]})
    history_messages.reverse()  # chronological order

    # Save user message
    await chat_col.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "role": "user",
        "content": message,
        "language": language,
        "created_at": datetime.now(timezone.utc),
    })

    reply = ""

    # Try Groq API
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your-groq-api-key-here":
        try:
            groq_messages = [{"role": "system", "content": system_prompt}]
            groq_messages.extend(history_messages)
            groq_messages.append({"role": "user", "content": message})

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.GROQ_MODEL,
                        "messages": groq_messages,
                        "max_tokens": 1024,
                        "temperature": 0.7,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    reply = data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"Groq API returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Groq API call failed: {e}")

    # Fallback
    if not reply:
        import random
        fallbacks = FALLBACK_RESPONSES.get(language, FALLBACK_RESPONSES["en"])
        reply = random.choice(fallbacks)

    # Save assistant reply
    await chat_col.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "role": "assistant",
        "content": reply,
        "language": language,
        "created_at": datetime.now(timezone.utc),
    })

    return {
        "reply": reply,
        "session_id": session_id,
        "language": language,
    }


async def get_chat_sessions(user_id: str) -> list:
    """Get user's chat sessions (grouped)."""
    chat_col = await get_collection("chat_history")
    pipeline = [
        {"$match": {"user_id": user_id, "role": "user"}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$session_id",
            "first_message": {"$last": "$content"},
            "last_date": {"$first": "$created_at"},
        }},
        {"$sort": {"last_date": -1}},
        {"$limit": 20},
    ]
    sessions = []
    async for doc in chat_col.aggregate(pipeline):
        preview = doc["first_message"][:80] if doc["first_message"] else ""
        sessions.append({
            "id": doc["_id"],
            "title": preview[:40] + ("..." if len(preview) > 40 else ""),
            "date": doc["last_date"].strftime("%Y-%m-%d"),
            "preview": preview,
        })
    return sessions


async def get_session_history(user_id: str, session_id: str) -> list:
    """Get messages for a specific session."""
    chat_col = await get_collection("chat_history")
    cursor = chat_col.find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_at", 1)
    messages = []
    async for doc in cursor:
        messages.append({
            "role": doc["role"],
            "content": doc["content"],
            "timestamp": doc["created_at"].isoformat(),
        })
    return messages
