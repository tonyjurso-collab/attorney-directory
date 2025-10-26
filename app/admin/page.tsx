import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  try {
    const supabase = await createClient();
    
    // Check if Supabase is properly configured
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('❌ Supabase not properly configured');
      redirect('/login');
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      redirect('/login');
    }

    // Get user profile and check for admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError);
      redirect('/login');
    }

    // Check if user is admin
    if (profile.role !== 'admin') {
      console.error('❌ User is not an admin, role:', profile.role);
      redirect('/');
    }

    return (
      <div className="min-h-screen bg-gray-50">
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
          <AdminDashboard />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error in AdminPage:', error);
    redirect('/login');
  }
}
