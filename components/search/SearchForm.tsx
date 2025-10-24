'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Filter } from 'lucide-react';
import { getCurrentLocation } from '@/lib/utils/geolocation';
import { LocationData } from '@/lib/types/database';

interface PracticeArea {
  id: string;
  name: string;
  slug: string;
}

const practiceAreas: PracticeArea[] = [
  { id: '1', name: 'Personal Injury', slug: 'personal-injury' },
  { id: '2', name: 'Family Law', slug: 'family-law' },
  { id: '3', name: 'Criminal Defense', slug: 'criminal-defense' },
  { id: '4', name: 'Business Law', slug: 'business-law' },
  { id: '5', name: 'Real Estate Law', slug: 'real-estate-law' },
  { id: '6', name: 'Estate Planning', slug: 'estate-planning' },
  { id: '7', name: 'Immigration Law', slug: 'immigration-law' },
  { id: '8', name: 'Employment Law', slug: 'employment-law' },
  { id: '9', name: 'Bankruptcy', slug: 'bankruptcy' },
  { id: '10', name: 'DUI/DWI Defense', slug: 'dui-defense' },
];

export function SearchForm() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState('');
  const [location, setLocation] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleLocationClick = async () => {
    setIsLoadingLocation(true);
    try {
      const currentLocation = await getCurrentLocation();
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
    if (selectedPracticeArea) params.set('practice_area', selectedPracticeArea);
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

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Practice Area Select */}
          <div className="relative">
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="block w-full px-3 py-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg appearance-none"
            >
              <option value="">All Practice Areas</option>
              {practiceAreas.map((area) => (
                <option key={area.id} value={area.slug}>
                  {area.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
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
