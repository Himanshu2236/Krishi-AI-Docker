"""
Fertilizer Recommendation Service.
Explainable rule-based agronomic recommendation engine based on ICAR
(Indian Council of Agricultural Research) standards.
"""
from datetime import datetime, timezone
from app.database.connection import get_collection
from app.schemas.fertilizer import (
    FertilizerRecommendRequest,
    NutrientDeficiencyAnalysis,
    FertilizerOption,
    FertilizerScheduleItem,
    FertilizerRecommendResponse,
)


# ── Crop Recommended Dose of Fertilizers (RDF in kg/ha) ────────────────────
CROP_RDF = {
    "rice": {"N": 120.0, "P": 60.0, "K": 60.0, "name": "Rice (Paddy)"},
    "paddy": {"N": 120.0, "P": 60.0, "K": 60.0, "name": "Rice (Paddy)"},
    "wheat": {"N": 120.0, "P": 60.0, "K": 40.0, "name": "Wheat"},
    "maize": {"N": 120.0, "P": 60.0, "K": 50.0, "name": "Maize (Corn)"},
    "corn": {"N": 120.0, "P": 60.0, "K": 50.0, "name": "Maize (Corn)"},
    "cotton": {"N": 100.0, "P": 50.0, "K": 50.0, "name": "Cotton"},
    "sugarcane": {"N": 250.0, "P": 115.0, "K": 115.0, "name": "Sugarcane"},
    "potato": {"N": 150.0, "P": 80.0, "K": 100.0, "name": "Potato"},
    "tomato": {"N": 140.0, "P": 70.0, "K": 90.0, "name": "Tomato"},
    "chilli": {"N": 120.0, "P": 60.0, "K": 60.0, "name": "Chilli"},
    "pepper": {"N": 120.0, "P": 60.0, "K": 60.0, "name": "Pepper"},
    "soybean": {"N": 30.0, "P": 60.0, "K": 40.0, "name": "Soybean (Legume)"},
    "chickpea": {"N": 25.0, "P": 50.0, "K": 30.0, "name": "Chickpea (Gram)"},
    "mustard": {"N": 80.0, "P": 40.0, "K": 40.0, "name": "Mustard / Rapeseed"},
    "groundnut": {"N": 25.0, "P": 50.0, "K": 75.0, "name": "Groundnut (Peanut)"},
    "onion": {"N": 100.0, "P": 50.0, "K": 100.0, "name": "Onion"},
}

DEFAULT_RDF = {"N": 100.0, "P": 50.0, "K": 50.0, "name": "General Crop"}


def evaluate_nutrient_status(value: float, nutrient: str) -> str:
    """Classify soil test level into Low, Medium, High."""
    thresholds = {
        "N": (50.0, 100.0),
        "P": (25.0, 60.0),
        "K": (40.0, 80.0),
    }
    low, high = thresholds.get(nutrient, (50.0, 100.0))
    if value < low:
        return "Deficient (Low)"
    elif value <= high:
        return "Optimal (Medium)"
    else:
        return "Surplus (High)"


