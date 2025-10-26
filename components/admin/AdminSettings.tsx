'use client';

import { useState } from 'react';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Attorney Directory',
    siteDescription: 'Find qualified attorneys in your area',
    contactEmail: 'admin@attorneydirectory.com',
    maxAttorneysPerPage: 20,
    enableRegistration: true,
    requireEmailVerification: true,
    enableChatbot: true,
    enableLeadTracking: true,
    algoliaAppId: '',
    algoliaSearchKey: '',
    openaiApiKey: '',
    googlePlacesKey: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Error saving settings');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <div className="flex items-center space-x-4">
            {saveMessage && (
              <span className={`text-sm ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Site Description</label>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Attorneys Per Page</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxAttorneysPerPage}
                onChange={(e) => handleInputChange('maxAttorneysPerPage', parseInt(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Feature Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Feature Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enableRegistration}
                  onChange={(e) => handleInputChange('enableRegistration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Enable User Registration</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Require Email Verification</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enableChatbot}
                  onChange={(e) => handleInputChange('enableChatbot', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Enable AI Chatbot</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enableLeadTracking}
                  onChange={(e) => handleInputChange('enableLeadTracking', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Enable Lead Tracking</label>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-6">API Configuration</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Algolia App ID</label>
              <input
                type="text"
                value={settings.algoliaAppId}
                onChange={(e) => handleInputChange('algoliaAppId', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Algolia App ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Algolia Search Key</label>
              <input
                type="password"
                value={settings.algoliaSearchKey}
                onChange={(e) => handleInputChange('algoliaSearchKey', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Algolia Search Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
              <input
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your OpenAI API Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Google Places API Key</label>
              <input
                type="password"
                value={settings.googlePlacesKey}
                onChange={(e) => handleInputChange('googlePlacesKey', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Google Places API Key"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Database Status</div>
            <div className="text-lg font-semibold text-green-600">Connected</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Algolia Status</div>
            <div className="text-lg font-semibold text-green-600">Connected</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">OpenAI Status</div>
            <div className="text-lg font-semibold text-green-600">Connected</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Last Backup</div>
            <div className="text-lg font-semibold text-gray-900">2 hours ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
