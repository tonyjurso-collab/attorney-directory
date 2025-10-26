'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import { AttorneyWithDetails } from '@/lib/types/database';
import { submitLeadToLeadProsper } from '@/lib/leadprosper/api';
import { useLeadTracking, LeadTrackingElements, LeadTrackingFooter } from '@/lib/hooks/use-lead-tracking';

const contactFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  zip_code: z.string().optional(),
  practice_area_id: z.string().min(1, 'Please select a practice area'),
  case_description: z.string().min(10, 'Please provide at least 10 characters describing your case'),
  case_value: z.string().optional(),
  urgency: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  attorney: AttorneyWithDetails;
}

export function ContactForm({ attorney }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Lead tracking hook
  const { captureTrackingIds, isLoading: trackingLoading } = useLeadTracking();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      practice_area_id: attorney.practice_areas.find(pa => pa.is_primary)?.id || attorney.practice_areas[0]?.id || '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Capture tracking IDs before submission
      const { jornayaLeadId, trustedFormCertUrl } = captureTrackingIds();
      
      console.log('📋 ContactForm Compliance Data:', {
        jornayaLeadId: jornayaLeadId || 'not captured',
        trustedFormCertUrl: trustedFormCertUrl || 'not captured',
      });

      const result = await submitLeadToLeadProsper({
        ...data,
        case_value: data.case_value ? parseFloat(data.case_value) : undefined,
        jornaya_leadid: jornayaLeadId,
        trustedform_cert_url: trustedFormCertUrl,
      }, attorney.id);

      if (result.success) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to submit your request. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const urgencyOptions = [
    { value: 'immediate', label: 'Immediate (within 24 hours)' },
    { value: 'urgent', label: 'Urgent (within a week)' },
    { value: 'moderate', label: 'Moderate (within a month)' },
    { value: 'planning', label: 'Planning ahead' },
  ];

  if (submitStatus === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Request Submitted Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            Thank you for your interest. {attorney.first_name} will review your case and contact you soon.
          </p>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Contact {attorney.first_name}
        </h2>
        <p className="text-sm text-gray-600">
          Fill out the form below and {attorney.first_name} will review your case and get back to you.
        </p>
      </div>

      {submitStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Lead tracking elements */}
        <LeadTrackingElements />
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              {...register('first_name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your first name"
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              {...register('last_name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your last name"
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              {...register('email')}
              type="email"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your.email@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              {...register('phone')}
              type="tel"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <input
              {...register('zip_code')}
              type="text"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="12345"
            />
          </div>
        </div>

        {/* Practice Area */}
        <div>
          <label htmlFor="practice_area_id" className="block text-sm font-medium text-gray-700 mb-1">
            Legal Issue *
          </label>
          <select
            {...register('practice_area_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a practice area</option>
            {attorney.practice_areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          {errors.practice_area_id && (
            <p className="mt-1 text-sm text-red-600">{errors.practice_area_id.message}</p>
          )}
        </div>

        {/* Case Description */}
        <div>
          <label htmlFor="case_description" className="block text-sm font-medium text-gray-700 mb-1">
            Case Description *
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </div>
            <textarea
              {...register('case_description')}
              rows={4}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please describe your legal issue in detail..."
            />
          </div>
          {errors.case_description && (
            <p className="mt-1 text-sm text-red-600">{errors.case_description.message}</p>
          )}
        </div>

        {/* Case Value */}
        <div>
          <label htmlFor="case_value" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Case Value (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              {...register('case_value')}
              type="number"
              step="0.01"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
            Urgency Level
          </label>
          <select
            {...register('urgency')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select urgency level</option>
            {urgencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || trackingLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </>
          )}
        </button>

        {/* Lead tracking footer */}
        <LeadTrackingFooter />
      </form>

    </div>
  );
}
