import { Edit, Eye, Star, Award } from 'lucide-react';
import { AttorneyWithDetails } from '@/lib/types/database';

interface ProfileOverviewProps {
  attorney: AttorneyWithDetails;
}

export function ProfileOverview({ attorney }: ProfileOverviewProps) {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Profile Overview</h2>
        <div className="flex items-center space-x-2">
          <a
            href={`/attorney/${attorney.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="View public profile"
          >
            <Eye className="h-4 w-4" />
          </a>
          <a
            href="/dashboard/profile/edit"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit profile"
          >
            <Edit className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="space-y-4">
        {/* Profile Image and Basic Info */}
        <div className="flex items-center space-x-4">
          {attorney.profile_image_url ? (
            <img
              src={attorney.profile_image_url}
              alt={`${attorney.first_name} ${attorney.last_name}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {attorney.first_name[0]}{attorney.last_name[0]}
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {attorney.first_name} {attorney.last_name}
            </h3>
            {attorney.firm_name && (
              <p className="text-sm text-gray-600">{attorney.firm_name}</p>
            )}
            
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${tierBadge.className}`}>
                {tierBadge.text}
              </span>
              
              {attorney.is_verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Practice Areas */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Practice Areas</h4>
          <div className="flex flex-wrap gap-1">
            {attorney.practice_areas.slice(0, 3).map((area) => (
              <span
                key={area.id}
                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
              >
                {area.name}
              </span>
            ))}
            {attorney.practice_areas.length > 3 && (
              <span className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{attorney.practice_areas.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        {attorney.city && attorney.state && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
            <p className="text-sm text-gray-600">
              {attorney.city}, {attorney.state}
            </p>
          </div>
        )}

        {/* Experience */}
        {attorney.experience_years && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Experience</h4>
            <p className="text-sm text-gray-600">
              {attorney.experience_years}+ years
            </p>
          </div>
        )}

        {/* Rating */}
        {attorney.average_rating && attorney.review_count && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Rating</h4>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(attorney.average_rating!)
                        ? 'fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {attorney.average_rating.toFixed(1)} ({attorney.review_count} reviews)
              </span>
            </div>
          </div>
        )}

        {/* Profile Completion */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Profile Completion</h4>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '75%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">75% complete</p>
        </div>
      </div>
    </div>
  );
}
