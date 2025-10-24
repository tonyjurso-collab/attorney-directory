import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AttorneyProfile } from '@/components/attorney/AttorneyProfile';
import { ContactForm } from '@/components/attorney/ContactForm';
import { createClient } from '@/lib/supabase/server';

interface AttorneyPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getAttorney(id: string) {
  try {
    const supabase = await createClient();
    
    // Check if Supabase is properly configured
    if (!supabase || typeof supabase.from !== 'function') {
      console.log('Supabase not configured, returning null');
      return null;
    }
    
    console.log('Looking for attorney with ID:', id);
    
    const { data: attorney, error } = await supabase
      .from('attorneys')
      .select(`
        *,
        attorney_practice_areas (
          practice_area_id,
          is_primary,
          practice_areas (
            id,
            name,
            slug,
            description
          )
        ),
        reviews (
          id,
          rating,
          review_text,
          client_name,
          created_at
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching attorney:', error);
      return null;
    }
    
    if (!attorney) {
      console.log('No attorney found with ID:', id);
      return null;
    }
    
    console.log('Found attorney:', attorney.first_name, attorney.last_name);

    // Calculate average rating
    const averageRating = attorney.reviews?.length 
      ? attorney.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / attorney.reviews.length
      : 0;

    return {
      ...attorney,
      practice_areas: attorney.attorney_practice_areas?.map((apa: any) => ({
        id: apa.practice_areas?.id,
        name: apa.practice_areas?.name,
        slug: apa.practice_areas?.slug,
        description: apa.practice_areas?.description,
        is_primary: apa.is_primary,
      })).filter(pa => pa.id) || [], // Filter out any null/undefined practice areas
      average_rating: averageRating,
      review_count: attorney.reviews?.length || 0,
    };
  } catch (error) {
    console.error('Error in getAttorney:', error);
    return null;
  }
}

export default async function AttorneyPage({ params }: AttorneyPageProps) {
  // Await the params Promise in Next.js 15
  const resolvedParams = await params;
  const attorney = await getAttorney(resolvedParams.id);

  if (!attorney) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Suspense fallback={
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            }>
              <AttorneyProfile attorney={attorney} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Suspense fallback={
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              }>
                <ContactForm attorney={attorney} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
