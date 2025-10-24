-- Attorney Directory Database Schema
-- This file contains the SQL schema for the attorney directory platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE membership_tier AS ENUM ('free', 'standard', 'exclusive');
CREATE TYPE user_role AS ENUM ('attorney', 'admin');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'closed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'attorney',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attorneys table
CREATE TABLE public.attorneys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  firm_name TEXT,
  bio TEXT,
  experience_years INTEGER,
  phone TEXT,
  email TEXT,
  website TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  location POINT, -- PostGIS point for geospatial queries
  profile_image_url TEXT,
  firm_logo_url TEXT,
  membership_tier membership_tier DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice areas table
CREATE TABLE public.practice_areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attorney practice areas junction table
CREATE TABLE public.attorney_practice_areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attorney_id UUID REFERENCES public.attorneys(id) ON DELETE CASCADE,
  practice_area_id UUID REFERENCES public.practice_areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attorney_id, practice_area_id)
);

-- Leads table
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attorney_id UUID REFERENCES public.attorneys(id) ON DELETE SET NULL,
  practice_area_id UUID REFERENCES public.practice_areas(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  zip_code TEXT,
  case_description TEXT,
  case_value DECIMAL(12,2),
  urgency TEXT,
  status lead_status DEFAULT 'new',
  source TEXT DEFAULT 'website', -- website, chatbot, referral, etc.
  leadprosper_lead_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table (for future implementation)
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attorney_id UUID REFERENCES public.attorneys(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_attorneys_location ON public.attorneys USING GIST (location);
CREATE INDEX idx_attorneys_membership_tier ON public.attorneys (membership_tier);
CREATE INDEX idx_attorneys_city_state ON public.attorneys (city, state);
CREATE INDEX idx_attorneys_is_active ON public.attorneys (is_active);
CREATE INDEX idx_leads_attorney_id ON public.leads (attorney_id);
CREATE INDEX idx_leads_created_at ON public.leads (created_at);
CREATE INDEX idx_attorney_practice_areas_attorney_id ON public.attorney_practice_areas (attorney_id);
CREATE INDEX idx_attorney_practice_areas_practice_area_id ON public.attorney_practice_areas (practice_area_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attorneys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Attorneys policies
CREATE POLICY "Anyone can view active attorneys" ON public.attorneys
  FOR SELECT USING (is_active = true);

CREATE POLICY "Attorneys can view their own profile" ON public.attorneys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Attorneys can update their own profile" ON public.attorneys
  FOR UPDATE USING (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Attorneys can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.attorneys WHERE id = attorney_id));

-- Reviews policies
CREATE POLICY "Anyone can view public reviews" ON public.reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Attorneys can view their own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.attorneys WHERE id = attorney_id));

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attorneys_updated_at BEFORE UPDATE ON public.attorneys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default practice areas
INSERT INTO public.practice_areas (name, description, slug) VALUES
('Personal Injury', 'Legal representation for accidents and injuries', 'personal-injury'),
('Family Law', 'Divorce, custody, and family-related legal matters', 'family-law'),
('Criminal Defense', 'Defense against criminal charges', 'criminal-defense'),
('Business Law', 'Corporate and business legal services', 'business-law'),
('Real Estate Law', 'Property transactions and real estate disputes', 'real-estate-law'),
('Estate Planning', 'Wills, trusts, and estate administration', 'estate-planning'),
('Immigration Law', 'Immigration and naturalization services', 'immigration-law'),
('Employment Law', 'Workplace disputes and employment issues', 'employment-law'),
('Bankruptcy', 'Debt relief and bankruptcy proceedings', 'bankruptcy'),
('DUI/DWI Defense', 'Driving under the influence defense', 'dui-defense');
