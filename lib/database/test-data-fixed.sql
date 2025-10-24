-- Test Attorney Data for Attorney Directory (Fixed Version)
-- Area: 28034 (North Carolina)
-- This version works with Supabase Auth by creating attorneys directly
-- without requiring existing users in auth.users

-- Insert test attorneys directly (without user_id foreign key)
-- In a real application, these would be created through the registration flow
INSERT INTO public.attorneys (
  id, first_name, last_name, firm_name, bio, experience_years, 
  phone, email, website, address_line1, city, state, zip_code, country,
  profile_image_url, firm_logo_url, membership_tier, is_active, is_verified,
  created_at, updated_at
) VALUES
-- Exclusive Tier Attorneys (Premium)
('11111111-1111-1111-1111-111111111111', 'John', 'Smith', 'Smith & Associates Law Firm', 
 'With over 15 years of experience in personal injury law, John has successfully represented thousands of clients in car accidents, slip and falls, and workplace injuries. He has recovered millions in settlements and verdicts for his clients.', 
 15, '(704) 555-0101', 'john.smith@lawfirm.com', 'https://smithlawfirm.com', 
 '123 Main Street', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'exclusive', true, true, NOW(), NOW()),

('22222222-2222-2222-2222-222222222222', 'Sarah', 'Johnson', 'Johnson Family Law Group', 
 'Sarah specializes in family law matters including divorce, child custody, and adoption. She is known for her compassionate approach and has helped hundreds of families navigate difficult legal situations.', 
 12, '(704) 555-0102', 'sarah.johnson@legal.com', 'https://johnsonfamilylaw.com', 
 '456 Oak Avenue', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'exclusive', true, true, NOW(), NOW()),

-- Standard Tier Attorneys
('33333333-3333-3333-3333-333333333333', 'Michael', 'Davis', 'Davis Criminal Defense', 
 'Michael is a former prosecutor with 10 years of experience defending clients against criminal charges. He has successfully defended clients in DUI, assault, and white-collar crime cases.', 
 10, '(704) 555-0103', 'michael.davis@attorney.com', 'https://daviscriminaldefense.com', 
 '789 Pine Street', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'standard', true, true, NOW(), NOW()),

('44444444-4444-4444-4444-444444444444', 'Emily', 'Wilson', 'Wilson Business Law', 
 'Emily focuses on business law, helping small and medium-sized businesses with contracts, employment law, and corporate formation. She has a background in business administration.', 
 8, '(704) 555-0104', 'emily.wilson@law.com', 'https://wilsonbusinesslaw.com', 
 '321 Elm Street', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'standard', true, true, NOW(), NOW()),

('55555555-5555-5555-5555-555555555555', 'Robert', 'Brown', 'Brown Real Estate Law', 
 'Robert specializes in real estate transactions, property disputes, and landlord-tenant law. He has extensive experience with commercial and residential real estate matters.', 
 14, '(704) 555-0105', 'robert.brown@legal.com', 'https://brownrealestatelaw.com', 
 '654 Maple Drive', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'standard', true, true, NOW(), NOW()),

-- Free Tier Attorneys
('66666666-6666-6666-6666-666666666666', 'Jennifer', 'Garcia', 'Garcia Immigration Law', 
 'Jennifer is dedicated to helping immigrants navigate the complex U.S. immigration system. She speaks Spanish fluently and has helped hundreds of families achieve their immigration goals.', 
 6, '(704) 555-0106', 'jennifer.garcia@lawfirm.com', 'https://garciaimmigrationlaw.com', 
 '987 Cedar Lane', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'free', true, true, NOW(), NOW()),

('77777777-7777-7777-7777-777777777777', 'David', 'Miller', 'Miller Employment Law', 
 'David represents employees in workplace discrimination, wrongful termination, and wage and hour disputes. He has recovered millions in settlements for his clients.', 
 9, '(704) 555-0107', 'david.miller@attorney.com', 'https://milleremploymentlaw.com', 
 '147 Birch Street', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'free', true, true, NOW(), NOW()),

