-- Seed Remaining LeadProsper Campaign Configuration Data
-- This updates existing practice area categories with LeadProsper configuration for the remaining 13 categories

-- Medical Malpractice
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29662,
  lp_supplier_id = 91142,
  lp_key = 'lr7raojrpt2klk',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29662,
      "lp_supplier_id": 91142,
      "lp_key": "lr7raojrpt2klk"
    },
    "chat_flow": [
      {"order": 1, "field": "describe"},
      {"order": 2, "field": "first_name"},
      {"order": 3, "field": "last_name"},
      {"order": 4, "field": "email"},
      {"order": 5, "field": "has_attorney"},
      {"order": 6, "field": "bodily_injury"},
      {"order": 7, "field": "zip_code"},
      {"order": 8, "field": "city"},
      {"order": 9, "field": "state"},
      {"order": 10, "field": "phone"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29662},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91142},
      "lp_key": {"type": "text", "required": true, "value": "lr7raojrpt2klk"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "bodily_injury": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]}
    }
  }'::jsonb
WHERE slug = 'medical_malpractice';

-- Defective Products
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29664,
  lp_supplier_id = 91144,
  lp_key = 'nzqzawvzes2kr0',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29664,
      "lp_supplier_id": 91144,
      "lp_key": "nzqzawvzes2kr0"
    },
    "chat_flow": [
      {"order": 1, "field": "describe"},
      {"order": 2, "field": "first_name"},
      {"order": 3, "field": "last_name"},
      {"order": 4, "field": "email"},
      {"order": 5, "field": "has_attorney"},
      {"order": 6, "field": "bodily_injury"},
      {"order": 7, "field": "zip_code"},
      {"order": 8, "field": "city"},
      {"order": 9, "field": "state"},
      {"order": 10, "field": "phone"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29664},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91144},
      "lp_key": {"type": "text", "required": true, "value": "nzqzawvzes2kr0"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "bodily_injury": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]}
    }
  }'::jsonb
WHERE slug = 'defective_products';

-- Defective Medical Devices
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29666,
  lp_supplier_id = 91146,
  lp_key = 'eyryhp7epsgelr',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29666,
      "lp_supplier_id": 91146,
      "lp_key": "eyryhp7epsgelr"
    },
    "chat_flow": [
      {"order": 1, "field": "describe"},
      {"order": 2, "field": "first_name"},
      {"order": 3, "field": "last_name"},
      {"order": 4, "field": "email"},
      {"order": 5, "field": "has_attorney"},
      {"order": 6, "field": "bodily_injury"},
      {"order": 7, "field": "zip_code"},
      {"order": 8, "field": "city"},
      {"order": 9, "field": "state"},
      {"order": 10, "field": "phone"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29666},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91146},
      "lp_key": {"type": "text", "required": true, "value": "eyryhp7epsgelr"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "bodily_injury": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]}
    }
  }'::jsonb
WHERE slug = 'defective_medical_devices';

-- Dangerous Drugs
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29668,
  lp_supplier_id = 91148,
  lp_key = 'd050tkr76tqv35',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29668,
      "lp_supplier_id": 91148,
      "lp_key": "d050tkr76tqv35"
    },
    "chat_flow": [
      {"order": 1, "field": "describe"},
      {"order": 2, "field": "first_name"},
      {"order": 3, "field": "last_name"},
      {"order": 4, "field": "email"},
      {"order": 5, "field": "has_attorney"},
      {"order": 6, "field": "bodily_injury"},
      {"order": 7, "field": "zip_code"},
      {"order": 8, "field": "city"},
      {"order": 9, "field": "state"},
      {"order": 10, "field": "phone"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29668},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91148},
      "lp_key": {"type": "text", "required": true, "value": "d050tkr76tqv35"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "bodily_injury": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]}
    }
  }'::jsonb
WHERE slug = 'dangerous_drugs';

-- Bankruptcy
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29670,
  lp_supplier_id = 91150,
  lp_key = 'y767clm21tly6k',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29670,
      "lp_supplier_id": 91150,
      "lp_key": "y767clm21tly6k"
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
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29670},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91150},
      "lp_key": {"type": "text", "required": true, "value": "y767clm21tly6k"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]}
    }
  }'::jsonb
WHERE slug = 'bankruptcy';

-- Employment Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29672,
  lp_supplier_id = 91152,
  lp_key = 'vxpxtkrdobwgwr',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29672,
      "lp_supplier_id": 91152,
      "lp_key": "vxpxtkrdobwgwr"
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
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29672},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91152},
      "lp_key": {"type": "text", "required": true, "value": "vxpxtkrdobwgwr"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]}
    }
  }'::jsonb
WHERE slug = 'employment_law';

-- Immigration Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29674,
  lp_supplier_id = 91154,
  lp_key = 'lr7raojgza2k2w',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29674,
      "lp_supplier_id": 91154,
      "lp_key": "lr7raojgza2k2w"
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
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29674},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91154},
      "lp_key": {"type": "text", "required": true, "value": "lr7raojgza2k2w"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]}
    }
  }'::jsonb
