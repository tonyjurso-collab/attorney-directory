'use client';

import { useState, useEffect } from 'react';
import { AttorneyCard } from '@/components/attorney/AttorneyCard';
import { liteClient } from 'algoliasearch/lite';
import { getUserLocation, calculateDistance, getRadiusOptions, UserLocation } from '@/lib/utils/geolocation';
import { geocodeAddress, GeocodingResult } from '@/lib/utils/geocoding';

interface EnhancedAlgoliaSearchProps {
  searchParams: {
    q?: string;
    practice_area?: string;
    location?: string;
    tier?: string;
    radius?: string;
  };
}

export function EnhancedAlgoliaSearch({ searchParams }: EnhancedAlgoliaSearchProps) {
  const [query, setQuery] = useState(searchParams.q || '');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [manualLocation, setManualLocation] = useState<string>('');
  const [geocodedManualLocation, setGeocodedManualLocation] = useState<GeocodingResult | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(25); // Default 25 miles
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    // Check if Algolia is configured
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
    setIsConfigured(!!(appId && searchKey));
  }, []);

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    setManualLocation(''); // Clear manual location when using geolocation
    
    try {
      const location = await getUserLocation();
      setUserLocation(location);
    } catch (error: any) {
      setLocationError(error.message);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleManualLocation = async (location: string) => {
    setManualLocation(location);
    setUserLocation(null); // Clear geolocation when using manual location
    setLocationError(null);
    setGeocodedManualLocation(null);
    
    if (location.trim()) {
      setIsGeocoding(true);
      try {
        const geocodingResult = await geocodeAddress(location);
        if ('error' in geocodingResult) {
          setLocationError(geocodingResult.message);
        } else {
          setGeocodedManualLocation(geocodingResult);
        }
      } catch (error: any) {
        setLocationError(error.message || 'Failed to geocode location');
      } finally {
        setIsGeocoding(false);
      }
    }
  };

  const clearLocation = () => {
    setUserLocation(null);
    setManualLocation('');
    setGeocodedManualLocation(null);
    setLocationError(null);
  };

  useEffect(() => {
    if (!isConfigured) return;

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const client = liteClient(
          process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
          process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
        );
        
        // Build search parameters
        const searchParams_algolia: any = {
          indexName: 'attorneys',
          query: query,
          hitsPerPage: 20,
          filters: []
        };

        // Add practice area filter
        if (searchParams.practice_area) {
          searchParams_algolia.filters.push(`practice_areas.name:"${searchParams.practice_area}"`);
        }

        // Add tier filter
        if (searchParams.tier) {
          searchParams_algolia.filters.push(`membership_tier:"${searchParams.tier}"`);
        }

        // Add geo search if we have coordinates
        const searchLocation = userLocation || geocodedManualLocation;
        if (searchLocation && selectedRadius > 0) {
          // Convert radius from miles to meters (Algolia uses meters)
          const radiusInMeters = selectedRadius * 1609.34;
          
          // Use Algolia's geo search with aroundLatLng
          searchParams_algolia.aroundLatLng = `${searchLocation.latitude},${searchLocation.longitude}`;
          searchParams_algolia.aroundRadius = radiusInMeters;
        }

        // Use the correct search method for liteClient
        const searchResponse = await client.search({
          requests: [searchParams_algolia]
        });
        
        let hits = searchResponse.results[0]?.hits || [];
        
        // Add distance information if we have a search location
        if (searchLocation) {
          hits = hits.map((hit: any) => {
            if (hit._geoloc?.lat && hit._geoloc?.lng) {
              const distance = calculateDistance(
                searchLocation.latitude,
                searchLocation.longitude,
                hit._geoloc.lat,
                hit._geoloc.lng
              );
              return { ...hit, distance };
            }
            return hit;
          }).sort((a: any, b: any) => {
            // Sort by distance if both have distances
            if (a.distance !== undefined && b.distance !== undefined) {
              return a.distance - b.distance;
            }
            // If only one has distance, prioritize it
            if (a.distance !== undefined) return -1;
            if (b.distance !== undefined) return 1;
            return 0;
          });
        }
        
        setResults(hits);
      } catch (error) {
        console.error('Algolia search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [query, searchParams, isConfigured, userLocation, selectedRadius, manualLocation, geocodedManualLocation]);

  if (!isConfigured) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Algolia Not Configured
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            Please add your Algolia API keys to your `.env.local` file to enable advanced search features.
          </p>
          <p className="text-xs text-yellow-600">
            Falling back to basic Supabase search.
          </p>
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
          
          {/* Search Input */}
          <div className="mb-4">
            <label htmlFor="search-query" className="sr-only">Search attorneys</label>
            <input
              type="text"
              id="search-query"
              placeholder="Search by name, firm, or practice area..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Location Controls */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Location & Distance</h3>
            
            <div className="space-y-3">
              {/* Manual Location Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter location manually
                </label>
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => handleManualLocation(e.target.value)}
                  placeholder="City, state, or zip code (e.g., Charlotte, NC or 28202)"
                  disabled={isGeocoding}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isGeocoding && (
                  <div className="mt-1 text-xs text-blue-600 flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Geocoding location...
                  </div>
                )}
              </div>

              {/* Location Options */}
              <div className="flex gap-2">
                <button
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  {isGettingLocation ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Getting...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Use My Location
                    </>
                  )}
                </button>
                
                {(userLocation || manualLocation || geocodedManualLocation) && (
                  <button
                    onClick={clearLocation}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Current Location Display */}
              {userLocation && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        📍 {userLocation.city && userLocation.state 
                          ? `${userLocation.city}, ${userLocation.state}` 
                          : 'Location detected'}
                      </p>
                      <p className="text-xs text-blue-600">
                        {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Location Display */}
              {manualLocation && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        📍 {manualLocation}
                      </p>
                      {geocodedManualLocation ? (
                        <div className="text-xs text-green-600">
                          <p>✅ Geocoded: {geocodedManualLocation.formatted_address}</p>
                          <p>Coordinates: {geocodedManualLocation.latitude.toFixed(4)}, {geocodedManualLocation.longitude.toFixed(4)}</p>
                        </div>
                      ) : isGeocoding ? (
                        <p className="text-xs text-green-600">🔄 Geocoding...</p>
                      ) : (
                        <p className="text-xs text-green-600">Manual location search</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search Radius */}
              {(userLocation || geocodedManualLocation) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search radius
                  </label>
                  <select
                    value={selectedRadius}
                    onChange={(e) => setSelectedRadius(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getRadiusOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {locationError && (
                <p className="text-sm text-red-600">{locationError}</p>
              )}
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {searchParams.practice_area && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Practice Area: {searchParams.practice_area}
              </span>
            )}
            {searchParams.tier && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Tier: {searchParams.tier}
              </span>
            )}
            {searchParams.location && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Location: {searchParams.location}
              </span>
            )}
            {userLocation && selectedRadius > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                Within {selectedRadius} miles
              </span>
            )}
            {geocodedManualLocation && selectedRadius > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Within {selectedRadius} miles of {geocodedManualLocation.city || manualLocation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="lg:col-span-3 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="lg:col-span-3 text-center py-12">
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
      ) : (
        <div className="lg:col-span-3 space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {results.length} Attorney{results.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-sm text-gray-600">
                Sorted by relevance and distance
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
            {results.map((attorney) => (
              <AttorneyCard key={attorney.objectID} attorney={attorney} />
            ))}
          </div>

          {/* Load More Button */}
          {results.length >= 20 && (
            <div className="text-center pt-8">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Load More Results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
