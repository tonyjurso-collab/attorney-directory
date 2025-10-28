'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AttorneyCardVertical } from '@/components/attorney';
import { HeroSection } from './HeroSection';
import { PracticeAreaContent } from './PracticeAreaContent';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '@/lib/animations/variants';

interface PracticeAreaLandingPageProps {
  practiceArea: string;
  state: string;
  category?: string;
  subcategory?: string;
}

interface Attorney {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  years_experience: number;
  law_school: string;
  bar_admissions: string[];
  practice_areas: string[];
  location: {
    city: string;
    state: string;
    zip_code: string;
  };
  rating: number;
  review_count: number;
  profile_image_url?: string;
  membership_tier: 'free' | 'standard' | 'exclusive';
}

export function PracticeAreaLandingPage({ 
  practiceArea, 
  state, 
  category, 
  subcategory 
}: PracticeAreaLandingPageProps) {
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttorneys = async () => {
      try {
        setLoading(true);
        
        // Build search parameters
        const searchParams = new URLSearchParams();
        searchParams.set('practice_area', practiceArea);
        searchParams.set('state', state);
        
        if (category) {
          searchParams.set('category', category);
        }
        
        if (subcategory) {
          searchParams.set('subcategory', subcategory);
        }
        
        const response = await fetch(`/api/search-attorneys?${searchParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch attorneys: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAttorneys(data.attorneys || []);
      } catch (err) {
        console.error('Error fetching attorneys:', err);
        setError(err instanceof Error ? err.message : 'Failed to load attorneys');
      } finally {
        setLoading(false);
      }
    };

    fetchAttorneys();
  }, [practiceArea, state, category, subcategory]);

  const formatPracticeArea = (area: string) => {
    return area.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatState = (stateCode: string) => {
    const stateNames: Record<string, string> = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
      'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
      'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
      'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
      'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
      'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
      'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
      'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
      'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
      'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
      'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'Washington D.C.'
    };
    
    return stateNames[stateCode] || stateCode;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection 
        practiceArea={practiceArea}
        state={state}
        category={category}
        subcategory={subcategory}
      />

      {/* Practice Area Content */}
      <PracticeAreaContent 
        practiceArea={practiceArea}
        state={state}
      />

      {/* Attorneys Section */}
      <motion.div 
        className="bg-gray-50 py-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {formatPracticeArea(practiceArea)} Attorneys in {formatState(state)}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our network of qualified {formatPracticeArea(practiceArea).toLowerCase()} attorneys 
              serving clients in {formatState(state)}.
            </p>
          </motion.div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading attorneys...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium">Error loading attorneys</p>
              <p className="text-red-600 mt-2">{error}</p>
            </div>
          )}

          {!loading && !error && attorneys.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 font-medium">No attorneys found</p>
              <p className="text-yellow-600 mt-2">
                We don't have any {formatPracticeArea(practiceArea).toLowerCase()} attorneys 
                listed in {formatState(state)} yet. Try searching in a nearby state or 
                contact us to add your practice.
              </p>
            </div>
          )}

          {!loading && !error && attorneys.length > 0 && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {attorneys.map((attorney, index) => (
                <motion.div key={attorney.id} variants={staggerItem}>
                  <AttorneyCardVertical 
                    attorney={attorney}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
