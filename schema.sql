-- =========================================================================
-- ReviewVault / SaaS Multi-Tenant Database Schema (PostgreSQL / Supabase)
-- Phase 1 — Secure Multi-Tenant SaaS Foundation
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_type AS ENUM ('text', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    website_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Collection Forms Table
CREATE TABLE IF NOT EXISTS collection_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    public_slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL DEFAULT 'Share Your Experience',
    description TEXT DEFAULT 'Your feedback helps our community and team grow.',
    is_active BOOLEAN NOT NULL DEFAULT true,
    allow_video BOOLEAN NOT NULL DEFAULT true,
    settings JSONB DEFAULT '{"theme": "dark", "requireRating": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Reviews / Testimonials Table (Multi-tenant)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    collection_form_id UUID REFERENCES collection_forms(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    avatar_url TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    type review_type NOT NULL DEFAULT 'text',
    video_url TEXT,
    tags TEXT[] DEFAULT '{}',
    source VARCHAR(50) DEFAULT 'form',
    status review_status NOT NULL DEFAULT 'pending',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    consent BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_collection_forms_slug ON collection_forms(public_slug);
CREATE INDEX IF NOT EXISTS idx_collection_forms_project ON collection_forms(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_project ON reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — ZERO TRUST ARCHITECTURE
-- =========================================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- Workspaces Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view own workspaces"
ON workspaces FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own workspaces"
ON workspaces FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own workspaces"
ON workspaces FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own workspaces"
ON workspaces FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- -------------------------------------------------------------------------
-- Projects Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view projects in own workspace"
ON projects FOR SELECT
TO authenticated
USING (
    workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Users can insert projects in own workspace"
ON projects FOR INSERT
TO authenticated
WITH CHECK (
    workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Users can update projects in own workspace"
ON projects FOR UPDATE
TO authenticated
USING (
    workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
)
WITH CHECK (
    workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Users can delete projects in own workspace"
ON projects FOR DELETE
TO authenticated
USING (
    workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
);

-- Public can view active project basic info (for collection form branding)
CREATE POLICY "Public can view project for active collection form"
ON projects FOR SELECT
TO anon, authenticated
USING (
    id IN (SELECT project_id FROM collection_forms WHERE is_active = true)
);

-- -------------------------------------------------------------------------
-- Collection Forms Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can manage collection forms for own projects"
ON collection_forms FOR ALL
TO authenticated
USING (
    project_id IN (
        SELECT p.id FROM projects p
        JOIN workspaces w ON p.workspace_id = w.id
        WHERE w.owner_id = auth.uid()
    )
)
WITH CHECK (
    project_id IN (
        SELECT p.id FROM projects p
        JOIN workspaces w ON p.workspace_id = w.id
        WHERE w.owner_id = auth.uid()
    )
);

-- Public can view active collection forms by slug
CREATE POLICY "Public can view active collection forms"
ON collection_forms FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- -------------------------------------------------------------------------
-- Reviews / Testimonials Policies
-- -------------------------------------------------------------------------

-- 1. Owner full access to own project's reviews
CREATE POLICY "Workspace owners can manage reviews in their projects"
ON reviews FOR ALL
TO authenticated
USING (
    project_id IN (
        SELECT p.id FROM projects p
        JOIN workspaces w ON p.workspace_id = w.id
        WHERE w.owner_id = auth.uid()
    )
)
WITH CHECK (
    project_id IN (
        SELECT p.id FROM projects p
        JOIN workspaces w ON p.workspace_id = w.id
        WHERE w.owner_id = auth.uid()
    )
);

-- 2. Public submission: Anonymous users can INSERT a review only if status='pending' and consent=true
CREATE POLICY "Public can submit pending reviews to active projects"
ON reviews FOR INSERT
TO anon, authenticated
WITH CHECK (
    status = 'pending' 
    AND consent = true 
    AND is_featured = false
    AND project_id IN (
        SELECT project_id FROM collection_forms WHERE is_active = true
    )
);

-- 3. Public viewing: Only approved reviews can be viewed by public (widgets/wall of love)
CREATE POLICY "Public can view approved reviews"
ON reviews FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- Security Hardening: Revoke SELECT on private customer email from anon role
REVOKE SELECT ON reviews FROM anon;
GRANT SELECT (
    id, 
    project_id, 
    collection_form_id, 
    name, 
    role, 
    company, 
    avatar_url, 
    rating, 
    title, 
    content, 
    type, 
    video_url, 
    tags, 
    source, 
    status, 
    is_featured, 
    consent, 
    created_at, 
    updated_at
) ON reviews TO anon;


-- -------------------------------------------------------------------------
-- Helper Trigger for Automatic Initial Workspace and Project upon Signup
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
DECLARE
    new_workspace_id UUID;
    new_project_id UUID;
    user_prefix TEXT;
BEGIN
    user_prefix := SPLIT_PART(NEW.email, '@', 1);
    
    -- Create default workspace
    INSERT INTO public.workspaces (owner_id, name, slug)
    VALUES (NEW.id, 'My Workspace', user_prefix || '-ws-' || SUBSTRING(NEW.id::text, 1, 6))
    RETURNING id INTO new_workspace_id;

    -- Create default project
    INSERT INTO public.projects (workspace_id, name, slug)
    VALUES (new_workspace_id, 'Primary Project', user_prefix || '-project-' || SUBSTRING(NEW.id::text, 1, 6))
    RETURNING id INTO new_project_id;

    -- Create default collection form
    INSERT INTO public.collection_forms (project_id, public_slug, title)
    VALUES (new_project_id, user_prefix || '-feedback', 'Share Your Experience with Us');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();

-- -------------------------------------------------------------------------
-- Helper View for Public Widgets (stripping private emails)
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW public_approved_reviews AS
SELECT 
    id,
    project_id,
    name,
    role,
    company,
    avatar_url,
    rating,
    title,
    content,
    type,
    video_url,
    tags,
    is_featured,
    created_at
FROM reviews
WHERE status = 'approved';
