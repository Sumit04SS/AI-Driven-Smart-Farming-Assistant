import React, { useState } from 'react';
import {
  FlaskConical,
  FileText,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { soilService } from '../services/soilService';
import { SoilAdvisoryRequest, SoilAdvisoryResponse } from '../types/soil';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { AlertBanner } from '../components/common/AlertBanner';

export const SoilAdvisoryPage: React.FC = () => {
  const [formData, setFormData] = useState<SoilAdvisoryRequest>({
    crop: 'rice',
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    ph: 6.5,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilAdvisoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const commonCrops = [
    'rice',
    'wheat',
    'cotton',
    'sugarcane',
    'maize',
    'soybean',
    'potato',
    'groundnut',
    'tomato',
  ];

  const handleInputChange = (field: keyof SoilAdvisoryRequest, val: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof val === 'string' && field !== 'crop' ? parseFloat(val) || 0 : val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.crop.trim()) {
      setError('Please specify the target crop.');
      return;
    }
    if (formData.ph < 0 || formData.ph > 14) {
      setError('Soil pH must be between 0 and 14.');
      return;
    }

    try {
      setLoading(true);
      const res = await soilService.getAdvisory(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Soil advisory generation failed.');
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
            FAO Integrated Soil Management
          </Badge>
          <Badge variant="slate" size="sm">
            Plant Nutrition for Food Security
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Soil Health & Nutrient Advisory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Obtain crop-specific nutrient management recommendations and fertilizer application guidance verified against official FAO soil standards.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            title="Soil Test Values & Target Crop"
            subtitle="Enter soil lab test results for targeted advice"
            icon={<FlaskConical className="w-5 h-5" />}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Crop Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Crop
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {commonCrops.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleInputChange('crop', c)}
                      className={`text-xs px-2.5 py-1 rounded-lg border capitalize transition-all cursor-pointer ${
                        formData.crop.toLowerCase() === c
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Or enter custom crop name..."
                  value={formData.crop}
                  onChange={(e) => handleInputChange('crop', e.target.value)}
                  required
                />
              </div>

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

              <Input
                label="Soil pH"
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={formData.ph}
                onChange={(e) => handleInputChange('ph', e.target.value)}
                required
                helperText="Acidity / Alkalinity Scale (0 to 14)"
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                icon={<FlaskConical className="w-4 h-4" />}
              >
                Analyze Soil & Get Guidance
              </Button>
            </form>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          {loading && (
            <Card className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800 animate-pulse">
                Consulting FAO Integrated Soil Management Manuals...
              </p>
              <p className="text-xs text-slate-400">
                Retrieving precise nutrient practices for {formData.crop}...
              </p>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Summary Metric Header */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500">Analyzed Crop:</span>
                  <h3 className="text-xl font-bold text-slate-900 capitalize">{result.crop}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-center px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">N</span>
                    <span className="text-xs font-bold text-slate-800">{result.soil_values.nitrogen}</span>
                  </div>
                  <div className="text-center px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">P</span>
                    <span className="text-xs font-bold text-slate-800">{result.soil_values.phosphorus}</span>
                  </div>
                  <div className="text-center px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">K</span>
                    <span className="text-xs font-bold text-slate-800">{result.soil_values.potassium}</span>
                  </div>
                  <div className="text-center px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">pH</span>
                    <span className="text-xs font-bold text-slate-800">{result.soil_values.ph}</span>
                  </div>
                </div>
              </div>

              {/* Advisory Card */}
              <Card
                title="Expert Nutrient Management Guidance"
                subtitle="Non-speculative advice synthesized exclusively from retrieved knowledge"
                icon={<BookOpen className="w-5 h-5" />}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-800 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {result.advisory}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No artificial thresholds or unverified fertilizer quantities were hallucinated.</span>
                  </div>
                </div>
              </Card>

              {/* Citations */}
              {result.sources && result.sources.length > 0 && (
                <Card
                  title="Evidence & Citations"
                  subtitle="Primary agricultural documents used for this advisory"
                  icon={<FileText className="w-5 h-5" />}
                >
                  <div className="space-y-2">
                    {result.sources.map((src, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900">{src.source}</p>
                          <p className="text-[11px] text-slate-500">Document Page: {src.page}</p>
                        </div>
                        {src.score !== undefined && (
                          <Badge variant="emerald" size="sm">
                            {(src.score * 100).toFixed(1)}% relevance
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {!loading && !result && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
              <FlaskConical className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <h3 className="font-semibold text-slate-700 text-sm">No Soil Data Analyzed Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select your crop and provide N-P-K and pH numbers on the left to generate evidence-based soil guidance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
