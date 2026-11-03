// Mock data for development (used until backend is ready)

export const mockUser = {
  id: '1',
  name: 'Ramesh Kumar',
  email: 'ramesh@example.com',
  phone: '+91 98765 43210',
  location: 'Pune, Maharashtra',
  farmSize: '5 acres',
  primaryCrops: ['Wheat', 'Tomato', 'Onion'],
  avatar: null,
  token: 'mock_token_123',
  joinDate: '2024-01-15',
}

export const mockWeather = {
  location: 'Pune, Maharashtra',
  temperature: 28,
  humidity: 65,
  windSpeed: 12,
  description: 'Partly Cloudy',
  rainfall: 2.3,
  uvIndex: 6,
  visibility: 10,
  feelsLike: 31,
  forecast: [
    { day: 'Mon', high: 30, low: 22, icon: '☀️', description: 'Sunny' },
    { day: 'Tue', high: 28, low: 21, icon: '⛅', description: 'Partly Cloudy' },
    { day: 'Wed', high: 25, low: 19, icon: '🌧️', description: 'Rain' },
    { day: 'Thu', high: 27, low: 20, icon: '⛅', description: 'Partly Cloudy' },
    { day: 'Fri', high: 29, low: 22, icon: '☀️', description: 'Sunny' },
    { day: 'Sat', high: 31, low: 23, icon: '☀️', description: 'Sunny' },
    { day: 'Sun', high: 27, low: 21, icon: '🌦️', description: 'Showers' },
  ],
}

export const mockCropRecommendation = {
  recommended_crop: 'Wheat',
  confidence: 0.92,
  alternatives: [
    { crop: 'Barley', confidence: 0.78 },
    { crop: 'Mustard', confidence: 0.71 },
    { crop: 'Gram', confidence: 0.65 },
  ],
  reasoning: 'Based on the soil NPK levels, pH, and current weather conditions, Wheat is highly suitable for your field. The nitrogen content is optimal and rainfall patterns support wheat cultivation.',
  tips: [
    'Best sowing time: October–November',
    'Requires well-drained loamy soil',
    'Irrigation: 5–6 times during growing season',
    'Expected yield: 35–40 quintals/hectare',
  ],
}

export const mockDiseaseDetection = {
  disease: 'Early Blight (Alternaria solani)',
  confidence: 0.87,
  plant: 'Tomato',
  severity: 'Moderate',
  description: 'Early blight is a common fungal disease affecting tomato plants. It causes dark spots with concentric rings on older leaves.',
  treatment: [
    'Remove and destroy infected leaves immediately',
    'Apply copper-based fungicide (Bordeaux mixture)',
    'Spray Mancozeb 75 WP @ 2.5 g/L water',
    'Ensure proper plant spacing for air circulation',
  ],
  prevention: [
    'Use disease-resistant varieties',
    'Practice crop rotation',
    'Avoid overhead irrigation',
    'Apply mulch to prevent soil splash',
  ],
}

export const mockFertilizerRecommendation = {
  recommended: 'DAP (Di-Ammonium Phosphate)',
  npk_needed: { N: 20, P: 15, K: 10 },
  dosage: '250 kg/hectare',
  schedule: [
    { stage: 'Basal', timing: 'At sowing', amount: '100 kg/ha' },
    { stage: 'Top dress 1', timing: '30 days after sowing', amount: '75 kg/ha' },
    { stage: 'Top dress 2', timing: '60 days after sowing', amount: '75 kg/ha' },
  ],
  alternatives: ['Urea + SSP combination', 'NPK 20-20-0', 'Compost + Urea'],
  organic_option: 'Vermicompost @ 5 tonnes/hectare as basal dose',
}

export const mockMandiPrices = [
  { commodity: 'Wheat', variety: 'Sharbati', market: 'Indore', state: 'MP', minPrice: 2100, maxPrice: 2350, modalPrice: 2200, unit: 'quintal', date: '2024-11-01' },
  { commodity: 'Rice', variety: 'Basmati', market: 'Karnal', state: 'Haryana', minPrice: 3200, maxPrice: 3800, modalPrice: 3500, unit: 'quintal', date: '2024-11-01' },
  { commodity: 'Tomato', variety: 'Hybrid', market: 'Pune', state: 'Maharashtra', minPrice: 800, maxPrice: 1200, modalPrice: 1000, unit: 'quintal', date: '2024-11-01' },
  { commodity: 'Onion', variety: 'Red', market: 'Nashik', state: 'Maharashtra', minPrice: 1500, maxPrice: 2200, modalPrice: 1800, unit: 'quintal', date: '2024-11-01' },
  { commodity: 'Cotton', variety: 'Long Staple', market: 'Akola', state: 'Maharashtra', minPrice: 6200, maxPrice: 7000, modalPrice: 6600, unit: 'quintal', date: '2024-11-01' },
  { commodity: 'Soybean', variety: 'Yellow', market: 'Latur', state: 'Maharashtra', minPrice: 4100, maxPrice: 4600, modalPrice: 4350, unit: 'quintal', date: '2024-11-01' },
  { commodity: 'Maize', variety: 'Hybrid', market: 'Davangere', state: 'Karnataka', minPrice: 1750, maxPrice: 2100, modalPrice: 1900, unit: 'quintal', date: '2024-11-01' },
  { commodity: 'Potato', variety: 'Jyoti', market: 'Agra', state: 'UP', minPrice: 700, maxPrice: 1100, modalPrice: 900, unit: 'quintal', date: '2024-11-01' },
]

