import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  CloudSun,
  Search,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Cloud,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldAlert,
  RefreshCw,
  LocateFixed,
  XCircle,
} from 'lucide-react';
import { weatherService } from '../services/weatherService';
import { WeatherResponse } from '../types/weather';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { AlertBanner } from '../components/common/AlertBanner';

type GeoState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'active'; lat: number; lon: number; displayName: string }
  | { status: 'denied'; reason: string }
  | { status: 'unavailable'; reason: string };

export const WeatherPage: React.FC = () => {
  const [city, setCity] = useState('Pune');
  const [country, setCountry] = useState('IN');
  const [searchInput, setSearchInput] = useState('Pune');
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSearchedCity, setActiveSearchedCity] = useState('Pune');
  const [geoState, setGeoState] = useState<GeoState>({ status: 'idle' });

  // Request sequencing to prevent race conditions
  const requestIdRef = useRef(0);

  const quickCities = [
    { name: 'Pune', state: 'Maharashtra' },
    { name: 'Mumbai', state: 'Maharashtra' },
    { name: 'Nashik', state: 'Maharashtra' },
    { name: 'Ludhiana', state: 'Punjab' },
    { name: 'Karnal', state: 'Haryana' },
    { name: 'Nagpur', state: 'Maharashtra' },
    { name: 'Indore', state: 'Madhya Pradesh' },
    { name: 'Guntur', state: 'Andhra Pradesh' },
  ];

  const fetchWeather = useCallback(async (targetCity: string, targetCountry?: string) => {
    const trimmedCity = targetCity.trim();
    if (!trimmedCity) return;

    const currentRequestId = ++requestIdRef.current;
    setError(null);
    setLoading(true);
    setActiveSearchedCity(trimmedCity);
    // Clear geo state when doing a manual search
    setGeoState({ status: 'idle' });

    try {
      const res = await weatherService.getWeather(trimmedCity, targetCountry);

      if (currentRequestId === requestIdRef.current) {
        if (res.status === 'success' && res.current) {
          setWeatherData(res);
          setError(null);
        } else {
          setWeatherData(null);
          setError(
            res.message || `No weather data found for "${trimmedCity}". Please check the spelling.`
          );
        }
      }
    } catch (err: any) {
      if (currentRequestId === requestIdRef.current) {
        setWeatherData(null);
        setError(
          err.message || `Failed to fetch weather for "${trimmedCity}". Please try again.`
        );
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const fetchWeatherByCoords = useCallback(
    async (lat: number, lon: number, displayName: string) => {
      const currentRequestId = ++requestIdRef.current;
      setError(null);
      setLoading(true);
      setActiveSearchedCity(displayName);

      try {
        const res = await weatherService.getWeatherByCoords(lat, lon);

        if (currentRequestId === requestIdRef.current) {
          if (res.status === 'success' && res.current) {
            setWeatherData(res);
            setError(null);
          } else {
            setWeatherData(null);
            setError(res.message || 'Failed to fetch weather for your location.');
          }
        }
      } catch (err: any) {
        if (currentRequestId === requestIdRef.current) {
          setWeatherData(null);
          setError(err.message || 'Failed to fetch weather for your location. Please try again.');
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchWeather(city, country);
  }, [city, country, fetchWeather]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setCity(trimmed);
      fetchWeather(trimmed, country);
    }
  };

  const handleQuickCitySelect = (cityName: string) => {
    setSearchInput(cityName);
    setCity(cityName);
    fetchWeather(cityName, country);
  };

  const handleRetry = () => {
    if (geoState.status === 'active') {
      fetchWeatherByCoords(geoState.lat, geoState.lon, geoState.displayName);
    } else {
      fetchWeather(city, country);
    }
  };

  const handleClearGeo = () => {
    setGeoState({ status: 'idle' });
    setWeatherData(null);
    setError(null);
    // Restore last manual search
    fetchWeather(city, country);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoState({
        status: 'unavailable',
        reason: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setGeoState({ status: 'requesting' });
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const displayName = 'My Location';
        setGeoState({ status: 'active', lat: latitude, lon: longitude, displayName });
        fetchWeatherByCoords(latitude, longitude, displayName);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoState({
            status: 'denied',
            reason:
              'Location permission was denied. Please allow location access in your browser settings.',
          });
        } else if (err.code === err.TIMEOUT) {
          setGeoState({
            status: 'unavailable',
            reason: 'Location request timed out. Please try again.',
          });
        } else {
          setGeoState({
            status: 'unavailable',
            reason: 'Your location could not be determined. Please search manually.',
          });
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return { label: 'Clear Sky', icon: Sun, color: 'text-amber-500' };
    if (code <= 3) return { label: 'Partly Cloudy', icon: CloudSun, color: 'text-emerald-500' };
    if (code <= 48) return { label: 'Foggy / Overcast', icon: Cloud, color: 'text-slate-500' };
    if (code <= 67)
      return { label: 'Light to Moderate Rain', icon: CloudRain, color: 'text-blue-500' };
    if (code <= 82)
      return { label: 'Heavy Showers', icon: CloudRain, color: 'text-blue-700' };
    return { label: 'Thunderstorm / Stormy', icon: AlertTriangle, color: 'text-purple-600' };
  };

  const weatherCodeInfo = weatherData?.current
    ? getWeatherDescription(weatherData.current.weather_code)
    : null;

  const isGeoActive = geoState.status === 'active';
  const isGeoRequesting = geoState.status === 'requesting';
  const geoError =
    geoState.status === 'denied' || geoState.status === 'unavailable'
      ? geoState.reason
      : null;

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-7xl 2xl:max-w-full mx-auto">
      {/* Header Banner */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="emerald" size="sm">
            Open-Meteo High-Resolution Forecast
          </Badge>
          <Badge variant="blue" size="sm">
            Agricultural Spray &amp; Irrigation Advisory
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Live Agricultural Weather Station
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          High-accuracy microclimate forecasts tracking wind speed, precipitation probability, and
          humidity to guide spraying and irrigation windows.
        </p>
      </div>

      {/* City Search Bar & Quick Chips */}
      <Card className="shadow-xs">
        <div className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search any Indian town or agricultural district (e.g. Mumbai, Ludhiana)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                disabled={loading}
              />
            </div>
            <div className="w-24">
              <Input
                placeholder="IN"
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                maxLength={2}
                disabled={loading}
                title="ISO 2-letter Country Code (default: IN)"
              />
            </div>
            <Button
              type="submit"
              loading={loading && !isGeoActive && !isGeoRequesting}
              icon={<Search className="w-4 h-4" />}
              disabled={loading || !searchInput.trim()}
            >
              Lookup Weather
            </Button>
          </form>

          {/* Quick City Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-medium">Agricultural Belts:</span>
            {quickCities.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleQuickCitySelect(c.name)}
                disabled={loading}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  !isGeoActive &&
                  activeSearchedCity.toLowerCase() === c.name.toLowerCase()
                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 disabled:opacity-50'
                }`}
              >
                {c.name} ({c.state})
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="font-medium">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Use My Location */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseMyLocation}
              disabled={loading || isGeoRequesting}
              loading={isGeoRequesting}
              icon={<LocateFixed className="w-4 h-4 text-emerald-600" />}
            >
              {isGeoRequesting ? 'Requesting permission…' : 'Use My Current Location'}
            </Button>

            {isGeoActive && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Showing weather for <strong>your current location</strong>
                </span>
                <button
                  onClick={handleClearGeo}
                  className="ml-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Clear and return to city search"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Geolocation Error */}
      {geoError && (
        <AlertBanner
          type="warning"
          title="Location Unavailable"
          message={geoError}
          onClose={() => setGeoState({ status: 'idle' })}
        />
      )}

      {/* Fetch Error with Retry */}
      {error && (
        <div className="space-y-3">
          <AlertBanner
            type="error"
            title="Weather Search Error"
            message={error}
            onClose={() => setError(null)}
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              disabled={loading}
            >
              Retry for "{activeSearchedCity}"
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-800">
            {isGeoRequesting
              ? 'Detecting your location…'
              : `Fetching weather for "${activeSearchedCity}"…`}
          </p>
          <p className="text-xs text-slate-400">
            Retrieving temperature, humidity, and precipitation data from Open-Meteo…
          </p>
        </Card>
      )}

      {/* Success Weather Results */}
      {!loading && weatherData?.current && weatherData.location && (
        <div className="space-y-6 transition-all duration-200">
          {/* Current Microclimate Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                    Current Atmospheric State
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-white mt-1">
                    <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{weatherData.location.city}</span>
                    {weatherData.location.state && (
                      <span className="text-slate-300 font-normal text-lg sm:text-xl">
                        , {weatherData.location.state}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lat: {weatherData.location.latitude.toFixed(2)}°, Lon:{' '}
                    {weatherData.location.longitude.toFixed(2)}° • TZ: {weatherData.location.timezone}
                  </p>
                </div>

                {weatherCodeInfo && (
                  <div className="text-right">
                    <weatherCodeInfo.icon
                      className={`w-10 h-10 ${weatherCodeInfo.color} ml-auto`}
                    />
                    <span className="text-xs font-semibold block text-slate-200 mt-1">
                      {weatherCodeInfo.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-5xl sm:text-6xl font-black tracking-tight">
                  {Math.round(weatherData.current.temperature_2m)}°C
                </span>
                <div className="space-y-0.5">
                  <Badge variant="emerald" size="md">
                    Feels Like {Math.round(weatherData.current.apparent_temperature)}°C
                  </Badge>
                  <p className="text-xs text-slate-300">Real-time surface 2m ambient reading</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="bg-white/5 p-3 rounded-xl backdrop-blur-xs text-center">
                  <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-400 block">Relative Humidity</span>
                  <span className="text-sm font-bold">
                    {weatherData.current.relative_humidity_2m}%
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl backdrop-blur-xs text-center">
                  <Wind className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-400 block">Wind Velocity</span>
                  <span className="text-sm font-bold">
                    {weatherData.current.wind_speed_10m} km/h
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl backdrop-blur-xs text-center">
                  <CloudRain className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-400 block">Precipitation</span>
                  <span className="text-sm font-bold">{weatherData.current.precipitation} mm</span>
                </div>
              </div>
            </div>

            {/* Farm Activity Feasibility Advisory */}
            <Card title="Field Spray & Activity Advisory" icon={<ShieldAlert className="w-5 h-5" />}>
              <div className="space-y-4 text-xs">
                {weatherData.current.precipitation > 0 ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl space-y-1">
                    <span className="font-bold block">❌ Unfavorable for Chemical Spraying</span>
                    <p>
                      Precipitation detected ({weatherData.current.precipitation} mm). Pesticide
                      wash-off risk is high. Postpone spraying.
                    </p>
                  </div>
                ) : weatherData.current.wind_speed_10m > 18 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1">
                    <span className="font-bold block">⚠️ High Wind Drift Risk</span>
                    <p>
                      Wind velocity is {weatherData.current.wind_speed_10m} km/h. Risk of droplet
                      drift onto non-target crops. Use low-drift nozzles.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-1">
                    <span className="font-bold block">✅ Optimal Spraying & Irrigation Window</span>
                    <p>
                      Winds are calm ({weatherData.current.wind_speed_10m} km/h) and no rain
                      detected. Suitable for foliar sprays and field operations.
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100 text-slate-600">
                  <div className="flex justify-between">
                    <span>Irrigation Urgency:</span>
                    <span className="font-semibold text-slate-800">
                      {weatherData.current.precipitation > 2
                        ? 'Low (Natural Rain)'
                        : 'Normal Monitoring'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fungal Disease Risk:</span>
                    <span className="font-semibold text-slate-800">
                      {weatherData.current.relative_humidity_2m > 80
                        ? 'Elevated (High Humidity)'
                        : 'Low to Moderate'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 3-Day Hourly Timeline Preview */}
          {weatherData.hourly && weatherData.hourly.temperature_2m && (
            <Card
              title="Next 24-Hour Microclimate Telemetry"
              subtitle={`Hourly temperature curve and precipitation probability for ${weatherData.location.city}`}
              icon={<Clock className="w-5 h-5" />}
            >
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[650px] grid grid-cols-8 gap-2">
                  {weatherData.hourly.temperature_2m.slice(0, 8).map((temp, i) => {
                    const prob = weatherData.hourly?.precipitation_probability?.[i] || 0;
                    const rain = weatherData.hourly?.precipitation?.[i] || 0;
                    return (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-center space-y-2"
                      >
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          +{i * 3}h
                        </span>
                        <span className="text-base font-bold text-slate-900 block">
                          {Math.round(temp)}°C
                        </span>
                        <div className="space-y-1 pt-1 border-t border-slate-200/40">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-blue-600 font-medium">
                            <Droplets className="w-3 h-3" />
                            <span>{prob}%</span>
                          </div>
                          {rain > 0 && (
                            <span className="text-[10px] text-amber-600 font-semibold block">
                              {rain} mm
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Initial Empty State */}
      {!loading && !weatherData && !error && !geoError && geoState.status === 'idle' && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
          <CloudSun className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h3 className="font-semibold text-slate-700 text-sm">Search for a City</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enter a city name above, select an agricultural belt chip, or use your current
            location to view live microclimate telemetry.
          </p>
        </div>
      )}
    </div>
  );
};
