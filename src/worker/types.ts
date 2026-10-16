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
  // Razorpay subscription and one-time billing (India-first processor)
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  RAZORPAY_PLAN_MONTHLY?: string;
  RAZORPAY_PLAN_ANNUAL?: string;
  RAZORPAY_FOUNDING_AMOUNT?: string;
  // Stripe subscription billing (legacy fallback)
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
  // Cloudflare Turnstile Anti-Abuse CAPTCHA
  TURNSTILE_SECRET_KEY?: string;
  VITE_TURNSTILE_SITE_KEY?: string;
  // Admin / Superadmin authorization allowlist
  ADMIN_EMAILS?: string;
  VITE_SUPERADMIN_EMAILS?: string;
  // Cloudflare KV for distributed rate limiting across edge isolates
  RATE_LIMIT_KV?: KVNamespaceLike;
  // Supabase Database & Auth Service
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  // AI Sentiment & LLM Analysis
  GEMINI_API_KEY?: string;
  // WhatsApp Cloud API
  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
}

export interface KVNamespaceLike {
  get(key: string, options?: any): Promise<any>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
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
