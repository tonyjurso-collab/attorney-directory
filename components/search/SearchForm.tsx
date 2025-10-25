'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { getUserLocation } from '@/lib/utils/geolocation';

export function SearchForm() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleLocationClick = async () => {
    setIsLoadingLocation(true);
    try {
      const currentLocation = await getUserLocation();
      if (currentLocation) {
        const locationString = currentLocation.city && currentLocation.state 
          ? `${currentLocation.city}, ${currentLocation.state}`
          : 'Current Location';
        setLocation(locationString);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for attorneys, firms, or legal services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>

        {/* Location Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="City, State, or ZIP Code"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full pl-10 pr-20 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          <button
            type="button"
            onClick={handleLocationClick}
            disabled={isLoadingLocation}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {isLoadingLocation ? 'Detecting...' : 'Use My Location'}
          </button>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Search className="h-5 w-5 mr-2" />
            Find Attorneys
          </button>
        </div>
      </form>
    </div>
  );
}