def recommend_fertilizer(data: FertilizerRecommendRequest) -> FertilizerRecommendResponse:
    """
    Explainable rule-based fertilizer recommendation engine adhering to ICAR benchmarks.
    Calculates exact deficit, fertilizer combinations, split application schedule, and pH correction.
    """
    crop_lower = data.crop.strip().lower()
    rdf = CROP_RDF.get(crop_lower, DEFAULT_RDF)
    
    # Calculate nutrient deficit per hectare (in kg/ha)
    n_def = max(0.0, round(rdf["N"] - data.nitrogen, 1))
    p_def = max(0.0, round(rdf["P"] - data.phosphorus, 1))
    k_def = max(0.0, round(rdf["K"] - data.potassium, 1))
    
    # Nutrient status
    n_status = evaluate_nutrient_status(data.nitrogen, "N")
    p_status = evaluate_nutrient_status(data.phosphorus, "P")
    k_status = evaluate_nutrient_status(data.potassium, "K")
    
    def_summary_parts = []
    if n_def > 0:
        def_summary_parts.append(f"Nitrogen deficit of {n_def} kg/ha")
    if p_def > 0:
        def_summary_parts.append(f"Phosphorus deficit of {p_def} kg/ha")
    if k_def > 0:
        def_summary_parts.append(f"Potassium deficit of {k_def} kg/ha")
        
    def_summary = "; ".join(def_summary_parts) if def_summary_parts else "Soil nutrient levels are sufficient for current crop requirements."

    nutrient_deficiency = NutrientDeficiencyAnalysis(
        nitrogen_status=n_status,
        phosphorus_status=p_status,
        potassium_status=k_status,
        deficits={"N": n_def, "P": p_def, "K": k_def},
        summary=def_summary,
    )

    # Area factor
    area = data.area if data.area and data.area > 0 else 1.0

    # ── Fertilizer Options Calculation ─────────────────────────────────────
    options = []
    
    # DAP + Urea + MOP Strategy
    # DAP has 18% N and 46% P2O5
    dap_kg = round((p_def / 0.46) * area, 1) if p_def > 0 else 0.0
    n_from_dap = (dap_kg * 0.18) / area if dap_kg > 0 else 0.0
    remaining_n = max(0.0, n_def - n_from_dap)
    urea_kg = round((remaining_n / 0.46) * area, 1) if remaining_n > 0 else 0.0
    mop_kg = round((k_def / 0.60) * area, 1) if k_def > 0 else 0.0

    if urea_kg > 0:
        options.append(FertilizerOption(
            name="Neem Coated Urea (46% N)",
            category="Chemical",
            dosage=f"{urea_kg} kg for {area} ha",
            purpose="Supplies essential vegetative Nitrogen to promote chlorophyll synthesis and vigorous foliage growth.",
        ))
        
    if dap_kg > 0:
        options.append(FertilizerOption(
            name="DAP (Di-Ammonium Phosphate 18:46:0)",
            category="Chemical",
            dosage=f"{dap_kg} kg for {area} ha",
            purpose="Supplies concentrated Phosphorus for robust early root architecture and seedling establishment.",
        ))
    elif p_def > 0:
        ssp_kg = round((p_def / 0.16) * area, 1)
        options.append(FertilizerOption(
            name="Single Super Phosphate (SSP 16% P2O5 + 11% S)",
            category="Chemical",
            dosage=f"{ssp_kg} kg for {area} ha",
            purpose="Supplies available Phosphorus plus beneficial secondary Sulfur for protein synthesis.",
        ))

    if mop_kg > 0:
        options.append(FertilizerOption(
            name="Muriate of Potash (MOP 60% K2O)",
            category="Chemical",
            dosage=f"{mop_kg} kg for {area} ha",
            purpose="Supplies Potassium for drought tolerance, pest resistance, enzyme activation, and grain filling.",
        ))

    # Organic & Bio-fertilizer options
    options.append(FertilizerOption(
        name="Well-rotted Farm Yard Manure (FYM) / Vermicompost",
        category="Organic",
        dosage=f"{round(5 * area, 1)} to {round(10 * area, 1)} tonnes for {area} ha",
        purpose="Improves soil humus, cation exchange capacity (CEC), moisture retention, and beneficial rhizosphere microflora.",
    ))
    
    options.append(FertilizerOption(
        name="Bio-fertilizer Consortia (Azotobacter/Rhizobium + PSB)",
        category="Bio-fertilizer",
        dosage=f"{round(2.5 * area, 1)} kg seed treatment or soil mix",
        purpose="Biological nitrogen fixation and phosphate solubilization, reducing chemical dependency by 15-20%.",
    ))

    # ── Application Schedule ───────────────────────────────────────────────
    schedule = [
        FertilizerScheduleItem(
            stage="Basal Dose (Sowing / Transplanting)",
            timing="At the time of final land preparation or planting",
            amount=f"100% DAP ({dap_kg} kg) + 50% MOP ({round(mop_kg * 0.5, 1)} kg) + 33% Urea ({round(urea_kg * 0.33, 1)} kg)",
            instructions="Broadcast and incorporate into root zone prior to sowing. Apply all organic manure during basal tillage.",
        ),
        FertilizerScheduleItem(
            stage="Top Dressing 1 (Active Vegetative / Tillering)",
            timing="30 - 35 days after sowing / transplanting",
            amount=f"33% Urea ({round(urea_kg * 0.33, 1)} kg)",
            instructions="Apply during afternoon after light irrigation or when soil has adequate moisture. Avoid applying during rain.",
        ),
        FertilizerScheduleItem(
            stage="Top Dressing 2 (Panicle Initiation / Flowering)",
            timing="55 - 65 days after sowing / transplanting",
            amount=f"Remaining 34% Urea ({round(urea_kg * 0.34, 1)} kg) + remaining 50% MOP ({round(mop_kg * 0.5, 1)} kg)",
            instructions="Ensures optimum panicle development, spikelet fertility, and test weight without vegetative overgrowth.",
        ),
    ]

    # ── Soil Texture & Irrigation Guidance ─────────────────────────────────
    guidance = [
        "Divide nitrogen applications into splits rather than a single heavy application to minimize leaching losses.",
        "Maintain adequate field moisture during fertilizer application; never top-dress fertilizers into dry, cracking soil.",
        "Place phosphatic fertilizers (DAP/SSP) 3-5 cm below and to the side of seed furrow to avoid seedling toxicity.",
        f"For {data.soil_type.capitalize()} soil, calibrate irrigation intervals to ensure nutrients stay in the active root horizon.",
    ]

    # ── Soil Improvement Suggestions (pH & Texture) ────────────────────────
    soil_improvements = []
    ph = data.ph
    if ph < 6.0:
        soil_improvements.append(
            f"Soil is Acidic (pH {ph:.1f}). Apply Agricultural Lime (CaCO3) or Dolomite @ 1.5 - 2.5 t/ha at least 3 weeks before planting to elevate pH, neutralize toxic aluminium, and restore phosphorus availability."
        )
    elif ph > 8.2:
        soil_improvements.append(
            f"Soil is Alkaline/Sodic (pH {ph:.1f}). Apply Agricultural Gypsum (CaSO4·2H2O) @ 2.0 - 4.0 t/ha followed by leaching irrigation to displace exchangeable sodium. Use acidifying nitrogen sources such as Ammonium Sulphate."
        )
    else:
        soil_improvements.append(
            f"Soil pH is optimal ({ph:.1f}) for most field crops. Maintain current soil reaction by incorporating organic green manure (Dhaincha/Sunnhemp) in crop rotation."
        )

    soil_type_lower = data.soil_type.strip().lower()
    if "sand" in soil_type_lower:
        soil_improvements.append(
            "Sandy soils exhibit rapid nutrient percolation. Apply split nitrogen in 4 smaller doses and incorporate organic mulch to enhance water and nutrient retention."
        )
    elif "clay" in soil_type_lower or "black" in soil_type_lower:
        soil_improvements.append(
            "Clay/Black soils have high retention but can suffer from poor aeration and waterlogging. Practice broad bed and furrow (BBF) tillage and ensure open surface drains."
        )
    else:
        soil_improvements.append(
            "Loamy soils provide ideal physical aeration and nutrient exchange. Continue balanced mineral and organic inputs to preserve microbial biodiversity."
        )

    # Primary recommended formulation for legacy UI
    recommended_str = f"Urea ({urea_kg} kg) + DAP ({dap_kg} kg) + MOP ({mop_kg} kg) for {area} ha"
    
    return FertilizerRecommendResponse(
        crop=data.crop,
        soil_type=data.soil_type,
        nutrient_deficiency=nutrient_deficiency,
        fertilizer_options=options,
        application_guidance=guidance,
        soil_improvement_suggestions=soil_improvements,
        recommended=recommended_str,
        npk_needed={"N": n_def, "P": p_def, "K": k_def},
        dosage=f"Total: {round(urea_kg + dap_kg + mop_kg, 1)} kg mineral fertilizer for {area} ha",
        schedule=schedule,
        alternatives=[
            "Complex NPK 10:26:26 + Urea",
            "Complex NPK 12:32:16 + Urea",
            "Single Super Phosphate (SSP) + Urea + MOP",
        ],
        organic_option="Vermicompost @ 5 t/ha + Neem Cake @ 250 kg/ha + Azotobacter seed inoculation",
    )


async def save_recommendation(user_id: str, input_data: dict, result) -> str:
    col = await get_collection("fertilizer_recommendations")
    res_dict = result.model_dump() if hasattr(result, "model_dump") else result
    doc = {
        "user_id": user_id,
        "input_data": input_data,
        "crop": res_dict.get("crop", input_data.get("crop", "")),
        "soil_type": res_dict.get("soil_type", input_data.get("soil_type", "")),
        "nutrient_deficiency": res_dict.get("nutrient_deficiency", {}),
        "recommended": res_dict.get("recommended", ""),
        "npk_needed": res_dict.get("npk_needed", {}),
        "dosage": res_dict.get("dosage", ""),
        "created_at": datetime.now(timezone.utc),
    }
    res = await col.insert_one(doc)
    return str(res.inserted_id)