WHERE slug = 'immigration_law';

-- Real Estate Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29676,
  lp_supplier_id = 91156,
  lp_key = 'nzqzawvzzu2k2n',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29676,
      "lp_supplier_id": 91156,
      "lp_key": "nzqzawvzzu2k2n"
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
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29676},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91156},
      "lp_key": {"type": "text", "required": true, "value": "nzqzawvzzu2k2n"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]}
    }
  }'::jsonb
WHERE slug = 'real_estate_law';

-- Intellectual Property Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29680,
  lp_supplier_id = 91160,
  lp_key = 'd050tkr7zaqvq2',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29680,
      "lp_supplier_id": 91160,
      "lp_key": "d050tkr7zaqvq2"
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
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29680},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91160},
      "lp_key": {"type": "text", "required": true, "value": "d050tkr7zaqvq2"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "sub_category": {"type": "text", "required": true}
    }
  }'::jsonb
WHERE slug = 'intellectual_property_law';

-- Wills, Trusts & Estates
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29682,
  lp_supplier_id = 91162,
  lp_key = 'y767clm2oalyld',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29682,
      "lp_supplier_id": 91162,
      "lp_key": "y767clm2oalyld"
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
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29682},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91162},
      "lp_key": {"type": "text", "required": true, "value": "y767clm2oalyld"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "sub_category": {"type": "text", "required": true}
    }
  }'::jsonb
WHERE slug = 'wills_trusts_estates';

-- Tax Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29684,
  lp_supplier_id = 91164,
  lp_key = 'vxpxtkrdwcwgwv',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29684,
      "lp_supplier_id": 91164,
      "lp_key": "vxpxtkrdwcwgwv"
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
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29684},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91164},
      "lp_key": {"type": "text", "required": true, "value": "vxpxtkrdwcwgwv"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "sub_category": {"type": "text", "required": true}
    }
  }'::jsonb
WHERE slug = 'tax_law';

-- Social Security Disability
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29688,
  lp_supplier_id = 91168,
  lp_key = 'nzqzawvjef2k20',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29688,
      "lp_supplier_id": 91168,
      "lp_key": "nzqzawvjef2k20"
    },
    "chat_flow": [
      {"order": 1, "field": "describe"},
      {"order": 2, "field": "first_name"},
      {"order": 3, "field": "last_name"},
      {"order": 4, "field": "email"},
      {"order": 5, "field": "currently_receiving_benefits"},
      {"order": 6, "field": "age"},
      {"order": 7, "field": "have_worked"},
      {"order": 8, "field": "out_of_work"},
      {"order": 9, "field": "doctor_treatment"},
      {"order": 10, "field": "has_attorney"},
      {"order": 11, "field": "phone"},
      {"order": 12, "field": "zip_code"},
      {"order": 13, "field": "city"},
      {"order": 14, "field": "state"}
    ],
    "required_fields": {
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29688},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91168},
      "lp_key": {"type": "text", "required": true, "value": "nzqzawvjef2k20"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "currently_receiving_benefits": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]},
      "have_worked": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]},
      "out_of_work": {"type": "enum", "required": true, "allowed_values": ["yes", "no"]},
      "doctor_treatment": {"type": "enum", "required": true, "allowed_values": ["Yes", "No"]},
      "age": {"type": "numeric", "required": true}
    }
  }'::jsonb
WHERE slug = 'social_security_disability';

-- Civil Rights Law
UPDATE public.practice_area_categories
SET 
  lp_campaign_id = 29686,
  lp_supplier_id = 91166,
  lp_key = 'lr7raojgps2k2k',
  lp_config = '{
    "lead_prosper_config": {
      "lp_campaign_id": 29686,
      "lp_supplier_id": 91166,
      "lp_key": "lr7raojgps2k2k"
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
      "lp_campaign_id": {"type": "numeric", "required": true, "value": 29686},
      "lp_supplier_id": {"type": "numeric", "required": true, "value": 91166},
      "lp_key": {"type": "text", "required": true, "value": "lr7raojgps2k2k"},
      "first_name": {"type": "text", "required": true},
      "last_name": {"type": "text", "required": true},
      "phone": {"type": "phone", "required": true},
      "email": {"type": "email", "required": true},
      "city": {"type": "text", "required": true},
      "state": {"type": "state", "required": true},
      "zip_code": {"type": "zip", "required": true},
      "describe": {"type": "text", "required": true},
      "has_attorney": {"type": "enum", "required": true, "allowed_values": ["no", "yes"]},
      "sub_category": {"type": "text", "required": true}
    }
  }'::jsonb
WHERE slug = 'civil_rights_law';

-- Verify updates
SELECT slug, name, lp_campaign_id, lp_supplier_id, 
       lp_config->'lead_prosper_config'->>'lp_key' as api_key
FROM public.practice_area_categories
WHERE lp_campaign_id IS NOT NULL
ORDER BY name;
