import Link from 'next/link';
import { Star, MapPin, Phone, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AttorneyWithDetails } from '@/lib/types/database';

async function getFeaturedAttorneys(): Promise<AttorneyWithDetails[]> {
  try {
    const supabase = await createClient();
    
    // Check if Supabase is properly configured
    if (!supabase || typeof supabase.from !== 'function') {
      console.log('Supabase not configured, returning empty array');
      return [];
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {attorneys.map((attorney) => (
        <div
          key={attorney.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
        >
          {/* Attorney Image */}
          <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
            {attorney.profile_image_url ? (
              <img
                src={attorney.profile_image_url}
                alt={`${attorney.first_name} ${attorney.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-4xl font-bold">
                {attorney.first_name[0]}{attorney.last_name[0]}
              </div>
            )}
            
            {/* Membership Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                Featured
              </span>
            </div>
          </div>

          {/* Attorney Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {attorney.first_name} {attorney.last_name}
                </h3>
                {attorney.firm_name && (
                  <p className="text-sm text-gray-600">{attorney.firm_name}</p>
                )}
              </div>
              
              {/* Rating */}
              <div className="flex items-center text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 text-sm font-medium text-gray-700">
                  {attorney.average_rating?.toFixed(1) || '4.8'}
                </span>
              </div>
            </div>

            {/* Practice Areas */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {attorney.practice_areas.slice(0, 2).map((area) => (
                  <span
                    key={area.id}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {area.name}
                  </span>
                ))}
                {attorney.practice_areas.length > 2 && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    +{attorney.practice_areas.length - 2} more
                  </span>
                )}
              </div>
            </div>

            {/* Location */}
            {attorney.city && attorney.state && (
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {attorney.city}, {attorney.state}
                </span>
              </div>
            )}

            {/* Experience */}
            {attorney.experience_years && (
              <p className="text-sm text-gray-600 mb-4">
                {attorney.experience_years}+ years experience
              </p>
            )}

            {/* Bio Preview */}
            {attorney.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {attorney.bio}
              </p>
            )}

            {/* Contact Button */}
            <div className="flex gap-2">
              <Link
                href={`/attorney/${attorney.id}`}
                className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                View Profile
              </Link>
              
              {attorney.phone && (
                <a
                  href={`tel:${attorney.phone}`}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  title="Call attorney"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