('88888888-8888-8888-8888-888888888888', 'Lisa', 'Anderson', 'Anderson Estate Planning', 
 'Lisa helps families protect their assets and plan for the future through comprehensive estate planning, wills, trusts, and probate administration.', 
 11, '(704) 555-0108', 'lisa.anderson@legal.com', 'https://andersonestateplanning.com', 
 '258 Willow Way', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'free', true, true, NOW(), NOW()),

('99999999-9999-9999-9999-999999999999', 'James', 'Taylor', 'Taylor Bankruptcy Law', 
 'James helps individuals and businesses navigate bankruptcy proceedings. He has extensive experience with Chapter 7, Chapter 13, and business bankruptcy cases.', 
 7, '(704) 555-0109', 'james.taylor@law.com', 'https://taylorbankruptcylaw.com', 
 '369 Spruce Avenue', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'free', true, true, NOW(), NOW()),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Amanda', 'Thomas', 'Thomas DUI Defense', 
 'Amanda specializes in DUI and traffic defense cases. She has successfully defended hundreds of clients against DUI charges and has a high success rate in court.', 
 5, '(704) 555-0110', 'amanda.thomas@lawfirm.com', 'https://thomasduidefense.com', 
 '741 Poplar Street', 'Charlotte', 'NC', '28034', 'US',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
 'free', true, true, NOW(), NOW());

-- Insert attorney practice area relationships
INSERT INTO public.attorney_practice_areas (attorney_id, practice_area_id, is_primary, created_at) VALUES
-- John Smith (Personal Injury - Primary)
('11111111-1111-1111-1111-111111111111', (SELECT id FROM practice_areas WHERE slug = 'personal-injury'), true, NOW()),

-- Sarah Johnson (Family Law - Primary)
('22222222-2222-2222-2222-222222222222', (SELECT id FROM practice_areas WHERE slug = 'family-law'), true, NOW()),

-- Michael Davis (Criminal Defense - Primary)
('33333333-3333-3333-3333-333333333333', (SELECT id FROM practice_areas WHERE slug = 'criminal-defense'), true, NOW()),

-- Emily Wilson (Business Law - Primary)
('44444444-4444-4444-4444-444444444444', (SELECT id FROM practice_areas WHERE slug = 'business-law'), true, NOW()),

-- Robert Brown (Real Estate Law - Primary)
('55555555-5555-5555-5555-555555555555', (SELECT id FROM practice_areas WHERE slug = 'real-estate-law'), true, NOW()),

-- Jennifer Garcia (Immigration Law - Primary)
('66666666-6666-6666-6666-666666666666', (SELECT id FROM practice_areas WHERE slug = 'immigration-law'), true, NOW()),

-- David Miller (Employment Law - Primary)
('77777777-7777-7777-7777-777777777777', (SELECT id FROM practice_areas WHERE slug = 'employment-law'), true, NOW()),

-- Lisa Anderson (Estate Planning - Primary)
('88888888-8888-8888-8888-888888888888', (SELECT id FROM practice_areas WHERE slug = 'estate-planning'), true, NOW()),

-- James Taylor (Bankruptcy - Primary)
('99999999-9999-9999-9999-999999999999', (SELECT id FROM practice_areas WHERE slug = 'bankruptcy'), true, NOW()),

-- Amanda Thomas (DUI Defense - Primary)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM practice_areas WHERE slug = 'dui-defense'), true, NOW());

-- Add some secondary practice areas for variety
INSERT INTO public.attorney_practice_areas (attorney_id, practice_area_id, is_primary, created_at) VALUES
-- John Smith also does Business Law
('11111111-1111-1111-1111-111111111111', (SELECT id FROM practice_areas WHERE slug = 'business-law'), false, NOW()),

-- Sarah Johnson also does Estate Planning
('22222222-2222-2222-2222-222222222222', (SELECT id FROM practice_areas WHERE slug = 'estate-planning'), false, NOW()),

