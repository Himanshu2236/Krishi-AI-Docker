"""Government schemes service – built-in data."""

SCHEMES = [
    {
        "id": "1",
        "title": "PM-KISAN Samman Nidhi",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "category": "Income Support",
        "benefit": "₹6,000/year direct income support",
        "eligibility": "All small and marginal farmers with landholding up to 2 hectares",
        "deadline": "Ongoing",
        "status": "Active",
        "link": "https://pmkisan.gov.in",
        "description": "PM-KISAN provides income support of ₹6000 per year to all farmer families across the country, in three equal installments of ₹2000 each every four months.",
        "documents": ["Aadhaar Card", "Land Records", "Bank Account Details"],
    },
    {
        "id": "2",
        "title": "Pradhan Mantri Fasal Bima Yojana",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "category": "Crop Insurance",
        "benefit": "Crop insurance at subsidized premium rates",
        "eligibility": "All farmers growing notified crops in notified areas",
        "deadline": "Seasonal (Kharif/Rabi)",
        "status": "Active",
        "link": "https://pmfby.gov.in",
        "description": "PMFBY provides comprehensive crop insurance coverage against crop loss/damage due to unforeseen events like natural calamities, pests & diseases.",
        "documents": ["Aadhaar Card", "Land Records", "Bank Account", "Sowing Certificate"],
    },
    {
        "id": "3",
        "title": "Kisan Credit Card (KCC)",
        "ministry": "Ministry of Finance",
        "category": "Credit & Finance",
        "benefit": "Short-term credit up to ₹3 lakh at 4% interest",
        "eligibility": "Farmers, tenant farmers, oral lessees and sharecroppers",
        "deadline": "Ongoing",
        "status": "Active",
        "link": "https://www.nabard.org",
        "description": "KCC provides farmers with affordable credit for agricultural needs, allied activities and non-farm short-term credit needs at subsidized interest rates.",
        "documents": ["Aadhaar Card", "Land Records", "Photograph", "Bank Account"],
    },
    {
        "id": "4",
        "title": "Soil Health Card Scheme",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "category": "Soil Management",
        "benefit": "Free soil testing and nutrient recommendations",
        "eligibility": "All farmers across India",
        "deadline": "Ongoing",
        "status": "Active",
        "link": "https://soilhealth.dac.gov.in",
        "description": "The scheme issues Soil Health Cards to farmers which carries crop-wise recommendations of nutrients/fertilizers for improving productivity.",
        "documents": ["Aadhaar Card", "Land Records"],
    },
    {
        "id": "5",
        "title": "PM Krishi Sinchai Yojana",
        "ministry": "Ministry of Jal Shakti",
        "category": "Irrigation",
        "benefit": "Subsidy on micro-irrigation systems (drip/sprinkler)",
        "eligibility": "All farmers with own or leased land",
        "deadline": "Ongoing",
        "status": "Active",
        "link": "https://pmksy.gov.in",
        "description": "PMKSY aims to achieve convergence of investments in irrigation at the field level, expand cultivable area under assured irrigation and improve on-farm water use efficiency.",
        "documents": ["Aadhaar Card", "Land Records", "Bank Account"],
    },
    {
        "id": "6",
        "title": "e-NAM (National Agriculture Market)",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "category": "Market Access",
        "benefit": "Online trading platform for better price discovery",
        "eligibility": "All farmers and traders with valid documents",
        "deadline": "Ongoing",
        "status": "Active",
        "link": "https://www.enam.gov.in",
        "description": "e-NAM is a pan-India electronic trading portal linking mandis to create a unified national market for agricultural commodities.",
        "documents": ["Aadhaar Card", "Bank Account", "Commodity Details"],
    },
    {
        "id": "7",
        "title": "Paramparagat Krishi Vikas Yojana",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "category": "Organic Farming",
        "benefit": "₹50,000/ha over 3 years for organic farming",
        "eligibility": "Groups of 50+ farmers with 50 acres cluster",
        "deadline": "Ongoing",
        "status": "Active",
        "link": "https://pgsindia-ncof.gov.in",
        "description": "PKVY promotes organic farming through cluster approach and PGS certification, providing financial assistance for inputs and marketing.",
        "documents": ["Aadhaar Card", "Land Records", "Group Formation Documents"],
    },
]


def get_all_schemes(category: str | None = None, search: str | None = None) -> list:
    """Filter and return schemes."""
    filtered = SCHEMES
    if category and category != "All":
        filtered = [s for s in filtered if s["category"] == category]
    if search:
        search_lower = search.lower()
        filtered = [
            s for s in filtered
            if search_lower in s["title"].lower()
            or search_lower in s["description"].lower()
            or search_lower in s["category"].lower()
        ]
    return filtered


def get_scheme_by_id(scheme_id: str) -> dict | None:
    """Return a single scheme by id."""
    for s in SCHEMES:
        if s["id"] == scheme_id:
            return s
    return None
