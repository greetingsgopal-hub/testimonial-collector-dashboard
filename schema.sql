-- =========================================================================
-- ReviewVault / Testimonial Collector Database Schema (PostgreSQL / Supabase)
-- =========================================================================
-- How to use:
-- 1. Create a project on Supabase (https://supabase.com) or any PostgreSQL provider.
-- 2. Open the SQL Editor and run this entire script.
-- 3. Copy your project URL & anon public key into .env or Netlify Environment Variables:
--    VITE_SUPABASE_URL=https://your-project-ref.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-public-key
-- =========================================================================

-- Create enum for review status
DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for review type
DO $$ BEGIN
    CREATE TYPE review_type AS ENUM ('text', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_featured ON reviews(is_featured);

-- Row Level Security (RLS) policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can submit a review (INSERT permission for anon / public)
CREATE POLICY "Public can submit reviews" 
ON reviews FOR INSERT 
TO anon, authenticated
WITH CHECK (status = 'pending' AND consent = true);

-- 2. Public can view approved reviews (for embed widgets and wall of love)
CREATE POLICY "Public can view approved reviews" 
ON reviews FOR SELECT 
TO anon, authenticated 
USING (status = 'approved');

-- 3. Authenticated administrators can perform all actions
CREATE POLICY "Admins have full access" 
ON reviews FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_modtime
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