-- Michael Davis also does DUI Defense
('33333333-3333-3333-3333-333333333333', (SELECT id FROM practice_areas WHERE slug = 'dui-defense'), false, NOW()),

-- Emily Wilson also does Employment Law
('44444444-4444-4444-4444-444444444444', (SELECT id FROM practice_areas WHERE slug = 'employment-law'), false, NOW()),

-- Robert Brown also does Business Law
('55555555-5555-5555-5555-555555555555', (SELECT id FROM practice_areas WHERE slug = 'business-law'), false, NOW()),

-- Add more secondary practice areas
('11111111-1111-1111-1111-111111111111', (SELECT id FROM practice_areas WHERE slug = 'employment-law'), false, NOW()),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM practice_areas WHERE slug = 'personal-injury'), false, NOW()),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM practice_areas WHERE slug = 'personal-injury'), false, NOW()),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM practice_areas WHERE slug = 'real-estate-law'), false, NOW()),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM practice_areas WHERE slug = 'estate-planning'), false, NOW());

-- Insert some sample reviews
INSERT INTO public.reviews (attorney_id, client_name, client_email, rating, review_text, is_verified, is_public, created_at) VALUES
-- Reviews for John Smith
('11111111-1111-1111-1111-111111111111', 'Mary Johnson', 'mary.johnson@email.com', 5, 
 'John was amazing! He helped me get a fair settlement after my car accident. He was always available to answer my questions and kept me informed throughout the process.', 
 true, true, NOW() - INTERVAL '30 days'),

('11111111-1111-1111-1111-111111111111', 'Robert Wilson', 'robert.wilson@email.com', 5, 
 'Excellent attorney! John fought hard for my case and got me the compensation I deserved. I would definitely recommend him to anyone.', 
 true, true, NOW() - INTERVAL '45 days'),

-- Reviews for Sarah Johnson
('22222222-2222-2222-2222-222222222222', 'Jennifer Davis', 'jennifer.davis@email.com', 5, 
 'Sarah helped me through a difficult divorce. She was compassionate and understanding while being a strong advocate for my children and me.', 
 true, true, NOW() - INTERVAL '20 days'),

('22222222-2222-2222-2222-222222222222', 'Michael Brown', 'michael.brown@email.com', 4, 
 'Sarah is a great family law attorney. She helped me with my custody case and always had my children''s best interests at heart.', 
 true, true, NOW() - INTERVAL '60 days'),

-- Reviews for Michael Davis
('33333333-3333-3333-3333-333333333333', 'David Garcia', 'david.garcia@email.com', 5, 
 'Michael got my charges reduced significantly. He was professional, knowledgeable, and fought hard for my case. Highly recommended!', 
 true, true, NOW() - INTERVAL '15 days'),

-- Reviews for Emily Wilson
('44444444-4444-4444-4444-444444444444', 'Lisa Anderson', 'lisa.anderson@email.com', 5, 
 'Emily helped me start my business and handled all the legal paperwork. She was thorough and made sure everything was done correctly.', 
 true, true, NOW() - INTERVAL '25 days'),

-- Reviews for Robert Brown
('55555555-5555-5555-5555-555555555555', 'James Taylor', 'james.taylor@email.com', 4, 
 'Robert helped me with my real estate transaction. He was professional and made sure all the details were handled properly.', 
 true, true, NOW() - INTERVAL '40 days'),

-- Reviews for Jennifer Garcia
('66666666-6666-6666-6666-666666666666', 'Amanda Thomas', 'amanda.thomas@email.com', 5, 
 'Jennifer helped my family with our immigration case. She was patient, understanding, and spoke Spanish fluently. We are now permanent residents thanks to her!', 
 true, true, NOW() - INTERVAL '35 days'),

-- Reviews for David Miller
('77777777-7777-7777-7777-777777777777', 'Christopher Lee', 'christopher.lee@email.com', 5, 
 'David helped me with my wrongful termination case. He was aggressive in fighting for my rights and got me a fair settlement.', 
 true, true, NOW() - INTERVAL '50 days'),

