-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------
-- 1. BAND APPLICATIONS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS band_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, needs_changes
    band_name TEXT NOT NULL,
    genre TEXT NOT NULL,
    custom_genre TEXT,
    home_city TEXT NOT NULL,
    formed_year INTEGER,
    bio TEXT NOT NULL,
    banner_image TEXT NOT NULL, -- Stored as Base64 string for easy local/env setup
    profile_image TEXT NOT NULL, -- Stored as Base64 string
    tagline TEXT,
    languages TEXT,
    original_covers TEXT DEFAULT 'Originals', -- Originals, Covers, Both
    mission TEXT,
    influences TEXT,
    musical_style TEXT,
    achievements TEXT,
    performance_photos JSONB DEFAULT '[]'::jsonb, -- Array of Base64 strings
    members JSONB DEFAULT '[]'::jsonb, -- Array of { name, role, photo, instagram, experience }
    instagram_url TEXT NOT NULL,
    youtube_url TEXT,
    spotify_url TEXT,
    saavn_url TEXT,
    apple_url TEXT,
    website_url TEXT,
    demo_track TEXT, -- Stored as Base64 audio/link
    stage_rider TEXT, -- Stage rider specs/base64
    technical_requirements TEXT,
    preferred_cities TEXT,
    fee_range TEXT,
    availability_calendar JSONB DEFAULT '[]'::jsonb,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    manager_name TEXT
);

-- Set up Row Level Security (RLS) for bands
ALTER TABLE band_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to approved bands" ON band_applications;
CREATE POLICY "Allow public read access to approved bands" ON band_applications FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Allow public insert for applying" ON band_applications;
CREATE POLICY "Allow public insert for applying" ON band_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON band_applications;
CREATE POLICY "Allow all access to authenticated users" ON band_applications FOR ALL USING (true) WITH CHECK (true);


-- --------------------------------------------------
-- 2. VENUE APPLICATIONS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS venue_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, needs_changes
    venue_name TEXT NOT NULL,
    address TEXT NOT NULL,
    maps_link TEXT,
    owner_name TEXT NOT NULL,
    type TEXT NOT NULL, -- cafe, pub, restaurant, college, open-air, indoor
    capacity TEXT NOT NULL,
    stage_size TEXT,
    facilities JSONB DEFAULT '{}'::jsonb, -- parking, green room, lighting, sound, power, food, bar
    images JSONB DEFAULT '[]'::jsonb, -- Array of Base64 images
    availability JSONB DEFAULT '[]'::jsonb, -- Days, preferred genres
    pricing TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL
);

ALTER TABLE venue_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to approved venues" ON venue_applications;
CREATE POLICY "Allow public read access to approved venues" ON venue_applications FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Allow public insert for applying venues" ON venue_applications;
CREATE POLICY "Allow public insert for applying venues" ON venue_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access to authenticated users venues" ON venue_applications;
CREATE POLICY "Allow all access to authenticated users venues" ON venue_applications FOR ALL USING (true) WITH CHECK (true);


-- --------------------------------------------------
-- 3. PRODUCTION HOUSE APPLICATIONS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS production_house_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, needs_changes
    company_name TEXT NOT NULL,
    logo_image TEXT,
    banner_image TEXT,
    company_profile TEXT NOT NULL,
    genres_of_interest JSONB DEFAULT '[]'::jsonb,
    investment_capacity TEXT,
    past_artists JSONB DEFAULT '[]'::jsonb,
    portfolio_links JSONB DEFAULT '[]'::jsonb,
    website_url TEXT,
    instagram_url TEXT,
    cities_of_operation TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL
);

ALTER TABLE production_house_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to approved production_houses" ON production_house_applications;
CREATE POLICY "Allow public read access to approved production_houses" ON production_house_applications FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Allow public insert for production_houses" ON production_house_applications;
CREATE POLICY "Allow public insert for production_houses" ON production_house_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access to authenticated users production_houses" ON production_house_applications;
CREATE POLICY "Allow all access to authenticated users production_houses" ON production_house_applications FOR ALL USING (true) WITH CHECK (true);


