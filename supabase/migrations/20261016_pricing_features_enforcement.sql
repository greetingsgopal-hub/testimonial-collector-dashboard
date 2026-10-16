-- =========================================================================
-- PandaPraise: Production Tier Enforcement & Quota Migration
-- Enforces hard limits for Starter, Pro, Agency, and Lifetime plans
-- =========================================================================

-- 1. Upgrade Workspaces Table with Real Feature Columns
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'agency', 'lifetime')),
  ADD COLUMN IF NOT EXISTS remove_branding BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_subdomain TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS custom_css TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ai_shield_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE DEFAULT ('pp_live_' || encode(gen_random_bytes(18), 'hex')),
  ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- 2. Upgrade Testimonials Table with AI Sentiment & Spam Shield Columns
-- Ensure testimonials table exists
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_company TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  media_type TEXT NOT NULL DEFAULT 'text' CHECK (media_type IN ('text', 'video', 'audio')),
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_spam BOOLEAN NOT NULL DEFAULT false,
  ai_sentiment_score NUMERIC(4,2) DEFAULT 1.00,
  ai_sentiment_label TEXT DEFAULT 'positive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'text' CHECK (media_type IN ('text', 'video', 'audio')),
  ADD COLUMN IF NOT EXISTS ai_sentiment_score NUMERIC(4,2) DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS ai_sentiment_label TEXT DEFAULT 'positive',
  ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT false;

-- 3. Create Automated Email & WhatsApp Drips Queue Table
CREATE TABLE IF NOT EXISTS public.drip_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. HARD DATABASE TRIGGER: Enforce 10 Text & 2 Video/Audio Proof Limits on Starter Plan
CREATE OR REPLACE FUNCTION public.enforce_testimonial_plan_quotas()
RETURNS TRIGGER AS $$
DECLARE
  ws_plan TEXT;
  current_text_count INT;
  current_media_count INT;
BEGIN
  SELECT plan INTO ws_plan FROM public.workspaces WHERE id = NEW.workspace_id;

  IF ws_plan = 'starter' THEN
    IF NEW.media_type = 'text' THEN
      SELECT COUNT(*) INTO current_text_count
      FROM public.testimonials
      WHERE workspace_id = NEW.workspace_id AND media_type = 'text';

      IF current_text_count >= 10 THEN
        RAISE EXCEPTION 'QUOTA_EXCEEDED: Starter plan is limited to 10 text testimonials. Upgrade to Pro for unlimited proofs.';
      END IF;
    ELSE
      SELECT COUNT(*) INTO current_media_count
      FROM public.testimonials
      WHERE workspace_id = NEW.workspace_id AND media_type IN ('video', 'audio');

      IF current_media_count >= 2 THEN
        RAISE EXCEPTION 'QUOTA_EXCEEDED: Starter plan is limited to 2 video/audio testimonials. Upgrade to Pro for unlimited proofs.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_testimonial_quotas ON public.testimonials;
CREATE TRIGGER trg_enforce_testimonial_quotas
  BEFORE INSERT ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.enforce_testimonial_plan_quotas();

-- 5. HARD DATABASE TRIGGER: Enforce Workspace Count Limits (1 for Starter/Pro, 5 for Agency)
CREATE OR REPLACE FUNCTION public.enforce_workspace_count_limit()
RETURNS TRIGGER AS $$
DECLARE
  existing_count INT;
  highest_plan TEXT;
BEGIN
  SELECT COUNT(*) INTO existing_count FROM public.workspaces WHERE owner_id = NEW.owner_id;

  SELECT plan INTO highest_plan
  FROM public.workspaces
  WHERE owner_id = NEW.owner_id
  ORDER BY CASE plan
    WHEN 'agency' THEN 3
    WHEN 'lifetime' THEN 2
    WHEN 'pro' THEN 1
    ELSE 0
  END DESC
  LIMIT 1;

  IF COALESCE(highest_plan, 'starter') IN ('starter', 'pro') AND existing_count >= 1 THEN
    RAISE EXCEPTION 'WORKSPACE_LIMIT_REACHED: Your current plan allows 1 workspace. Upgrade to Agency for up to 5 dedicated workspaces.';
  ELSIF highest_plan = 'lifetime' AND existing_count >= 3 THEN
    RAISE EXCEPTION 'WORKSPACE_LIMIT_REACHED: Founding Member Lifetime Pass allows up to 3 workspaces.';
  ELSIF highest_plan = 'agency' AND existing_count >= 5 THEN
    RAISE EXCEPTION 'WORKSPACE_LIMIT_REACHED: Agency plan allows up to 5 dedicated workspaces.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_workspace_limit ON public.workspaces;
CREATE TRIGGER trg_enforce_workspace_limit
  BEFORE INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.enforce_workspace_count_limit();