-- Reviews for Lisa Anderson
('88888888-8888-8888-8888-888888888888', 'Patricia White', 'patricia.white@email.com', 5, 
 'Lisa helped me set up my estate plan. She was thorough and made sure my family would be taken care of. I feel much more secure now.', 
 true, true, NOW() - INTERVAL '10 days'),

-- Reviews for James Taylor
('99999999-9999-9999-9999-999999999999', 'Richard Harris', 'richard.harris@email.com', 4, 
 'James helped me through my bankruptcy. He was understanding of my situation and made the process as smooth as possible.', 
 true, true, NOW() - INTERVAL '55 days'),

-- Reviews for Amanda Thomas
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Susan Clark', 'susan.clark@email.com', 5, 
 'Amanda got my DUI charges dismissed! She was knowledgeable about the law and fought hard for my case. I couldn''t be happier with the result.', 
 true, true, NOW() - INTERVAL '5 days');

-- Insert some sample leads
INSERT INTO public.leads (attorney_id, practice_area_id, first_name, last_name, email, phone, zip_code, case_description, case_value, urgency, status, source, created_at) VALUES
-- Leads for John Smith (Personal Injury)
('11111111-1111-1111-1111-111111111111', (SELECT id FROM practice_areas WHERE slug = 'personal-injury'), 
 'John', 'Doe', 'john.doe@email.com', '(704) 555-0201', '28034', 
 'Car accident on I-77. Rear-ended by another driver. Back and neck pain. Seeking compensation for medical bills and lost wages.', 
 25000.00, 'medium', 'new', 'website', NOW() - INTERVAL '2 days'),

-- Leads for Sarah Johnson (Family Law)
('22222222-2222-2222-2222-222222222222', (SELECT id FROM practice_areas WHERE slug = 'family-law'), 
 'Jane', 'Smith', 'jane.smith@email.com', '(704) 555-0202', '28034', 
 'Divorce proceedings. Need help with child custody and asset division. Amicable separation but need legal guidance.', 
 15000.00, 'low', 'new', 'website', NOW() - INTERVAL '1 day'),

-- Leads for Michael Davis (Criminal Defense)
('33333333-3333-3333-3333-333333333333', (SELECT id FROM practice_areas WHERE slug = 'criminal-defense'), 
 'Bob', 'Johnson', 'bob.johnson@email.com', '(704) 555-0203', '28034', 
 'Charged with assault. Self-defense case. Need experienced criminal defense attorney.', 
 20000.00, 'high', 'new', 'website', NOW() - INTERVAL '3 days'),

-- Leads for Emily Wilson (Business Law)
('44444444-4444-4444-4444-444444444444', (SELECT id FROM practice_areas WHERE slug = 'business-law'), 
 'Alice', 'Brown', 'alice.brown@email.com', '(704) 555-0204', '28034', 
 'Starting a new business. Need help with LLC formation, contracts, and employment law compliance.', 
 5000.00, 'medium', 'new', 'website', NOW() - INTERVAL '4 days'),

-- Leads for Robert Brown (Real Estate Law)
('55555555-5555-5555-5555-555555555555', (SELECT id FROM practice_areas WHERE slug = 'real-estate-law'), 
 'Charlie', 'Wilson', 'charlie.wilson@email.com', '(704) 555-0205', '28034', 
 'Buying first home. Need attorney to review purchase agreement and handle closing.', 
 3000.00, 'medium', 'new', 'website', NOW() - INTERVAL '5 days'),

-- Leads for Jennifer Garcia (Immigration Law)
('66666666-6666-6666-6666-666666666666', (SELECT id FROM practice_areas WHERE slug = 'immigration-law'), 
 'Maria', 'Garcia', 'maria.garcia@email.com', '(704) 555-0206', '28034', 
 'Family-based immigration case. Need help with green card application for spouse.', 
 8000.00, 'medium', 'new', 'website', NOW() - INTERVAL '6 days'),

