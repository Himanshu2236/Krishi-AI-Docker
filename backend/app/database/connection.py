"""
MongoDB async connection via Motor.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from loguru import logger

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    """Open the Motor client and ping the server."""
    global _client, _db
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=1000,
            timeoutMS=1000,
        )
        await client.admin.command("ping")
        _client = client
        _db = client[settings.MONGODB_DB_NAME]
        logger.info(f"Connected to MongoDB database: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        _client = None
        _db = None
        logger.warning("MongoDB not detected. Operating in in-memory fallback mode.")


async def close_db() -> None:
    """Close the Motor client."""
    global _client, _db
    if _client:
        try:
            _client.close()
        except Exception:
            pass
        _client = None
        _db = None
        logger.info("MongoDB connection closed.")


def get_db():
    """Return the current database handle or None."""
    return _db


async def get_collection(name: str):
    """Shortcut – return a Motor collection object or an in-memory dictionary-backed fallback."""
    db = get_db()
    if db is not None:
        return db[name]
    
    # In-memory mock fallback when MongoDB server is not running
    return _MockCollection(name)


class _MockCursor:
    def __init__(self, docs):
        self.docs = docs
        self._idx = 0

    def sort(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self._idx < len(self.docs):
            doc = self.docs[self._idx]
            self._idx += 1
            return doc
        raise StopAsyncIteration


class _MockCollection:
    _storage = {}

    def __init__(self, name: str):
        self.name = name
        if name not in _MockCollection._storage:
            _MockCollection._storage[name] = []

    async def find_one(self, query):
        from bson import ObjectId
        docs = _MockCollection._storage[self.name]
        for d in docs:
            match = True
            for k, v in query.items():
                if k == "_id" and isinstance(v, ObjectId):
                    if str(d.get("_id")) != str(v):
                        match = False
                        break
                elif d.get(k) != v:
                    match = False
                    break
            if match:
                return d
        return None

    async def insert_one(self, doc):
        from bson import ObjectId
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        _MockCollection._storage[self.name].append(doc)
        
        class Result:
            inserted_id = doc["_id"]
        return Result()

    async def update_one(self, query, update):
        d = await self.find_one(query)
        if d and "$set" in update:
            d.update(update["$set"])
        class Result:
            matched_count = 1 if d else 0
        return Result()

    async def count_documents(self, query):
        return len(_MockCollection._storage[self.name])

    def find(self, query=None):
        docs = _MockCollection._storage[self.name]
        return _MockCursor(docs)

    async def create_index(self, *args, **kwargs):
        pass


async def init_indexes() -> None:
    """Create indexes on first startup."""
    db = get_db()
    if db is None:
        return

    try:
        await db.users.create_index("email", unique=True)
        await db.farmer_profiles.create_index("user_id", unique=True)
        await db.crop_recommendations.create_index([("user_id", 1), ("created_at", -1)])
        await db.disease_detections.create_index([("user_id", 1), ("created_at", -1)])
        await db.fertilizer_recommendations.create_index([("user_id", 1), ("created_at", -1)])
        await db.chat_history.create_index([("user_id", 1), ("created_at", -1)])
        await db.weather_history.create_index([("user_id", 1), ("created_at", -1)])
        logger.info("MongoDB indexes ensured.")
    except Exception as e:
        logger.warning(f"Failed to ensure indexes: {e}")
