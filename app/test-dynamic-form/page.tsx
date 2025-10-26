'use client';

import { DynamicLeadForm } from '@/components/attorney/DynamicLeadForm';

// Mock attorney data for testing
const mockAttorney = {
  id: '11111111-1111-1111-1111-111111111111',
  first_name: 'John',
  last_name: 'Smith',
  email: 'john.smith@example.com',
  phone: '(704) 555-0101',
  bio: 'Experienced attorney specializing in personal injury law.',
  city: 'Dallas',
  state: 'NC',
  zip_code: '28034',
  practice_areas: [],
  practice_categories: [],
  google_rating: 4.2,
  google_review_count: 12,
  googleReviews: []
};

export default function TestDynamicFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test Dynamic Lead Form
          </h1>
          <p className="text-gray-600 mb-6">
            This page tests the dynamic lead form with practice area selection. 
            Try selecting different practice areas to see custom fields appear.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>Fill out the standard fields (name, email, phone, zip)</li>
              <li>Select a practice area from the dropdown</li>
              <li>Watch for custom fields to appear below</li>
              <li>Try different practice areas to see different custom fields</li>
              <li>Test form validation and submission</li>
            </ol>
          </div>
        </div>

        <DynamicLeadForm attorney={mockAttorney as any} />
      </div>
    </div>
  );
}
