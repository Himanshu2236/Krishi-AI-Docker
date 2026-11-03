"""
Official Groq AI Farming Chatbot Service.
KRISHI AI – Intelligent Agriculture Assistant.

Technology:
- Official Groq Python SDK (AsyncGroq)
- Llama 3.3 / Llama 3 models via Groq API
- MongoDB conversation persistence
- Bilingual support: Hindi and English
"""
import uuid
from typing import AsyncGenerator
from datetime import datetime, timezone
from groq import AsyncGroq, GroqError, RateLimitError, APIConnectionError
from app.core.config import settings
from app.database.connection import get_collection
from loguru import logger

# ── Agricultural System Prompts ─────────────────────────────────────────────
SYSTEM_PROMPT_EN = """You are KRISHI AI, an intelligent agricultural assistant for Indian farmers.

Your Core Capabilities:
- Answer farming and agronomy questions accurately and practically.
- Explain crop diseases, causes, visual symptoms, and field management.
- Provide tailored irrigation guidance based on crop phenology and soil moisture.
- Explain soil health, pH balance, and organic carbon management.
- Explain fertilizer recommendations, nutrient deficiencies, and bio-fertilizers.
- Explain modern and traditional sustainable agricultural practices.
- Support both English and Hindi fluently.
- Give practical, actionable, and easy-to-understand answers for rural and progressive farmers.

Mandatory Safety & Compliance Rules:
1. Never invent or speculate on live mandi market prices. Direct the farmer to the Mandi Dashboard or official AGMARKNET portal for verified live rates.
2. Never invent government schemes or subsidies. Only reference authentic schemes like PM-KISAN, PM Fasal Bima Yojana (PMFBY), Kisan Credit Card (KCC), and Soil Health Card.
3. Never provide arbitrary or unsupported pesticide/chemical dosages. Recommend ICAR/CIBRC approved active ingredients or consult the package label.
4. Communicate uncertainty transparently if user inputs are insufficient or conditions are ambiguous.
5. Do not claim to be a certified government agricultural officer or doctor.
6. Always advise consulting local Krishi Vigyan Kendra (KVK) scientists or district agricultural extension officers for severe or widespread crop disease outbreaks."""

SYSTEM_PROMPT_HI = """आप KRISHI AI हैं, भारतीय किसानों के लिए एक बुद्धिमान और विश्वसनीय कृषि सहायक।

आपकी मुख्य क्षमताएं:
- खेती, फसल चक्र और कृषि संबंधी प्रश्नों के व्यावहारिक और सटीक उत्तर दें।
- फसल रोगों, लक्षणों, कारणों और रोकथाम के उपाय सरल भाषा में समझाएं।
- सिंचाई प्रबंधन, ड्रिप/स्प्रिंकलर और जल संरक्षण की सलाह दें।
- मिट्टी की उर्वरता, pH मान और जैविक खाद (वर्मीकम्पोस्ट, हरी खाद) का मार्गदर्शन करें।
- संतुलित उर्वरक प्रबंधन और पोषक तत्वों की कमी को दूर करने के उपाय बताएं।
- हिंदी और अंग्रेजी दोनों भाषाओं में स्पष्ट मार्गदर्शन प्रदान करें।

अनिवार्य सुरक्षा और अनुपालन नियम:
1. कभी भी मंडी के फर्जी या अनुमानित भाव न बताएं। किसान को मंडी डैशबोर्ड या AGMARKNET पोर्टल देखने की सलाह दें।
2. किसी भी फर्जी सरकारी योजना का उल्लेख न करें। केवल वास्तविक योजनाओं (PM-KISAN, PMFBY, KCC आदि) की जानकारी दें।
3. कभी भी कीटनाशकों की असत्यापित या खतरनाक मात्रा न बताएं।
4. यदि जानकारी अधूरी हो, तो स्पष्ट रूप से अनिश्चितता व्यक्त करें।
5. स्वयं को प्रमाणित कृषि अधिकारी या वैज्ञानिक होने का दावा न करें।
6. गंभीर फसल बीमारी या कीट प्रकोप की स्थिति में किसान को तुरंत स्थानीय कृषि विज्ञान केंद्र (KVK) या कृषि विशेषज्ञ से संपर्क करने की सलाह दें।"""

