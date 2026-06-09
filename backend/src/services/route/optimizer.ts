import type { DayPlan } from '../../types/index.js';

const CITY_COORDS: Record<string, [number, number]> = {
  'Delhi': [28.6139, 77.2090],
  'New Delhi': [28.6139, 77.2090],
  'Mumbai': [19.0760, 72.8777],
  'Bangalore': [12.9716, 77.5946],
  'Bengaluru': [12.9716, 77.5946],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  'Pune': [18.5204, 73.8567],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur': [26.9124, 75.7873],
  'Jodhpur': [26.2389, 73.0243],
  'Jaisalmer': [26.9157, 70.9083],
  'Udaipur': [24.5854, 73.7125],
  'Agra': [27.1767, 78.0081],
  'Varanasi': [25.3176, 82.9739],
  'Goa': [15.2993, 74.1240],
  'Panaji': [15.4909, 73.8278],
  'Kochi': [9.9312, 76.2673],
  'Thiruvananthapuram': [8.5241, 76.9366],
  'Mysuru': [12.2958, 76.6394],
  'Mysore': [12.2958, 76.6394],
  'Amritsar': [31.6340, 74.8723],
  'Chandigarh': [30.7333, 76.7794],
  'Shimla': [31.1048, 77.1734],
  'Manali': [32.2396, 77.1887],
  'Darjeeling': [27.0360, 88.2627],
  'Dehradun': [30.3165, 78.0322],
  'Haridwar': [29.9457, 78.1642],
  'Rishikesh': [30.0869, 78.2676],
  'Puri': [19.8135, 85.8312],
  'Bhubaneswar': [20.2961, 85.8245],
  'Aurangabad': [19.8762, 75.3433],
  'Coimbatore': [11.0168, 76.9558],
  'Madurai': [9.9252, 78.1198],
  'Ooty': [11.4102, 76.6950],
  'Kodaikanal': [10.2381, 77.4892],
  'Leh': [34.1526, 77.5771],
  'Srinagar': [34.0837, 74.7973],
  'Jammu': [32.7266, 74.8570],
  'Pondicherry': [11.9416, 79.8083],
  'Hampi': [15.3350, 76.4600],
  'Khajuraho': [24.8318, 79.9199],
  'Bodh Gaya': [24.6961, 84.9915],
  'Ajmer': [26.4499, 74.6399],
  'Pushkar': [26.4899, 74.5514],
  'Mount Abu': [24.5926, 72.7156],
  'Bikaner': [28.0229, 73.3119],
  'Chittorgarh': [24.8887, 74.6269],
  'Kota': [25.2138, 75.8648],
  'Allahabad': [25.4358, 81.8463],
  'Prayagraj': [25.4358, 81.8463],
  'Lucknow': [26.8467, 80.9462],
  'Kanpur': [26.4499, 80.3319],
  'Patna': [25.5941, 85.1376],
  'Ranchi': [23.3441, 85.3096],
  'Bhopal': [23.2599, 77.4126],
  'Indore': [22.7196, 75.8577],
  'Nagpur': [21.1458, 79.0882],
  'Surat': [21.1702, 72.8311],
  'Vadodara': [22.3072, 73.1812],
  'Rajkot': [22.3039, 70.8022],
  'Dwarka': [22.2442, 68.9685],
  'Somnath': [20.9059, 70.3850],
  'Rann of Kutch': [23.7337, 69.8597],
  'Ujjain': [23.1765, 75.7885],
  'Orchha': [25.3519, 78.6416],
  'Gwalior': [26.2183, 78.1828],
  'Jhansi': [25.4484, 78.5685],
  'Mathura': [27.4924, 77.6737],
  'Vrindavan': [27.5714, 77.6961],
  'Kurukshetra': [29.9695, 76.8783],
  'Meerut': [28.9845, 77.7064],
  'Nainital': [29.3803, 79.4636],
  'Mussoorie': [30.4598, 78.0644],
  'Lansdowne': [29.8366, 78.6909],
  'Corbett': [29.5301, 78.7747],
  'Ranthambore': [26.0173, 76.5026],
  'Bharatpur': [27.2152, 77.5030],
  'Sawai Madhopur': [26.0197, 76.3566],
  'Sikar': [27.6094, 75.1399],
  'Shekhawati': [27.6094, 75.1399],
  'Mandawa': [28.0543, 75.1411],
  'Lonavala': [18.7546, 73.4062],
  'Mahabaleshwar': [17.9235, 73.6586],
  'Nashik': [19.9975, 73.7898],
  'Shirdi': [19.7668, 74.4745],
  'Alibag': [18.6414, 72.8722],
  'Kolhapur': [16.7050, 74.2433],
  'Mahabalipuram': [12.6208, 80.1930],
  'Kanchipuram': [12.8342, 79.7036],
  'Tirupati': [13.6288, 79.4192],
  'Vellore': [12.9165, 79.1325],
  'Rameshwaram': [9.2876, 79.3129],
  'Kanyakumari': [8.0883, 77.5385],
  'Thanjavur': [10.7869, 79.1378],
  'Kumbakonam': [10.9617, 79.3788],
  'Coorg': [12.3375, 75.8069],
  'Chikmagalur': [13.3161, 75.7720],
  'Udupi': [13.3409, 74.7421],
  'Mangalore': [12.9141, 74.8560],
  'Hubli': [15.3647, 75.1240],
  'Badami': [15.9180, 75.6836],
  'Pattadakal': [15.9478, 75.8175],
  'Aihole': [15.9600, 75.8847],
  'Belur': [13.1650, 75.8647],
  'Halebidu': [13.2120, 75.9960],
  'Hospet': [15.2689, 76.3870],
  'Trivandrum': [8.5241, 76.9366],
  'Munnar': [10.0889, 77.0595],
  'Thekkady': [9.6000, 77.1600],
  'Varkala': [8.7379, 76.7163],
  'Kovalam': [8.4004, 76.9787],
  'Kumarakom': [9.6150, 76.4285],
  'Alleppey': [9.4981, 76.3388],
  'Alappuzha': [9.4981, 76.3388],
  'Thrissur': [10.5276, 76.2144],
  'Kozhikode': [11.2588, 75.7804],
  'Kasaragod': [12.4996, 74.9869],
  'Wayanad': [11.6854, 76.1320],
  'Gangtok': [27.3314, 88.6138],
  'Pelling': [27.3000, 88.1200],
  'Lachung': [27.6897, 88.7467],
  'Yumthang': [27.8226, 88.6833],
  'Sikkim': [27.5330, 88.5122],
  'Shillong': [25.5788, 91.8933],
  'Cherrapunji': [25.2700, 91.7333],
  'Kaziranga': [26.5775, 93.1711],
  'Guwahati': [26.1445, 91.7362],
  'Tezpur': [26.6528, 92.7926],
  'Dibrugarh': [27.4800, 94.9100],
  'Ziro': [27.5467, 93.8300],
  'Imphal': [24.8170, 93.9368],
  'Kohima': [25.6588, 94.1054],
  'Aizawl': [23.7307, 92.7173],
  'Agartala': [23.8315, 91.2868],
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCoords(city: string): [number, number] | null {
  const key = Object.keys(CITY_COORDS).find((k) => k.toLowerCase() === city.toLowerCase());
  return key ? CITY_COORDS[key] : null;
}

export interface RouteOptimizationResult {
  ordered: string[];
  optimized: boolean;
  routeDescription: string;
}

// Nearest-neighbor TSP heuristic — finds geographically optimal visit order
export function optimizeDestinations(
  origin: string,
  destinations: string[]
): RouteOptimizationResult {
  if (destinations.length <= 1) {
    return {
      ordered: destinations,
      optimized: false,
      routeDescription: `${origin} → ${destinations.join(' → ')} → ${origin}`,
    };
  }

  const originCoords = getCoords(origin);
  if (!originCoords) {
    return {
      ordered: destinations,
      optimized: false,
      routeDescription: destinations.join(' → '),
    };
  }

  const destWithCoords = destinations.map((d) => ({ city: d, coords: getCoords(d) }));
  if (destWithCoords.some((d) => !d.coords)) {
    return {
      ordered: destinations,
      optimized: false,
      routeDescription: destinations.join(' → '),
    };
  }

  // Nearest-neighbor from origin
  let current = originCoords;
  const remaining = destWithCoords as { city: string; coords: [number, number] }[];
  const ordered: string[] = [];

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineKm(current[0], current[1], remaining[i].coords[0], remaining[i].coords[1]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    const next = remaining.splice(nearestIdx, 1)[0];
    ordered.push(next.city);
    current = next.coords;
  }

  const originalLower = destinations.map((d) => d.toLowerCase());
  const orderedLower = ordered.map((d) => d.toLowerCase());
  const changed = !originalLower.every((d, i) => d === orderedLower[i]);

  return {
    ordered,
    optimized: changed,
    routeDescription: `${origin} → ${ordered.join(' → ')} → ${origin}`,
  };
}

export interface BacktrackResult {
  hasBacktrack: boolean;
  duplicateCities: string[];
  details: string;
}

// Detect backtracking: City A → City B → City A (non-consecutive repeat with different cities in between)
export function detectBacktracking(days: DayPlan[]): BacktrackResult {
  const locations = days.map((d) => (d.location ?? '').toLowerCase().trim());
  const duplicateCities: string[] = [];

  for (let i = 0; i < locations.length; i++) {
    if (!locations[i]) continue;
    for (let j = i + 2; j < locations.length; j++) {
      if (locations[i] === locations[j]) {
        const between = locations.slice(i + 1, j);
        if (between.some((c) => c !== locations[i])) {
          const cityName = days[i].location;
          if (!duplicateCities.includes(cityName)) {
            duplicateCities.push(cityName);
          }
        }
      }
    }
  }

  const routeStr = [...new Set(locations)].join(' → ');
  const details = duplicateCities.length > 0
    ? `Backtracking detected: ${duplicateCities.join(', ')} visited multiple times. Route: ${routeStr}`
    : `Route looks optimal: ${routeStr}`;

  return { hasBacktrack: duplicateCities.length > 0, duplicateCities, details };
}

// Estimate approximate distance between two cities in km (for context in prompts)
export function estimateDistanceKm(city1: string, city2: string): number | null {
  const c1 = getCoords(city1);
  const c2 = getCoords(city2);
  if (!c1 || !c2) return null;
  return Math.round(haversineKm(c1[0], c1[1], c2[0], c2[1]));
}
