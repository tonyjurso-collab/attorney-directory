'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ProfileEditor } from '@/components/dashboard/ProfileEditor';
import { ProfileOverview } from '@/components/dashboard/ProfileOverview';
import { SubscriptionStatus } from '@/components/dashboard/SubscriptionStatus';
import { fadeIn, slideUp, staggerContainer } from '@/lib/animations/variants';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [attorney, setAttorney] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if Supabase is properly configured
        if (!supabase || typeof supabase.from !== 'function') {
          console.error('❌ Supabase not properly configured');
          router.push('/login');
          return;
        }
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        console.log('👤 Auth check:', { 
          hasUser: !!user, 
          userId: user?.id, 
          authError: authError?.message 
        });
        
        if (authError || !user) {
          console.error('❌ Auth error:', authError);
          router.push('/login');
          return;
        }

        setUser(user);

        // Get user profile
        console.log('📋 Fetching profile for user:', user.id);
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        console.log('📋 Profile result:', { 
          profile, 
          profileError: profileError?.message 
        });

        // If profile doesn't exist, create it
        if (profileError || !profile) {
          console.log('⚠️ Profile not found, creating new profile...');
          
          // Create profile for this user
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              full_name: user.user_metadata?.full_name || '', // Keep for backwards compatibility
              role: 'attorney',
            })
            .select()
            .single();

          if (createError || !newProfile) {
            console.error('❌ Failed to create profile:', createError);
            router.push('/login');
            return;
          }

          profile = newProfile;
          console.log('✅ Profile created:', profile);
        }

        // Check role
        if (profile.role !== 'attorney') {
          console.error('❌ User is not an attorney, role:', profile.role);
          router.push('/');
          return;
        }

        setProfile(profile);

        // Get attorney data
        console.log('📋 Fetching attorney data for user:', user.id);
        const { data: attorney, error: attorneyError } = await supabase
          .from('attorneys')
          .select(`
            *,
            attorney_practice_categories (
              category_id,
              practice_area_categories (
                id,
                name,
                slug
              )
            ),
            attorney_practice_areas (
              practice_area_id,
              practice_areas (
                id,
                name,
                slug,
                category_id
              )
            )
          `)
          .eq('user_id', user.id)
          .single();

        console.log('📋 Attorney result:', { 
          attorney: !!attorney, 
          attorneyError: attorneyError?.message 
        });

        if (attorneyError || !attorney) {
          console.error('❌ Error fetching attorney:', attorneyError);
          router.push('/attorney/join');
          return;
        }

        // Transform the attorney data to match component expectations
        const transformedAttorney = {
          ...attorney,
          selected_categories: attorney.attorney_practice_categories?.map((apc: any) => apc.category_id) || [],
          practice_areas: attorney.attorney_practice_areas?.map((apa: any) => ({
            id: apa.practice_areas?.id,
            name: apa.practice_areas?.name,
            slug: apa.practice_areas?.slug,
            category_id: apa.practice_areas?.category_id,
          })).filter(pa => pa.id) || [], // Filter out any null/undefined practice areas
        };

        setAttorney(transformedAttorney);
        console.log('✅ Dashboard data loaded successfully');

      } catch (error) {
        console.error('Error in DashboardPage:', error);
        setError('Failed to load dashboard data');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !attorney) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">{error || 'Unable to load attorney data'}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <DashboardHeader attorney={attorney} />
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DashboardStats attorneyId={attorney.id} />
        </motion.div>

        <motion.div
          className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="lg:col-span-2">
            <ProfileEditor attorney={attorney} />
          </div>

          <div className="space-y-6">
            <ProfileOverview attorney={attorney} />
            <SubscriptionStatus attorney={attorney} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}