# Agronomic fallbacks when Groq API key is unconfigured or temporary outage occurs
AGRI_FALLBACKS = {
    "en": [
        "Balanced crop nutrition requires testing your soil every 2 years. Before applying Urea or DAP, check your Soil Health Card to avoid soil degradation and unnecessary costs.",
        "For healthy crop growth, maintain good drainage to prevent root rot diseases like Pythium and Phytophthora. If you observe yellowing or wilting, contact your nearest Krishi Vigyan Kendra (KVK).",
        "To maximize irrigation efficiency, consider adopting drip irrigation under the PM Krishi Sinchayee Yojana (PMKSY), which can save up to 40-50% water while increasing yields.",
        "For authentic crop insurance coverage against unseasonal rain or drought, enroll under the Pradhan Mantri Fasal Bima Yojana (PMFBY) through your bank or CSC before seasonal cutoff dates.",
    ],
    "hi": [
        "संतुलित पोषण के लिए हर 2 साल में मिट्टी की जांच अवश्य कराएं। यूरिया या डीएपी डालने से पहले मृदा स्वास्थ्य कार्ड (Soil Health Card) की सिफारिशें देखें।",
        "फसल में फफूंदजनित रोगों से बचाव के लिए खेत में जलभराव न होने दें। यदि पत्तियों पर धब्बे या झुलसा दिखे, तो नजदीकी कृषि विज्ञान केंद्र (KVK) के वैज्ञानिकों से संपर्क करें।",
        "सिंचाई की बचत के लिए प्रधानमंत्री कृषि सिंचाई योजना (PMKSY) के तहत ड्रिप या स्प्रिंकलर सिंचाई अपनाएं, जिससे 40-50% तक पानी की बचत होती है।",
        "प्राकृतिक आपदाओं से सुरक्षा के लिए प्रधानमंत्री फसल बीमा योजना (PMFBY) के तहत अपनी फसल का बीमा अवश्य कराएं।",
    ]
}


def get_groq_client() -> AsyncGroq | None:
    """Initialize AsyncGroq client if valid API key is present."""
    api_key = settings.GROQ_API_KEY.strip() if settings.GROQ_API_KEY else ""
    if not api_key or api_key in ("your-groq-api-key-here", "your_groq_api_key", "change-this"):
        return None
    return AsyncGroq(api_key=api_key)


async def chat_with_ai(user_id: str, message: str, language: str = "en", session_id: str | None = None) -> dict:
    """
    Process user query using official Groq AsyncGroq SDK.
    Stores query and response in MongoDB `chat_history`.
    """
    if not session_id:
        session_id = str(uuid.uuid4())

    system_prompt = SYSTEM_PROMPT_HI if language == "hi" else SYSTEM_PROMPT_EN

    # Fetch last 8 contextual messages for conversation continuity
    chat_col = await get_collection("chat_history")
    history_cursor = chat_col.find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_at", -1).limit(8)

    history_messages = []
    async for doc in history_cursor:
        history_messages.append({"role": doc["role"], "content": doc["content"]})
    history_messages.reverse()

    # Persist user message
    await chat_col.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "role": "user",
        "content": message,
        "language": language,
        "created_at": datetime.now(timezone.utc),
    })

    client = get_groq_client()
    reply = ""

    if client:
        try:
            groq_messages = [{"role": "system", "content": system_prompt}]
            groq_messages.extend(history_messages)
            groq_messages.append({"role": "user", "content": message})

            response = await client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=groq_messages,
                temperature=0.6,
                max_tokens=1024,
            )
            if response.choices and len(response.choices) > 0:
                reply = response.choices[0].message.content or ""
        except RateLimitError as e:
            logger.warning(f"Groq API Rate Limit reached: {e}")
            reply = (
                "कृषि AI अनुरोध सीमा तक पहुँच गया है। कृपया कुछ क्षण बाद पुनः प्रयास करें।"
                if language == "hi"
                else "Groq API request limit reached. Please wait a brief moment before sending your next question."
            )
        except (APIConnectionError, GroqError) as e:
            logger.error(f"Groq SDK API error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error communicating with Groq: {e}")

    # Fallback to authentic agronomic advice if Groq is unconfigured or unavailable
    if not reply:
        import random
        pool = AGRI_FALLBACKS.get(language, AGRI_FALLBACKS["en"])
        note = (
            "\n\n*(नोट: Groq API Key कॉन्फ़िगर नहीं है। वास्तविक LLM प्रतिक्रिया के लिए .env में GROQ_API_KEY सेट करें।)*"
            if language == "hi"
            else "\n\n*(Note: Groq API Key is not configured. Add GROQ_API_KEY to your backend .env for real-time Llama 3 responses.)*"
        )
        reply = random.choice(pool) + note

    # Persist assistant reply
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


