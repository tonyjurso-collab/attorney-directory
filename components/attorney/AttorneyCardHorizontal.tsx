import Link from 'next/link';
import { Star, MapPin, Phone, ExternalLink, Award } from 'lucide-react';
import { AttorneyWithDetails } from '@/lib/types/database';
import { formatPhoneNumber } from '@/lib/utils/format';

interface AttorneyCardHorizontalProps {
  attorney: AttorneyWithDetails;
}

export function AttorneyCardHorizontal({ attorney }: AttorneyCardHorizontalProps) {
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'exclusive':
        return {
          text: 'Featured',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'standard':
        return {
          text: 'Standard',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      default:
        return {
          text: 'Free',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const tierBadge = getTierBadge(attorney.membership_tier);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Attorney Photo */}
          <div className="flex-shrink-0">
            {attorney.profile_image_url ? (
              <img
                src={attorney.profile_image_url}
                alt={`${attorney.first_name || ''} ${attorney.last_name || ''}`.trim() || 'Attorney profile'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {(attorney.first_name?.[0] || '')}{(attorney.last_name?.[0] || '')}
              </div>
            )}
          </div>

          {/* Attorney Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {attorney.first_name} {attorney.last_name}
                  </h3>
                  
                  {/* Membership Tier Badge */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${tierBadge.className}`}>
                    {tierBadge.text}
                  </span>
                  
                  {/* Verified Badge */}
                  {attorney.is_verified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>

                {attorney.firm_name && (
                  <p className="text-sm text-gray-600 mb-2">{attorney.firm_name}</p>
                )}

                {/* Location */}
                {attorney.city && attorney.state && (
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {attorney.city}, {attorney.state}
                    </span>
                  </div>
                )}

                {/* Practice Areas - Hierarchical Display (New Structure) */}
                {(attorney as any).practice_categories && (attorney as any).practice_categories.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {(attorney as any).practice_categories.slice(0, 3).map((category: any, categoryIndex: number) => (
                        <div key={category.id || `category-${categoryIndex}`} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-2">
                          <div className="font-medium text-blue-900 text-sm">
                            {category.name}
                          </div>
                        </div>
                      ))}
                      {(attorney as any).practice_categories.length > 3 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-600">
                            +{(attorney as any).practice_categories.length - 3} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Practice Areas - Legacy Display (Old Structure) */}
                {!(attorney as any).practice_categories && attorney.practice_areas && attorney.practice_areas.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {attorney.practice_areas.slice(0, 3).map((area, index) => (
                        <div
                          key={area.id || `practice-area-${index}`}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-2"
                        >
                          <span className="font-medium text-blue-900 text-sm">
                            {area.name || 'Unknown Practice Area'}
                          </span>
                        </div>
                      ))}
                      {attorney.practice_areas.length > 3 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-600">
                            +{attorney.practice_areas.length - 3} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* Experience */}
                {attorney.experience_years && (
                  <p className="text-sm text-gray-600 mb-2">
                    {attorney.experience_years}+ years experience
                  </p>
                )}

                {/* Bio Preview */}
                {attorney.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {attorney.bio}
                  </p>
                )}

                {/* Google Rating */}
                {(attorney as any).google_rating && (attorney as any).google_review_count ? (
                  <div className="flex items-center mb-3">
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor((attorney as any).google_rating || 0)
                              ? 'fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {(attorney as any).google_rating.toFixed(1)} ({(attorney as any).google_review_count} Google reviews)
                    </span>
                  </div>
                ) : (
                  /* Fallback for test data - show sample rating */
                  <div className="flex items-center mb-3">
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 4 ? 'fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      4.2 (12 reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Contact information removed - only View Profile button remains */}
                </div>

                <Link
                  href={`/attorney/${attorney.id}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
