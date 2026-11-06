import React, { useState } from 'react';
import {
  Compass,
  CloudRain,
  Sun,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { farmAdvisorService } from '../services/farmAdvisorService';
import { FarmAdvisorRequest, FarmAdvisorResponse } from '../types/advisor';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { AlertBanner } from '../components/common/AlertBanner';

export const FarmAdvisorPage: React.FC = () => {
  const [formData, setFormData] = useState<FarmAdvisorRequest>({
    crop: 'rice',
    crop_stage: 'tillering',
    city: 'Pune',
    country: 'IN',
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    ph: 6.5,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FarmAdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stages = [
    'nursery',
    'seedling',
    'vegetative',
    'tillering',
    'panicle initiation',
    'flowering',
    'grain filling',
    'harvesting',
  ];

  const quickCities = ['Pune', 'Nashik', 'Nagpur', 'Ludhiana', 'Karnal', 'Guntur', 'Coimbatore'];

  const handleInputChange = (field: keyof FarmAdvisorRequest, val: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.crop.trim() || !formData.crop_stage.trim() || !formData.city.trim()) {
      setError('Please provide crop name, stage, and field city.');
      return;
    }

    try {
      setLoading(true);
      const res = await farmAdvisorService.getFarmActions(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Integrated farm action calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-7xl 2xl:max-w-full mx-auto">
      {/* Header */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="sm">
            Integrated Precision Agronomy
          </Badge>
          <Badge variant="blue" size="sm">
            Live Weather Telemetry + Stage Guidance
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Smart Farm Advisor & Action Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Fuses real-time local microclimate forecasts with current crop phenological stage and soil fertility to produce prioritized daily farming instructions.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Farm Variables Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            title="Field Context & Stage Parameters"
            subtitle="Configure crop, growth stage, and regional telemetry"
            icon={<Sliders className="w-5 h-5" />}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Crop Name */}
              <Input
                label="Crop Name"
                value={formData.crop}
                onChange={(e) => handleInputChange('crop', e.target.value)}
                placeholder="e.g. rice, wheat, cotton..."
                required
              />

              {/* Crop Growth Stage */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Crop Growth Stage
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {stages.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleInputChange('crop_stage', st)}
                      className={`text-xs px-2.5 py-1 rounded-lg border capitalize transition-all cursor-pointer ${
                        formData.crop_stage.toLowerCase() === st
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <Input
                  value={formData.crop_stage}
                  onChange={(e) => handleInputChange('crop_stage', e.target.value)}
                  placeholder="Or enter custom stage..."
                  required
                />
              </div>

              {/* City & Country */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Field Location (City & Country)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {quickCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleInputChange('city', city)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                        formData.city.toLowerCase() === city.toLowerCase()
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="e.g. Pune"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      value={formData.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value.toUpperCase())}
                      placeholder="IN"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Soil Test Metrics */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Soil Fertility Telemetry
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    label="N"
                    type="number"
                    step="any"
                    value={formData.nitrogen}
                    onChange={(e) => handleInputChange('nitrogen', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <Input
                    label="P"
                    type="number"
                    step="any"
                    value={formData.phosphorus}
                    onChange={(e) => handleInputChange('phosphorus', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <Input
                    label="K"
                    type="number"
                    step="any"
                    value={formData.potassium}
                    onChange={(e) => handleInputChange('potassium', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <Input
                    label="pH"
                    type="number"
                    step="0.1"
                    value={formData.ph}
                    onChange={(e) => handleInputChange('ph', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2"
                loading={loading}
                icon={<Compass className="w-4 h-4" />}
              >
                Synthesize Farm Action Plan
              </Button>
            </form>
          </Card>
        </div>

        {/* Action Plan Results */}
        <div className="lg:col-span-7 space-y-6">
          {loading && (
            <Card className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800 animate-pulse">
                Synthesizing Atmospheric, Soil & Phenological Data...
              </p>
              <p className="text-xs text-slate-400">
                Fetching Open-Meteo microclimate, checking soil thresholds, and querying Crop Production Guide...
              </p>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Telemetry Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg capitalize">
                      {result.crop} • <span className="text-emerald-700">{result.crop_stage}</span> stage
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {result.location.city}
                      {result.location.country ? `, ${result.location.country}` : ''}
                    </p>
                  </div>
                </div>

                {result.weather?.current && (
                  <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 text-xs">
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block text-sm">
                        {Math.round(result.weather.current.temperature_2m)}°C
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Rain: {result.weather.current.precipitation} mm
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Categorized Prioritized Actions */}
              <Card
                title="Action Plan & Decision Support"
                subtitle="Prioritized operational tasks for current field conditions"
                icon={<Sparkles className="w-5 h-5" />}
              >
                <div className="space-y-3">
                  {result.actions.map((action, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        action.priority === 'high'
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : 'bg-slate-50 border-slate-200/80 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={action.priority === 'high' ? 'rose' : 'amber'}
                            size="sm"
                          >
                            {action.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <span className="font-semibold text-slate-700 capitalize">
                            Type: {action.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed font-medium">{action.message}</p>

                      {action.guidance && action.guidance.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                          {action.guidance.map((g, gi) => (
                            <div key={gi} className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                              <p className="line-clamp-3 italic">"{g.message}"</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Source: {g.source.document} (Page {g.source.page})
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Farmer Executive Summary */}
              {result.summary && (
                <Card
                  title="Agronomic Action Plan Summary"
                  subtitle="Concise practical advice compiled for daily operations"
                  icon={<FileText className="w-5 h-5" />}
                >
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {result.summary}
                  </div>
                </Card>
              )}
            </div>
          )}

          {!loading && !result && (
            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
              <Compass className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <h3 className="font-semibold text-slate-700 text-sm">Farm Advisor Ready</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fill in your crop, growth stage, and field city to generate tailored multi-factor farming instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
