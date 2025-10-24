import { Star, MapPin, Phone, Mail, Globe, Award, Calendar, Users } from 'lucide-react';
import { AttorneyWithDetails } from '@/lib/types/database';
import { formatPhoneNumber } from '@/lib/utils/format';

interface AttorneyProfileProps {
  attorney: AttorneyWithDetails & {
    reviews?: {
      id: string;
      rating: number;
      review_text: string | null;
      client_name: string;
      created_at: string;
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
            {attorney.profile_image_url ? (
              <img
                src={attorney.profile_image_url}
                alt={`${attorney.first_name} ${attorney.last_name}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl border-4 border-white">
                {attorney.first_name[0]}{attorney.last_name[0]}
              </div>
            )}
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
        {/* Practice Areas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attorney.practice_areas.map((area) => (
              <div key={area.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{area.name}</h3>
                  {(area as any).description && (
                    <p className="text-sm text-gray-600 mt-1">{(area as any).description}</p>
                  )}
                </div>
                {area.is_primary && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

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
