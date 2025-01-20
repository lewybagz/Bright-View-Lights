import { 
  collection, 
  doc,  
  setDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WeatherData } from "@/types";

const OPENWEATHER_API_KEY = process.env.VITE_PUBLIC_OPENWEATHER_API_KEY;
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

interface StoredWeatherData {
  temperature: number;
  conditions: string;
  precipitation: number;
  windSpeed: number;
  timestamp: Timestamp;
  lat: number;
  lng: number;
  forecastDate: Timestamp;
}

interface OpenWeatherForecast {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
  }>;
  pop: number;
  wind: {
    speed: number;
  };
}

async function fetchWeatherFromAPI(
  location: { lat: number; lng: number }, 
  targetDate?: Date
): Promise<WeatherData[]> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${OPENWEATHER_API_KEY}&units=imperial`
  );

  if (!response.ok) {
    throw new Error('Weather API request failed');
  }

  const data = await response.json();
  
  return data.list
  .map((forecast: OpenWeatherForecast) => {
    const forecastDate = new Date(forecast.dt * 1000);
    return {
      temperature: Math.round(forecast.main.temp),
      conditions: forecast.weather[0].main,
      precipitation: Math.round(forecast.pop * 100),
      windSpeed: Math.round(forecast.wind.speed),
      forecastDate
    };
  })
  .filter((forecast: WeatherData) => {
    const hours = forecast.forecastDate.getHours();
    return hours >= 7 && hours <= 18; // Filter for 7am to 6pm
  })
  .filter((forecast: WeatherData) => {
    if (!targetDate) return true;
    
    // If target date is provided, only return forecasts for that date
    // that are within our business hours
    return (
      forecast.forecastDate.getDate() === targetDate.getDate() &&
      forecast.forecastDate.getMonth() === targetDate.getMonth() &&
      forecast.forecastDate.getFullYear() === targetDate.getFullYear()
    );
  });
}

function generateLocationKey(lat: number, lng: number): string {
  return `${Math.round(lat * 100) / 100}_${Math.round(lng * 100) / 100}`;
}

export async function getWeatherForecast(
  location: { lat: number; lng: number },
  jobDate?: Date
): Promise<WeatherData> {
  try {
    const locationKey = generateLocationKey(location.lat, location.lng);
    const weatherCollection = collection(db, 'weather');
    
    // Query for existing forecast
    const q = query(
      weatherCollection,
      where('lat', '>=', location.lat - 0.01),
      where('lat', '<=', location.lat + 0.01)
    );
    
    const querySnapshot = await getDocs(q);
    let cachedData: StoredWeatherData | null = null;

    // Convert to array and find first matching document
    const matchingDoc = querySnapshot.docs.find(doc => {
      const data = doc.data() as StoredWeatherData;
      const forecastHour = data.forecastDate.toDate().getHours();
      return (
        Math.abs(data.lng - location.lng) <= 0.01 &&
        Date.now() - data.timestamp.toMillis() < CACHE_DURATION &&
        (!jobDate || data.forecastDate.toDate().getDate() === jobDate.getDate()) &&
        forecastHour >= 7 && forecastHour <= 18
      );
    });

    if (matchingDoc) {
      cachedData = matchingDoc.data() as StoredWeatherData;
    }

    if (cachedData) {
      console.log('Using cached weather data');
      return {
        temperature: cachedData.temperature,
        conditions: cachedData.conditions,
        precipitation: cachedData.precipitation,
        windSpeed: cachedData.windSpeed,
        forecastDate: cachedData.forecastDate.toDate()
      };
    }

    // If cache miss or expired, fetch new data
    console.log('Fetching fresh weather data');
    const forecasts = await fetchWeatherFromAPI(location, jobDate);
    
    // Find the forecast closest to the job date or use the first one
    const targetForecast = jobDate
      ? forecasts.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev.forecastDate.getTime() - jobDate.getTime());
          const currDiff = Math.abs(curr.forecastDate.getTime() - jobDate.getTime());
          return prevDiff < currDiff ? prev : curr;
        })
      : forecasts[0];

    // Store all forecasts in Firestore
    const weatherData: StoredWeatherData[] = forecasts.map(forecast => ({
      ...forecast,
      timestamp: Timestamp.now(),
      lat: location.lat,
      lng: location.lng,
      forecastDate: Timestamp.fromDate(forecast.forecastDate)
    }));
    
    await Promise.all(
      weatherData.map(data => 
        setDoc(doc(weatherCollection, `${locationKey}_${data.forecastDate.toDate().getTime()}`), data)
      )
    );
      
    return {
      temperature: targetForecast.temperature,
      conditions: targetForecast.conditions,
      precipitation: targetForecast.precipitation,
      windSpeed: targetForecast.windSpeed,
      forecastDate: targetForecast.forecastDate
    };
    
  } catch (error) {
    console.error('Error in weather service:', error);
    return {
      temperature: 70,
      conditions: 'Unknown',
      precipitation: 0,
      windSpeed: 0,
      forecastDate: new Date()  // Add current date as fallback
    };
  }
}

export function isWeatherSuitableForInstallation(weather: WeatherData): boolean {
  return (
    weather.temperature >= 40 &&
    weather.temperature <= 95 &&
    weather.precipitation < 30 &&
    weather.windSpeed < 20
  );
}