'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, User, LogOut, Settings, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useRef } from 'react';
import { mobileMenuSlide } from '@/lib/animations/variants';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [attorneyProfileImage, setAttorneyProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Get user profile to check role and get profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, first_name, last_name, full_name, avatar_url, attorneys(profile_image_url)')
          .eq('id', user.id)
          .single();
        console.log('🔍 Navigation: Fetched profile data:', profile);
        setUserProfile(profile);
        
        // Extract attorney profile image if user is an attorney
        if (profile?.role === 'attorney' && profile?.attorneys?.[0]?.profile_image_url) {
          setAttorneyProfileImage(profile.attorneys[0].profile_image_url);
        } else {
          setAttorneyProfileImage(null);
        }
      }
      
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Get user profile to check role and get profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, first_name, last_name, full_name, avatar_url, attorneys(profile_image_url)')
          .eq('id', session.user.id)
          .single();
        console.log('🔍 Navigation: Auth state change - Fetched profile data:', profile);
        setUserProfile(profile);
        
        // Extract attorney profile image if user is an attorney
        if (profile?.role === 'attorney' && profile?.attorneys?.[0]?.profile_image_url) {
          setAttorneyProfileImage(profile.attorneys[0].profile_image_url);
        } else {
          setAttorneyProfileImage(null);
        }
      } else {
        setUserProfile(null);
        setAttorneyProfileImage(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleSignOut = async () => {
    try {
      console.log('🔄 Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        return;
      }
      console.log('✅ Successfully signed out');
      router.push('/');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/LegalHubLogo.png"
                alt="LegalHub Logo"
                width={300}
                height={60}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/search"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Search className="h-4 w-4 mr-1" />
                Find Attorneys
              </Link>
              
              {!user && (
                <Link
                  href="/pricing"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pricing
                </Link>
              )}
              
              {!user && (
                <Link
                  href="/register"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Attorney Registration
                </Link>
              )}
              
              {userProfile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {loading ? (
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                  
                  {userProfile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Admin
                    </Link>
                  )}
                  
                  <div className="relative group" ref={profileRef}>
                    <button 
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                      {(() => {
                        // For admin users, always show "A"
                        if (userProfile?.role === 'admin') {
                          return (
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                              A
                            </div>
                          );
                        }
                        
                        // For attorney users, check attorney profile image first
                        if (userProfile?.role === 'attorney' && attorneyProfileImage) {
                          return (
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={attorneyProfileImage}
                              alt={`${userProfile.first_name || ''} ${userProfile.last_name || ''}`}
                            />
                          );
                        }
                        
                        // Fallback to initials for attorneys without profile image
                        return (
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {(() => {
                              console.log('🎯 Navigation: Computing initials for userProfile:', userProfile);
                              console.log('🎯 Navigation: User email:', user?.email);
                              
                              // Try to get initials from first_name and last_name
                              if (userProfile?.first_name && userProfile?.last_name) {
                                const initials = `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
                                console.log('✅ Navigation: Using first_name + last_name initials:', initials);
                                return initials;
                              }
                              
                              // Fall back to full_name if available
                              if (userProfile?.full_name) {
                                const nameParts = userProfile.full_name.trim().split(' ');
                                if (nameParts.length >= 2) {
                                  const initials = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
                                  console.log('✅ Navigation: Using full_name initials:', initials);
                                  return initials;
                                }
                                const initial = userProfile.full_name[0].toUpperCase();
                                console.log('✅ Navigation: Using full_name single initial:', initial);
                                return initial;
                              }
                              
                              // Final fallback to email first letter
                              const emailInitial = user.email?.[0]?.toUpperCase() || 'U';
                              console.log('⚠️ Navigation: Using email fallback initial:', emailInitial);
                              return emailInitial;
                            })()}
                          </div>
                        );
                      })()}
                    </button>
                    
                    <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 transition-all duration-200 border border-gray-200 ${isProfileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="md:hidden"
            variants={mobileMenuSlide}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link
              href="/search"
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Search className="h-4 w-4 mr-2" />
              Find Attorneys
            </Link>
            
            {!user && (
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
            )}
            
            {!user && (
              <Link
                href="/attorney/join"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Join as Attorney
              </Link>
            )}
            
            {userProfile?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Link>
            )}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                
                {userProfile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                )}
                
                <Link
                  href="/dashboard/profile"
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile Settings
                </Link>
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium flex items-center w-full text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
