import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  Languages,
  Sparkles,
  FlaskConical,
  Compass,
  CloudSun,
  TrendingUp,
  Tractor,
  Bell,
  ArrowUpRight,
  Droplets,
  Wind,
  Thermometer,
  Search,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { weatherService } from '../services/weatherService';
import { WeatherResponse } from '../types/weather';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();

  const [weatherCity, setWeatherCity] = useState('Pune');
  const [cityInput, setCityInput] = useState('Pune');
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setWeatherLoading(true);
    setWeatherError(null);

    weatherService
      .getWeather(weatherCity, 'IN')
      .then((res) => {
        if (!mounted) return;
        if (res.status === 'success' && res.current) {
          setWeatherData(res);
          setWeatherError(null);
        } else {
          setWeatherData(null);
          setWeatherError(res.message || `No weather data for ${weatherCity}`);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Weather load error:', err);
        setWeatherData(null);
        setWeatherError(`Failed to fetch weather for ${weatherCity}`);
      })
      .finally(() => {
        if (mounted) setWeatherLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [weatherCity]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setWeatherCity(cityInput.trim());
    }
  };

  const actionCards = [
    {
      title: 'Multilingual AI Assistant',
      desc: 'Ask farming advice in your own language (मराठी, हिन्दी, etc.) via voice or text.',
      icon: Languages,
      path: '/multilingual',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Voice & Indic AI',
    },
    {
      title: 'AI Advisory (RAG)',
      desc: 'Ask complex agronomy questions with FAO cited sources.',
      icon: MessageSquareText,
      path: '/advisor',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Verified FAO Knowledge',
    },

    {
      title: 'ML Crop Predictor',
      desc: 'Input soil NPK and rainfall to predict optimal yield crops.',
      icon: Sparkles,
      path: '/crop-recommendation',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Trained Random Forest',
    },
    {
      title: 'Soil Health Advisory',
      desc: 'Analyze soil fertility tests for safe fertilizer planning.',
      icon: FlaskConical,
      path: '/soil-advisory',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Nutrient Analysis',
    },
    {
      title: 'Smart Farm Advisor',
      desc: 'Stage-specific farming action plan with real-time weather.',
      icon: Compass,
      path: '/farm-advisor',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Integrated Engine',
    },
    {
      title: 'Mandi Market Prices',
      desc: 'Track live AGMARKNET mandi rates and set price target alerts.',
      icon: TrendingUp,
      path: '/market',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'AGMARKNET Live',
    },
    {
      title: 'Equipment Rental Hub',
      desc: 'Find or list tractors and implements with deal calculators.',
      icon: Tractor,
      path: '/equipment',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Farmer Sharing Hub',
    },
  ];

  return (
    <div className="space-y-8 py-4 sm:py-6 max-w-7xl 2xl:max-w-full mx-auto">
      {/* Welcome Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Precision Farm Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Welcome back, {user?.name || 'Farmer'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor real-time microclimate conditions, market trends, and AI crop recommendations for your field.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/advisor">
            <Button size="sm" icon={<MessageSquareText className="w-4 h-4" />}>
              Ask AI Advisor
            </Button>
          </Link>
          <Link to="/market">
            <Button variant="outline" size="sm" icon={<TrendingUp className="w-4 h-4" />}>
              Check Mandis
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Grid: Live Microclimate + Notifications Snippet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <Card
          className="lg:col-span-2"
          title="Field Weather Conditions"
          subtitle={`Microclimate station for ${weatherData?.location?.city || weatherCity}, ${weatherData?.location?.country || 'India'}`}
          icon={<CloudSun className="w-5 h-5" />}
          action={
            <form onSubmit={handleCitySearch} className="flex items-center gap-1.5">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Change city..."
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 w-28 sm:w-36 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Button type="submit" size="sm" variant="outline" className="px-2" disabled={weatherLoading}>
                <Search className="w-3.5 h-3.5" />
              </Button>
            </form>
          }
        >
          {weatherLoading ? (
            <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
              Retrieving live atmospheric telemetry...
            </div>
          ) : weatherData?.current ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {Math.round(weatherData.current.temperature_2m)}°C
                  </span>
                  <div>
                    <Badge variant="emerald" size="sm">
                      Feels like {Math.round(weatherData.current.apparent_temperature)}°C
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      Coordinates: {weatherData.location?.latitude.toFixed(2)}°N, {weatherData.location?.longitude.toFixed(2)}°E
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <span className="text-xs text-slate-500 block">Humidity</span>
                    <span className="text-sm font-bold text-slate-900">
                      {weatherData.current.relative_humidity_2m}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <Wind className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <span className="text-xs text-slate-500 block">Wind</span>
                    <span className="text-sm font-bold text-slate-900">
                      {weatherData.current.wind_speed_10m} km/h
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <Thermometer className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <span className="text-xs text-slate-500 block">Rainfall</span>
                    <span className="text-sm font-bold text-slate-900">
                      {weatherData.current.precipitation} mm
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                <span>Data source: Open-Meteo High-Resolution Forecast Engine</span>
                <Link to="/weather" className="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                  Full 3-Day Forecast <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs text-rose-600 font-medium">{weatherError || 'Weather data currently unavailable for this region.'}</p>
              <button
                type="button"
                onClick={() => setWeatherCity(cityInput.trim() || 'Pune')}
                className="text-xs text-emerald-700 underline font-semibold hover:text-emerald-800 cursor-pointer"
              >
                Retry Weather
              </button>
            </div>
          )}
        </Card>

        {/* Notifications & Alert Center Snippet */}
        <Card
          title="Active Alerts & Updates"
          subtitle={`${unreadCount} unread system notice${unreadCount === 1 ? '' : 's'}`}
          icon={<Bell className="w-5 h-5" />}
          action={
            <Link to="/market" className="text-xs font-semibold text-emerald-600 hover:underline">
              Alerts
            </Link>
          }
        >
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Bell className="w-7 h-7 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-medium text-slate-600">All systems normal</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending market price alerts or rental notices.</p>
              </div>
            ) : (
              notifications.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{item.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Main Feature Launch Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Farm Intelligence Modules</h2>
          <p className="text-xs text-slate-500">Access verified decision support tools and agronomic analytics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.path}
                className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/60 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="emerald" size="sm">
                      {card.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                  <span>Open Tool</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
