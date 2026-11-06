import React, { useState } from 'react';
import {
  Sparkles,
  BarChart3,
  BookOpen,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { cropService } from '../services/cropService';
import { CropRecommendationRequest, CropRecommendationResponse } from '../types/crop';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { AlertBanner } from '../components/common/AlertBanner';

export const CropRecommendationPage: React.FC = () => {
  const [formData, setFormData] = useState<CropRecommendationRequest>({
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    temperature: 25,
    humidity: 80,
    ph: 6.5,
    rainfall: 200,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      name: 'Kharif Rice (High Rain)',
      data: { nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 26, humidity: 82, ph: 6.5, rainfall: 202 },
    },
    {
      name: 'Rabi Wheat (Loam Soil)',
      data: { nitrogen: 100, phosphorus: 50, potassium: 50, temperature: 20, humidity: 55, ph: 6.8, rainfall: 75 },
    },
    {
      name: 'Cotton (Black Soil)',
      data: { nitrogen: 120, phosphorus: 60, potassium: 58, temperature: 29, humidity: 65, ph: 7.2, rainfall: 90 },
    },
    {
      name: 'Maize / Corn Profile',
      data: { nitrogen: 80, phosphorus: 40, potassium: 20, temperature: 24, humidity: 65, ph: 6.5, rainfall: 110 },
    },
  ];

  const handleInputChange = (field: keyof CropRecommendationRequest, val: string) => {
    const num = parseFloat(val);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num,
    }));
  };

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setFormData(preset.data);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.ph < 0 || formData.ph > 14) {
      setError('Soil pH must be between 0 and 14.');
      return;
    }
    if (formData.humidity < 0 || formData.humidity > 100) {
      setError('Humidity percentage must be between 0% and 100%.');
      return;
    }

    try {
      setLoading(true);
      const res = await cropService.getRecommendation(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Crop recommendation calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-7xl 2xl:max-w-full mx-auto">
      {/* Header Banner */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="sm">
            Scikit-Learn Random Forest Model
          </Badge>
          <Badge variant="slate" size="sm">
            Crop Production Guide Grounding
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Smart Crop Recommendation Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Predict the most suitable and profitable crops based on laboratory soil nutrient tests, atmospheric humidity, and seasonal precipitation.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Soil & Climate Features */}
        <div className="lg:col-span-6 space-y-6">
          <Card
            title="Soil & Microclimate Telemetry"
            subtitle="Enter laboratory soil test values and climate conditions"
            icon={<Sliders className="w-5 h-5" />}
          >
            {/* Quick Presets */}
            <div className="mb-6 space-y-2">
              <span className="text-xs font-semibold text-slate-600">Quick Test Presets:</span>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="text-left text-xs p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 transition-all cursor-pointer font-medium"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Nitrogen (N)"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.nitrogen}
                  onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                  required
                  helperText="kg/ha"
                />
                <Input
                  label="Phosphorus (P)"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.phosphorus}
                  onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                  required
                  helperText="kg/ha"
                />
                <Input
                  label="Potassium (K)"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.potassium}
                  onChange={(e) => handleInputChange('potassium', e.target.value)}
                  required
                  helperText="kg/ha"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Temperature"
                  type="number"
                  step="any"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  required
                  helperText="°Celsius"
                />
                <Input
                  label="Humidity"
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  value={formData.humidity}
                  onChange={(e) => handleInputChange('humidity', e.target.value)}
                  required
                  helperText="Relative %"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Soil pH"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={formData.ph}
                  onChange={(e) => handleInputChange('ph', e.target.value)}
                  required
                  helperText="Scale 0 to 14"
                />
                <Input
                  label="Annual Rainfall"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.rainfall}
                  onChange={(e) => handleInputChange('rainfall', e.target.value)}
                  required
                  helperText="Millimeters (mm)"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-4"
                loading={loading}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Compute Optimal Crop Suitability
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Output: Recommendations & Agronomic Explanations */}
        <div className="lg:col-span-6 space-y-6">
          {loading && (
            <Card className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800 animate-pulse">
                Evaluating Multiclass Probabilities...
              </p>
              <p className="text-xs text-slate-400">
                Cross-referencing soil suitability with the Crop Production Guide...
              </p>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Recommended Crop Hero */}
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-6 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
                    Highest Suitability Match
                  </span>
                  <Badge variant="emerald" size="md">
                    {result.confidence}% Confidence
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-3xl sm:text-4xl font-black capitalize tracking-tight text-white">
                    {result.recommended_crop}
                  </h2>
                  <span className="text-xs text-emerald-200/80">Primary Recommendation</span>
                </div>
              </div>

              {/* Multiclass Probability Breakdown */}
              <Card
                title="Top 3 Crop Suitability Rankings"
                icon={<BarChart3 className="w-5 h-5" />}
              >
                <div className="space-y-3.5">
                  {result.top_recommendations.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="capitalize text-slate-800">
                          #{idx + 1} {item.crop}
                        </span>
                        <span className="text-slate-600">{item.confidence}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0 ? 'bg-emerald-600' : idx === 1 ? 'bg-emerald-400' : 'bg-slate-300'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, item.confidence))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* RAG-Generated Agronomic Rationale */}
              <Card
                title="Production Guide Verification"
                subtitle={`Source: ${result.guidance_source}`}
                icon={<BookOpen className="w-5 h-5" />}
              >
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{result.explanation}"
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified from official state crop agronomy recommendations.
                  </div>
                </div>
              </Card>
            </div>
          )}

          {!loading && !result && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
              <Sparkles className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <h3 className="font-semibold text-slate-700 text-sm">Awaiting Soil Parameters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fill in the N-P-K nutrient values and weather parameters on the left or select a preset to generate ML predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
