import api from './api';
import { WeatherResponse } from '../types/weather';

export const weatherService = {
  async getWeather(city: string, country?: string): Promise<WeatherResponse> {
    const params: Record<string, string> = { city };
    if (country) {
      params.country = country;
    }
    const res = await api.get<WeatherResponse>('/weather', { params });
    return res.data;
  },

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherResponse> {
    const res = await api.get<WeatherResponse>('/weather/by-coords', {
      params: { lat, lon },
    });
    return res.data;
  },
};
