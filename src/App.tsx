import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { initAnalytics, trackPageView } from './lib/analytics';
import { CookieConsentBanner } from './components/CookieConsentBanner';

import { LandingPage } from './pages/LandingPage';
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = React.lazy(() => import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const PublicCollectorPage = React.lazy(() => import('./pages/PublicCollectorPage').then((m) => ({ default: m.PublicCollectorPage })));
const PublicWidgetPage = React.lazy(() => import('./pages/PublicWidgetPage').then((m) => ({ default: m.PublicWidgetPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const RefundPolicyPage = React.lazy(() => import('./pages/RefundPolicyPage').then((m) => ({ default: m.RefundPolicyPage })));
const CookiePolicyPage = React.lazy(() => import('./pages/CookiePolicyPage').then((m) => ({ default: m.CookiePolicyPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const OnboardingUpgradePage = React.lazy(() => import('./pages/OnboardingUpgradePage').then((m) => ({ default: m.OnboardingUpgradePage })));
const PricingPage = React.lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const HostedProofVaultPage = React.lazy(() => import('./pages/HostedProofVaultPage').then((m) => ({ default: m.HostedProofVaultPage })));
const WallOfLovePage = React.lazy(() => import('./pages/WallOfLovePage').then((m) => ({ default: m.WallOfLovePage })));
const ViralActivationPage = React.lazy(() => import('./pages/ViralActivationPage').then((m) => ({ default: m.ViralActivationPage })));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ReferralRedirectPage = React.lazy(() => import('./pages/ReferralRedirectPage').then((m) => ({ default: m.ReferralRedirectPage })));
const AlternativePage = React.lazy(() => import('./pages/AlternativePage').then((m) => ({ default: m.AlternativePage })));
const UseCasePage = React.lazy(() => import('./pages/UseCasePage').then((m) => ({ default: m.UseCasePage })));
const AffiliatePage = React.lazy(() => import('./pages/AffiliatePage').then((m) => ({ default: m.AffiliatePage })));
const DeveloperDocsPage = React.lazy(() => import('./pages/DeveloperDocsPage').then((m) => ({ default: m.DeveloperDocsPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const ProspectResearchPage = React.lazy(() => import('./features/prospectResearch/ProspectResearchPage').then((m) => ({ default: m.ProspectResearchPage })));
const BillingAndPlansPage = React.lazy(() => import('./pages/BillingAndPlansPage').then((m) => ({ default: m.BillingAndPlansPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const RoadmapPage = React.lazy(() => import('./pages/RoadmapPage').then((m) => ({ default: m.RoadmapPage })));
const BlogPage = React.lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const WhatsAppShopifyOnboardingPage = React.lazy(() => import('./pages/WhatsAppShopifyOnboardingPage').then((m) => ({ default: m.WhatsAppShopifyOnboardingPage })));
const VideoCollectionDashboardPage = React.lazy(() => import('./pages/VideoCollectionDashboardPage').then((m) => ({ default: m.VideoCollectionDashboardPage })));
const MetaAdsLibraryPage = React.lazy(() => import('./pages/MetaAdsLibraryPage').then((m) => ({ default: m.MetaAdsLibraryPage })));
const VideoStudioPage = React.lazy(() => import('./pages/VideoStudioPage').then((m) => ({ default: m.VideoStudioPage })));
const ReviewToMetaAdsStudioPage = React.lazy(() => import('./pages/ReviewToMetaAdsStudioPage').then((m) => ({ default: m.ReviewToMetaAdsStudioPage })));
const AccessSystemPage = React.lazy(() => import('./pages/AccessSystemPage'));


const AppLayout = React.lazy(() => import('./components/layouts/AppLayout'));
import { SuperadminGuard } from './components/auth/SuperadminGuard';
import { captureReferralCode } from './lib/referral';

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
    if (location.search) {
      captureReferralCode(location.search);
    }
  }, [location.pathname, location.search]);

  return null;
}

import ScrollToTop from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AnalyticsRouteTracker />
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/r/:code" element={<ReferralRedirectPage />} />
            <Route path="/alternatives/:slug" element={<AlternativePage />} />
            <Route path="/best-:slug-testimonial-tools" element={<UseCasePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/affiliates" element={<AffiliatePage />} />
            <Route path="/partner" element={<AffiliatePage />} />
            <Route path="/partners" element={<AffiliatePage />} />
            <Route path="/developers" element={<DeveloperDocsPage />} />
            <Route path="/api-docs" element={<DeveloperDocsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contact-us" element={<ContactPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/refunds" element={<RefundPolicyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/c/:collectionSlug" element={<PublicCollectorPage />} />
            <Route path="/p/:slug" element={<HostedProofVaultPage />} />
            <Route path="/w/:publicWidgetId" element={<PublicWidgetPage />} />
            <Route path="/wall" element={<WallOfLovePage />} />
            <Route path="/love/:slug" element={<WallOfLovePage />} />
            <Route path="/wall-of-love" element={<WallOfLovePage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/action" element={<VerifyEmailPage />} />
            <Route path="/__/auth/action" element={<VerifyEmailPage />} />
            <Route path="/access-system" element={<AccessSystemPage />} />
            <Route path="/auth-system" element={<AccessSystemPage />} />

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
              path="/dashboard/connect"
              element={
                <ProtectedRoute>
                  <WhatsAppShopifyOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/whatsapp-api"
              element={<WhatsAppShopifyOnboardingPage />}
            />
            <Route
              path="/step-1"
              element={<WhatsAppShopifyOnboardingPage />}
            />
            <Route
              path="/dashboard/collection"
              element={
                <ProtectedRoute>
                  <VideoCollectionDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/studio"
              element={
                <ProtectedRoute>
                  <VideoStudioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ads"
              element={
                <ProtectedRoute>
                  <MetaAdsLibraryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review-to-meta-ads"
              element={
                <ProtectedRoute>
                  <ReviewToMetaAdsStudioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/studio"
              element={
                <ProtectedRoute>
                  <ReviewToMetaAdsStudioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/legacy"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <VideoCollectionDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/merchant"
              element={
                <ProtectedRoute>
                  <VideoCollectionDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <VideoCollectionDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/proof"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <BillingAndPlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plans"
              element={
                <ProtectedRoute>
                  <BillingAndPlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing-and-plans"
              element={
                <ProtectedRoute>
                  <BillingAndPlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <SuperadminGuard>
                  <AdminPage />
                </SuperadminGuard>
              }
            />
            <Route
              path="/admin/prospect-research"
              element={
                <SuperadminGuard>
                  <ProspectResearchPage />
                </SuperadminGuard>
              }
            />

            {/* Custom Branded 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <CookieConsentBanner />
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
);
}

export default App;
