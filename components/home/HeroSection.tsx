'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, Users, Star } from 'lucide-react';
import { getUserLocation } from '@/lib/utils/geolocation';
import { LocationData } from '@/lib/types/database';

export function HeroSection() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoadingLocation(true);
      try {
        const currentLocation = await getUserLocation();
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Find the Right
            <span className="block text-blue-300">Attorney for You</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Connect with qualified legal professionals in your area. 
            Get matched with attorneys who specialize in your specific needs.
          </p>

          {/* Location Display */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <MapPin className="h-5 w-5 text-blue-300" />
            {isLoadingLocation ? (
              <span className="text-blue-200">Detecting your location...</span>
            ) : location ? (
              <span className="text-blue-200">
                {location.city && location.state 
                  ? `${location.city}, ${location.state}`
                  : 'Location detected'
                }
              </span>
            ) : (
              <span className="text-blue-200">Enter your location to get started</span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-blue-300" />
              </div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-blue-200">Qualified Attorneys</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Search className="h-8 w-8 text-blue-300" />
              </div>
              <div className="text-2xl font-bold">50+</div>
              <div className="text-blue-200">Practice Areas</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-blue-300" />
              </div>
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-blue-200">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
