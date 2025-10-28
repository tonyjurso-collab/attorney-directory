'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserLocation } from '@/lib/utils/geolocation';
import { detectUserLocation } from '@/lib/utils/ip-geolocation';
import { fadeIn, slideUp, hoverScale } from '@/lib/animations/variants';

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isDetectingIPLocation, setIsDetectingIPLocation] = useState(true);
  const [locationDetected, setLocationDetected] = useState(false);

  // Automatically detect user location on page load
  useEffect(() => {
    const detectLocation = async () => {
      try {
        console.log('🌍 Auto-detecting user location from IP...');
        const ipLocation = await detectUserLocation();
        
        if (ipLocation.success && ipLocation.formatted_address) {
          setLocation(ipLocation.formatted_address);
          setLocationDetected(true);
          console.log('✅ Auto-detected location:', ipLocation.formatted_address);
        } else {
          console.log('⚠️ IP geolocation failed, user can manually enter location');
        }
      } catch (error) {
        console.error('❌ Error auto-detecting location:', error);
      } finally {
        setIsDetectingIPLocation(false);
      }
    };

    detectLocation();
  }, []);

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
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Find the Right
            <span className="block text-blue-300">Attorney for You</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Connect with qualified legal professionals in your area. 
            Get matched with attorneys who specialize in your specific needs.
          </motion.p>

          {/* Search Form */}
          <motion.div 
            className="max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Main Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for attorneys, firms, or legal services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                />
              </div>

              {/* Location Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={isDetectingIPLocation ? "Detecting your location..." : "City, State, or ZIP Code"}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isDetectingIPLocation}
                  className="block w-full pl-12 pr-24 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={handleLocationClick}
                  disabled={isLoadingLocation || isDetectingIPLocation}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 font-medium"
                >
                  {isDetectingIPLocation ? 'Auto-detecting...' : isLoadingLocation ? 'Detecting...' : 'Use My Location'}
                </button>
              </div>

              {/* Location Detection Success Message */}
              {locationDetected && (
                <div className="text-center">
                  <p className="text-sm text-green-200 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Location auto-detected! Showing attorneys near you.
                  </p>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="text-center">
                <p className="text-xs text-blue-200">
                  We use your IP address to suggest nearby attorneys. You can change the location above.
                </p>
              </div>

              {/* Search Button */}
              <div className="flex justify-center">
                <motion.button
                  type="submit"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  whileHover={hoverScale}
                  whileTap={{ scale: 0.98 }}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Find Attorneys
                </motion.button>
              </div>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
