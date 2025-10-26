'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send, Loader2 } from 'lucide-react';
import { AttorneyWithDetails } from '@/lib/types/database';
import { validateEmail, validatePhone, validateZipCode, formatPhoneNumber, formatPhoneInput } from '@/lib/utils/form-validation';
import { useLeadTracking, LeadTrackingElements, LeadTrackingFooter } from '@/lib/hooks/use-lead-tracking';

interface PracticeArea {
  id: string;
  name: string;
  slug: string;
  lp_campaign_id: number;
  lp_supplier_id: number;
  lp_key: string;
  lp_config: any;
}

interface DynamicLeadFormProps {
  attorney?: AttorneyWithDetails;
  practiceArea?: string;
  state?: string;
  category?: string;
  subcategory?: string;
}

export function DynamicLeadForm({ attorney, practiceArea, state, category, subcategory }: DynamicLeadFormProps) {
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<PracticeArea | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    zip_code: '',
    describe: '',
    // Dynamic fields will be added here
  });
  const [locationData, setLocationData] = useState({
    city: '',
    state: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Lead tracking hooks
  const { captureTrackingIds, isLoading: trackingLoading } = useLeadTracking();

  // Fetch practice areas on component mount
  useEffect(() => {
    const fetchPracticeAreas = async () => {
      try {
        const response = await fetch('/api/practice-areas');
        if (response.ok) {
          const data = await response.json();
          // Extract all practice areas from categories
          const allPracticeAreas = data.categories?.flatMap((category: any) => 
            category.practice_areas?.map((pa: any) => ({
              id: pa.id,
              name: pa.name,
              slug: pa.slug,
              lp_campaign_id: category.lp_campaign_id || 0,
              lp_supplier_id: category.lp_supplier_id || 0,
              lp_key: category.lp_key || '',
              lp_config: category.lp_config || {}
            })) || []
          ) || [];
          setPracticeAreas(allPracticeAreas);
        }
      } catch (error) {
        console.error('Error fetching practice areas:', error);
      }
    };

    fetchPracticeAreas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const zip = e.target.value;
    setFormData(prev => ({ ...prev, zip_code: zip }));
    
    if (errors.zip_code) {
      setErrors(prev => ({ ...prev, zip_code: '' }));
    }

    // Auto-geocode zip code
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      try {
        const response = await fetch(`/api/geocode-zip?zip=${zip}`);
        if (response.ok) {
          const data = await response.json();
          setLocationData({
            city: data.city,
            state: data.state,
          });
        }
      } catch (error) {
        console.error('Error geocoding zip:', error);
      }
    }
  };

  const handlePracticeAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    const area = practiceAreas.find(pa => pa.slug === slug);
    setSelectedPracticeArea(area || null);
    
    // Clear practice area errors
    if (errors.practice_area) {
      setErrors(prev => ({ ...prev, practice_area: '' }));
    }
  };

  // Get custom fields for the selected practice area
  const getCustomFields = () => {
    if (!selectedPracticeArea?.lp_config?.required_fields) return [];
    
    const standardFields = ['first_name', 'last_name', 'email', 'phone', 'zip_code', 'describe', 'city', 'state'];
    const customFields = Object.entries(selectedPracticeArea.lp_config.required_fields)
      .filter(([fieldName, fieldConfig]: [string, any]) => 
        !standardFields.includes(fieldName) && 
        fieldName !== 'lp_key' && 
        fieldName !== 'lp_campaign_id' && 
        fieldName !== 'lp_supplier_id'
      )
      .map(([fieldName, fieldConfig]: [string, any]) => ({
        name: fieldName,
        config: fieldConfig
      }));
    
    return customFields;
  };

  // Render a custom field based on its configuration
  const renderCustomField = (fieldName: string, fieldConfig: any) => {
    const fieldValue = formData[fieldName as keyof typeof formData] || '';
    const fieldError = errors[fieldName];

    switch (fieldConfig.type) {
      case 'enum':
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
              {fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} *
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={fieldValue}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an option</option>
              {fieldConfig.allowed_values?.map((value: string) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {fieldError && <p className="mt-1 text-sm text-red-600">{fieldError}</p>}
          </div>
        );

      case 'numeric':
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
              {fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} *
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              value={fieldValue}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={`Enter ${fieldName.replace(/_/g, ' ')}`}
            />
            {fieldError && <p className="mt-1 text-sm text-red-600">{fieldError}</p>}
          </div>
        );

      case 'text':
      default:
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
              {fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} *
            </label>
            <input
              type="text"
              id={fieldName}
              name={fieldName}
              value={fieldValue}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={`Enter ${fieldName.replace(/_/g, ' ')}`}
            />
            {fieldError && <p className="mt-1 text-sm text-red-600">{fieldError}</p>}
          </div>
        );
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Standard field validation
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit phone number';
    if (!formData.zip_code.trim()) newErrors.zip_code = 'Zip code is required';
    else if (!validateZipCode(formData.zip_code)) newErrors.zip_code = 'Please enter a valid 5-digit zip code';
    else if (!locationData.city || !locationData.state) newErrors.zip_code = 'Unable to verify zip code. Please try again.';
    if (!formData.describe.trim()) newErrors.describe = 'Please describe your legal issue';
    if (!selectedPracticeArea) newErrors.practice_area = 'Please select a practice area';

    // Custom field validation
    if (selectedPracticeArea?.lp_config?.required_fields) {
      const customFields = getCustomFields();
      customFields.forEach(({ name, config }) => {
        const fieldValue = formData[name as keyof typeof formData] || '';
        if (config.required && !fieldValue.toString().trim()) {
          newErrors[name] = `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
        }
      });
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
    setErrorMessage('');

    try {
      // Capture tracking IDs before submission
      const { jornayaLeadId, trustedFormCertUrl } = captureTrackingIds();
      
      console.log('📋 DynamicLeadForm Compliance Data:', {
        jornayaLeadId: jornayaLeadId || 'not captured',
        trustedFormCertUrl: trustedFormCertUrl || 'not captured',
      });
      
      // Prepare custom fields data
      const customFieldsData: Record<string, any> = {};
      if (selectedPracticeArea?.lp_config?.required_fields) {
        const customFields = getCustomFields();
        customFields.forEach(({ name }) => {
          const fieldValue = formData[name as keyof typeof formData];
          if (fieldValue !== undefined && fieldValue !== '') {
            customFieldsData[name] = fieldValue;
          }
        });
      }

      const response = await fetch('/api/lead-capture/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...customFieldsData,
          city: locationData.city,
          state: locationData.state,
          phone: formatPhoneNumber(formData.phone),
          practice_area: selectedPracticeArea?.slug || 'general_legal_assistance',
          jornaya_leadid: jornayaLeadId,
          trustedform_cert_url: trustedFormCertUrl,
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
        setSelectedPracticeArea(null);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'There was an error submitting your form. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('There was an error submitting your form. Please try again.');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Get Legal Help
        </h3>
        <p className="text-gray-600 text-sm">
          {attorney 
            ? `Connect with ${attorney.first_name} ${attorney.last_name} for a free consultation.`
            : `Fill out our quick form and we'll connect you with qualified ${practiceArea?.toLowerCase() || 'legal'} attorneys in ${state || 'your area'}.`
          }
        </p>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Thank you! Your inquiry has been submitted successfully. We'll be in touch soon!
              </p>
            </div>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Lead tracking elements */}
        <LeadTrackingElements />
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.first_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your first name"
            />
            {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.last_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your last name"
            />
            {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
        </div>

        {/* Zip Code */}
        <div>
          <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
            Zip Code *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleZipChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.zip_code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345"
              maxLength={5}
            />
          </div>
          {locationData.city && locationData.state && (
            <p className="mt-1 text-sm text-gray-600">
              📍 {locationData.city}, {locationData.state}
            </p>
          )}
          {errors.zip_code && <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>}
        </div>

        {/* Practice Area Dropdown */}
        <div>
          <label htmlFor="practice_area" className="block text-sm font-medium text-gray-700 mb-1">
            Practice Area *
          </label>
          <select
            id="practice_area"
            name="practice_area"
            value={selectedPracticeArea?.slug || ''}
            onChange={handlePracticeAreaChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.practice_area ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a practice area</option>
            {practiceAreas.map((area) => (
              <option key={area.id} value={area.slug}>
                {area.name}
              </option>
            ))}
          </select>
          {errors.practice_area && <p className="mt-1 text-sm text-red-600">{errors.practice_area}</p>}
        </div>

        {/* Custom Fields - Only show if practice area is selected */}
        {selectedPracticeArea && getCustomFields().length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Additional Information for {selectedPracticeArea.name}
            </h4>
            <div className="space-y-4">
              {getCustomFields().map(({ name, config }) => 
                renderCustomField(name, config)
              )}
            </div>
          </div>
        )}

        {/* Case Description */}
        <div>
          <label htmlFor="describe" className="block text-sm font-medium text-gray-700 mb-1">
            Describe Your Legal Issue *
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </div>
            <textarea
              id="describe"
              name="describe"
              value={formData.describe}
              onChange={handleChange}
              rows={4}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.describe ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Please describe your legal issue in detail..."
            />
          </div>
          {errors.describe && <p className="mt-1 text-sm text-red-600">{errors.describe}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || trackingLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Get Free Consultation
            </>
          )}
        </button>

        {/* Lead tracking footer */}
        <LeadTrackingFooter />
      </form>
    </div>
  );
}
