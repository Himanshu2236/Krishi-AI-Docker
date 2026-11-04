"""Disease detection router."""
import io
from PIL import Image
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.services.disease_service import detect_disease_from_bytes, save_detection, get_user_history
from app.schemas.disease import DiseaseDetectResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/disease", tags=["Disease Detection"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit


@router.post("/predict", response_model=DiseaseDetectResponse)
@router.post("/detect", response_model=DiseaseDetectResponse)
async def predict(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload a plant leaf image (Tomato, Potato, Pepper, Corn, Rice) and get CNN disease prediction."""
    # 1. Validate MIME type
    content_type = (file.content_type or "").lower().strip()
    if content_type not in ALLOWED_IMAGE_TYPES and not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only valid image files (JPG, PNG, WebP) are accepted",
        )

    # 2. Enforce file size limit
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image must be smaller than 10MB",
        )
    if len(contents) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty or too small to be a valid image",
        )

    # 3. Verify real image payload integrity with PIL
    try:
        with Image.open(io.BytesIO(contents)) as img:
            img.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is corrupted or not a recognized image format",
        )

    # 4. Run PyTorch CNN disease detection
    result = detect_disease_from_bytes(contents)
    await save_detection(current_user["id"], result, file.filename or "")

    return result


@router.get("/history")
async def history(current_user: dict = Depends(get_current_user)):
    """Get user's disease detection history."""
    items = await get_user_history(current_user["id"])
    return {"history": items}
