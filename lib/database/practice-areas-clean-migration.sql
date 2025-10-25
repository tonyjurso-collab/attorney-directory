-- Clean Practice Areas Migration
-- This script will drop existing tables and recreate them properly

-- Drop existing tables if they exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS public.attorney_practice_areas CASCADE;
DROP TABLE IF EXISTS public.practice_areas CASCADE;
DROP TABLE IF EXISTS public.practice_area_categories CASCADE;

-- Create practice area categories table
CREATE TABLE public.practice_area_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice areas table
CREATE TABLE public.practice_areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.practice_area_categories(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attorney practice areas junction table
CREATE TABLE public.attorney_practice_areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attorney_id UUID REFERENCES public.attorneys(id) ON DELETE CASCADE,
  practice_area_id UUID REFERENCES public.practice_areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attorney_id, practice_area_id)
);

-- Create indexes
CREATE INDEX idx_practice_areas_category_id ON public.practice_areas(category_id);
CREATE INDEX idx_practice_areas_slug ON public.practice_areas(slug);
CREATE INDEX idx_practice_area_categories_slug ON public.practice_area_categories(slug);
CREATE INDEX idx_attorney_practice_areas_attorney_id ON public.attorney_practice_areas(attorney_id);
CREATE INDEX idx_attorney_practice_areas_practice_area_id ON public.attorney_practice_areas(practice_area_id);

-- Insert practice area categories
INSERT INTO public.practice_area_categories (slug, name, description, display_order) VALUES
('personal_injury_law', 'Personal Injury Law', 'Legal representation for injuries caused by accidents or negligence', 1),
('family_law', 'Family Law', 'Legal matters involving family relationships and domestic issues', 2),
('general_legal_assistance', 'General Legal Assistance', 'General legal consultation and representation services', 3),
('criminal_law', 'Criminal Law', 'Defense against criminal charges and violations', 4),
('medical_malpractice', 'Medical Malpractice', 'Legal representation for medical negligence and malpractice', 5),
('defective_products', 'Defective Products', 'Legal representation for injuries caused by defective products', 6),
('defective_medical_devices', 'Defective Medical Devices', 'Legal representation for injuries caused by defective medical devices', 7),
('dangerous_drugs', 'Dangerous Drugs', 'Legal representation for injuries caused by dangerous or defective drugs', 8),
('bankruptcy', 'Bankruptcy', 'Legal assistance with bankruptcy proceedings and debt relief', 9),
('employment_law', 'Employment Law', 'Legal representation for workplace and employment issues', 10),
('immigration_law', 'Immigration Law', 'Legal assistance with immigration and naturalization matters', 11),
('real_estate_law', 'Real Estate Law', 'Legal representation for real estate transactions and disputes', 12),
('business_law', 'Business Law', 'Legal assistance with business formation, contracts, and disputes', 13),
('intellectual_property_law', 'Intellectual Property Law', 'Legal assistance with patents, trademarks, and copyrights', 14),
('wills_trusts_estates', 'Wills, Trusts & Estates', 'Legal assistance with estate planning and probate matters', 15),
('tax_law', 'Tax Law', 'Legal representation for tax disputes and IRS matters', 16),
('social_security_disability', 'Social Security Disability', 'Legal assistance with Social Security disability claims', 17),
('civil_rights_law', 'Civil Rights Law', 'Legal representation for civil rights violations and discrimination', 18);

-- Insert practice areas for Personal Injury Law
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'car_accident', 'Car Accident', 1 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'truck_accident', 'Truck Accident', 2 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'motorcycle_accident', 'Motorcycle Accident', 3 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'pedestrian_accident', 'Pedestrian Accident', 4 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'bicycle_accident', 'Bicycle Accident', 5 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'workplace_injury', 'Workplace Injury', 6 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'slip_and_fall', 'Slip and Fall', 7 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'medical_malpractice_pi', 'Medical Malpractice', 8 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'prescription_drug_injury', 'Prescription Drug Injury', 9 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'product_liability', 'Product Liability', 10 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'defective_medical_device_pi', 'Defective Medical Device', 11 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'wrongful_death', 'Wrongful Death', 12 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
UNION ALL
SELECT c.id, 'personal_injury_other', 'Other', 13 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law';

-- Insert practice areas for Family Law
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'divorce', 'Divorce', 1 FROM public.practice_area_categories c WHERE c.slug = 'family_law'
UNION ALL
SELECT c.id, 'child_custody_visitation', 'Child Custody and Visitation', 2 FROM public.practice_area_categories c WHERE c.slug = 'family_law'
UNION ALL
SELECT c.id, 'child_support', 'Child Support', 3 FROM public.practice_area_categories c WHERE c.slug = 'family_law'
UNION ALL
SELECT c.id, 'spousal_support_alimony', 'Spousal Support or Alimony', 4 FROM public.practice_area_categories c WHERE c.slug = 'family_law'
UNION ALL
SELECT c.id, 'adoptions', 'Adoptions', 5 FROM public.practice_area_categories c WHERE c.slug = 'family_law'
UNION ALL
SELECT c.id, 'paternity', 'Paternity', 6 FROM public.practice_area_categories c WHERE c.slug = 'family_law'
UNION ALL
SELECT c.id, 'guardianship', 'Guardianship', 7 FROM public.practice_area_categories c WHERE c.slug = 'family_law'
UNION ALL
SELECT c.id, 'separations', 'Separations', 8 FROM public.practice_area_categories c WHERE c.slug = 'family_law'
UNION ALL
SELECT c.id, 'family_law_other', 'Other', 9 FROM public.practice_area_categories c WHERE c.slug = 'family_law';

