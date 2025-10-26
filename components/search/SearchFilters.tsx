'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Search, X } from 'lucide-react';

interface SearchFiltersProps {
  searchParams: {
    q?: string;
    location?: string;
    radius?: string;
  };
}



const radiusOptions = [
  { value: '5', label: '5 miles' },
  { value: '10', label: '10 miles' },
  { value: '25', label: '25 miles' },
  { value: '50', label: '50 miles' },
  { value: '100', label: '100 miles' },
];

export function SearchFilters({ searchParams }: SearchFiltersProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.q || '',
    location: searchParams.location || '',
    radius: searchParams.radius || '25',
  });

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams(currentSearchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      location: '',
      radius: '25',
    });
    
    const params = new URLSearchParams(currentSearchParams);
    params.delete('q');
    params.delete('location');
    params.delete('radius');
    
    router.push(`/search?${params.toString()}`);
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '25');

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Active Filters</span>
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </button>
        </div>
      )}

      {/* Keyword Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Keywords
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="e.g., personal injury, divorce, criminal defense..."
            value={filters.q}
            onChange={(e) => updateFilter('q', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Search by practice area, attorney name, or firm name
        </p>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="City, State, or ZIP"
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Radius Filter */}
      {filters.location && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius
          </label>
          <select
            value={filters.radius}
            onChange={(e) => updateFilter('radius', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {radiusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}


      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Active Filters:
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.q && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Keywords: {filters.q}
                <button
                  onClick={() => updateFilter('q', '')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.location && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filters.location}
                <button
                  onClick={() => updateFilter('location', '')}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
