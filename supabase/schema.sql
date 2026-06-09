-- LocalSkill Platform - Supabase Database Schema
-- Run this SQL in Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: merchants
-- Stores merchant/business information
-- =====================================================
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '待解析',
    source_url TEXT,
    source_type TEXT CHECK (source_type IN ('meituan', 'dianping', 'amap', 'other')),
    category TEXT CHECK (category IN ('restaurant', 'retail', 'beauty', 'repair', 'other')) DEFAULT 'other',
    location_city TEXT,
    location_district TEXT,
    location_address TEXT,
    phone TEXT,
    rating NUMERIC(3, 2),
    avg_price INTEGER,
    business_hours JSONB DEFAULT '{}',
    raw_data JSONB DEFAULT '{}',
    verified_data JSONB DEFAULT '{}',
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'archived')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Indexes for merchants
CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id ON merchants(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_created_at ON merchants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchants_location_city ON merchants(location_city);
CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(category);

-- =====================================================
-- Table: skills
-- Stores published skill information
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_version TEXT DEFAULT '1.0.0',
    mcp_config JSONB DEFAULT '{}',
    capabilities JSONB DEFAULT '[]',
    visibility TEXT CHECK (visibility IN ('private', 'public')) DEFAULT 'public',
    github_repo TEXT,
    github_path TEXT,
    commit_sha TEXT,
    published_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for skills
CREATE INDEX IF NOT EXISTS idx_skills_merchant_id ON skills(merchant_id);
CREATE INDEX IF NOT EXISTS idx_skills_skill_name ON skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_skills_visibility ON skills(visibility);

-- =====================================================
-- Table: parse_tasks
-- Queue for URL/image parsing tasks
-- =====================================================
CREATE TABLE IF NOT EXISTS parse_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('url_parse', 'image_parse', 'refresh')),
    input_type TEXT NOT NULL CHECK (input_type IN ('url', 'text', 's3_path')),
    input_value TEXT NOT NULL,
    parse_result JSONB,
    error_info JSONB,
    status TEXT CHECK (status IN ('queued', 'running', 'completed', 'failed')) DEFAULT 'queued',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    priority INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cost_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for parse_tasks
CREATE INDEX IF NOT EXISTS idx_parse_tasks_status ON parse_tasks(status);
CREATE INDEX IF NOT EXISTS idx_parse_tasks_merchant_id ON parse_tasks(merchant_id);
CREATE INDEX IF NOT EXISTS idx_parse_tasks_priority ON parse_tasks(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_parse_tasks_created_at ON parse_tasks(created_at DESC);

-- =====================================================
-- Table: github_deployments
-- Tracks GitHub deployment history
-- =====================================================
CREATE TABLE IF NOT EXISTS github_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    repo_full_name TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    commit_sha TEXT,
    skill_path TEXT,
    status TEXT CHECK (status IN ('pending', 'pushing', 'succeeded', 'failed')) DEFAULT 'pending',
    gh_response JSONB,
    error_message TEXT,
    deployed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for github_deployments
CREATE INDEX IF NOT EXISTS idx_github_deployments_merchant_id ON github_deployments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_github_deployments_status ON github_deployments(status);
CREATE INDEX IF NOT EXISTS idx_github_deployments_repo ON github_deployments(repo_full_name);

-- =====================================================
-- Table: stats_daily
-- Daily aggregated statistics
-- =====================================================
CREATE TABLE IF NOT EXISTS stats_daily (
    stat_date DATE PRIMARY KEY,
    new_merchants INTEGER DEFAULT 0,
    new_skills INTEGER DEFAULT 0,
    parse_success INTEGER DEFAULT 0,
    parse_failed INTEGER DEFAULT 0,
    github_pushes INTEGER DEFAULT 0,
    total_queries INTEGER DEFAULT 0,
    avg_parse_time_ms INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE parse_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_deployments ENABLE ROW LEVEL SECURITY;

-- Merchants: Users can only see their own merchants
CREATE POLICY "Users can view their own merchants"
    ON merchants FOR SELECT
    USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert their own merchants"
    ON merchants FOR INSERT
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own merchants"
    ON merchants FOR UPDATE
    USING (auth_user_id = auth.uid());

-- Skills: Public read, authenticated write
CREATE POLICY "Anyone can view public skills"
    ON skills FOR SELECT
    USING (visibility = 'public' OR EXISTS (
        SELECT 1 FROM merchants WHERE id = skills.merchant_id AND auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can insert skills for their merchants"
    ON skills FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM merchants WHERE id = merchant_id AND auth_user_id = auth.uid()
    ));

-- Parse tasks: Users can only see tasks for their merchants
CREATE POLICY "Users can view tasks for their merchants"
    ON parse_tasks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM merchants WHERE id = parse_tasks.merchant_id AND auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can create tasks for their merchants"
    ON parse_tasks FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM merchants WHERE id = merchant_id AND auth_user_id = auth.uid()
    ));

-- =====================================================
-- Functions
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stats_daily_updated_at
    BEFORE UPDATE ON stats_daily
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT ALL ON merchants TO anon, authenticated;
GRANT ALL ON skills TO anon, authenticated;
GRANT ALL ON parse_tasks TO anon, authenticated;
GRANT ALL ON github_deployments TO anon, authenticated;
GRANT ALL ON stats_daily TO anon, authenticated;

-- Grant sequence permissions (for UUID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
