export interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface WorkerEnv {
  ASSETS: Fetcher;
  FIREBASE_API_KEY?: string;
  VITE_FIREBASE_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  LINKEDIN_REDIRECT_URI?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
  GOOGLE_PLACES_API_KEY?: string;
  META_APP_ID?: string;
  META_APP_SECRET?: string;
  INSTAGRAM_REDIRECT_URI?: string;
  FACEBOOK_REDIRECT_URI?: string;
  META_WEBHOOK_VERIFY_TOKEN?: string;
  APP_ENCRYPTION_KEY?: string;
  APP_ENCRYPTION_KEY_PREVIOUS?: string;
  FIREBASE_SERVICE_ACCOUNT_KEY?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  NODE_ENV?: string;
  // Stripe subscription billing
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_SUBSCRIPTION_MONTHLY?: string;
  STRIPE_PRICE_SUBSCRIPTION_ANNUAL?: string;
  STRIPE_PRICE_FOUNDING_LIFETIME?: string;
  // Automated Review Request Drip Campaigns
  CAMPAIGN_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_WHATSAPP_NUMBER?: string;
}

export interface ScheduledEvent {
  cron: string;
  type: string;
  scheduledTime: number;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}
