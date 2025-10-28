'use client';

import { useState, useEffect } from 'react';
import { AttorneyCardHorizontal } from '@/components/attorney';
import { liteClient } from 'algoliasearch/lite';
import { getUserLocation, calculateDistance, getRadiusOptions, UserLocation } from '@/lib/utils/geolocation';
import { GeocodingResult } from '@/lib/utils/geocoding';
import { detectUserLocation } from '@/lib/utils/ip-geolocation';

interface SimpleAlgoliaSearchProps {
  searchParams: {
    q?: string;
    location?: string;
    radius?: string;
  };
}

export function SimpleAlgoliaSearch({ searchParams }: SimpleAlgoliaSearchProps) {
  const [query, setQuery] = useState(searchParams.q || '');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true); // Start as true, will be set to false if API fails
  const [isCheckingConfig, setIsCheckingConfig] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [manualLocation, setManualLocation] = useState<string>('');
  const [geocodedManualLocation, setGeocodedManualLocation] = useState<GeocodingResult | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(25); // Default 25 miles
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isDetectingIPLocation, setIsDetectingIPLocation] = useState(true);
  const [ipLocationDetected, setIpLocationDetected] = useState(false);

  useEffect(() => {
    // Check if Algolia is configured via API call
    const checkAlgoliaStatus = async () => {
      try {
        console.log('🔍 Starting Algolia status check...');
        const response = await fetch('/api/algolia-status');
        const data = await response.json();
        
        console.log('🔍 Algolia status check response:', data);
        if (!data.isConfigured) {
          setIsConfigured(false);
          console.log('🔍 Set isConfigured to false');
        }
      } catch (error) {
        console.error('❌ Failed to check Algolia status:', error);
        setIsConfigured(false);
      }
    };
    
    checkAlgoliaStatus();
  }, []);

  // Auto-detect user location from IP on page load
  useEffect(() => {
    const detectLocation = async () => {
      try {
        console.log('🌍 Auto-detecting user location from IP on search page...');
        const ipLocation = await detectUserLocation();
        
        if (ipLocation.success && ipLocation.formatted_address) {
          // Set the manual location field with the detected location
          setManualLocation(ipLocation.formatted_address);
          setIpLocationDetected(true);
          console.log('✅ Auto-detected location on search page:', ipLocation.formatted_address);
        } else {
          console.log('⚠️ IP geolocation failed on search page, user can manually enter location');
        }
      } catch (error) {
        console.error('❌ Error auto-detecting location on search page:', error);
      } finally {
        setIsDetectingIPLocation(false);
      }
    };

    detectLocation();
  }, []);

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    setManualLocation(''); // Clear manual location when using geolocation
    setGeocodedManualLocation(null);
    
    try {
      const location = await getUserLocation();
      setUserLocation(location);
    } catch (error: any) {
      setLocationError(error.message);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleManualLocation = (location: string) => {
    setManualLocation(location);
    setUserLocation(null); // Clear geolocation when using manual location
    setLocationError(null);
    setGeocodedManualLocation(null);
  };

  // Separate effect for geocoding manual location
  useEffect(() => {
    if (!manualLocation.trim()) return;

    const geocodeLocation = async () => {
      setIsGeocoding(true);
      try {
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: manualLocation }),
        });
        
        const geocodingResult = await response.json();
        
        if (!('error' in geocodingResult)) {
          setGeocodedManualLocation(geocodingResult);
        } else {
          setLocationError(geocodingResult.message);
        }
      } catch (error: any) {
        setLocationError(error.message || 'Failed to geocode location');
      } finally {
        setIsGeocoding(false);
      }
    };

    // Debounce geocoding to avoid too many API calls
    const timeoutId = setTimeout(geocodeLocation, 1000); // 1 second delay
    return () => clearTimeout(timeoutId);
  }, [manualLocation]);

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
        // Try Algolia first, fallback to Supabase if it fails
        let searchResults = [];
        
        // Define searchLocation outside try block so it's available in catch block
        const searchLocation = userLocation || geocodedManualLocation;
        
        try {
          // Get Algolia credentials from server-side API
          const configResponse = await fetch('/api/algolia-config');
          const config = await configResponse.json();
          
          if (!config.appId || !config.searchKey) {
            throw new Error('Algolia credentials not available');
          }
          
          const client = liteClient(config.appId, config.searchKey);
    
          // Build search parameters for liteClient (start with basic config like test page)
          const searchParams_algolia: any = {
            indexName: 'attorneys',
            query: searchParams.q || query || '', // Prioritize URL parameter over local state
            hitsPerPage: 20
          };
          
          // Only add exact filters for other criteria
          const filters: string[] = [];
          if (filters.length > 0) {
            searchParams_algolia.filters = filters;
          }

          // Add geo search if we have coordinates
          if (searchLocation && selectedRadius > 0) {
            // Convert radius from miles to meters (Algolia uses meters)
            // Ensure we have a valid integer for aroundRadius
            const radiusInMeters = Math.floor(selectedRadius * 1609.34);
            
            // Use Algolia's geo search with aroundLatLng
            searchParams_algolia.aroundLatLng = `${searchLocation.latitude},${searchLocation.longitude}`;
            searchParams_algolia.aroundRadius = radiusInMeters;
            
                // Geo search parameters applied
          } else {
            // If no location is selected, don't add geo search parameters
          }

          // Search parameters configured
          
          // Perform the search using liteClient
          const searchResponse = await client.search({
            requests: [searchParams_algolia]
          });
          
          // Process Algolia response
          const algoliaResult = searchResponse.results[0] as any;
          
          let hits = algoliaResult?.hits || [];
          
          // Check if Algolia returned any results
          if (hits.length === 0) {
            // No results found - this is normal for some search criteria
            hits = [];
            
            /* DISABLED FOR TESTING:
            // If we had geo search enabled, try without it first
            if (searchLocation && selectedRadius > 0) {
              console.log('🔄 Trying Algolia search without geo parameters...');
              
              const fallbackSearchParams = {
                indexName: 'attorneys',
                query: query,
                hitsPerPage: 20,
                filters: searchParams_algolia.filters // Keep other filters but remove geo
              };
              
              try {
                const fallbackResponse = await client.search({
                  requests: [fallbackSearchParams]
                });
                
                const fallbackResult = fallbackResponse.results[0] as any;
                const fallbackHits = fallbackResult?.hits || [];
                console.log('🔄 Fallback search results:', {
                  totalHits: fallbackResult?.nbHits,
                  hits: fallbackHits.length
                });
                
                if (fallbackHits.length > 0) {
                  console.log('✅ Fallback search successful, using results without geo filtering');
                  hits = fallbackHits;
                } else {
                  console.log('❌ Fallback search also returned 0 results, falling back to Supabase...');
                  throw new Error('Algolia returned 0 results even without geo search');
                }
              } catch (fallbackError) {
                console.log('❌ Fallback search failed, falling back to Supabase...');
                throw new Error('Algolia returned 0 results');
              }
            } else {
              console.log('❌ Algolia returned 0 results, falling back to Supabase...');
              throw new Error('Algolia returned 0 results');
            }
            */
          }
          
          // Transform Algolia hits to match AttorneyCard expected structure
          hits = hits.map((hit: any) => {
            // Split the name into first_name and last_name
            const nameParts = hit.name ? hit.name.split(' ') : ['', ''];
            const first_name = nameParts[0] || '';
            const last_name = nameParts.slice(1).join(' ') || '';
            
            // Transform the hit to match expected structure
            const transformedHit = {
              ...hit,
              // Map objectID to id for AttorneyCard component
              id: hit.objectID,
              // Add the expected fields
              first_name,
              last_name,
              // Keep original name for reference
              full_name: `${first_name} ${last_name}`,
              // Ensure other expected fields exist
              firm_name: hit.firm_name || null,
              bio: hit.bio || null,
              experience_years: hit.experience_years || null,
              phone: hit.phone || null,
              email: hit.email || null,
              website: hit.website || null,
              city: hit.city || null,
              state: hit.state || null,
              zip_code: hit.zip_code || null,
              profile_image_url: hit.profile_image_url || null,
              firm_logo_url: hit.firm_logo_url || null,
              membership_tier: hit.membership_tier || 'free',
              is_verified: hit.is_verified || false,
              practice_categories: hit.practice_categories || [],
              practice_areas: (hit.practice_areas || []).map((area: any, index: number) => ({
                id: area.id || area.slug || `practice-area-${index}`,
                name: area.name || 'Unknown Practice Area',
                slug: area.slug || area.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
                category_id: area.category_id || null,
                category_name: area.category_name || null
              })),
              average_rating: hit.average_rating || null,
              review_count: hit.review_count || 0,
              // Keep geo data
              latitude: hit.latitude,
              longitude: hit.longitude,
              formatted_address: hit.formatted_address,
              _geoloc: hit._geoloc
            };
            
            return transformedHit;
          });
          
          // Add distance information for display (Algolia handles the geo filtering server-side)
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
            });
          }
          
          // Results processed
          setResults(hits);
            } catch (error) {
              // Search completed with no results - this is normal
              setResults([]);
          
          /* DISABLED FOR TESTING:
          try {
            const response = await fetch('/api/search/supabase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query,
                location: searchLocation || geocodedManualLocation,
                radius: selectedRadius
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('📥 Supabase API response:', {
                status: response.status,
                resultsCount: data.results?.length || 0,
                results: data.results
              });
              setResults(data.results || []);
              console.log('✅ Supabase fallback search successful:', data.results?.length || 0, 'results');
            } else {
              const errorData = await response.json();
              console.error('❌ Supabase fallback also failed:', errorData);
              setResults([]);
            }
          } catch (fallbackError) {
            console.error('❌ Supabase fallback error:', fallbackError);
            setResults([]);
          }
          */
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [query, searchParams.q, searchParams.location, searchParams.radius, isConfigured, userLocation, selectedRadius, geocodedManualLocation]);

  if (!isConfigured) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Search Service Unavailable
          </h3>
          <p className="text-red-700 mb-4">
            The attorney search service is not properly configured. Please contact the site administrator.
          </p>
          <details className="text-left text-sm text-red-600 mt-4">
            <summary className="cursor-pointer font-medium">Technical Details</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded">
              Missing Algolia credentials.
              Check .env.local file and restart server.
            </pre>
          </details>
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
                  placeholder={isDetectingIPLocation ? "Auto-detecting your location..." : "City, state, or zip code (e.g., Charlotte, NC or 28202)"}
                  disabled={isGeocoding || isDetectingIPLocation}
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
                      ) : ipLocationDetected ? (
                        <p className="text-xs text-green-600">✅ Auto-detected from your IP address</p>
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

              {/* Privacy Notice */}
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  We use your IP address to suggest nearby attorneys. You can change the location above.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {searchParams.q && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Keywords: {searchParams.q}
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
              </select>
            </div>
          </div>

          {/* Attorney Cards */}
          <div className="space-y-4">
            {results.map((attorney) => (
              <AttorneyCardHorizontal key={attorney.objectID} attorney={attorney} />
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