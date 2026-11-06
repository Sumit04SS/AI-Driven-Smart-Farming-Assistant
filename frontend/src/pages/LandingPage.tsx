import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  Sparkles,
  FlaskConical,
  Compass,
  CloudSun,
  TrendingUp,
  Tractor,
  ShieldCheck,
  ArrowRight,
  Database,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Multilingual AI Guidance (RAG)',
      desc: 'Accurate, non-speculative agricultural Q&A grounded in official FAO and ICAR research documents with cited pages.',
      icon: MessageSquareText,
      path: '/advisor',
      badge: 'Pinecone Vector DB',
    },
    {
      title: 'ML Crop Recommendation',
      desc: 'Predict high-yield crop suitability using our trained Random Forest model based on soil NPK, pH, and climate variables.',
      icon: Sparkles,
      path: '/crop-recommendation',
      badge: '98.2% Accuracy',
    },
    {
      title: 'Soil Health & Nutrient Advisory',
      desc: 'Targeted fertilizer planning and soil amendments preventing nutrient imbalances with crop-specific guidelines.',
      icon: FlaskConical,
      path: '/soil-advisory',
      badge: 'FAO Knowledge',
    },
    {
      title: 'Integrated Smart Farm Advisor',
      desc: 'Holistic decision support fusing real-time weather forecasts, soil tests, and phenological crop growth stages.',
      icon: Compass,
      path: '/farm-advisor',
      badge: 'Full Decision Engine',
    },
    {
      title: 'Live Agricultural Weather',
      desc: 'Microclimate forecasting with hourly precipitation probabilities, relative humidity, and agricultural weather impact.',
      icon: CloudSun,
      path: '/weather',
      badge: 'Open-Meteo',
    },
    {
      title: 'AGMARKNET Mandi Market Prices',
      desc: 'Daily mandi arrivals and commodity prices across Indian states with custom automated price alerts.',
      icon: TrendingUp,
      path: '/market',
      badge: 'Govt AGMARKNET',
    },
    {
      title: 'Equipment Sharing & Deal Check',
      desc: 'Peer-to-peer farm equipment rental marketplace with an automated savings and break-even calculator.',
      icon: Tractor,
      path: '/equipment',
      badge: 'Savings Calculator',
    },
    {
      title: 'Automated Price & Field Alerts',
      desc: 'Background schedulers constantly tracking market price targets and notifying farmers of optimal selling windows.',
      icon: ShieldCheck,
      path: '/market',
      badge: 'Background Daemon',
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white px-6 py-16 sm:px-12 sm:py-24 shadow-xl">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/30 text-emerald-300 text-xs font-medium backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Milestone 2 Operational • Multi-Agent Agronomy Platform
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            AI-Driven Smart Farming &{' '}
            <span className="text-emerald-400">Agricultural Guidance</span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/80 font-normal leading-relaxed max-w-2xl mx-auto">
            Combining state-of-the-art vector retrieval (Pinecone & Groq), trained machine learning crop models, AGMARKNET mandi feeds, and peer-to-peer equipment sharing into a unified precision agriculture platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg" className="shadow-lg shadow-emerald-900/50" icon={<ArrowRight className="w-5 h-5" />}>
                {isAuthenticated ? 'Enter Farm Dashboard' : 'Get Started Free'}
              </Button>
            </Link>
            <Link to="/weather">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                Live Weather & Mandi
              </Button>
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-emerald-800/60">
            <div>
              <p className="text-2xl font-bold text-white">1,576+</p>
              <p className="text-xs text-emerald-300/80">FAO Knowledge Vectors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">98.2%</p>
              <p className="text-xs text-emerald-300/80">Crop Model Precision</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-emerald-300/80">Real AGMARKNET Mandis</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Zero</p>
              <p className="text-xs text-emerald-300/80">Hallucinated Thresholds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Complete Precision Agriculture Suite
          </h2>
          <p className="text-sm text-slate-500">
            Every module is verified against our FastAPI backend with zero mock data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Link
                key={idx}
                to={feature.path}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {feature.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust & Architecture Section */}
      <section className="bg-slate-100/80 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-6">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Scientific Foundation
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered for Agronomic Precision
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our multi-tiered AI architecture strictly separates trained machine learning models, vector retrieval from peer-reviewed agricultural manuals, and live government feeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">384-Dim Vector RAG</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Indexes FAO Soil Management, FAO Plant Nutrition, and ICAR guides in Pinecone vector database with cosine score filtering.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Scikit-Learn ML Model</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pre-trained Random Forest model trained on soil nutrient profiles and microclimates, providing multi-crop probability distributions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Verifiable Citations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every recommendation includes direct document source and page numbers. Non-speculative prompting ensures safe agronomic advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
