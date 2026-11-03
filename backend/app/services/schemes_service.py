"""
Government Agriculture Schemes Service.
Provides verified information on major Central and State agricultural support schemes in India.
"""
from typing import Optional

SCHEMES = [
    {
        "id": "1",
        "title": "PM-KISAN Samman Nidhi (Pradhan Mantri Kisan Samman Nidhi)",
        "short_name": "PM-KISAN",
        "ministry": "Ministry of Agriculture & Farmers Welfare, Govt of India",
        "category": "Income Support",
        "benefit": "₹6,000 per year directly transferred to bank account in 3 equal installments of ₹2,000 every 4 months.",
        "eligibility": "All landholding farmer families having cultivable land in their names, subject to exclusion criteria (institutional landholders, high-income taxpayers, constitutional post holders).",
        "deadline": "Continuous / Ongoing (no cutoff date)",
        "status": "Active",
        "link": "https://pmkisan.gov.in",
        "description": "PM-KISAN is a central sector scheme with 100% funding from the Government of India. It aims to supplement the financial needs of landholding farmers in procuring inputs appropriate to crop health and appropriate yields.",
        "documents": [
            "Aadhaar Card (Mandatory)",
            "Citizenship / Domicile Certificate",
            "Land ownership land records (Khasra / Khatauni / Jamabandi)",
            "Aadhaar-seeded Active Bank Account Passbook",
            "Active Mobile Number linked to Aadhaar",
        ],
        "application_procedure": [
            "1. Visit the official PM-KISAN portal (pmkisan.gov.in) and click on 'Farmer Corner' -> 'New Farmer Registration'.",
            "2. Select Rural Farmer or Urban Farmer, enter your Aadhaar number, state, and mobile number, and submit OTP.",
            "3. Fill in applicant personal details, land record survey number, dag/khasra number, and bank account info.",
            "4. Upload scanned land document and submit the application for Sub-Divisional Magistrate / District Nodal Officer verification.",
            "5. Alternatively, visit your nearest Common Service Centre (CSC) or State Agricultural Extension Office with Aadhaar and land records.",
            "6. Complete mandatory e-KYC via OTP or biometric face authentication on PM-KISAN mobile app."
        ],
    },
    {
        "id": "2",
        "title": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "short_name": "PMFBY",
        "ministry": "Ministry of Agriculture & Farmers Welfare, Govt of India",
        "category": "Crop Insurance",
        "benefit": "Comprehensive financial support for crop loss/damage from non-preventable natural risks. Low premium paid by farmer: 2% for Kharif crops, 1.5% for Rabi crops, and 5% for Annual Commercial/Horticultural crops. Balance premium subsidized up to 90% by Central & State Govts.",
        "eligibility": "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas are eligible. Loanee and non-loanee farmers alike.",
        "deadline": "Seasonal: Kharif enrollment deadline usually July 31st; Rabi enrollment deadline usually December 31st.",
        "status": "Active",
        "link": "https://pmfby.gov.in",
        "description": "PMFBY provides comprehensive insurance coverage against failure of the crop due to non-preventable natural risks: unseasonal rains, drought, flood, pests, post-harvest losses within 14 days of harvest, and localized perils like hailstorm and landslide.",
        "documents": [
            "Aadhaar Card",
            "Land Possession Certificate / Revenue Record (ROR) / Lease Agreement",
            "Sowing Certificate issued by Patwari / Village Agriculture Officer",
            "Cancelled Cheque or Bank Passbook copy",
            "Crop insurance declaration form",
        ],
        "application_procedure": [
            "1. Check if your crop and district/village are notified for insurance coverage for the current season on pmfby.gov.in.",
            "2. Loanee farmers with active Kisan Credit Card are enrolled automatically by their lending bank unless opted out in writing.",
            "3. Non-loanee farmers can apply online at pmfby.gov.in via 'Farmer Corner' or via Common Service Centre (CSC).",
            "4. Enter personal details, land survey details, crop sown, and upload sowing certificate.",
            "5. Pay the nominal farmer share of premium through net banking/UPI/CSC wallet and save the policy receipt.",
            "6. In case of crop damage, report within 72 hours via the Crop Insurance Mobile App or toll-free helpline 14447."
        ],
    },
    {
        "id": "3",
        "title": "Kisan Credit Card (KCC)",
        "short_name": "KCC",
        "ministry": "Ministry of Finance & Ministry of Agriculture, Govt of India",
        "category": "Credit & Finance",
        "benefit": "Short-term institutional crop loan up to ₹3,00,000 at subsidized interest rate of 7%, further reduced to 4% effective interest upon prompt repayment (3% Interest Subvention Scheme). Flexible revolving credit valid for 5 years.",
        "eligibility": "Individual farmers, joint borrowers, tenant farmers, oral lessees, sharecroppers, and Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers. Also extended to animal husbandry, dairy, and fisheries farmers.",
        "deadline": "Continuous / Ongoing throughout the year.",
        "status": "Active",
        "link": "https://www.nabard.org",
        "description": "KCC simplifies credit delivery to farmers for timely purchase of seeds, fertilizers, pesticides, machinery rental, and post-harvest household expenses. ATM-cum-debit card (RuPay Kisan Card) issued for anytime cash withdrawal at ATMs and point-of-sale machines.",
        "documents": [
            "Duly completed KCC Application Form",
            "Identity Proof (Aadhaar Card / Voter ID / PAN Card)",
            "Address Proof (Aadhaar Card / Ration Card)",
            "Land title documents and latest land record extract (7/12, Khasra-Khatauni)",
            "No Dues Certificate from adjacent regional banks (for loan limits above ₹1.6 lakh)",
            "Passport-size photographs",
        ],
        "application_procedure": [
            "1. Download the one-page KCC application form from pmkisan.gov.in or obtain it from any commercial, rural (RRB), or cooperative bank.",
            "2. Complete basic details: name, Aadhaar, survey number of cultivated land, and crop name sown.",
            "3. Submit the filled form with land ownership copy and Aadhaar to the bank branch where you have a savings account.",
            "4. Bank assesses scale of finance (SOF) determined by District Level Technical Committee (DLTC) and sanctions credit within 14 days.",
            "5. Receive RuPay KCC card and use it for agricultural input purchases and withdrawals.",
        ],
    },
    {
        "id": "4",
        "title": "Soil Health Card Scheme (SHC)",
        "short_name": "Soil Health Card",
        "ministry": "Ministry of Agriculture & Farmers Welfare, Govt of India",
        "category": "Soil Management",
        "benefit": "Free comprehensive laboratory testing of 12 vital soil parameters (N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) along with customized crop-wise fertilizer dosage recommendations to improve yield and reduce chemical costs.",
        "eligibility": "All farmers holding agricultural land in India across all states and union territories. Issued on a 3-year recurring cycle for each farm grid.",
        "deadline": "Ongoing periodic soil sampling by state agriculture extension teams.",
        "status": "Active",
        "link": "https://soilhealth.dac.gov.in",
        "description": "The Soil Health Card Scheme promotes judicious and balanced use of chemical fertilizers combined with bio-fertilizers and organic manures. It provides actionable advice to correct soil acidity/alkalinity and micronutrient deficiencies.",
        "documents": [
            "Farmer Aadhaar Card",
            "Farm land identification details (Survey Number / Dag Number / Khasra)",
            "Mobile number for receiving SMS alerts and digital card copy",
        ],
        "application_procedure": [
            "1. Soil samples are collected by trained state agriculture staff/village assistants from grids of 2.5 ha (irrigated) or 10 ha (rainfed).",
            "2. Farmers can also directly deposit soil samples (0.5 kg mixed sample from V-shaped cuts) at the nearest Soil Testing Laboratory (STL) or Krishi Vigyan Kendra (KVK).",
            "3. Lab analyzes sample across 12 chemical & physical parameters.",
            "4. A printed Soil Health Card is issued to the farmer with fertilizer recommendations for up to 6 designated crops.",
            "5. Farmers can download their digital card anytime from soilhealth.dac.gov.in by entering State, District, and Survey Number.",
        ],
    },
    {
        "id": "5",
        "title": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)",
        "short_name": "PMKSY",
        "ministry": "Ministry of Jal Shakti & Ministry of Agriculture, Govt of India",
        "category": "Irrigation",
        "benefit": "Financial subsidy up to 55% for small & marginal farmers and 45% for other farmers on micro-irrigation installations (drip and sprinkler systems). Leads to 40-50% water savings, 30-40% yield increase, and 20% fertilizer reduction.",
        "eligibility": "All landholding farmers having cultivable land with an assured water source (borewell, open well, farm pond, canal). Member of water users association or registered farmer group.",
        "deadline": "Ongoing (State-level annual budget allocations)",
        "status": "Active",
        "link": "https://pmksy.gov.in",
        "description": "PMKSY has been formulated with the vision of extending the coverage of irrigation 'Har Khet Ko Pani' and improving water use efficiency 'More Crop Per Drop' in a focused manner with end-to-end solutions on source creation, distribution, and on-farm water management.",
        "documents": [
            "Aadhaar Card",
            "Proof of Land Ownership (7/12 extract / RTC / Land Possession Certificate)",
            "Water Source Certificate / Electricity bill for pump connection",
            "Soil and Water Test Report (optional)",
            "Bank Passbook copy (linked with Aadhaar)",
            "Quotation from authorized micro-irrigation system manufacturer/dealer",
        ],
        "application_procedure": [
            "1. Register on your state's horticulture or agriculture portal (e.g. Mahadbt in Maharashtra, e-Udyan, or national PMKSY portal).",
            "2. Select 'Micro-irrigation Scheme (Drip / Sprinkler)' and enter land survey numbers and water source details.",
            "3. Select an empanelled micro-irrigation equipment vendor/manufacturer from the portal list.",
            "4. Field officer visits farm site to conduct pre-installation physical verification and GPS mapping.",
            "5. After administrative sanction, the vendor installs the drip/sprinkler system.",
            "6. Joint inspection is completed, and subsidy is transferred via DBT directly into the farmer's bank account.",
        ],
    },
    {
        "id": "6",
        "title": "National Agriculture Market (e-NAM)",
        "short_name": "e-NAM",
        "ministry": "Ministry of Agriculture & Farmers Welfare, Govt of India",
        "category": "Market Access",
        "benefit": "Pan-India electronic trading portal linking over 1,300 APMC mandis across 23 states. Transparent price discovery through online competitive bidding, free assaying facilities, direct payment into bank accounts, and removal of intermediary commission fees.",
        "eligibility": "All farmers and agricultural produce traders holding valid KYC and produce for sale in regulated APMC markets.",
        "deadline": "Continuous / Daily market trading hours.",
        "status": "Active",
        "link": "https://www.enam.gov.in",
        "description": "e-NAM creates a unified national market for agricultural commodities by networking existing APMC mandis. It promotes uniformity in agriculture marketing by streamlining procedures across the integrated markets, removing information asymmetry between buyers and sellers.",
        "documents": [
            "Aadhaar Card / Voter ID",
            "Bank Account Passbook (with IFSC code)",
            "Mobile number for receiving bid alerts and e-payment receipts",
            "Gate entry slip issued at the APMC mandi",
        ],
        "application_procedure": [
            "1. Visit anam.gov.in or download the e-NAM mobile app and register as a 'Farmer' with your Aadhaar and bank details.",
            "2. Bring produce to any e-NAM integrated APMC mandi; generate a gate entry slip at the arrival counter.",
            "3. Sample is tested at the quality assaying laboratory and quality grade parameters are uploaded online.",
            "4. Traders from across India bid online on the e-auction platform based on the assaying report.",
            "5. Farmer reviews highest bid and accepts or rejects the sale. Upon acceptance, payment is credited directly via e-Banking.",
        ],
    },
    {
        "id": "7",
        "title": "Paramparagat Krishi Vikas Yojana (PKVY)",
        "short_name": "PKVY",
        "ministry": "Ministry of Agriculture & Farmers Welfare, Govt of India",
        "category": "Organic Farming",
        "benefit": "Financial assistance of ₹50,000 per hectare for 3 years, of which ₹31,000/ha is directly paid to the farmer via DBT for procurement of organic inputs (seeds, bio-fertilizers, vermicompost, botanical extracts). Free Participatory Guarantee System (PGS-India) organic certification.",
        "eligibility": "Groups of farmers forming a cluster of 20 or more farmers having 50 acres (20 hectares) of contiguous agricultural land. Individual farmers can join existing local clusters.",
        "deadline": "Continuous cluster mobilization through Regional Council & District Agriculture Offices.",
        "status": "Active",
        "link": "https://pgsindia-ncof.gov.in",
        "description": "PKVY is an elaborate component of Soil Health Management under the National Mission on Sustainable Agriculture (NMSA). It promotes commercial organic production through certified organic farming clusters, enhancing soil organic matter and fetching premium market prices for farmers.",
        "documents": [
            "Aadhaar Card",
            "Land ownership documentation",
            "Bank passbook copy",
            "Farmer Group / Cluster resolution document signed by participating members",
            "Organic management plan and farm diary",
        ],
        "application_procedure": [
            "1. Form a group of at least 20 farmers with a total contiguous area of 50 acres in your village.",
            "2. Approach the District Agriculture Officer / Krishi Vigyan Kendra (KVK) to register the cluster under PKVY.",
            "3. Register on the PGS-India portal (pgsindia-ncof.gov.in) with assistance from the Regional Council / Service Provider agency.",
            "4. Complete peer reviews, soil testing, and maintain the organic farm history record for 3 conversion years.",
            "5. Receive financial assistance in stages via DBT into bank accounts for organic inputs and bio-pesticides.",
            "6. Obtain Green / PGS-Organic Certification logo and market produce directly through organic fairs and e-NAM.",
        ],
    },
]


def get_all_schemes(category: Optional[str] = None, search: Optional[str] = None) -> list:
    """Filter and return schemes."""
    filtered = SCHEMES
    if category and category not in ("All", "all"):
        filtered = [s for s in filtered if s["category"].lower() == category.lower()]
    if search:
        search_lower = search.lower().strip()
        filtered = [
            s for s in filtered
            if search_lower in s["title"].lower()
            or search_lower in s.get("short_name", "").lower()
            or search_lower in s["description"].lower()
            or search_lower in s["category"].lower()
            or search_lower in s["benefit"].lower()
            or any(search_lower in doc.lower() for doc in s.get("documents", []))
        ]
    return filtered


def get_scheme_by_id(scheme_id: str) -> Optional[dict]:
    """Return a single scheme by id."""
    for s in SCHEMES:
        if s["id"] == scheme_id or s.get("short_name", "").lower() == scheme_id.lower():
            return s
    return None
