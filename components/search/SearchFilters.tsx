'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  searchParams: {
    q?: string;
    practice_area?: string;
    location?: string;
    tier?: string;
    radius?: string;
  };
}

const practiceAreas = [
  { id: 'personal-injury', name: 'Personal Injury' },
  { id: 'family-law', name: 'Family Law' },
  { id: 'criminal-defense', name: 'Criminal Defense' },
  { id: 'business-law', name: 'Business Law' },
  { id: 'real-estate-law', name: 'Real Estate Law' },
  { id: 'estate-planning', name: 'Estate Planning' },
  { id: 'immigration-law', name: 'Immigration Law' },
  { id: 'employment-law', name: 'Employment Law' },
  { id: 'bankruptcy', name: 'Bankruptcy' },
  { id: 'dui-defense', name: 'DUI/DWI Defense' },
];

const membershipTiers = [
  { id: 'exclusive', name: 'Exclusive', description: 'Premium features' },
  { id: 'standard', name: 'Standard', description: 'Enhanced visibility' },
  { id: 'free', name: 'Free', description: 'Basic listing' },
];

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
    practice_area: searchParams.practice_area || '',
    location: searchParams.location || '',
    tier: searchParams.tier || '',
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
      practice_area: '',
      location: '',
      tier: '',
      radius: '25',
    });
    
    const params = new URLSearchParams(currentSearchParams);
    params.delete('practice_area');
    params.delete('location');
    params.delete('tier');
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

      {/* Practice Area Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Practice Area
        </label>
        <select
          value={filters.practice_area}
          onChange={(e) => updateFilter('practice_area', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Practice Areas</option>
          {practiceAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
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

      {/* Membership Tier Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Membership Tier
        </label>
        <div className="space-y-2">
          {membershipTiers.map((tier) => (
            <label key={tier.id} className="flex items-center">
              <input
                type="radio"
                name="tier"
                value={tier.id}
                checked={filters.tier === tier.id}
                onChange={(e) => updateFilter('tier', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">
                  {tier.name}
                </div>
                <div className="text-xs text-gray-500">
                  {tier.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Active Filters:
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.practice_area && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {practiceAreas.find(pa => pa.id === filters.practice_area)?.name}
                <button
                  onClick={() => updateFilter('practice_area', '')}
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
            
            {filters.tier && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {membershipTiers.find(t => t.id === filters.tier)?.name}
                <button
                  onClick={() => updateFilter('tier', '')}
                  className="ml-1 hover:text-purple-600"
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
