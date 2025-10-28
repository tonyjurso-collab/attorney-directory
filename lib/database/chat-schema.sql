-- Chat System Tables for Supabase
-- Add these tables to your existing Supabase database

-- Chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sid TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  landing_page_url TEXT,
  main_category TEXT,
  sub_category TEXT,
  stage TEXT DEFAULT 'COLLECTING' CHECK (stage IN ('COLLECTING', 'READY_TO_SUBMIT', 'SUBMITTED', 'FAILED_SUBMISSION')),
  answers JSONB DEFAULT '{}',
  asked TEXT[] DEFAULT '{}',
  transcript JSONB DEFAULT '[]',
  lead_id TEXT,
  lead_status TEXT,
  -- LeadProsper response fields
  leadprosper_lead_id TEXT,
  leadprosper_status TEXT,
  leadprosper_code INTEGER,
  leadprosper_message TEXT,
  leadprosper_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Lead queue table
CREATE TABLE public.lead_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id TEXT UNIQUE NOT NULL,
  lead_data JSONB NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'dead_letter')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead processing status table
CREATE TABLE public.lead_processing_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  processing_time INTEGER, -- milliseconds
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Failed leads table
CREATE TABLE public.failed_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id TEXT UNIQUE NOT NULL,
  lead_data JSONB NOT NULL,
  error_message TEXT NOT NULL,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chat_sessions_sid ON public.chat_sessions (sid);
CREATE INDEX idx_chat_sessions_expires_at ON public.chat_sessions (expires_at);
CREATE INDEX idx_chat_sessions_stage ON public.chat_sessions (stage);
CREATE INDEX idx_lead_queue_status ON public.lead_queue (status);
CREATE INDEX idx_lead_queue_created_at ON public.lead_queue (created_at);
CREATE INDEX idx_lead_queue_job_id ON public.lead_queue (job_id);
CREATE INDEX idx_lead_processing_status_job_id ON public.lead_processing_status (job_id);
CREATE INDEX idx_failed_leads_job_id ON public.failed_leads (job_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_processing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_leads ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies (allow all operations for now, can be restricted later)
CREATE POLICY "Allow all operations on chat_sessions" ON public.chat_sessions
  FOR ALL USING (true);

-- Lead queue policies (admin only for management, but allow inserts for the system)
CREATE POLICY "Allow inserts to lead_queue" ON public.lead_queue
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow selects from lead_queue" ON public.lead_queue
  FOR SELECT USING (true);

CREATE POLICY "Allow updates to lead_queue" ON public.lead_queue
  FOR UPDATE USING (true);

-- Lead processing status policies
CREATE POLICY "Allow all operations on lead_processing_status" ON public.lead_processing_status
  FOR ALL USING (true);

-- Failed leads policies
CREATE POLICY "Allow all operations on failed_leads" ON public.failed_leads
  FOR ALL USING (true);

-- Functions for updating timestamps
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_queue_updated_at BEFORE UPDATE ON public.lead_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_failed_leads_updated_at BEFORE UPDATE ON public.failed_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.chat_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old completed jobs
CREATE OR REPLACE FUNCTION cleanup_old_jobs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.lead_queue 
  WHERE status = 'completed' 
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
