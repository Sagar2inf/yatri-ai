import axios from 'axios';

export interface WeatherForecast {
  city: string;
  currentTemp?: number;
  description: string;
  season: string;
  travelTip: string;
}

// Open-Meteo WMO weather codes → description
const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Moderate showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail',
};

// Approximate coordinates for major Indian cities
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  delhi: { lat: 28.6139, lon: 77.2090 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  hyderabad: { lat: 17.3850, lon: 78.4867 },
  pune: { lat: 18.5204, lon: 73.8567 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  jodhpur: { lat: 26.2389, lon: 73.0243 },
  jaisalmer: { lat: 26.9157, lon: 70.9083 },
  udaipur: { lat: 24.5854, lon: 73.7125 },
  agra: { lat: 27.1767, lon: 78.0081 },
  varanasi: { lat: 25.3176, lon: 82.9739 },
  goa: { lat: 15.2993, lon: 74.1240 },
  panaji: { lat: 15.4909, lon: 73.8278 },
  kochi: { lat: 9.9312, lon: 76.2673 },
  thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  mysuru: { lat: 12.2958, lon: 76.6394 },
  mysore: { lat: 12.2958, lon: 76.6394 },
  amritsar: { lat: 31.6340, lon: 74.8723 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  shimla: { lat: 31.1048, lon: 77.1734 },
  manali: { lat: 32.2396, lon: 77.1887 },
  darjeeling: { lat: 27.0360, lon: 88.2627 },
  dehradun: { lat: 30.3165, lon: 78.0322 },
  haridwar: { lat: 29.9457, lon: 78.1642 },
  rishikesh: { lat: 30.0869, lon: 78.2676 },
  puri: { lat: 19.8135, lon: 85.8312 },
  bhubaneswar: { lat: 20.2961, lon: 85.8245 },
  aurangabad: { lat: 19.8762, lon: 75.3433 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  madurai: { lat: 9.9252, lon: 78.1198 },
  ooty: { lat: 11.4102, lon: 76.6950 },
  kodaikanal: { lat: 10.2381, lon: 77.4892 },
};

function getSeason(month: number): { season: string; tip: string } {
  if (month >= 11 || month <= 2) {
    return { season: 'Winter (Nov–Feb)', tip: 'Best time to visit plains, bring light woollens for north India nights' };
  } else if (month >= 3 && month <= 5) {
    return { season: 'Summer (Mar–May)', tip: 'Hot across most of India; prefer hill stations, avoid Rajasthan midday' };
  } else {
    return { season: 'Monsoon (Jun–Oct)', tip: 'Heavy rains possible; check road conditions for hill stations, great for Kerala backwaters' };
  }
}

async function geocodeCityNominatim(city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: `${city}, India`, format: 'json', limit: 1, countrycodes: 'in' },
      headers: { 'User-Agent': 'YatraAI/1.0 travel-planner' },
      timeout: 6000,
    });
    if (res.data?.[0]) {
      return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon) };
    }
  } catch { /* ignore */ }
  return null;
}

export async function fetchCityWeather(city: string): Promise<WeatherForecast> {
  const key = city.toLowerCase().replace(/\s+/g, '');
  let coords = Object.entries(CITY_COORDS).find(([k]) => key.includes(k))?.[1];

  const month = new Date().getMonth() + 1;
  const { season, tip } = getSeason(month);

  if (!coords) {
    coords = (await geocodeCityNominatim(city)) ?? undefined;
  }

  if (!coords) {
    return { city, description: 'Weather data unavailable', season, travelTip: tip };
  }

  try {
    const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current: 'temperature_2m,weathercode',
        timezone: 'Asia/Kolkata',
        forecast_days: 1,
      },
      timeout: 8000,
    });

    const current = res.data?.current;
    const temp: number = current?.temperature_2m;
    const code: number = current?.weathercode;
    const description = WMO_DESCRIPTIONS[code] ?? 'Variable weather';

    return {
      city,
      currentTemp: temp,
      description,
      season,
      travelTip: tip,
    };
  } catch {
    return { city, description: 'Weather data unavailable', season, travelTip: tip };
  }
}

export function formatWeatherForLLM(forecast: WeatherForecast): string {
  const temp = forecast.currentTemp !== undefined ? `${Math.round(forecast.currentTemp)}°C, ` : '';
  return `Weather in ${forecast.city}: ${temp}${forecast.description} | Season: ${forecast.season} | Travel tip: ${forecast.travelTip}`;
}