-- Leads for David Miller (Employment Law)
('77777777-7777-7777-7777-777777777777', (SELECT id FROM practice_areas WHERE slug = 'employment-law'), 
 'Tom', 'Davis', 'tom.davis@email.com', '(704) 555-0207', '28034', 
 'Wrongful termination case. Fired for reporting safety violations. Need employment law attorney.', 
 35000.00, 'high', 'new', 'website', NOW() - INTERVAL '7 days'),

-- Leads for Lisa Anderson (Estate Planning)
('88888888-8888-8888-8888-888888888888', (SELECT id FROM practice_areas WHERE slug = 'estate-planning'), 
 'Helen', 'Miller', 'helen.miller@email.com', '(704) 555-0208', '28034', 
 'Need to create will and trust for family. Want to ensure assets are protected and distributed according to wishes.', 
 5000.00, 'low', 'new', 'website', NOW() - INTERVAL '8 days'),

-- Leads for James Taylor (Bankruptcy)
('99999999-9999-9999-9999-999999999999', (SELECT id FROM practice_areas WHERE slug = 'bankruptcy'), 
 'Frank', 'Taylor', 'frank.taylor@email.com', '(704) 555-0209', '28034', 
 'Overwhelmed by debt. Need to explore bankruptcy options. Medical bills and credit card debt.', 
 15000.00, 'high', 'new', 'website', NOW() - INTERVAL '9 days'),

-- Leads for Amanda Thomas (DUI Defense)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM practice_areas WHERE slug = 'dui-defense'), 
 'Gary', 'Thomas', 'gary.thomas@email.com', '(704) 555-0210', '28034', 
 'First-time DUI charge. Need experienced DUI defense attorney to help with case.', 
 10000.00, 'high', 'new', 'website', NOW() - INTERVAL '10 days');

-- Create some additional leads for testing
INSERT INTO public.leads (attorney_id, practice_area_id, first_name, last_name, email, phone, zip_code, case_description, case_value, urgency, status, source, created_at) VALUES
-- Additional leads for testing
('11111111-1111-1111-1111-111111111111', (SELECT id FROM practice_areas WHERE slug = 'personal-injury'), 
 'Sarah', 'Johnson', 'sarah.johnson@email.com', '(704) 555-0301', '28034', 
 'Slip and fall at grocery store. Injured back and shoulder. Seeking compensation.', 
 18000.00, 'medium', 'contacted', 'website', NOW() - INTERVAL '15 days'),

('22222222-2222-2222-2222-222222222222', (SELECT id FROM practice_areas WHERE slug = 'family-law'), 
 'Mike', 'Wilson', 'mike.wilson@email.com', '(704) 555-0302', '28034', 
 'Child support modification needed. Income changed significantly.', 
 5000.00, 'medium', 'qualified', 'website', NOW() - INTERVAL '20 days'),

('33333333-3333-3333-3333-333333333333', (SELECT id FROM practice_areas WHERE slug = 'criminal-defense'), 
 'Lisa', 'Brown', 'lisa.brown@email.com', '(704) 555-0303', '28034', 
 'Drug possession charges. First offense. Need help with case.', 
 12000.00, 'high', 'new', 'website', NOW() - INTERVAL '1 day');

-- Note: average_rating and review_count are calculated dynamically from the reviews table
-- No need to update these fields as they are computed in the application

-- Final verification query to check data
SELECT 
  a.first_name, 
  a.last_name, 
  a.firm_name, 
  a.membership_tier,
  a.city,
  a.state,
  a.zip_code,
  COUNT(apa.practice_area_id) as practice_area_count,
  COUNT(r.id) as review_count,
  COUNT(l.id) as lead_count
FROM public.attorneys a
LEFT JOIN public.attorney_practice_areas apa ON a.id = apa.attorney_id
LEFT JOIN public.reviews r ON a.id = r.attorney_id
LEFT JOIN public.leads l ON a.id = l.attorney_id
WHERE a.is_active = true
GROUP BY a.id, a.first_name, a.last_name, a.firm_name, a.membership_tier, a.city, a.state, a.zip_code
ORDER BY a.membership_tier DESC, a.first_name;
