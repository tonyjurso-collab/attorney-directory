import { createClient } from '@/lib/supabase/server';
import { AttorneyWithDetails } from '@/lib/types/database';
import { AttorneyCardVertical } from '@/components/attorney';

async function getFeaturedAttorneys(): Promise<AttorneyWithDetails[]> {
  try {
    const supabase = await createClient();
    
    // Check if Supabase is properly configured
    if (!supabase || typeof supabase.from !== 'function') {
      console.log('Supabase not configured, returning mock data');
      
      // Return mock featured attorneys for testing
      return [
        {
          id: 'mock-featured-1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@lawfirm.com',
          phone: '(555) 123-4567',
          bio: 'Experienced personal injury attorney with over 15 years of practice.',
          years_experience: 15,
          law_school: 'Harvard Law School',
          bar_admissions: ['NJ', 'NY'],
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
    }
    
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
      .eq('membership_tier', 'exclusive')
      .limit(6);

    if (error) {
      console.error('Error fetching featured attorneys:', error);
      return [];
    }

        return attorneys?.map((attorney: any) => ({
          ...attorney,
          practice_areas: attorney.attorney_practice_areas?.map((apa: any) => ({
            id: apa.practice_areas?.id,
            name: apa.practice_areas?.name,
            slug: apa.practice_areas?.slug,
            is_primary: apa.is_primary,
          })).filter(pa => pa.id) || [], // Filter out any null/undefined practice areas
        })) || [];
  } catch (error) {
    console.error('Error in getFeaturedAttorneys:', error);
    return [];
  }
}

export async function FeaturedAttorneys() {
  const attorneys = await getFeaturedAttorneys();

  if (attorneys.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No featured attorneys available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {attorneys.map((attorney) => (
        <AttorneyCardVertical key={attorney.id} attorney={attorney} />
      ))}
    </div>
  );
}
