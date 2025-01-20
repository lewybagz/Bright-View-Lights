import { useEffect, useState } from "react";
import { Cloud, Sun, Wind, Droplets } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  getWeatherForecast,
  isWeatherSuitableForInstallation,
} from "@/lib/weather";
import type { Job } from "@/types";
import { WeatherData } from "@/types";

interface JobWeatherProps {
  job: Job;
}

export function JobWeather({ job }: JobWeatherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        const forecast = await getWeatherForecast(
          job.location.coordinates,
          job.scheduledDate
        );
        setWeather(forecast);
      } catch (err) {
        setError("Failed to load weather forecast");
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [job.location.coordinates, job.scheduledDate, setError]);

  if (!weather) return null;

  const isSuitable = isWeatherSuitableForInstallation(weather);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Weather Conditions</h3>
        </CardHeader>
        <CardContent>
          <p>Loading weather forecast...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Weather Conditions</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            <span>{weather.temperature}°F</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            <span>{weather.conditions}</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            <span>{weather.precipitation}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            <span>{weather.windSpeed} mph</span>
          </div>
        </div>

        <div
          className={`mt-4 p-2 rounded-md text-center ${
            isSuitable
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isSuitable
            ? "Weather conditions are suitable for installation"
            : "Weather conditions may not be suitable for installation"}
        </div>
        <div className="mt-2 text-sm text-red-500">{error}</div>
      </CardContent>
    </Card>
  );
}
