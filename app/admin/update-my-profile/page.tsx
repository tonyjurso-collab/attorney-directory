'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { User, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function UpdateMyProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: ''
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setMessage('Not authenticated');
          setLoading(false);
          return;
        }

        setUser(user);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setMessage('Profile not found');
          setLoading(false);
          return;
        }

        setProfile(profileData);
        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || ''
        });
        setLoading(false);

      } catch (error) {
        console.error('Error:', error);
        setMessage('Error loading data');
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const updateProfile = async () => {
    if (!user) return;
    
    setUpdating(true);
    setMessage('');

    try {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          full_name: formData.first_name && formData.last_name 
            ? `${formData.first_name} ${formData.last_name}` 
            : null
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        setMessage(`Update failed: ${updateError.message}`);
        setUpdating(false);
        return;
      }

      setProfile(updatedProfile);
      setMessage('✅ Profile updated successfully! The profile icon should now show correct initials.');
      setUpdating(false);

    } catch (error) {
      console.error('Error:', error);
      setMessage('Error updating profile');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Update My Profile</h1>
          </div>
          
          {user && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Current User</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
              </div>
            </div>
          )}

          {profile && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Current Profile Data</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><strong>First Name:</strong> {profile.first_name || 'Not set'}</p>
                <p><strong>Last Name:</strong> {profile.last_name || 'Not set'}</p>
                <p><strong>Full Name:</strong> {profile.full_name || 'Not set'}</p>
                <p><strong>Role:</strong> {profile.role}</p>
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Debug:</strong> This is why the profile icon shows "S" - no name fields are populated, so it falls back to email first letter.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Update Profile</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your first name"
                />
              </div>
              
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <motion.button
              onClick={updateProfile}
              disabled={updating || !formData.first_name || !formData.last_name}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </>
              )}
            </motion.button>
          </div>

          {message && (
            <motion.div 
              className={`p-4 rounded-md flex items-center ${
                message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {message.includes('✅') ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message}
            </motion.div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <p><strong>Note:</strong> After updating, refresh the page to see the profile icon change from "S" to your initials.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
