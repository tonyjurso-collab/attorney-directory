import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AttorneyJoinForm } from '@/components/attorney/AttorneyJoinForm';

export default async function AttorneyJoinPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // Check if user already has an attorney profile
  const { data: existingAttorney } = await supabase
    .from('attorneys')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existingAttorney) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Join as an Attorney
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Create your attorney profile and start connecting with clients
          </p>
        </div>

        <AttorneyJoinForm userId={user.id} />
      </div>
    </div>
  );
}
