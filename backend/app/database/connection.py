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
            serverSelectionTimeoutMS=800,
            connectTimeoutMS=800,
            socketTimeoutMS=800,
            timeoutMS=800,
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
    """Async-compatible cursor for in-memory fallback collections (Python 3.14 safe)."""
    def __init__(self, docs):
        self._docs = list(docs)
        self._sort_field = None
        self._sort_dir = 1
        self._limit_n = None

    def sort(self, field_or_list, direction=1, *args, **kwargs):
        if isinstance(field_or_list, list):
            if field_or_list:
                self._sort_field = field_or_list[0][0]
                self._sort_dir = field_or_list[0][1]
        else:
            self._sort_field = field_or_list
            self._sort_dir = direction
        return self

    def limit(self, n, *args, **kwargs):
        self._limit_n = n
        return self

    def _get_docs(self):
        docs = list(self._docs)
        if self._sort_field:
            docs.sort(
                key=lambda d: d.get(self._sort_field, ""),
                reverse=(self._sort_dir == -1)
            )
        if self._limit_n is not None:
            docs = docs[:self._limit_n]
        return docs

    def __aiter__(self):
        return self._iterate()

    async def _iterate(self):
        for doc in self._get_docs():
            yield doc


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
        if query:
            filtered = []
            for d in docs:
                match = all(d.get(k) == v for k, v in query.items())
                if match:
                    filtered.append(d)
            return _MockCursor(filtered)
        return _MockCursor(list(docs))

    def aggregate(self, pipeline):
        """Minimal aggregate support for chat session grouping."""
        docs = list(_MockCollection._storage[self.name])
        # Apply $match if present
        for stage in pipeline:
            if "$match" in stage:
                match_q = stage["$match"]
                docs = [d for d in docs if all(d.get(k) == v for k, v in match_q.items())]
            elif "$sort" in stage:
                sort_field = list(stage["$sort"].keys())[0]
                sort_dir = list(stage["$sort"].values())[0]
                docs = sorted(docs, key=lambda d: d.get(sort_field, ""), reverse=(sort_dir == -1))
            elif "$limit" in stage:
                docs = docs[:stage["$limit"]]
            elif "$group" in stage:
                # For chat sessions: group by session_id
                seen = {}
                for d in docs:
                    gid = d.get("session_id", "")
                    if gid not in seen:
                        seen[gid] = {
                            "_id": gid,
                            "first_message": d.get("content", ""),
                            "last_date": d.get("created_at"),
                        }
                docs = list(seen.values())
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
