-- Add LeadProsper campaign fields to practice_area_categories table

ALTER TABLE public.practice_area_categories
ADD COLUMN IF NOT EXISTS lp_campaign_id INTEGER,
ADD COLUMN IF NOT EXISTS lp_supplier_id INTEGER,
ADD COLUMN IF NOT EXISTS lp_key TEXT,
ADD COLUMN IF NOT EXISTS lp_config JSONB;

COMMENT ON COLUMN public.practice_area_categories.lp_campaign_id IS 'LeadProsper campaign ID';
COMMENT ON COLUMN public.practice_area_categories.lp_supplier_id IS 'LeadProsper supplier ID';
COMMENT ON COLUMN public.practice_area_categories.lp_key IS 'LeadProsper API key';
COMMENT ON COLUMN public.practice_area_categories.lp_config IS 'Full LeadProsper campaign configuration including chat_flow and required_fields';
