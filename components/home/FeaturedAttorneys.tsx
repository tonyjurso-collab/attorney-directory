'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AttorneyWithDetails } from '@/lib/types/database';
import { AttorneyCardVertical } from '@/components/attorney';
import { staggerContainer, staggerItem } from '@/lib/animations/variants';
import { createClient } from '@/lib/supabase/client';

// Static mock data as fallback
const mockAttorneys = [
  {
    id: 'mock-featured-1',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@lawfirm.com',
    phone: '(555) 123-4567',
    bio: 'Experienced personal injury attorney with over 15 years of practice.',
    experience_years: 15,
    law_school: 'Harvard Law School' as any,
    bar_admissions: ['NJ', 'NY'] as any,
    city: 'Newark',
    state: 'NJ',
    zip_code: '07102',
    profile_image_url: null,
    membership_tier: 'exclusive',
    average_rating: 4.8,
    firm_name: 'Smith & Associates',
    practice_areas: [
      { id: '1', name: 'Personal Injury', slug: 'personal-injury', is_primary: true },
      { id: '2', name: 'Car Accident', slug: 'car-accident', is_primary: false }
    ]
  },
  {
    id: 'mock-featured-2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@lawfirm.com',
    phone: '(555) 234-5678',
    bio: 'Dedicated family law attorney helping clients navigate complex legal matters.',
    years_experience: 12,
    law_school: 'Yale Law School',
    bar_admissions: ['NJ', 'PA'],
    city: 'Jersey City',
    state: 'NJ',
    zip_code: '07302',
    profile_image_url: null,
    membership_tier: 'exclusive',
    average_rating: 4.9,
    firm_name: 'Johnson Legal Group',
    practice_areas: [
      { id: '3', name: 'Family Law', slug: 'family-law', is_primary: true },
      { id: '4', name: 'Divorce', slug: 'divorce', is_primary: false }
    ]
  },
  {
    id: 'mock-featured-3',
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@lawfirm.com',
    phone: '(555) 345-6789',
    bio: 'Criminal defense attorney with a track record of successful case outcomes.',
    years_experience: 18,
    law_school: 'Columbia Law School',
    bar_admissions: ['NJ', 'NY'],
    city: 'Paterson',
    state: 'NJ',
    zip_code: '07501',
    profile_image_url: null,
    membership_tier: 'exclusive',
    average_rating: 4.7,
    firm_name: 'Brown Defense Law',
    practice_areas: [
      { id: '5', name: 'Criminal Defense', slug: 'criminal-defense', is_primary: true },
      { id: '6', name: 'DUI Defense', slug: 'dui-defense', is_primary: false }
    ]
  }
];

export function FeaturedAttorneys() {
  const [attorneys, setAttorneys] = useState<AttorneyWithDetails[]>(mockAttorneys as any as AttorneyWithDetails[]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAttorneys = async () => {
      try {
        console.log('🔄 Attempting to fetch attorneys from database...');
        setIsLoading(true);
        
        const supabase = createClient();
        
        // Check if Supabase is properly configured
        if (!supabase || typeof supabase.from !== 'function') {
          console.log('⚠️ Supabase not configured, using mock data');
          return;
        }
        
        console.log('✅ Supabase client created successfully');
        
        // First, let's see what attorneys exist in the database
        let allAttorneys = null;
        try {
          const { data, error: allError } = await supabase
            .from('attorneys')
            .select('id, first_name, last_name, membership_tier, is_active')
            .limit(10);
          
          allAttorneys = data;
          console.log('📊 All attorneys in database:', allAttorneys);
          console.log('📊 All attorneys error:', allError);
        } catch (queryError) {
          console.error('❌ Database query failed:', queryError);
          return;
        }
        
        if (allAttorneys && allAttorneys.length > 0) {
          const membershipTiers = [...new Set(allAttorneys.map(a => a.membership_tier))];
          console.log('📊 Available membership tiers:', membershipTiers);
          const activeAttorneys = allAttorneys.filter(a => a.is_active);
          console.log('📊 Active attorneys:', activeAttorneys.length);
        }

        // Try to get any active attorneys (not just exclusive ones)
        const { data: attorneys, error } = await supabase
          .from('attorneys')
          .select(`
            *,
            attorney_practice_areas (
              practice_area_id,
              is_primary,
              practice_areas (
                id,
                name,
                slug
              )
            )
          `)
          .eq('is_active', true)
          .limit(6);

        if (error) {
          console.error('❌ Error fetching attorneys:', error);
          console.log('📋 Using mock data as fallback');
          return;
        }

        if (attorneys && attorneys.length > 0) {
          console.log('✅ Found', attorneys.length, 'attorneys in database');
          console.log('📋 Raw attorney data:', attorneys[0]); // Log first attorney to see structure
          
          const processedAttorneys = attorneys.map((attorney: any) => ({
            ...attorney,
            practice_areas: attorney.attorney_practice_areas?.map((apa: any) => ({
              id: apa.practice_areas?.id,
              name: apa.practice_areas?.name,
              slug: apa.practice_areas?.slug,
              is_primary: apa.is_primary,
            })).filter(pa => pa.id) || [],
          }));
          
          console.log('📋 Processed attorney data:', processedAttorneys[0]); // Log first processed attorney
          setAttorneys(processedAttorneys);
        } else {
          console.log('📭 No attorneys found in database, using mock data');
        }
      } catch (error) {
        console.error('❌ Error in fetchAttorneys:', error);
        console.log('📋 Using mock data as fallback');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we're still using mock data
    if (attorneys === mockAttorneys) {
      fetchAttorneys();
    }
  }, []);

  console.log('🎯 FeaturedAttorneys render with', attorneys.length, 'attorneys (loading:', isLoading, ')');
  console.log('📋 First attorney for rendering:', attorneys[0]);

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {attorneys.map((attorney, index) => {
        console.log(`🎭 Rendering attorney ${index}:`, attorney.first_name, attorney.last_name);
        return (
          <motion.div key={attorney.id} variants={staggerItem}>
            <AttorneyCardVertical attorney={attorney} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