async def stream_chat_with_ai(
    user_id: str, message: str, language: str = "en", session_id: str | None = None
) -> AsyncGenerator[str, None]:
    """Stream AI responses chunk by chunk using Groq streaming API."""
    if not session_id:
        session_id = str(uuid.uuid4())

    system_prompt = SYSTEM_PROMPT_HI if language == "hi" else SYSTEM_PROMPT_EN

    chat_col = await get_collection("chat_history")
    history_cursor = chat_col.find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_at", -1).limit(8)

    history_messages = []
    async for doc in history_cursor:
        history_messages.append({"role": doc["role"], "content": doc["content"]})
    history_messages.reverse()

    await chat_col.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "role": "user",
        "content": message,
        "language": language,
        "created_at": datetime.now(timezone.utc),
    })

    client = get_groq_client()
    accumulated_reply = ""

    if client:
        try:
            groq_messages = [{"role": "system", "content": system_prompt}]
            groq_messages.extend(history_messages)
            groq_messages.append({"role": "user", "content": message})

            stream = await client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=groq_messages,
                temperature=0.6,
                max_tokens=1024,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content if chunk.choices else ""
                if delta:
                    accumulated_reply += delta
                    yield delta
        except Exception as e:
            logger.error(f"Groq streaming failure: {e}")

    if not accumulated_reply:
        import random
        pool = AGRI_FALLBACKS.get(language, AGRI_FALLBACKS["en"])
        accumulated_reply = random.choice(pool)
        yield accumulated_reply

    # Save complete assistant reply
    await chat_col.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "role": "assistant",
        "content": accumulated_reply,
        "language": language,
        "created_at": datetime.now(timezone.utc),
    })


async def get_chat_sessions(user_id: str) -> list:
    """Retrieve distinct conversational sessions for user."""
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
        date_str = (
            doc["last_date"].strftime("%Y-%m-%d")
            if isinstance(doc.get("last_date"), datetime)
            else str(doc.get("last_date", ""))
        )
        sessions.append({
            "id": doc["_id"],
            "title": preview[:40] + ("..." if len(preview) > 40 else ""),
            "date": date_str,
            "preview": preview,
        })
    return sessions


async def get_session_history(user_id: str, session_id: str) -> list:
    """Retrieve chronologically ordered messages for specific chat session."""
    chat_col = await get_collection("chat_history")
    cursor = chat_col.find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_at", 1)
    messages = []
    async for doc in cursor:
        dt = doc.get("created_at")
        ts = dt.isoformat() if isinstance(dt, datetime) else str(dt or "")
        messages.append({
            "role": doc["role"],
            "content": doc["content"],
            "timestamp": ts,
        })
    return messages
