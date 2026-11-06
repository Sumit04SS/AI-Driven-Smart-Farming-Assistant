import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PublicRoute } from './components/layout/PublicRoute';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdvisorPage } from './pages/AdvisorPage';
import { CropRecommendationPage } from './pages/CropRecommendationPage';
import { SoilAdvisoryPage } from './pages/SoilAdvisoryPage';
import { FarmAdvisorPage } from './pages/FarmAdvisorPage';
import { WeatherPage } from './pages/WeatherPage';
import { MarketPricesPage } from './pages/MarketPricesPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { ProfilePage } from './pages/ProfilePage';
import { MultilingualAdvisorPage } from './pages/MultilingualAdvisorPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
            <OfflineIndicator />
            <Navbar />
            <main className="flex-1 max-w-7xl 2xl:max-w-360 w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6 sm:py-8 transition-all">
              <Routes>

                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/weather" element={<WeatherPage />} />

                {/* Authentication Only for Guests */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Protected Farmer Pages */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/multilingual" element={<MultilingualAdvisorPage />} />
                  <Route path="/advisor" element={<AdvisorPage />} />
                  <Route path="/crop-recommendation" element={<CropRecommendationPage />} />
                  <Route path="/soil-advisory" element={<SoilAdvisoryPage />} />
                  <Route path="/farm-advisor" element={<FarmAdvisorPage />} />
                  <Route path="/market" element={<MarketPricesPage />} />
                  <Route path="/equipment" element={<EquipmentPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>


                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
