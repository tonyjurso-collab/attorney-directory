-- Attorney Articles System Database Schema
-- This file contains the SQL schema for the attorney articles feature

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for articles
CREATE TYPE article_status AS ENUM ('draft', 'pending_review', 'published', 'rejected');
CREATE TYPE revision_type AS ENUM ('created', 'edited', 'admin_approved', 'admin_rejected');

-- Main articles table
CREATE TABLE public.attorney_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attorney_id UUID REFERENCES public.attorneys(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_description TEXT,
  status article_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  rejection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for articles and practice areas
CREATE TABLE public.article_practice_areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.attorney_articles(id) ON DELETE CASCADE NOT NULL,
  practice_area_id UUID REFERENCES public.practice_areas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, practice_area_id)
);

-- Tags table
CREATE TABLE public.article_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for articles and tags
CREATE TABLE public.article_tag_associations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.attorney_articles(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.article_tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, tag_id)
);

-- Revisions table for tracking edit history
CREATE TABLE public.article_revisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.attorney_articles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  revised_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  revision_type revision_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_attorney_articles_attorney_id ON public.attorney_articles(attorney_id);
CREATE INDEX idx_attorney_articles_status ON public.attorney_articles(status);
CREATE INDEX idx_attorney_articles_slug ON public.attorney_articles(slug);
CREATE INDEX idx_attorney_articles_published_at ON public.attorney_articles(published_at DESC);
CREATE INDEX idx_attorney_articles_created_at ON public.attorney_articles(created_at DESC);

CREATE INDEX idx_article_practice_areas_article_id ON public.article_practice_areas(article_id);
CREATE INDEX idx_article_practice_areas_practice_area_id ON public.article_practice_areas(practice_area_id);

CREATE INDEX idx_article_tag_associations_article_id ON public.article_tag_associations(article_id);
CREATE INDEX idx_article_tag_associations_tag_id ON public.article_tag_associations(tag_id);

CREATE INDEX idx_article_revisions_article_id ON public.article_revisions(article_id);
CREATE INDEX idx_article_tags_slug ON public.article_tags(slug);

-- Enable Row Level Security
ALTER TABLE public.attorney_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_practice_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tag_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attorney_articles
-- Attorneys can view their own articles (all statuses)
CREATE POLICY "Attorneys can view their own articles" ON public.attorney_articles
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.attorneys WHERE id = attorney_id)
  );

-- Anyone can view published articles
CREATE POLICY "Anyone can view published articles" ON public.attorney_articles
  FOR SELECT USING (status = 'published');

-- Admins can view all articles
CREATE POLICY "Admins can view all articles" ON public.attorney_articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Attorneys can create their own articles
CREATE POLICY "Attorneys can create their own articles" ON public.attorney_articles
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.attorneys WHERE id = attorney_id)
  );

-- Attorneys can update their own articles (when draft or rejected)
-- WITH CHECK allows status to change to 'pending_review'
CREATE POLICY "Attorneys can update their own articles" ON public.attorney_articles
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.attorneys WHERE id = attorney_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.attorneys WHERE id = attorney_id)
    AND (status IN ('draft', 'rejected', 'pending_review'))
  );

-- Admins can update all articles
CREATE POLICY "Admins can update all articles" ON public.attorney_articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Attorneys can delete their own draft articles
CREATE POLICY "Attorneys can delete their own draft articles" ON public.attorney_articles
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.attorneys WHERE id = attorney_id)
    AND status = 'draft'
  );

-- Admins can delete any article
CREATE POLICY "Admins can delete any article" ON public.attorney_articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for article_practice_areas
CREATE POLICY "Public read for article practice areas" ON public.article_practice_areas
  FOR SELECT USING (true);

CREATE POLICY "Attorneys can manage their article practice areas" ON public.article_practice_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.attorney_articles aa
      JOIN public.attorneys a ON a.id = aa.attorney_id
      WHERE aa.id = article_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage article practice areas" ON public.article_practice_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for article_tags
CREATE POLICY "Anyone can read article tags" ON public.article_tags
  FOR SELECT USING (true);

CREATE POLICY "Attorneys can create article tags" ON public.article_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'attorney'
    )
  );

CREATE POLICY "Admins can manage article tags" ON public.article_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for article_tag_associations
CREATE POLICY "Public read for article tag associations" ON public.article_tag_associations
  FOR SELECT USING (true);

CREATE POLICY "Attorneys can manage their article tag associations" ON public.article_tag_associations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.attorney_articles aa
      JOIN public.attorneys a ON a.id = aa.attorney_id
      WHERE aa.id = article_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage article tag associations" ON public.article_tag_associations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for article_revisions
CREATE POLICY "Attorneys can view their article revisions" ON public.article_revisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.attorney_articles aa
      JOIN public.attorneys a ON a.id = aa.attorney_id
      WHERE aa.id = article_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all article revisions" ON public.article_revisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Attorneys can insert revisions for their articles" ON public.article_revisions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attorney_articles aa
      JOIN public.attorneys a ON a.id = aa.attorney_id
      WHERE aa.id = article_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert all revisions" ON public.article_revisions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_attorney_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_attorney_articles_timestamp
  BEFORE UPDATE ON public.attorney_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_attorney_articles_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.attorney_articles IS 'Main table for attorney-authored articles';
COMMENT ON TABLE public.article_practice_areas IS 'Junction table linking articles to practice areas';
COMMENT ON TABLE public.article_tags IS 'Tags for categorizing articles';
COMMENT ON TABLE public.article_tag_associations IS 'Junction table linking articles to tags';
COMMENT ON TABLE public.article_revisions IS 'Historical record of article edits and status changes';

COMMENT ON COLUMN public.attorney_articles.status IS 'Article approval status: draft, pending_review, published, or rejected';
COMMENT ON COLUMN public.attorney_articles.published_at IS 'Timestamp when article was approved and published';
COMMENT ON COLUMN public.attorney_articles.rejection_reason IS 'Reason provided by admin when rejecting article';