-- Insert practice areas for General Legal Assistance
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'legal_consultation', 'Legal Consultation', 1 FROM public.practice_area_categories c WHERE c.slug = 'general_legal_assistance'
UNION ALL
SELECT c.id, 'general_legal_advice', 'General Legal Advice', 2 FROM public.practice_area_categories c WHERE c.slug = 'general_legal_assistance'
UNION ALL
SELECT c.id, 'legal_representation', 'Legal Representation', 3 FROM public.practice_area_categories c WHERE c.slug = 'general_legal_assistance'
UNION ALL
SELECT c.id, 'contract_review', 'Contract Review', 4 FROM public.practice_area_categories c WHERE c.slug = 'general_legal_assistance'
UNION ALL
SELECT c.id, 'legal_document_preparation', 'Legal Document Preparation', 5 FROM public.practice_area_categories c WHERE c.slug = 'general_legal_assistance'
UNION ALL
SELECT c.id, 'general_legal_other', 'Other', 6 FROM public.practice_area_categories c WHERE c.slug = 'general_legal_assistance';

-- Insert practice areas for Criminal Law
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'drug_crimes', 'Drug Crimes', 1 FROM public.practice_area_categories c WHERE c.slug = 'criminal_law'
UNION ALL
SELECT c.id, 'felonies', 'Felonies', 2 FROM public.practice_area_categories c WHERE c.slug = 'criminal_law'
UNION ALL
SELECT c.id, 'speeding_moving_violations', 'Speeding and Moving Violations', 3 FROM public.practice_area_categories c WHERE c.slug = 'criminal_law'
UNION ALL
SELECT c.id, 'drunk_driving_dui_dwi', 'Drunk Driving / DUI / DWI', 4 FROM public.practice_area_categories c WHERE c.slug = 'criminal_law'
UNION ALL
SELECT c.id, 'misdemeanors', 'Misdemeanors', 5 FROM public.practice_area_categories c WHERE c.slug = 'criminal_law'
UNION ALL
SELECT c.id, 'white_collar_crime', 'White Collar Crime', 6 FROM public.practice_area_categories c WHERE c.slug = 'criminal_law'
UNION ALL
SELECT c.id, 'criminal_law_other', 'Other', 7 FROM public.practice_area_categories c WHERE c.slug = 'criminal_law';

-- Insert practice areas for Medical Malpractice
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'surgical_errors', 'Surgical Errors', 1 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'wrong_site_surgery', 'Wrong-Site Surgery', 2 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'retained_surgical_instruments', 'Retained Surgical Instruments', 3 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'post_surgical_complications', 'Post-Surgical Complications', 4 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'misdiagnosis', 'Misdiagnosis', 5 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'failure_to_diagnose', 'Failure to Diagnose', 6 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'delayed_diagnosis', 'Delayed Diagnosis', 7 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'failure_to_diagnose_cancer', 'Failure to Diagnose Cancer', 8 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'failure_to_diagnose_heart_attack_stroke', 'Failure to Diagnose Heart Attack or Stroke', 9 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'medication_errors', 'Medication Errors', 10 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'wrong_prescription', 'Wrong Prescription', 11 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'incorrect_dosage', 'Incorrect Dosage', 12 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'pharmacy_errors', 'Pharmacy Errors', 13 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'allergic_reaction_medication_error', 'Allergic Reaction / Medication Error', 14 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'birth_injuries', 'Birth Injuries', 15 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'cerebral_palsy_birth_trauma', 'Cerebral Palsy from Birth Trauma', 16 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'erbs_palsy', 'Erb''s Palsy', 17 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'shoulder_dystocia', 'Shoulder Dystocia', 18 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'failure_to_perform_c_section', 'Failure to Perform C-Section', 19 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'improper_prenatal_care', 'Improper Prenatal Care', 20 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
UNION ALL
SELECT c.id, 'medical_malpractice_other', 'Other', 21 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice';

-- Add more categories as needed...
-- For now, let's add a few more key categories

-- Insert practice areas for Bankruptcy
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'chapter_7_bankruptcy', 'Chapter 7 Bankruptcy', 1 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'chapter_11_bankruptcy', 'Chapter 11 Bankruptcy', 2 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'chapter_13_bankruptcy', 'Chapter 13 Bankruptcy', 3 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'business_bankruptcy', 'Business Bankruptcy', 4 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'debt_settlement_negotiation', 'Debt Settlement & Negotiation', 5 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'foreclosure_defense', 'Foreclosure Defense', 6 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'bankruptcy_other', 'Other', 7 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy';

-- Insert practice areas for Employment Law
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'employment_contracts', 'Employment Contracts', 1 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'employment_discrimination', 'Employment Discrimination', 2 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'sexual_harassment', 'Sexual Harassment', 3 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'wages_overtime_pay', 'Wages and Overtime Pay', 4 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'wrongful_termination', 'Wrongful Termination', 5 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'employment_law_other', 'Other', 6 FROM public.practice_area_categories c WHERE c.slug = 'employment_law';
