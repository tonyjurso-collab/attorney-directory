'use client';

import { useState } from 'react';
import { validateEmail, validatePhone, validateZipCode, validateState, formatPhoneInput, US_STATES } from '@/lib/utils/form-validation';
import { useLeadCompliance } from '@/lib/hooks/use-lead-compliance';

export default function MultiStepPersonalInjuryPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    describe: '',
    first_name: '',
    last_name: '',
    email: '',
    date_of_incident: '',
    bodily_injury: '',
    at_fault: '',
    has_attorney: '',
    zip_code: '',
    phone: '',
  });
  
  const [locationData, setLocationData] = useState({
    city: '',
    state: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const totalSteps = 9; // Reduced from 10 to 9 (combined first/last name)
  
  // Capture compliance data
  const { jornayaLeadId, trustedFormCertUrl } = useLeadCompliance();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // describe
        if (!formData.describe.trim()) {
          newErrors.describe = 'Please describe what happened';
        }
        break;
      case 2: // first_name and last_name (combined)
        if (!formData.first_name.trim()) {
          newErrors.first_name = 'First name is required';
        }
        if (!formData.last_name.trim()) {
          newErrors.last_name = 'Last name is required';
        }
        break;
      case 3: // email
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
      case 4: // date_of_incident
        if (!formData.date_of_incident) {
          newErrors.date_of_incident = 'Date of incident is required';
        }
        break;
      case 5: // bodily_injury
        if (!formData.bodily_injury) {
          newErrors.bodily_injury = 'Please select an option';
        }
        break;
      case 6: // at_fault
        if (!formData.at_fault) {
          newErrors.at_fault = 'Please select an option';
        }
        break;
      case 7: // has_attorney
        if (!formData.has_attorney) {
          newErrors.has_attorney = 'Please select an option';
        }
        break;
      case 8: // zip_code
        if (!formData.zip_code.trim()) {
          newErrors.zip_code = 'Zip code is required';
        } else if (!validateZipCode(formData.zip_code)) {
          newErrors.zip_code = 'Please enter a valid 5-digit zip code';
        }
        // Validate that we were able to geocode the zip
        else if (formData.zip_code.length === 5 && (!locationData.city || !locationData.state)) {
          newErrors.zip_code = 'Unable to verify zip code. Please try again.';
        }
        break;
      case 9: // phone
        if (!formData.phone) {
          newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
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
          phone: formatPhoneInput(formData.phone),
          practice_area: 'personal_injury_law',
          jornaya_leadid: jornayaLeadId || 'test-jornaya-id',
          trustedform_cert_url: tfCertUrl || 'https://trustedform.com/cert_url',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">What happened?</h2>
            <textarea
              name="describe"
              value={formData.describe}
              onChange={handleChange}
              rows={5}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.describe ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Please describe the incident..."
            />
            {errors.describe && <p className="mt-1 text-sm text-red-600">{errors.describe}</p>}
          </div>
        );
      
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">What is your name?</h2>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="First name"
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">What's your email address?</h2>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        );
      
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">When did the incident occur?</h2>
            <input
              type="date"
              name="date_of_incident"
              value={formData.date_of_incident}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.date_of_incident ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date_of_incident && <p className="mt-1 text-sm text-red-600">{errors.date_of_incident}</p>}
          </div>
        );
      
      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Were you injured?</h2>
            <div className="space-y-4">
              {['yes', 'no'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="bodily_injury"
                    value={option}
                    checked={formData.bodily_injury === option}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="capitalize">{option === 'yes' ? 'Yes, I was injured' : 'No, I was not injured'}</span>
                </label>
              ))}
            </div>
            {errors.bodily_injury && <p className="mt-1 text-sm text-red-600">{errors.bodily_injury}</p>}
          </div>
        );
      
      case 6:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Were you at fault?</h2>
            <div className="space-y-4">
              {['no', 'yes'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="at_fault"
                    value={option}
                    checked={formData.at_fault === option}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="capitalize">{option === 'no' ? 'No, I was not at fault' : 'Yes, I was at fault'}</span>
                </label>
              ))}
            </div>
            {errors.at_fault && <p className="mt-1 text-sm text-red-600">{errors.at_fault}</p>}
          </div>
        );
      
      case 7:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Do you already have an attorney?</h2>
            <div className="space-y-4">
              {['yes', 'no'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="has_attorney"
                    value={option}
                    checked={formData.has_attorney === option}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="capitalize">{option === 'yes' ? 'Yes' : 'No'}</span>
                </label>
              ))}
            </div>
            {errors.has_attorney && <p className="mt-1 text-sm text-red-600">{errors.has_attorney}</p>}
          </div>
        );
      
      case 8:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">What's your zip code?</h2>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleZipChange}
              maxLength={5}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.zip_code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345"
            />
            {errors.zip_code && <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>}
            {locationData.city && locationData.state && !errors.zip_code && (
              <p className="mt-1 text-sm text-green-600">
                ✓ {locationData.city}, {locationData.state}
              </p>
            )}
          </div>
        );
      
      case 9:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">What's the best phone number to reach you?</h2>
            <input
              type="tel"
              name="phone"
              value={formatPhoneInput(formData.phone)}
              onChange={handlePhoneChange}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Personal Injury Lead Form</h1>
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">Thank you! We'll be in touch soon.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">There was an error. Please try again.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-tf-form-required>
            {/* TrustedForm automatically injects xxTrustedFormCertUrl hidden input */}
            
            <div className="min-h-[300px] py-8">
              {renderStep()}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
