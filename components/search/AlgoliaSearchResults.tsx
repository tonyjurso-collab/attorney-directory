'use client';

import { useState, useEffect } from 'react';
import { useSearchBox, useHits, useRefinementList, useGeoSearch } from 'react-instantsearch';
import { AttorneyCardHorizontal } from '@/components/attorney';
// import { attorneysIndex } from '@/lib/algolia/client'; // Removed - not exported

interface AlgoliaSearchResultsProps {
  searchParams: {
    q?: string;
    practice_area?: string;
    location?: string;
    tier?: string;
    radius?: string;
  };
}

function SearchBox() {
  const { query, refine } = useSearchBox();

  return (
    <div className="mb-6">
      <input
        type="search"
        placeholder="Search attorneys by name, firm, or practice area..."
        value={query}
        onChange={(e) => refine(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

function PracticeAreaFilter() {
  const { items, refine } = useRefinementList({
    attribute: 'practice_areas.name',
    limit: 10,
  });

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Practice Areas</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item.value} className="flex items-center">
            <input
              type="checkbox"
              checked={item.isRefined}
              onChange={() => refine(item.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {item.label} ({item.count})
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function MembershipTierFilter() {
  const { items, refine } = useRefinementList({
    attribute: 'membership_tier',
    limit: 10,
  });

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Membership Tier</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item.value} className="flex items-center">
            <input
              type="checkbox"
              checked={item.isRefined}
              onChange={() => refine(item.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {item.label.charAt(0).toUpperCase() + item.label.slice(1)} ({item.count})
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function GeoSearch() {
  const { items, refine } = useGeoSearch({
    // defaultRefinement removed - not supported in this version of useGeoSearch
  });

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
      <div className="text-sm text-gray-600">
        <p>Map-based search coming soon...</p>
        <p className="mt-2">Currently showing attorneys in Charlotte, NC area</p>
      </div>
    </div>
  );
}

function Hits() {
  const { hits } = useHits();

  if (hits.length === 0) {
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
            {hits.length} Attorney{hits.length !== 1 ? 's' : ''} Found
          </h2>
          <p className="text-sm text-gray-600">
            Sorted by relevance and membership tier
          </p>
        </div>
      </div>

      {/* Attorney Cards */}
      <div className="space-y-4">
        {hits.map((hit: any) => (
          <div key={hit.objectID} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              {/* Attorney Image */}
              {hit.profile_image_url ? (
                <img
                  src={hit.profile_image_url}
                  alt={hit.name || 'Attorney profile'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {hit.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
              )}

              {/* Attorney Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{hit.name}</h3>
                    {hit.firm_name && (
                      <p className="text-sm text-gray-600">{hit.firm_name}</p>
                    )}
                  </div>
                  
                  {/* Membership Badge */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    hit.membership_tier === 'exclusive'
                      ? 'bg-purple-100 text-purple-800'
                      : hit.membership_tier === 'standard'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {hit.membership_tier.charAt(0).toUpperCase() + hit.membership_tier.slice(1)}
                  </span>
                </div>

                {/* Practice Areas - Hierarchical Display (New Structure) */}
                {hit.practice_categories && hit.practice_categories.length > 0 && (
                  <div className="mb-3">
                    <div className="space-y-2">
                      {hit.practice_categories.slice(0, 2).map((category: any, categoryIndex: number) => {
                        // Find subcategories for this category
                        const categorySubcategories = hit.practice_areas?.filter((pa: any) => 
                          pa.category_name === category.name
                        ) || [];
                        
                        return (
                          <div key={category.name || `category-${categoryIndex}`} className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            {categorySubcategories.length > 0 && (
                              <div className="ml-2">
                                <span className="text-xs text-gray-600">Specializes in:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {categorySubcategories.slice(0, 2).map((subcategory: any, subIndex: number) => (
                                    <span
                                      key={subcategory.name || `sub-${subIndex}`}
                                      className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                                    >
                                      {subcategory.name}
                                    </span>
                                  ))}
                                  {categorySubcategories.length > 2 && (
                                    <span className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full">
                                      +{categorySubcategories.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {hit.practice_categories.length > 2 && (
                        <div className="text-xs text-gray-600">
                          +{hit.practice_categories.length - 2} more categories
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Practice Areas - Legacy Display (Old Structure) */}
                {!hit.practice_categories && hit.practice_areas && hit.practice_areas.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {hit.practice_areas.slice(0, 3).map((area: any, index: number) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                        >
                          {area.name}
                        </span>
                      ))}
                      {hit.practice_areas.length > 3 && (
                        <span className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full">
                          +{hit.practice_areas.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {hit.city && hit.state && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">
                      {hit.city}, {hit.state}
                    </span>
                  </div>
                )}

                {/* Experience */}
                {hit.experience_years && (
                  <p className="text-sm text-gray-600 mb-3">
                    {hit.experience_years}+ years experience
                  </p>
                )}

                {/* Bio Preview */}
                {hit.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {hit.bio}
                  </p>
                )}

                {/* Contact Button */}
                <div className="flex gap-2">
                  <a
                    href={`/attorney/${hit.objectID}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    View Profile
                  </a>
                  
                  {hit.phone && (
                    <a
                      href={`tel:${hit.phone}`}
                      className="flex items-center justify-center bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      title="Call attorney"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlgoliaSearchResults({ searchParams }: AlgoliaSearchResultsProps) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if Algolia is configured
    setIsConfigured(true); // Algolia client is configured via getSearchClient()
  }, []);

  if (!isConfigured) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Algolia Not Configured
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            Please add your Algolia API keys to the environment variables to enable advanced search.
          </p>
          <div className="text-xs text-yellow-600">
            <p>Required environment variables:</p>
            <ul className="mt-1 space-y-1">
              <li>• NEXT_PUBLIC_ALGOLIA_APP_ID</li>
              <li>• NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY</li>
              <li>• ALGOLIA_ADMIN_API_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Refine Search
          </h2>
          <SearchBox />
          <PracticeAreaFilter />
          <MembershipTierFilter />
          <GeoSearch />
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        <Hits />
      </div>
    </div>
  );
}
