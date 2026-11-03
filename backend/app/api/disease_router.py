"""Disease detection router."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.services.disease_service import detect_disease, save_detection, get_user_history
from app.core.security import get_current_user

router = APIRouter(prefix="/disease", tags=["Disease Detection"])


@router.post("/predict")
@router.post("/detect")
async def predict(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload a plant image and get disease prediction."""
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (JPG, PNG, WebP) are accepted",
        )

    # Read file (for future ML inference)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image must be smaller than 10MB",
        )

    # Run detection (rule-based for now)
    result = detect_disease(filename=file.filename or "")
    await save_detection(current_user["id"], result, file.filename or "")

    return result


@router.get("/history")
async def history(current_user: dict = Depends(get_current_user)):
    """Get user's disease detection history."""
    items = await get_user_history(current_user["id"])
    return {"history": items}
