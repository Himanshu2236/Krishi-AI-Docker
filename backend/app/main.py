"""
KRISHI AI – Intelligent Agriculture Assistant
FastAPI Backend Application
"""
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger

from app.core.config import settings
from app.database.connection import connect_db, close_db, init_indexes
from app.utils import setup_logging

# Routers
from app.api.auth_router import router as auth_router
from app.api.crop_router import router as crop_router
from app.api.disease_router import router as disease_router
from app.api.fertilizer_router import router as fertilizer_router
from app.api.chat_router import router as chat_router
from app.api.weather_router import router as weather_router
from app.api.mandi_router import router as mandi_router
from app.api.schemes_router import router as schemes_router
from app.api.dashboard_router import router as dashboard_router

# Initialize Logger
setup_logging()

# Rate Limiter setup
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle: startup and shutdown."""
    logger.info("Initializing KRISHI AI Backend...")
    try:
        await connect_db()
        await init_indexes()
        logger.info("MongoDB initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB at startup: {e}. Running in graceful mode.")
    
    yield

    logger.info("Shutting down KRISHI AI Backend...")
    try:
        await close_db()
    except Exception as e:
        logger.warning(f"Error during MongoDB disconnect: {e}")


app = FastAPI(
    title="KRISHI AI – Intelligent Agriculture Assistant API",
    description="Backend API powering AI-driven crop recommendation, disease detection, market prices, and farming advisory for Indian farmers.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Attach limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS Middleware ────────────────────────────────────────────────────────
origins = [o.strip() for o in settings.allowed_origins_list if o.strip()]
default_dev_ports = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:80", "http://127.0.0.1:80"]
for port_url in default_dev_ports:
    if port_url not in origins and "*" not in origins:
        origins.append(port_url)

allow_credentials = "*" not in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)


# ─── Request Logging & Timing Middleware ────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = None
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({process_time:.2f}ms)"
        )
        response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
        return response
    except Exception as exc:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"{request.method} {request.url.path} -> ERROR: {exc} ({process_time:.2f}ms)")
        raise exc


# ─── Centralized Exception Handlers ─────────────────────────────────────────
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append({"field": field or "body", "message": error["msg"]})
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "status_code": 422,
            "detail": "Validation error in request data",
            "errors": errors,
            "path": request.url.path,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "status_code": 500,
            "detail": "An internal server error occurred. Please try again later.",
            "path": request.url.path,
        },
    )


# ─── Health Check & Root Endpoints ──────────────────────────────────────────
@app.get("/", tags=["General"])
async def root():
    return {
        "app": "Krishi AI API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["General"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "environment": settings.APP_ENV,
    }


# ─── Mount API Routers ──────────────────────────────────────────────────────
# All routers are prefixed under /api
app.include_router(auth_router, prefix="/api")
app.include_router(crop_router, prefix="/api")
# Also mount with /crop alias for singular compatibility
app.include_router(crop_router, prefix="/api", include_in_schema=False)
app.include_router(disease_router, prefix="/api")
app.include_router(fertilizer_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
# Also mount with /chatbot alias for compatibility
app.include_router(chat_router, prefix="/api", include_in_schema=False)
app.include_router(weather_router, prefix="/api")
app.include_router(mandi_router, prefix="/api")
app.include_router(schemes_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.APP_RELOAD,
    )
