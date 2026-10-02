import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { initAnalytics, trackPageView } from './lib/analytics';

// Lazy-loaded routes for ultra-fast initial page loads and zero bundle bloat
const LandingPage = React.lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = React.lazy(() => import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const PublicCollectorPage = React.lazy(() => import('./pages/PublicCollectorPage').then((m) => ({ default: m.PublicCollectorPage })));
const PublicWidgetPage = React.lazy(() => import('./pages/PublicWidgetPage').then((m) => ({ default: m.PublicWidgetPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const OnboardingUpgradePage = React.lazy(() => import('./pages/OnboardingUpgradePage').then((m) => ({ default: m.OnboardingUpgradePage })));
const PricingPage = React.lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const WallOfLovePage = React.lazy(() => import('./pages/WallOfLovePage').then((m) => ({ default: m.WallOfLovePage })));
const ViralActivationPage = React.lazy(() => import('./pages/ViralActivationPage').then((m) => ({ default: m.ViralActivationPage })));

/**
 * Ultra-lightweight route loading fallback
 */
function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/60 font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-[#6701e6] animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Loading Panda Praise...</span>
      </div>
    </div>
  );
}

/**
 * Route listener to track high-level page views in analytics (if configured)
 */
function AnalyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

export function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AnalyticsRouteTracker />
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/c/:collectionSlug" element={<PublicCollectorPage />} />
            <Route path="/w/:publicWidgetId" element={<PublicWidgetPage />} />
            <Route path="/love/:slug" element={<WallOfLovePage />} />
            <Route path="/wall-of-love" element={<WallOfLovePage />} />

            {/* Protected Routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/upgrade"
              element={
                <ProtectedRoute>
                  <OnboardingUpgradePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ready"
              element={
                <ProtectedRoute>
                  <ViralActivationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activate"
              element={
                <ProtectedRoute>
                  <ViralActivationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Custom Branded 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
