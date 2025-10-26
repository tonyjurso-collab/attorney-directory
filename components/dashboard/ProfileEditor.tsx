'use client';

import { useState, useRef } from 'react';
import { Save, X, MapPin, Mail, Phone, Globe, Building, User, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import { AttorneyWithDetails } from '@/lib/types/database';
import { PracticeAreasSelector } from './PracticeAreasSelector';

interface ProfileEditorProps {
  attorney: AttorneyWithDetails;
}

const US_STATES = [
  { value: '', label: 'Select a state' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export function ProfileEditor({ attorney }: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(attorney.profile_image_url || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    first_name: attorney.first_name || '',
    last_name: attorney.last_name || '',
    firm_name: attorney.firm_name || '',
    bio: attorney.bio || '',
    phone: attorney.phone || '',
    email: attorney.email || '',
    website: attorney.website || '',
    address_line1: (attorney as any).address_line1 || '',
    address_line2: (attorney as any).address_line2 || '',
    suite_number: (attorney as any).suite_number || '',
    city: attorney.city || '',
    state: attorney.state || '',
    zip_code: attorney.zip_code || '',
    experience_years: attorney.experience_years || '',
    profile_image_url: attorney.profile_image_url || '',
    google_place_id: (attorney as any).google_place_id || '',
  });

  // Practice areas state
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState<string[]>(
    attorney.practice_areas?.map(pa => pa.id) || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    (attorney as any).selected_categories || []
  );

  // Phone formatting function
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address_line1.trim()) {
      newErrors.address_line1 = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle phone number formatting
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/attorney/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        practice_areas: selectedPracticeAreas,
        categories: selectedCategories,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || 'Failed to update profile');
      }

      console.log('Profile updated successfully:', data);
      
      setIsEditing(false);
      setErrors({});
      // Reload the page to show updated data
      window.location.reload();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(`Error saving profile: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'attorney-profiles');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFormData(prev => ({
        ...prev,
        profile_image_url: data.url,
      }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Error uploading image: ${error.message || 'Please try again.'}`);
      setImagePreview(attorney.profile_image_url || null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: attorney.first_name || '',
      last_name: attorney.last_name || '',
      firm_name: attorney.firm_name || '',
      bio: attorney.bio || '',
      phone: attorney.phone || '',
      email: attorney.email || '',
      website: attorney.website || '',
      address_line1: (attorney as any).address_line1 || '',
      address_line2: (attorney as any).address_line2 || '',
      suite_number: (attorney as any).suite_number || '',
      city: attorney.city || '',
      state: attorney.state || '',
      zip_code: attorney.zip_code || '',
      experience_years: attorney.experience_years || '',
      profile_image_url: attorney.profile_image_url || '',
      google_place_id: (attorney as any).google_place_id || '',
    });
          setSelectedPracticeAreas(attorney.practice_areas?.map(pa => pa.id) || []);
          setSelectedCategories((attorney as any).selected_categories || []);
    setImagePreview(attorney.profile_image_url || null);
    setIsEditing(false);
  };

  const handleSyncReviews = async () => {
    if (!formData.google_place_id) {
      alert('Please enter a Google Place ID first');
      return;
    }

    try {
      const response = await fetch('/api/sync-google-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attorneyId: attorney.id,
          placeId: formData.google_place_id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Reviews synced successfully! Found ${result.data.reviewsCount} reviews.`);
        // Optionally refresh the page or update the UI
        window.location.reload();
      } else {
        alert(`Failed to sync reviews: ${result.error}`);
      }
    } catch (error) {
      console.error('Error syncing reviews:', error);
      alert('Error syncing reviews. Please try again.');
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Profile
          </button>
        </div>

        <div className="space-y-4">
          {/* Profile Photo */}
          {imagePreview && (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt={`${attorney.first_name} ${attorney.last_name}`}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Profile Photo</h3>
                <p className="text-xs text-gray-500">Click "Edit Profile" to change</p>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Name
            </h3>
            <p className="text-gray-900">
              {attorney.first_name} {attorney.last_name}
            </p>
          </div>

          {/* Firm */}
          {attorney.firm_name && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Firm
              </h3>
              <p className="text-gray-900">{attorney.firm_name}</p>
            </div>
          )}

          {/* Bio */}
          {attorney.bio && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Biography
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">{attorney.bio}</p>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
            <div className="space-y-2">
              {attorney.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${attorney.phone}`} className="hover:text-blue-600">
                    {attorney.phone}
                  </a>
                </div>
              )}
              {attorney.email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${attorney.email}`} className="hover:text-blue-600">
                    {attorney.email}
                  </a>
                </div>
              )}
              {attorney.website && (
                <div className="flex items-center text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <a href={attorney.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    {attorney.website}
                  </a>
                </div>
              )}
            </div>
          </div>

                     {/* Location */}
           {((attorney as any).address_line1 || attorney.city || attorney.state) && (
             <div>
               <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                 <MapPin className="h-4 w-4 mr-2" />
                 Location
               </h3>
               {(attorney as any).address_line1 && (
                 <p className="text-gray-900 mb-1">{(attorney as any).address_line1}</p>
               )}
               {(attorney as any).address_line2 && (
                 <p className="text-gray-900 mb-1">{(attorney as any).address_line2}</p>
               )}
               {(attorney as any).suite_number && (
                 <p className="text-gray-900 mb-1">Suite/Office: {(attorney as any).suite_number}</p>
               )}
               <p className="text-gray-900">
                 {[attorney.city, attorney.state, attorney.zip_code]
                   .filter(Boolean)
                   .join(', ')}
               </p>
             </div>
           )}

          {/* Practice Areas */}
          {((attorney as any).selected_categories && (attorney as any).selected_categories.length > 0) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Practice Areas</h3>
              <div className="space-y-3">
                {(attorney as any).selected_categories.map((categoryId: string) => {
                  // Find the category name from the attorney data
                  const categoryName = (attorney as any).attorney_practice_categories?.find(
                    (apc: any) => apc.category_id === categoryId
                  )?.practice_area_categories?.name || 'Unknown Category';
                  
                  // Find subcategories for this category
                  const categorySubcategories = attorney.practice_areas?.filter((pa: any) => 
                    pa.category_id === categoryId
                  ) || [];
                  
                  return (
                    <div key={categoryId} className="border-l-2 border-blue-200 pl-3">
                      <div className="font-medium text-gray-900 text-sm mb-1">
                        {categoryName}
                      </div>
                      {categorySubcategories.length > 0 && (
                        <div className="ml-2">
                          <span className="text-xs text-gray-600">Specializes in:</span>
                          <div className="space-y-1 mt-1">
                            {categorySubcategories.map((subcategory: any) => (
                              <div key={subcategory.id} className="text-gray-700 text-sm">
                                • {subcategory.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Experience */}
          {attorney.experience_years && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Experience</h3>
              <p className="text-gray-900">{attorney.experience_years} years</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Profile Photo
          </label>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingImage ? 'Uploading...' : 'Upload Photo'}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Recommended: Square image, at least 400x400px. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Firm */}
        <div>
          <label htmlFor="firm_name" className="block text-sm font-medium text-gray-700 mb-2">
            Firm Name
          </label>
          <input
            type="text"
            id="firm_name"
            name="firm_name"
            value={formData.firm_name}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Biography
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell clients about your experience and expertise..."
          />
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Location</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                id="address_line1"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address_line1 ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.address_line1 && (
                <p className="mt-1 text-sm text-red-600">{errors.address_line1}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apartment, building, floor, etc."
                />
              </div>
              <div>
                <label htmlFor="suite_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Suite/Office Number
                </label>
                <input
                  type="text"
                  id="suite_number"
                  name="suite_number"
                  value={formData.suite_number}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Suite 100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange as any}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>
              <div>
                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.zip_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.zip_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Practice Areas */}
        <div>
          <PracticeAreasSelector
            selectedPracticeAreas={selectedPracticeAreas}
            onSelectionChange={setSelectedPracticeAreas}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />
        </div>

        {/* Experience */}
        <div>
          <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            id="experience_years"
            name="experience_years"
            value={formData.experience_years}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>

        {/* Google Place ID */}
        <div>
          <label htmlFor="google_place_id" className="block text-sm font-medium text-gray-700 mb-2">
            Google Place ID
          </label>
          <input
            type="text"
            id="google_place_id"
            name="google_place_id"
            value={formData.google_place_id}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="ChIJ..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Find your Google Place ID at{' '}
            <a
              href="https://developers.google.com/maps/documentation/places/web-service/place-id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Place ID Finder
            </a>
          </p>
          {formData.google_place_id && (
            <button
              type="button"
              onClick={handleSyncReviews}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sync Google Reviews Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
