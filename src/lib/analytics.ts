/**
 * Safe, privacy-preserving Google Analytics 4 utility.
 *
 * Enforces:
 * - Production-safe: Operates as a pure no-op if VITE_GA_MEASUREMENT_ID is not configured.
 * - Zero PII: Does NOT send emails, review content, internal IDs, or sensitive customer data.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let isInitialized = false;

export function initAnalytics() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || isInitialized) {
    return;
  }

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: false, // Managed manually via trackPageView
    });

    isInitialized = true;
  } catch (err) {
    console.warn('[Analytics] Failed to initialize Google Analytics:', err);
  }
}

export function trackPageView(pagePath: string) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  try {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
    });
  } catch (e) {
    // Silent fail
  }
}

export function trackEvent(eventName: string, params: Record<string, string | number | boolean> = {}) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  try {
    window.gtag('event', eventName, params);
  } catch (e) {
    // Silent fail
  }
}

// Predefined privacy-safe high-level event helpers
export const analytics = {
  landingPageVisit: () => trackEvent('landing_page_visit'),
  ctaClicked: (ctaName: string, destination: string) =>
    trackEvent('cta_clicked', { cta_name: ctaName, destination }),
  signupStarted: (source: string = 'landing_cta') =>
    trackEvent('signup_started', { source }),
  signupCompleted: () =>
    trackEvent('signup_completed'),
  collectionCreated: () =>
    trackEvent('collection_created'),
  publicCollectionSubmitted: () =>
    trackEvent('public_collection_submitted'),
  widgetPageViewed: () =>
    trackEvent('widget_page_viewed'),
};
