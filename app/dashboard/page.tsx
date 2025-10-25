import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ProfileEditor } from '@/components/dashboard/ProfileEditor';
import { ProfileOverview } from '@/components/dashboard/ProfileOverview';
import { SubscriptionStatus } from '@/components/dashboard/SubscriptionStatus';

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    
    // Check if Supabase is properly configured
    if (!supabase || typeof supabase.from !== 'function') {
      redirect('/login');
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      redirect('/login');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'attorney') {
      redirect('/');
    }

    // Get attorney data
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

    if (attorneyError || !attorney) {
      redirect('/attorney/join');
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

    return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="space-y-6">
            <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        }>
          <DashboardHeader attorney={transformedAttorney} />
          
          <div className="mt-8">
            <DashboardStats attorneyId={transformedAttorney.id} />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ProfileEditor attorney={transformedAttorney} />
            </div>
            
            <div className="space-y-6">
              <ProfileOverview attorney={transformedAttorney} />
              <SubscriptionStatus attorney={transformedAttorney} />
            </div>
          </div>
        </Suspense>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error in DashboardPage:', error);
    redirect('/login');
  }
}
