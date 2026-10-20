-- =========================================================================
-- PandaPraise 2.0: Radar & Lead Poacher Database Schema
-- Provides storage for tracked brands, competitor monitors, and auto-scraped signals
-- =========================================================================

-- 1. Projects Table (Brand Monitoring & Hosted Deal-Closer Vaults)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  brand_name TEXT NOT NULL,
  brand_slug TEXT NOT NULL UNIQUE,
  competitors TEXT[] NOT NULL DEFAULT '{}',
  alert_email TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Chat on WhatsApp / Get Started',
  cta_url TEXT NOT NULL DEFAULT 'https://wa.me/',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_brand_slug ON public.projects(brand_slug);

-- 2. Mentions Table (Social Signals & Poachable Leads)
CREATE TABLE IF NOT EXISTS public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  target_keyword TEXT NOT NULL,
  is_competitor BOOLEAN NOT NULL DEFAULT false,
  author TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  source_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('PRAISE', 'POACHABLE_LEAD', 'FIRE_ALERT', 'NOISE')),
  urgency_score INTEGER NOT NULL DEFAULT 5 CHECK (urgency_score >= 1 AND urgency_score <= 10),
  clean_quote TEXT,
  ai_poach_reply TEXT,
  is_published_to_wall BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deduplication index across scraper runs
CREATE UNIQUE INDEX IF NOT EXISTS idx_mentions_external_id ON public.mentions(external_id);

-- Performance indexes for public deal-closer vaults and category filtering
CREATE INDEX IF NOT EXISTS idx_mentions_project_published ON public.mentions(project_id, is_published_to_wall);
CREATE INDEX IF NOT EXISTS idx_mentions_category ON public.mentions(category);
CREATE INDEX IF NOT EXISTS idx_mentions_created_at ON public.mentions(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

-- Allow public read of projects for hosted vault rendering at /p/:slug
CREATE POLICY "Public read projects for hosted vaults"
  ON public.projects FOR SELECT
  USING (true);

-- Allow public read of published mentions for /p/:slug
CREATE POLICY "Public read published mentions"
  ON public.mentions FOR SELECT
  USING (is_published_to_wall = true);

-- Service role full access
CREATE POLICY "Service role full access projects"
  ON public.projects FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access mentions"
  ON public.mentions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
