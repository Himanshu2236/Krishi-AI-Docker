"""
Crop Disease Detection Service.
Performs real CNN inference using PyTorch and OpenCV on leaf images.
Supported Crops: Tomato, Potato, Pepper (Bell/Chilli), Corn (Maize), Rice (Paddy).
"""
import os
import json
import numpy as np
import cv2
import torch
import torch.nn as nn
from datetime import datetime, timezone
from fastapi import HTTPException, status
from loguru import logger
from app.database.connection import get_collection


# ── Model Architecture (PlantDiseaseCNN) ────────────────────────────────────
class PlantDiseaseCNN(nn.Module):
    """Deep CNN for multi-class plant disease classification."""
    def __init__(self, num_classes=23, dropout_rate=0.4):
        super(PlantDiseaseCNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        
        self.conv4 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.bn4 = nn.BatchNorm2d(256)
        
        self.pool = nn.MaxPool2d(2, 2)
        self.adaptive_pool = nn.AdaptiveAvgPool2d((4, 4))
        
        self.dropout = nn.Dropout(dropout_rate)
        self.fc1 = nn.Linear(256 * 4 * 4, 512)
        self.bn_fc = nn.BatchNorm1d(512)
        self.fc2 = nn.Linear(512, num_classes)
        
    def forward(self, x):
        x = self.pool(torch.relu(self.bn1(self.conv1(x))))
        x = self.pool(torch.relu(self.bn2(self.conv2(x))))
        x = self.pool(torch.relu(self.bn3(self.conv3(x))))
        x = self.pool(torch.relu(self.bn4(self.conv4(x))))
        x = self.adaptive_pool(x)
        x = torch.flatten(x, 1)
        x = self.dropout(x)
        x = torch.relu(self.bn_fc(self.fc1(x)))
        x = self.dropout(x)
        x = self.fc2(x)
        return x


# ── Model & Metadata Loading ───────────────────────────────────────────────
_MODEL = None
_CLASSES = []
_METADATA = {}


def _find_model_paths():
    """Locate the plant disease model and metadata files."""
    candidate_dirs = [
        os.getenv("DISEASE_MODEL_DIR", ""),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml-models", "disease-detection")),
        os.path.abspath(os.path.join(os.getcwd(), "ml-models", "disease-detection")),
        os.path.abspath(os.path.join(os.getcwd(), "..", "ml-models", "disease-detection")),
        "/app/ml-models/disease-detection",
    ]
    
    for c_dir in candidate_dirs:
        if not c_dir:
            continue
        model_p = os.path.join(c_dir, "plant_disease_model.pth")
        meta_p = os.path.join(c_dir, "disease_metadata.json")
        if os.path.exists(model_p) and os.path.exists(meta_p):
            return model_p, meta_p
            
    return None, None


def load_disease_model():
    """Load the trained PyTorch CNN model and agronomic disease metadata."""
    global _MODEL, _CLASSES, _METADATA
    
    if _MODEL is not None and _METADATA:
        return _MODEL, _CLASSES, _METADATA
        
    model_path, meta_path = _find_model_paths()
    if not model_path or not meta_path:
        logger.warning("Plant disease model weights or metadata not found in candidate paths.")
        return None, [], {}

    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            _METADATA = json.load(f)
            
        _CLASSES = _METADATA.get("classes", [])
        
        checkpoint = torch.load(model_path, map_location=torch.device("cpu"), weights_only=False)
        num_classes = checkpoint.get("num_classes", len(_CLASSES))
        
        model = PlantDiseaseCNN(num_classes=num_classes)
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()
        _MODEL = model
        
        logger.info(f"Loaded Plant Disease CNN model ({num_classes} classes) successfully.")
        return _MODEL, _CLASSES, _METADATA
    except Exception as e:
        logger.error(f"Failed to load disease detection model: {e}")
        return None, [], {}


def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Preprocess image bytes into normalized PyTorch tensor for CNN inference."""
    # Decode bytes using OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not decode image. Please ensure the file is a valid JPG, PNG, or WebP image."
        )
        
    # Convert BGR to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Resize to standard 224x224 input
    img = cv2.resize(img, (224, 224), interpolation=cv2.INTER_AREA)
    
    # Scale to [0, 1]
    img = img.astype(np.float32) / 255.0
    
    # Standard ImageNet normalization
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img = (img - mean) / std
    
    # (H, W, C) -> (C, H, W)
    img = np.transpose(img, (2, 0, 1))
    
    # Add batch dimension -> (1, C, H, W)
    tensor = torch.tensor(img, dtype=torch.float32).unsqueeze(0)
    return tensor


def detect_disease_from_bytes(image_bytes: bytes) -> dict:
    """
    Perform CNN inference on leaf image.
    Returns crop, disease, confidence, symptoms, causes, prevention, management.
    """
    model, classes, metadata = load_disease_model()
    
    if model is None or not classes or not metadata:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Plant disease detection model is currently unavailable on the server. Please verify model weights."
        )

    # Preprocess image
    tensor = preprocess_image(image_bytes)
    
    # Perform inference
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)[0]
        top_idx = torch.argmax(probs).item()
        confidence = float(probs[top_idx].item())
        predicted_class = classes[top_idx]

    info = metadata.get("disease_info", {}).get(predicted_class, {})
    
    crop = info.get("crop", predicted_class.split("___")[0].replace("_", " "))
    disease = info.get("disease", predicted_class.split("___")[-1].replace("_", " "))
    is_healthy = info.get("is_healthy", "healthy" in predicted_class.lower())
    symptoms = info.get("symptoms", "No visible necrotic or chlorotic lesions detected." if is_healthy else "Leaf spots or wilting visible.")
    possible_causes = info.get("possible_causes", "Normal healthy development." if is_healthy else "Pathogenic infection or microclimate stress.")
    prevention_methods = info.get("prevention", [
        "Use certified disease-resistant seeds and planting material.",
        "Ensure proper plant spacing and drip irrigation.",
        "Practice regular field sanitation and crop rotation."
    ])
    management_practices = info.get("management", [
        "Maintain balanced soil nutrition.",
        "Monitor fields routinely for early symptoms.",
        "Contact local Krishi Vigyan Kendra (KVK) for specialized biological/chemical control."
    ])

    # Severity classification
    severity = "None" if is_healthy else ("Severe" if confidence > 0.8 else "Moderate")

    return {
        "crop": crop,
        "disease": disease,
        "confidence": round(confidence, 4),
        "symptoms": symptoms,
        "possible_causes": possible_causes,
        "prevention_methods": prevention_methods,
        "suggested_management_practices": management_practices,
        # Backward-compatible fields
        "plant": crop,
        "severity": severity,
        "description": symptoms,
        "treatment": management_practices,
        "prevention": prevention_methods,
    }


async def save_detection(user_id: str, result: dict, filename: str = "") -> str:
    col = await get_collection("disease_detections")
    doc = {
        "user_id": user_id,
        "crop": result.get("crop", result.get("plant", "Unknown")),
        "disease": result["disease"],
        "confidence": result["confidence"],
        "plant": result.get("plant", result.get("crop", "Unknown")),
        "severity": result.get("severity", "Moderate"),
        "symptoms": result.get("symptoms", ""),
        "possible_causes": result.get("possible_causes", ""),
        "prevention_methods": result.get("prevention_methods", []),
        "suggested_management_practices": result.get("suggested_management_practices", []),
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
            "crop": doc.get("crop", doc.get("plant", "Unknown")),
            "disease": doc.get("disease", "Unknown"),
            "plant": doc.get("plant", doc.get("crop", "Unknown")),
            "confidence": doc.get("confidence", 0.0),
            "severity": doc.get("severity", "Moderate"),
            "created_at": doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", "")),
            "image_filename": doc.get("image_filename", ""),
        })
    return items
