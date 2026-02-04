-- Simple schema for Lark MVP
-- Run this in Supabase SQL Editor FIRST

-- Company settings (no auth required for MVP)
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_description TEXT,
  competitors TEXT[] DEFAULT '{}',
  search_terms TEXT[] DEFAULT '{}',
  subreddits TEXT[] DEFAULT '{}',
  twitter_keywords TEXT[] DEFAULT '{}',
  enabled_sources TEXT[] DEFAULT '{}',
  selected_integrations TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback items (collected from sources)
CREATE TABLE IF NOT EXISTS public.collected_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  title TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  author TEXT,
  sentiment TEXT,
  category TEXT,
  priority TEXT,
  priority_score INTEGER,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline results (clusters and insights)
CREATE TABLE IF NOT EXISTS public.pipeline_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  clusters JSONB NOT NULL,
  stats JSONB,
  insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets created
CREATE TABLE IF NOT EXISTS public.created_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_id TEXT,
  external_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'created',
  feedback_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public access for MVP (REMOVE IN PRODUCTION)
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collected_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.created_tickets ENABLE ROW LEVEL SECURITY;

-- Public access policies (REMOVE IN PRODUCTION)
CREATE POLICY "Allow all access to company_settings" ON public.company_settings FOR ALL USING (true);
CREATE POLICY "Allow all access to collected_feedback" ON public.collected_feedback FOR ALL USING (true);
CREATE POLICY "Allow all access to pipeline_results" ON public.pipeline_results FOR ALL USING (true);
CREATE POLICY "Allow all access to created_tickets" ON public.created_tickets FOR ALL USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_settings_timestamp
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
