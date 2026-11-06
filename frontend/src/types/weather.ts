export interface WeatherLocation {
  city: string;
  state?: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface WeatherCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface WeatherHourly {
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  wind_speed_10m: number[];
}

export interface WeatherResponse {
  status: string;
  location?: WeatherLocation;
  current?: WeatherCurrent;
  hourly?: WeatherHourly;
  message?: string;
}
