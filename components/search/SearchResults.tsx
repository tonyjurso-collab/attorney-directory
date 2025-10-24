import { Suspense } from 'react';
import { AttorneyCard } from '@/components/attorney/AttorneyCard';
import { createClient } from '@/lib/supabase/server';
import { AttorneyWithDetails } from '@/lib/types/database';

interface SearchResultsProps {
  searchParams: {
    q?: string;
    practice_area?: string;
    location?: string;
    tier?: string;
    radius?: string;
  };
}

async function searchAttorneys(searchParams: SearchResultsProps['searchParams']): Promise<AttorneyWithDetails[]> {
  const supabase = await createClient();
  
  let query = supabase
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
    .eq('is_active', true);

  // Apply filters
  if (searchParams.practice_area) {
    query = query.eq('attorney_practice_areas.practice_areas.slug', searchParams.practice_area);
  }

  if (searchParams.tier) {
    query = query.eq('membership_tier', searchParams.tier);
  }

  if (searchParams.location) {
    // For now, we'll do a simple text search on city/state
    // In production, you'd want to use PostGIS for proper geospatial queries
    query = query.or(`city.ilike.%${searchParams.location}%,state.ilike.%${searchParams.location}%`);
  }

  const { data: attorneys, error } = await query.limit(20);

  if (error) {
    console.error('Error searching attorneys:', error);
    return [];
  }

  return attorneys?.map((attorney: any) => ({
    ...attorney,
    practice_areas: attorney.attorney_practice_areas?.map((apa: any) => ({
      id: apa.practice_areas.id,
      name: apa.practice_areas.name,
      slug: apa.practice_areas.slug,
      is_primary: apa.is_primary,
    })) || [],
  })) || [];
}

export async function SearchResults({ searchParams }: SearchResultsProps) {
  const attorneys = await searchAttorneys(searchParams);

  if (attorneys.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No attorneys found
        </h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your search criteria or expanding your location.
        </p>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Try a broader location search</p>
          <p>• Check different practice areas</p>
          <p>• Remove some filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {attorneys.length} Attorney{attorneys.length !== 1 ? 's' : ''} Found
          </h2>
          <p className="text-sm text-gray-600">
            Sorted by membership tier and relevance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="distance">Distance</option>
            <option value="tier">Membership Tier</option>
          </select>
        </div>
      </div>

      {/* Attorney Cards */}
      <div className="space-y-4">
        {attorneys.map((attorney) => (
          <AttorneyCard key={attorney.id} attorney={attorney} />
        ))}
      </div>

      {/* Load More Button */}
      {attorneys.length >= 20 && (
        <div className="text-center pt-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Load More Results
          </button>
        </div>
      )}
    </div>
  );
}