-- --------------------------------------------------
-- 4. SPONSOR APPLICATIONS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS sponsor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'pending',
    company_name TEXT NOT NULL,
    industry TEXT,
    budget_range TEXT,
    campaign_goals TEXT,
    preferred_audience TEXT,
    preferred_cities JSONB DEFAULT '[]'::jsonb,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL
);

ALTER TABLE sponsor_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert for sponsors" ON sponsor_applications;
CREATE POLICY "Allow public insert for sponsors" ON sponsor_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access to authenticated users sponsors" ON sponsor_applications;
CREATE POLICY "Allow all access to authenticated users sponsors" ON sponsor_applications FOR ALL USING (true) WITH CHECK (true);


-- --------------------------------------------------
-- 5. INFLUENCER APPLICATIONS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS influencer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'pending',
    name TEXT NOT NULL,
    instagram_handle TEXT NOT NULL,
    follower_count TEXT NOT NULL,
    engagement_rate TEXT,
    category TEXT,
    audience_demographics TEXT,
    past_campaigns TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL
);

ALTER TABLE influencer_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert for influencers" ON influencer_applications;
CREATE POLICY "Allow public insert for influencers" ON influencer_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access to authenticated users influencers" ON influencer_applications;
CREATE POLICY "Allow all access to authenticated users influencers" ON influencer_applications FOR ALL USING (true) WITH CHECK (true);


-- --------------------------------------------------
-- 6. VOLUNTEER APPLICATIONS TABLE (Also for creative partners)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'pending',
    name TEXT NOT NULL,
    role_type TEXT NOT NULL, -- volunteer, producer, videographer, photographer, podcast, college
    skills TEXT,
    city TEXT NOT NULL,
    availability TEXT,
    experience TEXT,
    interests TEXT,
    photo TEXT, -- Base64
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL
);

ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert for volunteers" ON volunteer_applications;
CREATE POLICY "Allow public insert for volunteers" ON volunteer_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access to authenticated users volunteers" ON volunteer_applications;
CREATE POLICY "Allow all access to authenticated users volunteers" ON volunteer_applications FOR ALL USING (true) WITH CHECK (true);


-- --------------------------------------------------
-- 7. EVENT MANAGER APPLICATIONS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS event_manager_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'pending',
    company_name TEXT NOT NULL,
    cities JSONB DEFAULT '[]'::jsonb,
    past_events TEXT,
    team_size TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL
);

ALTER TABLE event_manager_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert for event_managers" ON event_manager_applications;
CREATE POLICY "Allow public insert for event_managers" ON event_manager_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access to authenticated users event_managers" ON event_manager_applications;
CREATE POLICY "Allow all access to authenticated users event_managers" ON event_manager_applications FOR ALL USING (true) WITH CHECK (true);


-- --------------------------------------------------
-- 8. LEAGUE STATS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS league_stats (
    id TEXT PRIMARY KEY DEFAULT 'current_season',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    total_shows TEXT NOT NULL DEFAULT '0',
    bands TEXT NOT NULL DEFAULT '0',
    cities TEXT NOT NULL DEFAULT '0',
    attendance TEXT NOT NULL DEFAULT '0',
    revenue TEXT NOT NULL DEFAULT '0',
    streaming TEXT NOT NULL DEFAULT '0',
    followers TEXT NOT NULL DEFAULT '0'
);

ALTER TABLE league_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to league_stats" ON league_stats;
CREATE POLICY "Allow public read access to league_stats" ON league_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin all access to league_stats" ON league_stats;
CREATE POLICY "Allow admin all access to league_stats" ON league_stats FOR ALL USING (true) WITH CHECK (true);

-- Insert default stats row
INSERT INTO league_stats (id, total_shows, bands, cities, attendance, revenue, streaming, followers)
VALUES ('current_season', '512', '1,248', '56', '2.3M+', '₹12.7Cr', '8.9M+', '1.6M+')
ON CONFLICT (id) DO NOTHING;
