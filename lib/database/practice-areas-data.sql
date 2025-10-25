-- Complete Practice Areas Data
-- This file contains all practice area categories and subcategories

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM public.attorney_practice_areas;
-- DELETE FROM public.practice_areas;
-- DELETE FROM public.practice_area_categories;

-- Insert all practice area categories
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
('civil_rights_law', 'Civil Rights Law', 'Legal representation for civil rights violations and discrimination', 18)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Personal Injury Law subcategories
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
SELECT c.id, 'personal_injury_other', 'Other', 13 FROM public.practice_area_categories c WHERE c.slug = 'personal_injury_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Family Law subcategories
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
SELECT c.id, 'family_law_other', 'Other', 9 FROM public.practice_area_categories c WHERE c.slug = 'family_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- General Legal Assistance subcategories
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
SELECT c.id, 'general_legal_other', 'Other', 6 FROM public.practice_area_categories c WHERE c.slug = 'general_legal_assistance'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Criminal Law subcategories
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
SELECT c.id, 'criminal_law_other', 'Other', 7 FROM public.practice_area_categories c WHERE c.slug = 'criminal_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Medical Malpractice subcategories
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
SELECT c.id, 'medical_malpractice_other', 'Other', 21 FROM public.practice_area_categories c WHERE c.slug = 'medical_malpractice'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Defective Products subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'nutribullet_blender', 'Nutribullet Blender', 1 FROM public.practice_area_categories c WHERE c.slug = 'defective_products'
UNION ALL
SELECT c.id, 'vevor_car_jack', 'Vevor Car Jack', 2 FROM public.practice_area_categories c WHERE c.slug = 'defective_products'
UNION ALL
SELECT c.id, 'vevor_chain_load_binder', 'Vevor Chain Load Binder', 3 FROM public.practice_area_categories c WHERE c.slug = 'defective_products'
UNION ALL
SELECT c.id, 'vevor_safety_harness', 'Vevor Safety Harness', 4 FROM public.practice_area_categories c WHERE c.slug = 'defective_products'
UNION ALL
SELECT c.id, 'roundup_weedkiller', 'Roundup Weedkiller', 5 FROM public.practice_area_categories c WHERE c.slug = 'defective_products'
UNION ALL
SELECT c.id, 'paraquat_herbicide', 'Paraquat Herbicide', 6 FROM public.practice_area_categories c WHERE c.slug = 'defective_products'
UNION ALL
SELECT c.id, 'keurig_coffee_makers', 'Keurig KS Supreme / Plus / Smart Coffee Makers', 7 FROM public.practice_area_categories c WHERE c.slug = 'defective_products'
UNION ALL
SELECT c.id, 'defective_products_other', 'Other', 8 FROM public.practice_area_categories c WHERE c.slug = 'defective_products'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Defective Medical Devices subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'philips_respironics_cpap_bipap', 'Philips Respironics CPAP and BiPAP Ventilators', 1 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'bard_powerport_implanted_port', 'Bard PowerPort Implanted Port Catheters', 2 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'exactech_knee_hip_ankle_implants', 'Exactech Knee Hip Ankle Joint Implants (Polyethylene Inserts)', 3 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'allergan_biocell_textured_breast_implants', 'Allergan Biocell Textured Breast Implants', 4 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'paragard_iud', 'Paragard IUD', 5 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'hernia_mesh', 'Hernia Mesh (Bard, Ethicon, Atrium, Covidien)', 6 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'ivc_filters', 'IVC Filters (Bard, Cook)', 7 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'penumbra_jet_7_xtra_flex_catheters', 'Penumbra Jet 7 Xtra Flex Catheters', 8 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'ethicon_surgical_staplers', 'Ethicon Surgical Staplers (Endopath Echelon Reload)', 9 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'da_vinci_surgical_robot', 'Da Vinci Surgical Robot', 10 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
UNION ALL
SELECT c.id, 'defective_medical_devices_other', 'Other', 11 FROM public.practice_area_categories c WHERE c.slug = 'defective_medical_devices'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Dangerous Drugs subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'ozempic', 'Ozempic', 1 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'wegovy', 'Wegovy', 2 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'rybelsus', 'Rybelsus', 3 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'mounjaro', 'Mounjaro', 4 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'zepbound', 'Zepbound', 5 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'tepezza', 'Tepezza', 6 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'suboxone_film', 'Suboxone (Film)', 7 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'elmiron', 'Elmiron', 8 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'valsartan', 'Valsartan', 9 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'losartan', 'Losartan', 10 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'irbesartan', 'Irbesartan', 11 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'zantac_ranitidine', 'Zantac (Ranitidine)', 12 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'gardasil_hpv_vaccine', 'Gardasil (HPV Vaccine)', 13 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'injectafer', 'Injectafer', 14 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'truvada', 'Truvada', 15 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'viread', 'Viread', 16 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'atripla', 'Atripla', 17 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'complera', 'Complera', 18 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'stribild', 'Stribild', 19 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'belviq', 'Belviq', 20 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'tasigna', 'Tasigna', 21 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'uloric', 'Uloric', 22 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
UNION ALL
SELECT c.id, 'dangerous_drugs_other', 'Other', 23 FROM public.practice_area_categories c WHERE c.slug = 'dangerous_drugs'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Bankruptcy subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'chapter_7_bankruptcy', 'Chapter 7 Bankruptcy', 1 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'chapter_11_bankruptcy', 'Chapter 11 Bankruptcy', 2 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'chapter_12_bankruptcy', 'Chapter 12 Bankruptcy (Family Farmers/Fishermen)', 3 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'chapter_13_bankruptcy', 'Chapter 13 Bankruptcy', 4 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'business_bankruptcy', 'Business Bankruptcy', 5 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'debt_settlement_negotiation', 'Debt Settlement & Negotiation', 6 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'debt_collection_defense', 'Debt Collection Defense', 7 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'creditor_harassment_fair_debt', 'Creditor Harassment / Fair Debt Collection Practices Act', 8 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'foreclosure_defense', 'Foreclosure Defense', 9 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'repossession_defense', 'Repossession Defense', 10 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'wage_garnishment_defense', 'Wage Garnishment Defense', 11 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'student_loan_debt_relief', 'Student Loan Debt Relief', 12 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'credit_card_debt_relief', 'Credit Card Debt Relief', 13 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'medical_debt_relief', 'Medical Debt Relief', 14 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'loan_modifications', 'Loan Modifications', 15 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'income_tax_debt_relief', 'Income Tax Debt Relief', 16 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'bankruptcy_litigation', 'Bankruptcy Litigation', 17 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'adversary_proceedings', 'Adversary Proceedings', 18 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'bankruptcy_appeals', 'Bankruptcy Appeals', 19 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
UNION ALL
SELECT c.id, 'bankruptcy_other', 'Other', 20 FROM public.practice_area_categories c WHERE c.slug = 'bankruptcy'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Employment Law subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'employment_contracts', 'Employment Contracts', 1 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'employment_discrimination', 'Employment Discrimination', 2 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'pensions_benefits', 'Pensions and Benefits', 3 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'sexual_harassment', 'Sexual Harassment', 4 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'wages_overtime_pay', 'Wages and Overtime Pay', 5 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'workplace_disputes', 'Workplace Disputes', 6 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'wrongful_termination', 'Wrongful Termination', 7 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'disabilities', 'Disabilities', 8 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
UNION ALL
SELECT c.id, 'employment_law_other', 'Other', 9 FROM public.practice_area_categories c WHERE c.slug = 'employment_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Immigration Law subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'green_card_applications', 'Green Card Applications', 1 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'family_based_immigration', 'Family-Based Immigration', 2 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'employment_based_immigration', 'Employment-Based Immigration', 3 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'fiancee_visas_k1', 'Fiancé(e) Visas (K-1)', 4 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'student_visas_f1_m1', 'Student Visas (F-1, M-1)', 5 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'work_visas_h1b_l1_o1', 'Work Visas (H-1B, L-1, O-1, etc.)', 6 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'investor_visas_e2_eb5', 'Investor Visas (E-2, EB-5)', 7 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'adjustment_of_status', 'Adjustment of Status', 8 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'naturalization_citizenship', 'Naturalization & Citizenship', 9 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'deportation_defense_removal', 'Deportation Defense / Removal Proceedings', 10 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'asylum_applications', 'Asylum Applications', 11 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'refugee_status', 'Refugee Status', 12 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'temporary_protected_status_tps', 'Temporary Protected Status (TPS)', 13 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'daca_deferred_action', 'DACA (Deferred Action for Childhood Arrivals)', 14 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'u_visas_victims_crimes', 'U Visas (Victims of Crimes)', 15 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 't_visas_victims_trafficking', 'T Visas (Victims of Trafficking)', 16 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'waivers_inadmissibility', 'Waivers of Inadmissibility', 17 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'consular_processing', 'Consular Processing', 18 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'immigration_appeals', 'Immigration Appeals', 19 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
UNION ALL
SELECT c.id, 'immigration_law_other', 'Other', 20 FROM public.practice_area_categories c WHERE c.slug = 'immigration_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Real Estate Law subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'commercial_real_estate', 'Commercial Real Estate', 1 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
UNION ALL
SELECT c.id, 'condominiums_cooperatives', 'Condominiums and Cooperatives', 2 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
UNION ALL
SELECT c.id, 'construction_disputes', 'Construction Disputes', 3 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
UNION ALL
SELECT c.id, 'foreclosures', 'Foreclosures', 4 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
UNION ALL
SELECT c.id, 'landlord_tenant', 'Landlord and Tenant', 5 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
UNION ALL
SELECT c.id, 'mortgages', 'Mortgages', 6 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
UNION ALL
SELECT c.id, 'purchase_sale_residence', 'Purchase and Sale of Residence', 7 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
UNION ALL
SELECT c.id, 'title_boundary_disputes', 'Title and Boundary Disputes', 8 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
UNION ALL
SELECT c.id, 'zoning_planning_land_use', 'Zoning, Planning and Land Use', 9 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
UNION ALL
SELECT c.id, 'real_estate_law_other', 'Other', 10 FROM public.practice_area_categories c WHERE c.slug = 'real_estate_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Business Law subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'breach_of_contract', 'Breach of Contract', 1 FROM public.practice_area_categories c WHERE c.slug = 'business_law'
UNION ALL
SELECT c.id, 'business_disputes', 'Business Disputes', 2 FROM public.practice_area_categories c WHERE c.slug = 'business_law'
UNION ALL
SELECT c.id, 'buying_selling_business', 'Buying and Selling a Business', 3 FROM public.practice_area_categories c WHERE c.slug = 'business_law'
UNION ALL
SELECT c.id, 'contract_drafting_review', 'Contract Drafting and Review', 4 FROM public.practice_area_categories c WHERE c.slug = 'business_law'
UNION ALL
SELECT c.id, 'corps_llcs_partnerships', 'Corps LLCs Partnerships etc.', 5 FROM public.practice_area_categories c WHERE c.slug = 'business_law'
UNION ALL
SELECT c.id, 'entertainment_law', 'Entertainment Law', 6 FROM public.practice_area_categories c WHERE c.slug = 'business_law'
UNION ALL
SELECT c.id, 'business_law_other', 'Other', 7 FROM public.practice_area_categories c WHERE c.slug = 'business_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Intellectual Property Law subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'patents', 'Patents', 1 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'patent_prosecution_filing', 'Patent Prosecution (Filing & Registration)', 2 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'patent_infringement_litigation', 'Patent Infringement Litigation', 3 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'patent_licensing', 'Patent Licensing', 4 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'trademarks', 'Trademarks', 5 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'trademark_registration', 'Trademark Registration', 6 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'trademark_infringement_enforcement', 'Trademark Infringement / Enforcement', 7 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'trademark_licensing', 'Trademark Licensing', 8 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'copyrights', 'Copyrights', 9 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'copyright_registration', 'Copyright Registration', 10 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'copyright_infringement_litigation', 'Copyright Infringement Litigation', 11 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'copyright_licensing', 'Copyright Licensing', 12 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'trade_secrets', 'Trade Secrets', 13 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'trade_secret_protection', 'Trade Secret Protection', 14 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'trade_secret_litigation', 'Trade Secret Litigation', 15 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'unfair_competition', 'Unfair Competition', 16 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'ip_licensing_technology_transfer', 'IP Licensing & Technology Transfer', 17 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'international_intellectual_property', 'International Intellectual Property', 18 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'domain_name_disputes', 'Domain Name Disputes', 19 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
UNION ALL
SELECT c.id, 'intellectual_property_law_other', 'Other', 20 FROM public.practice_area_categories c WHERE c.slug = 'intellectual_property_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Wills, Trusts & Estates subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'drafting_wills', 'Drafting Wills', 1 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'drafting_trusts', 'Drafting Trusts', 2 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'estate_planning', 'Estate Planning', 3 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'estate_administration', 'Estate Administration', 4 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'probate', 'Probate', 5 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'contested_wills', 'Contested Wills', 6 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'trust_disputes', 'Trust Disputes', 7 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'guardianship_estates', 'Guardianship', 8 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'powers_of_attorney', 'Powers of Attorney', 9 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'advance_healthcare_directives', 'Advance Healthcare Directives / Living Wills', 10 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'asset_protection_planning', 'Asset Protection Planning', 11 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'inheritance_disputes', 'Inheritance Disputes', 12 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'tax_planning_estates', 'Tax Planning for Estates', 13 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'charitable_giving_trusts', 'Charitable Giving / Charitable Trusts', 14 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'business_succession_planning', 'Business Succession Planning', 15 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
UNION ALL
SELECT c.id, 'wills_trusts_estates_other', 'Other', 16 FROM public.practice_area_categories c WHERE c.slug = 'wills_trusts_estates'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Tax Law subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'irs_audit_defense', 'IRS Audit Defense', 1 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'unpaid_back_taxes', 'Unpaid Back Taxes', 2 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'tax_liens', 'Tax Liens', 3 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'tax_levies_wage_garnishment', 'Tax Levies or Wage Garnishment', 4 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'innocent_spouse_relief', 'Innocent Spouse Relief', 5 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'offers_in_compromise', 'Offers in Compromise', 6 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'installment_agreements_payment_plans', 'Installment Agreements / Payment Plans', 7 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'penalty_abatement', 'Penalty Abatement', 8 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'business_tax_issues', 'Business Tax Issues', 9 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'employment_payroll_tax_disputes', 'Employment Payroll Tax Disputes', 10 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'sales_tax_disputes', 'Sales Tax Disputes', 11 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'property_tax_appeals', 'Property Tax Appeals', 12 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'estate_gift_tax_issues', 'Estate and Gift Tax Issues', 13 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'international_tax_compliance', 'International Tax Compliance', 14 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'crypto_digital_asset_tax', 'Crypto / Digital Asset Tax Issues', 15 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'tax_fraud_evasion_defense', 'Tax Fraud or Evasion Defense', 16 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'tax_court_litigation', 'Tax Court Litigation', 17 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'tax_return_errors_amendments', 'Tax Return Errors or Amendments', 18 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'general_tax_advice', 'General Tax Advice', 19 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
UNION ALL
SELECT c.id, 'tax_law_other', 'Other', 20 FROM public.practice_area_categories c WHERE c.slug = 'tax_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Social Security Disability subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'initial_ssdi_application', 'Initial SSDI Application', 1 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'initial_ssi_application', 'Initial SSI Application', 2 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'reconsideration_appeal', 'Reconsideration Appeal', 3 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'administrative_law_judge_hearing', 'Administrative Law Judge Hearing', 4 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'appeals_council_review', 'Appeals Council Review', 5 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'federal_court_appeal', 'Federal Court Appeal', 6 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'continuing_disability_review_cdr', 'Continuing Disability Review (CDR)', 7 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'overpayment_issues', 'Overpayment Issues', 8 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'benefits_termination_appeal', 'Benefits Termination Appeal', 9 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'concurrent_ssdi_ssi_claims', 'Concurrent SSDI/SSI Claims', 10 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'childhood_disability_benefits', 'Childhood Disability Benefits', 11 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'widow_widower_disability_benefits', 'Widow/Widower Disability Benefits', 12 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
UNION ALL
SELECT c.id, 'social_security_disability_other', 'Other', 13 FROM public.practice_area_categories c WHERE c.slug = 'social_security_disability'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Civil Rights Law subcategories
INSERT INTO public.practice_areas (category_id, slug, name, display_order) 
SELECT c.id, 'police_misconduct_brutality', 'Police Misconduct / Brutality', 1 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'wrongful_arrest_false_imprisonment', 'Wrongful Arrest or False Imprisonment', 2 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'excessive_force', 'Excessive Force', 3 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'discrimination_race_gender_age', 'Discrimination (Race, Gender, Age, Disability, etc.)', 4 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'hate_crimes', 'Hate Crimes', 5 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'prisoner_rights_violations', 'Prisoner Rights Violations', 6 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'first_amendment_violations', 'First Amendment Violations (Speech, Religion, Assembly)', 7 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'voting_rights_violations', 'Voting Rights Violations', 8 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'housing_discrimination', 'Housing Discrimination', 9 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'employment_discrimination_civil_rights', 'Employment Discrimination (Civil Rights Related)', 10 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'retaliation_exercising_civil_rights', 'Retaliation for Exercising Civil Rights', 11 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'denial_due_process', 'Denial of Due Process', 12 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'unlawful_search_seizure', 'Unlawful Search and Seizure', 13 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'immigration_refugee_civil_rights', 'Immigration or Refugee Civil Rights Issues', 14 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'educational_discrimination_school_rights', 'Educational Discrimination or School Rights', 15 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'disability_rights_violations_ada', 'Disability Rights Violations (ADA)', 16 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'public_accommodations_discrimination', 'Public Accommodations Discrimination', 17 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'other_civil_rights_violations', 'Other Civil Rights Violations', 18 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
UNION ALL
SELECT c.id, 'civil_rights_law_other', 'Other', 19 FROM public.practice_area_categories c WHERE c.slug = 'civil_rights_law'
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