export const mockSchemes = [
  {
    id: '1',
    title: 'PM-KISAN Samman Nidhi',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Income Support',
    benefit: '₹6,000/year direct income support',
    eligibility: 'All small and marginal farmers with landholding up to 2 hectares',
    deadline: 'Ongoing',
    status: 'Active',
    link: 'https://pmkisan.gov.in',
    description: 'PM-KISAN provides income support of ₹6000 per year to all farmer families across the country, in three equal installments of ₹2000 each every four months.',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
  },
  {
    id: '2',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Crop Insurance',
    benefit: 'Crop insurance at subsidized premium rates',
    eligibility: 'All farmers growing notified crops in notified areas',
    deadline: 'Seasonal (Kharif/Rabi)',
    status: 'Active',
    link: 'https://pmfby.gov.in',
    description: 'PMFBY provides comprehensive crop insurance coverage against crop loss/damage due to unforeseen events like natural calamities, pests & diseases.',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Sowing Certificate'],
  },
  {
    id: '3',
    title: 'Kisan Credit Card (KCC)',
    ministry: 'Ministry of Finance',
    category: 'Credit & Finance',
    benefit: 'Short-term credit up to ₹3 lakh at 4% interest',
    eligibility: 'Farmers, tenant farmers, oral lessees and sharecroppers',
    deadline: 'Ongoing',
    status: 'Active',
    link: 'https://www.nabard.org',
    description: 'KCC provides farmers with affordable credit for agricultural needs, allied activities and non-farm short-term credit needs at subsidized interest rates.',
    documents: ['Aadhaar Card', 'Land Records', 'Photograph', 'Bank Account'],
  },
  {
    id: '4',
    title: 'Soil Health Card Scheme',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Soil Management',
    benefit: 'Free soil testing and nutrient recommendations',
    eligibility: 'All farmers across India',
    deadline: 'Ongoing',
    status: 'Active',
    link: 'https://soilhealth.dac.gov.in',
    description: 'The scheme issues Soil Health Cards to farmers which carries crop-wise recommendations of nutrients/fertilizers for improving productivity.',
    documents: ['Aadhaar Card', 'Land Records'],
  },
  {
    id: '5',
    title: 'PM Krishi Sinchai Yojana',
    ministry: 'Ministry of Jal Shakti',
    category: 'Irrigation',
    benefit: 'Subsidy on micro-irrigation systems (drip/sprinkler)',
    eligibility: 'All farmers with own or leased land',
    deadline: 'Ongoing',
    status: 'Active',
    link: 'https://pmksy.gov.in',
    description: 'PMKSY aims to achieve convergence of investments in irrigation at the field level, expand cultivable area under assured irrigation and improve on-farm water use efficiency.',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account'],
  },
]

export const mockDashboardStats = {
  totalRecommendations: 24,
  diseasesDetected: 8,
  weatherAlerts: 2,
  schemesEligible: 5,
  recentActivities: [
    { id: 1, type: 'crop', action: 'Crop Recommendation', detail: 'Wheat recommended for Field A', time: '2 hours ago', icon: '🌾' },
    { id: 2, type: 'disease', action: 'Disease Detection', detail: 'Early Blight detected in tomato crop', time: '5 hours ago', icon: '🔬' },
    { id: 3, type: 'weather', action: 'Weather Alert', detail: 'Heavy rain expected in 3 days', time: '1 day ago', icon: '🌧️' },
    { id: 4, type: 'fertilizer', action: 'Fertilizer Recommendation', detail: 'DAP recommended for wheat field', time: '2 days ago', icon: '🌱' },
    { id: 5, type: 'mandi', action: 'Market Price Check', detail: 'Wheat price at ₹2,200/quintal', time: '3 days ago', icon: '📊' },
  ],
  cropYieldData: [
    { month: 'Jun', yield: 28 },
    { month: 'Jul', yield: 32 },
    { month: 'Aug', yield: 30 },
    { month: 'Sep', yield: 35 },
    { month: 'Oct', yield: 38 },
    { month: 'Nov', yield: 40 },
  ],
  priceComparisonData: [
    { crop: 'Wheat', current: 2200, lastMonth: 2100, lastYear: 1950 },
    { crop: 'Rice', current: 3500, lastMonth: 3200, lastYear: 2800 },
    { crop: 'Tomato', current: 1000, lastMonth: 800, lastYear: 600 },
    { crop: 'Onion', current: 1800, lastMonth: 2200, lastYear: 1500 },
  ],
}

export const mockChatHistory = [
  {
    id: '1',
    title: 'Wheat Cultivation Tips',
    date: '2024-11-01',
    preview: 'What is the best time to sow wheat?',
  },
  {
    id: '2',
    title: 'Tomato Disease Help',
    date: '2024-10-28',
    preview: 'My tomato leaves are turning yellow...',
  },
  {
    id: '3',
    title: 'PM-KISAN Registration',
    date: '2024-10-25',
    preview: 'How do I register for PM-KISAN?',
  },
]

export const suggestedQuestions = [
  'What crop should I plant this season?',
  'How to treat fungal disease in tomatoes?',
  'What is the current MSP for wheat?',
  'How to apply for PM-KISAN scheme?',
  'Best fertilizer for rice cultivation?',
  'How to conserve water during drought?',
  'What are the symptoms of nitrogen deficiency?',
  'How to improve soil health naturally?',
]
