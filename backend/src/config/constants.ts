export const INDIA_BUDGET_TIERS = {
  budget: { hotelMin: 400, hotelMax: 1500, foodPerDay: 300, label: 'Budget (Backpacker)' },
  economy: { hotelMin: 1500, hotelMax: 2500, foodPerDay: 600, label: 'Economy' },
  mid: { hotelMin: 2500, hotelMax: 5000, foodPerDay: 1200, label: 'Mid-Range' },
  premium: { hotelMin: 5000, hotelMax: 10000, foodPerDay: 2500, label: 'Premium' },
  luxury: { hotelMin: 10000, hotelMax: 50000, foodPerDay: 5000, label: 'Luxury' },
} as const;

export const TRAIN_CLASS_COSTS_PER_100KM = {
  'SL': 50,   // Sleeper
  '3A': 110,  // AC 3-Tier
  '2A': 165,  // AC 2-Tier
  '1A': 275,  // AC First Class
  'CC': 90,   // Chair Car (Shatabdi)
  'EC': 200,  // Executive Chair Car
  'GN': 25,   // General
} as const;

export const MAJOR_INDIAN_CITIES = [
  'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata',
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra',
  'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi',
  'Srinagar', 'Amritsar', 'Vijayawada', 'Coimbatore', 'Madurai',
  'Guwahati', 'Chandigarh', 'Raipur', 'Jodhpur', 'Udaipur',
  'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Mangaluru', 'Mysuru',
  'Goa', 'Panaji', 'Dehradun', 'Haridwar', 'Rishikesh',
  'Shimla', 'Manali', 'Leh', 'Darjeeling', 'Gangtok',
  'Bhubaneswar', 'Puri', 'Hampi', 'Ooty', 'Munnar',
  'Alleppey', 'Thekkady', 'Pushkar', 'Mount Abu', 'Jaisalmer',
  'Rann of Kutch', 'Mahabaleshwar', 'Lonavala', 'Aurangabad',
  'Khajuraho', 'Orchha', 'Gwalior', 'Ajmer', 'Bikaner',
] as const;

export const POPULAR_CIRCUITS = [
  {
    name: 'Golden Triangle',
    destinations: ['Delhi', 'Agra', 'Jaipur'],
    duration: '5-7 days',
    bestTime: 'Oct-Mar',
  },
  {
    name: 'Rajasthan Royal',
    destinations: ['Jaipur', 'Jodhpur', 'Jaisalmer', 'Udaipur'],
    duration: '8-12 days',
    bestTime: 'Oct-Mar',
  },
  {
    name: 'Kerala Backwaters',
    destinations: ['Kochi', 'Alleppey', 'Munnar', 'Thekkady', 'Thiruvananthapuram'],
    duration: '7-10 days',
    bestTime: 'Sep-Mar',
  },
  {
    name: 'Goa Beach',
    destinations: ['North Goa', 'South Goa', 'Old Goa'],
    duration: '4-7 days',
    bestTime: 'Nov-Feb',
  },
  {
    name: 'Himachal Adventure',
    destinations: ['Shimla', 'Manali', 'Spiti'],
    duration: '10-14 days',
    bestTime: 'May-Jun, Sep-Oct',
  },
  {
    name: 'Northeast Explorer',
    destinations: ['Guwahati', 'Kaziranga', 'Shillong', 'Cherrapunji', 'Ziro'],
    duration: '10-14 days',
    bestTime: 'Oct-Apr',
  },
  {
    name: 'Uttarakhand Pilgrimage',
    destinations: ['Haridwar', 'Rishikesh', 'Kedarnath', 'Badrinath'],
    duration: '7-10 days',
    bestTime: 'May-Jun, Sep-Oct',
  },
] as const;

export const EMERGENCY_CONTACTS_INDIA = [
  { name: 'Police', number: '100', type: 'police' as const },
  { name: 'Ambulance', number: '108', type: 'ambulance' as const },
  { name: 'Fire', number: '101', type: 'fire' as const },
  { name: 'Tourist Helpline', number: '1800-111-363', type: 'tourist-helpline' as const },
  { name: 'Indian Railways Helpline', number: '139', type: 'railway' as const },
];

export const LOCAL_TRANSPORT_COSTS = {
  autoRickshaw: { perKm: 15, minimum: 30 },
  taxi: { perKm: 20, minimum: 100 },
  ola_uber: { perKm: 12, minimum: 50, surge: 1.5 },
  metro: { basePrice: 10, maximum: 60 },
  localBus: { basePrice: 10, maximum: 30 },
  eRickshaw: { basePrice: 20, maximum: 60 },
} as const;

export const SEASONS = {
  summer: { months: [3, 4, 5], label: 'Summer', advisory: 'Carry sunscreen and water. Avoid midday sightseeing.' },
  monsoon: { months: [6, 7, 8, 9], label: 'Monsoon', advisory: 'Carry rain gear. Some roads may be affected.' },
  postMonsoon: { months: [10, 11], label: 'Post-Monsoon', advisory: 'Pleasant weather, ideal for sightseeing.' },
  winter: { months: [12, 1, 2], label: 'Winter', advisory: 'Carry woolens for hill stations. Perfect weather for plains.' },
} as const;

export const BOOKING_PLATFORMS = {
  trains: 'IRCTC (irctc.co.in) or RailYatri',
  flights: 'Google Flights, MakeMyTrip, Ixigo, Cleartrip',
  hotels: 'MakeMyTrip, OYO, Booking.com, Airbnb',
  buses: 'RedBus, AbhiBus',
  cabs: 'Ola, Uber, Rapido',
} as const;
