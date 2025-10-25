-- Seed LeadProsper Campaign Configuration Data
-- This updates existing practice area categories with LeadProsper configuration

-- Personal Injury Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29656,
  lp_supplier_id = 90809,
  lp_key = '2kqkhm7pefnmwz',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29656,
      "lp_supplier_id": 90809,
      "lp_key": "2kqkhm7pefnmwz"
    },
    "chat_flow": [
      {"order": 1, "field": "describe"},
      {"order": 2, "field": "first_name"},
      {"order": 3, "field": "last_name"},
      {"order": 4, "field": "email"},
      {"order": 5, "field": "date_of_incident"},
      {"order": 6, "field": "bodily_injury"},
      {"order": 7, "field": "at_fault"},
      {"order": 8, "field": "has_attorney"},
      {"order": 9, "field": "zip_code"},
      {"order": 10, "field": "city"},
      {"order": 11, "field": "state"},
      {"order": 12, "field": "phone"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29656},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 90809},
      "lp_key": {"type": "text", "required": true, "value": "2kqkhm7pefnmwz"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "date_of_incident": {"type": "date", "required": true, "format": "MM/DD/YYYY"},
      "at_fault": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "bodily_injury": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]}
    }
  }'::jsonb
WHERE slug = 'personal_injury_law';

-- Family Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29660,
  lp_supplier_id = 91009,
  lp_key = '2kqkhm7p5an6qk',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29660,
      "lp_supplier_id": 91009,
      "lp_key": "2kqkhm7p5an6qk"
    },
    "chat_flow": [
      {"order": 1, "field": "describe"},
      {"order": 2, "field": "first_name"},
      {"order": 3, "field": "last_name"},
      {"order": 4, "field": "email"},
      {"order": 5, "field": "has_attorney"},
      {"order": 6, "field": "zip_code"},
      {"order": 7, "field": "city"},
      {"order": 8, "field": "state"},
      {"order": 9, "field": "phone"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29660},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91009},
      "lp_key": {"type": "text", "required": true, "value": "2kqkhm7p5an6qk"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true, "format": "(650) 327-1100"},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]}
    }
  }'::jsonb
WHERE slug = 'family_law';

-- General Legal Assistance
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29748,
  lp_supplier_id = 91072,
  lp_key = 'wpvpc3mlrtd3yq',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29748,
      "lp_supplier_id": 91072,
      "lp_key": "wpvpc3mlrtd3yq"
    },
    "chat_flow": [
      {"order": 1, "field": "describe"},
      {"order": 2, "field": "first_name"},
      {"order": 3, "field": "last_name"},
      {"order": 4, "field": "email"},
      {"order": 5, "field": "zip_code"},
      {"order": 6, "field": "city"},
      {"order": 7, "field": "state"},
      {"order": 8, "field": "phone"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29748},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91072},
      "lp_key": {"type": "text", "required": true, "value": "wpvpc3mlrtd3yq"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true, "format": "6503271100"},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true}
    }
  }'::jsonb
WHERE slug = 'general_legal_assistance';

-- Criminal Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29658,
  lp_supplier_id = 90810,
  lp_key = 'mm6mbj36qhwxym',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29658,
      "lp_supplier_id": 90810,
      "lp_key": "mm6mbj36qhwxym"
    },
    "chat_flow": [
      {"order": 1, "field": "describe"},
      {"order": 2, "field": "first_name"},
      {"order": 3, "field": "last_name"},
      {"order": 4, "field": "has_attorney"},
      {"order": 5, "field": "city"},
      {"order": 6, "field": "state"},
      {"order": 7, "field": "zip_code"},
      {"order": 8, "field": "phone"},
      {"order": 9, "field": "email"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29658},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 90810},
      "lp_key": {"type": "text", "required": true, "value": "mm6mbj36qhwxym"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true, "format": "(650) 327-1100"},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]}
    }
  }'::jsonb
WHERE slug = 'criminal_law';

-- Business Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29678,
  lp_supplier_id = 91158,
  lp_key = 'eyryhp7erugegg',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29678,
      "lp_supplier_id": 91158,
      "lp_key": "eyryhp7erugegg"
    },
    "chat_flow": [
      {"order": 1, "field": "sub_category"},
      {"order": 2, "field": "describe"},
      {"order": 3, "field": "first_name"},
      {"order": 4, "field": "last_name"},
      {"order": 5, "field": "email"},
      {"order": 6, "field": "has_attorney"},
      {"order": 7, "field": "phone"},
      {"order": 8, "field": "zip_code"},
      {"order": 9, "field": "city"},
      {"order": 10, "field": "state"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29678},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91158},
      "lp_key": {"type": "text", "required": true, "value": "eyryhp7erugegg"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true, "format": "(650) 327-1100"},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "postal_code", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]}
    }
  }'::jsonb
WHERE slug = 'business_law';

-- Verify updates
SELECT slug, name, lp_campaign_id, lp_supplier_id, 
       lp_config->'lead_prosper_config'->>'lp_key' as api_key
FROM public.practice_area_categories
WHERE lp_campaign_id IS NOT NULL;
