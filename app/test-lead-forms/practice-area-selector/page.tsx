'use client';

import { useState, useEffect } from 'react';
import { useLeadCompliance } from '@/lib/hooks/use-lead-compliance';
import { validateEmail, validatePhone, validateZipCode, formatPhoneInput } from '@/lib/utils/form-validation';

interface PracticeArea {
  id: number;
  name: string;
  slug: string;
  lp_campaign_id: number | null;
  lp_supplier_id: number | null;
  lp_key: string | null;
  lp_config: any;
}

export default function PracticeAreaSelectorFormPage() {
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<PracticeArea | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [locationData, setLocationData] = useState({
    city: '',
    state: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const { jornayaLeadId, trustedFormCertUrl } = useLeadCompliance();

  useEffect(() => {
    // Fetch practice areas with LeadProsper configs
    fetch('/api/practice-areas')
      .then(res => res.json())
      .then(data => {
        setPracticeAreas(data.filter((pa: PracticeArea) => pa.lp_campaign_id));
      });
  }, []);

  const handlePracticeAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    const area = practiceAreas.find(pa => pa.slug === slug);
    setSelectedPracticeArea(area || null);
    
    // Don't clear form data - keep all existing fields
    // Only clear errors related to practice area change
    const newErrors: Record<string, string> = {};
    
    // Remove any practice_area error, but keep other errors
    Object.keys(errors).forEach(key => {
      if (key !== 'practice_area') {
        newErrors[key] = errors[key];
      }
    });
    
    setErrors(newErrors);
    // Note: We keep all form data and locationData
  };

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPracticeArea) {
      newErrors.practice_area = 'Please select a practice area';
      setErrors(newErrors);
      return false;
    }

    const config = selectedPracticeArea.lp_config?.required_fields || {};

    // Validate all required fields for the selected practice area
    Object.keys(config).forEach(fieldName => {
      if (config[fieldName].required && fieldName !== 'lp_campaign_id' && fieldName !== 'lp_supplier_id' && fieldName !== 'lp_key') {
        const value = formData[fieldName];
        
        // Skip validation for city and state - they are auto-filled from geocoding
        if (fieldName === 'city' || fieldName === 'state') {
          // These are handled by zip_code validation instead
          return;
        }
        
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[fieldName] = `${fieldName.replace('_', ' ')} is required`;
        } else if (config[fieldName].type === 'email' && !validateEmail(value)) {
          newErrors[fieldName] = 'Please enter a valid email address';
        } else if (config[fieldName].type === 'phone' && !validatePhone(value)) {
          newErrors[fieldName] = 'Please enter a valid 10-digit phone number';
        } else if (config[fieldName].type === 'zip' && !validateZipCode(value)) {
          newErrors[fieldName] = 'Please enter a valid 5-digit zip code';
        } else if (config[fieldName].type === 'zip' && (!locationData.city || !locationData.state)) {
          newErrors.zip_code = 'Unable to verify zip code. Please try again.';
        }
      }
    });

    setErrors(newErrors);
    
    // Log validation details for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation failed:', newErrors);
      console.log('Form data:', formData);
      console.log('Location data:', locationData);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedPracticeArea) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const tfCertInput = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement;
      const tfCertUrl = tfCertInput?.value || trustedFormCertUrl || 'https://trustedform.com/cert_url';
      
      const response = await fetch('/api/lead-capture/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          city: locationData.city,
          state: locationData.state,
          phone: formData.phone ? formatPhoneInput(formData.phone) : formData.phone,
          practice_area: selectedPracticeArea.slug,
          jornaya_leadid: jornayaLeadId || 'test-jornaya-id',
          trustedform_cert_url: tfCertUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({});
        setLocationData({ city: '', state: '' });
        setTimeout(() => {
          setSelectedPracticeArea(null);
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (fieldName: string, fieldConfig: any) => {
    if (fieldName === 'lp_campaign_id' || fieldName === 'lp_supplier_id' || fieldName === 'lp_key') {
      return null;
    }

    const label = fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const value = formData[fieldName] || '';
    const error = errors[fieldName];

    // Handle different field types
    if (fieldConfig.type === 'enum' && fieldConfig.allowed_values) {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {fieldConfig.required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={fieldName}
            value={value}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select...</option>
            {fieldConfig.allowed_values.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    if (fieldConfig.type === 'phone') {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {fieldConfig.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            name={fieldName}
            value={formatPhoneInput(value)}
            onChange={handlePhoneChange}
            className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="(555) 123-4567"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    if (fieldConfig.type === 'zip') {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {fieldConfig.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name={fieldName}
            value={value}
            onChange={handleZipChange}
            maxLength={5}
            className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="12345"
          />
          {locationData.city && locationData.state && !error && (
            <p className="mt-1 text-sm text-green-600">
              ✓ {locationData.city}, {locationData.state}
            </p>
          )}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    if (fieldConfig.type === 'date') {
      return (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {fieldConfig.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            name={fieldName}
            value={value}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    if (fieldName.toLowerCase().includes('describe') || fieldName.toLowerCase().includes('message')) {
      return (
        <div key={fieldName} className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {fieldConfig.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            name={fieldName}
            value={value}
            onChange={handleChange}
            rows={4}
            className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={`Please describe...`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    return (
      <div key={fieldName}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {fieldConfig.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={fieldConfig.type === 'email' ? 'email' : 'text'}
          name={fieldName}
          value={value}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
          placeholder={label}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  const requiredFields = selectedPracticeArea?.lp_config?.required_fields || {};

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dynamic Practice Area Form
            </h1>
            <p className="text-gray-600">
              Select a practice area to see the corresponding form fields.
            </p>
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
            {/* Standard fields - always visible */}
            <div className="space-y-6">
              {/* First Name - Last Name row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="First name"
                  />
                  {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Last name"
                  />
                  {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                </div>
              </div>

              {/* Phone - Email row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formatPhoneInput(formData.phone || '')}
                    onChange={handlePhoneChange}
                    className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* Zip Code row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code || ''}
                  onChange={handleZipChange}
                  maxLength={5}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.zip_code ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="12345"
                />
                {locationData.city && locationData.state && !errors.zip_code && (
                  <p className="mt-1 text-sm text-green-600">
                    ✓ {locationData.city}, {locationData.state}
                  </p>
                )}
                {errors.zip_code && <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>}
              </div>
            </div>

            {/* Practice Area Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice Area <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPracticeArea?.slug || ''}
                onChange={handlePracticeAreaChange}
                className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.practice_area ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a practice area...</option>
                {practiceAreas.map(pa => (
                  <option key={pa.slug} value={pa.slug}>{pa.name}</option>
                ))}
              </select>
              {errors.practice_area && <p className="mt-1 text-sm text-red-600">{errors.practice_area}</p>}
            </div>

            {/* Custom practice area fields - only show when practice area is selected */}
            {selectedPracticeArea && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(requiredFields)
                    .filter(fieldName => {
                      // Skip standard fields we've already placed
                      const standardFields = ['first_name', 'last_name', 'email', 'phone', 'zip_code', 'city', 'state', 'describe', 'lp_campaign_id', 'lp_supplier_id', 'lp_key'];
                      return !standardFields.includes(fieldName);
                    })
                    .map(fieldName => renderField(fieldName, requiredFields[fieldName]))}
                </div>

                {/* Describe field - full width */}
                {requiredFields.describe && (
                  <div>
                    {renderField('describe', requiredFields.describe)}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedPracticeArea}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
