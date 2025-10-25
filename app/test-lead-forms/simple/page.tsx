'use client';

import { useState } from 'react';
import { useLeadCompliance } from '@/lib/hooks/use-lead-compliance';

export default function SimpleContactFormPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    zip_code: '',
    describe: '',
  });
  
  const [locationData, setLocationData] = useState({
    city: '',
    state: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Capture compliance data
  const { jornayaLeadId, trustedFormCertUrl } = useLeadCompliance();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, phone: value }));
    }
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };
  
  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setFormData(prev => ({ ...prev, zip_code: value }));
    
    // Clear error
    if (errors.zip_code) {
      setErrors(prev => ({ ...prev, zip_code: '' }));
    }
    
    // If we have a complete 5-digit zip, look up city/state
    if (value.length === 5) {
      try {
        const response = await fetch(`/api/geocode-zip?zip=${value}`);
        const data = await response.json();
        
        if (response.ok && data.city && data.state) {
          setLocationData({
            city: data.city,
            state: data.state,
          });
        } else {
          console.error('Failed to geocode zip:', data.error);
          setLocationData({ city: '', state: '' });
        }
      } catch (error) {
        console.error('Error geocoding zip:', error);
        setLocationData({ city: '', state: '' });
      }
    } else {
      setLocationData({ city: '', state: '' });
    }
  };

  const formatPhone = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.replace(/\D/g, '').length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'Zip code is required';
    } else if (!/^\d{5}$/.test(formData.zip_code)) {
      newErrors.zip_code = 'Please enter a valid 5-digit zip code';
    }
    
    // Validate that we were able to geocode the zip
    if (formData.zip_code.length === 5 && (!locationData.city || !locationData.state)) {
      newErrors.zip_code = 'Unable to verify zip code. Please try again.';
    }

    if (!formData.describe.trim()) {
      newErrors.describe = 'Please describe your legal issue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Capture TrustedForm certificate URL from hidden input (TrustedForm injects this field)
      const tfCertInput = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement;
      const tfCertUrl = tfCertInput?.value || trustedFormCertUrl || 'https://trustedform.com/cert_url';
      
      console.log('📋 Compliance Data:', {
        jornayaLeadId: jornayaLeadId || 'not captured',
        trustedFormCertUrl: tfCertUrl,
      });
      
      const response = await fetch('/api/lead-capture/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          city: locationData.city,
          state: locationData.state,
          phone: formatPhone(formData.phone),
          practice_area: 'general_legal_assistance', // Test with general
          jornaya_leadid: jornayaLeadId || 'test-jornaya-id',
          trustedform_cert_url: tfCertUrl || 'https://trustedform.com/cert_url',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          zip_code: '',
          describe: '',
        });
        setLocationData({ city: '', state: '' });
      } else {
        setSubmitStatus('error');
        console.error('Submission failed:', data);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Simple Contact Form Test
            </h1>
            <p className="text-gray-600">
              Basic contact form with validation for testing LeadProsper integration.
            </p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">
                  Thank you! We'll be in touch soon.
                </span>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">
                  There was an error submitting your form. Please try again.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-tf-form-required>
            {/* TrustedForm automatically injects xxTrustedFormCertUrl hidden input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formatPhone(formData.phone)}
                onChange={handlePhoneChange}
                className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Zip Code (standalone) */}
            <div>
              <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleZipChange}
                maxLength={5}
                className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.zip_code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="28202"
              />
              {errors.zip_code && (
                <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>
              )}
              {locationData.city && locationData.state && !errors.zip_code && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ {locationData.city}, {locationData.state}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="describe" className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Legal Issue <span className="text-red-500">*</span>
              </label>
              <textarea
                id="describe"
                name="describe"
                value={formData.describe}
                onChange={handleChange}
                rows={4}
                className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.describe ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please provide details about your legal matter..."
              />
              {errors.describe && (
                <p className="mt-1 text-sm text-red-600">{errors.describe}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
