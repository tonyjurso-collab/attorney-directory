import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentLeads } from '@/components/dashboard/RecentLeads';
import { ProfileOverview } from '@/components/dashboard/ProfileOverview';
import { SubscriptionStatus } from '@/components/dashboard/SubscriptionStatus';

export default async function DashboardPage() {
  const supabase = await createClient();
  
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
      attorney_practice_areas (
        practice_area_id,
        is_primary,
        practice_areas (
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (attorneyError || !attorney) {
    redirect('/attorney/join');
  }

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
          <DashboardHeader attorney={attorney} />
          
          <div className="mt-8">
            <DashboardStats attorneyId={attorney.id} />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecentLeads attorneyId={attorney.id} />
            </div>
            
            <div className="space-y-6">
              <ProfileOverview attorney={attorney} />
              <SubscriptionStatus attorney={attorney} />
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
