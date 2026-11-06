import React, { useEffect, useState } from 'react';
import { Sprout, Activity } from 'lucide-react';
import { authService } from '../../services/authService';

export const Footer: React.FC = () => {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    authService
      .healthCheck()
      .then((res) => setBackendHealthy(res.status === 'success'))
      .catch(() => setBackendHealthy(false));
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl 2xl:max-w-360 mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-10">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">
                AgriSmart<span className="text-emerald-600">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Empowering Indian farmers with multilingual AI agronomic intelligence, real-time AGMARKNET mandi prices, high-resolution microclimate forecasts, and peer-to-peer equipment sharing.
            </p>
            {/* Live Backend Health Tag */}
            <div className="pt-2 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                Backend Engine:
              </span>
              {backendHealthy === null ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" /> Connecting...
                </span>
              ) : backendHealthy ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operational
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Offline / Proxying
                </span>
              )}
            </div>
          </div>

          {/* Col 2: Knowledge Sources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Knowledge Bases
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>FAO Integrated Soil Management</li>
              <li>FAO Plant Nutrition & Security</li>
              <li>FAO Irrigation Manual</li>
              <li>ICAR Indian Agriculture Guidelines</li>
              <li>Crop Production Guide 2026</li>
            </ul>
          </div>

          {/* Col 3: Integrations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Live Feeds
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>AGMARKNET Mandi Price API</li>
              <li>Open-Meteo High-Resolution Forecast</li>
              <li>Pinecone Vector Cloud (384-d)</li>
              <li>Groq Llama-3 120B Agronomy Engine</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 AgriSmart AI Platform. Built for Springboard Agricultural Research.</p>
          <p>Strictly non-speculative verified agricultural guidance.</p>
        </div>
      </div>
    </footer>
  );
};
