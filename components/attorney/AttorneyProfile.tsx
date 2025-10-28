import { Star, MapPin, Phone, Mail, Globe, Award, Calendar, Users } from 'lucide-react';
import { AttorneyWithDetails } from '@/lib/types/database';
import { formatPhoneNumber } from '@/lib/utils/format';
import { AttorneyAvatar } from '@/components/ui/AttorneyAvatar';

interface AttorneyProfileProps {
  attorney: AttorneyWithDetails & {
    reviews?: {
      id: string;
      rating: number;
      review_text: string | null;
      client_name: string;
      created_at: string;
    }[];
    googleReviews?: {
      id: string;
      author_name: string;
      author_photo_url: string | null;
      rating: number;
      text: string;
      time: number;
      relative_time_description: string;
    }[];
  };
}

export function AttorneyProfile({ attorney }: AttorneyProfileProps) {
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'exclusive':
        return {
          text: 'Featured Attorney',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'standard':
        return {
          text: 'Standard Member',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      default:
        return {
          text: 'Free Member',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const tierBadge = getTierBadge(attorney.membership_tier);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
        <div className="flex items-start space-x-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <AttorneyAvatar
              profileImageUrl={attorney.profile_image_url}
              firstName={attorney.first_name}
              lastName={attorney.last_name}
              size="xl"
              className="border-4 border-white"
            />
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {attorney.first_name} {attorney.last_name}
                </h1>
                
                {attorney.firm_name && (
                  <p className="text-xl text-blue-100 mb-4">{attorney.firm_name}</p>
                )}

                {/* Badges */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${tierBadge.className}`}>
                    {tierBadge.text}
                  </span>
                  
                  {attorney.is_verified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      <Award className="h-4 w-4 mr-1" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Rating */}
                {attorney.average_rating && attorney.review_count && (
                  <div className="flex items-center">
                    <div className="flex items-center text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(attorney.average_rating!)
                              ? 'fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-lg font-semibold">
                      {attorney.average_rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-blue-100">
                      ({attorney.review_count} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Practice Areas - Hierarchical Display (New Structure) */}
        {(attorney as any).practice_categories && (attorney as any).practice_categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Areas</h2>
            <div className="space-y-6">
              {(attorney as any).practice_categories.map((category: any) => {
                // Find subcategories for this category
                const categorySubcategories = attorney.practice_areas?.filter((pa: any) => 
                  pa.category_id === category.id
                ) || [];
                
                return (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      {categorySubcategories.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600 font-medium">Specializes in:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {categorySubcategories.map((subcategory: any) => (
                              <div key={subcategory.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{subcategory.name}</h4>
                                  {(subcategory as any).description && (
                                    <p className="text-sm text-gray-600 mt-1">{(subcategory as any).description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Practice Areas - Legacy Display (Old Structure) */}
        {!(attorney as any).practice_categories && attorney.practice_areas && attorney.practice_areas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Areas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attorney.practice_areas.map((area: any) => (
                <div key={area.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{area.name}</h4>
                    {area.description && (
                      <p className="text-sm text-gray-600 mt-1">{area.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {attorney.bio && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {attorney.bio}
              </p>
            </div>
          </div>
        )}

        {/* Experience */}
        {attorney.experience_years && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-lg">
                {attorney.experience_years}+ years of legal experience
              </span>
            </div>
          </div>
        )}

        {/* Google Reviews */}
        {attorney.googleReviews && attorney.googleReviews.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Google Reviews</h2>
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor((attorney as any).google_rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-lg font-semibold">
                  {(attorney as any).google_rating?.toFixed(1) || '4.2'} ({(attorney as any).google_review_count || attorney.googleReviews.length} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {attorney.googleReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {review.author_photo_url && (
                        <img
                          src={review.author_photo_url}
                          alt={review.author_name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{review.author_name}</p>
                        <p className="text-sm text-gray-500">{review.relative_time_description}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* No reviews available - show message for attorneys */
          <div className="mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Google Reviews Yet</h3>
              <p className="text-gray-600 mb-4">
                {attorney.membership_tier === 'free' 
                  ? "Add your Google reviews link in your dashboard to display client reviews on your profile."
                  : "Add your Google Place URL to your dashboard to display client reviews on your profile."
                }
              </p>
              <div className="text-sm text-gray-500">
                <p>Reviews help build trust with potential clients</p>
                <p>Contact support if you need help setting this up</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attorney.phone && (
              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-blue-600" />
                <a
                  href={`tel:${attorney.phone}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {formatPhoneNumber(attorney.phone)}
                </a>
              </div>
            )}
            
            {attorney.email && (
              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-3 text-blue-600" />
                <a
                  href={`mailto:${attorney.email}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {attorney.email}
                </a>
              </div>
            )}
            
            {attorney.website && (
              <div className="flex items-center text-gray-700">
                <Globe className="h-5 w-5 mr-3 text-blue-600" />
                <a
                  href={attorney.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  Visit Website
                </a>
              </div>
            )}
            
            {attorney.city && attorney.state && (
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                <span>
                  {attorney.city}, {attorney.state}
                  {attorney.zip_code && ` ${attorney.zip_code}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {attorney.reviews && attorney.reviews.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Client Reviews ({attorney.review_count})
            </h2>
            <div className="space-y-4">
              {attorney.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-medium text-gray-900">
                        {review.client_name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="text-gray-700">{review.review_text}</p>
                  )}
                </div>
              ))}
              
              {(attorney.review_count || 0) > 3 && (
                <p className="text-sm text-gray-600 text-center py-2">
                  Showing 3 of {attorney.review_count || 0} reviews
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
