'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Lock, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { PasswordUpdateForm } from '@/components/dashboard/PasswordUpdateForm';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '@/lib/animations/variants';

type TabType = 'account' | 'profile' | 'preferences';

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ User not found:', userError);
          router.push('/login');
          return;
        }

        setUser(user);

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('❌ Profile not found:', profileError);
          setError('Failed to load profile data');
          return;
        }

        setProfile(profile);

        // Check if user is attorney (for dashboard access)
        if (profile.role !== 'attorney') {
          console.error('❌ User is not an attorney, role:', profile.role);
          router.push('/');
          return;
        }

      } catch (err) {
        console.error('❌ Error fetching user data:', err);
        setError('Failed to load user data');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'account' as TabType, name: 'Account', icon: Lock },
    { id: 'profile' as TabType, name: 'Profile', icon: User },
    { id: 'preferences' as TabType, name: 'Preferences', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Link 
              href="/dashboard"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            className="lg:col-span-1"
          >
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'account' && (
                  <motion.div
                    variants={slideUp}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h2>
                      <p className="text-gray-600">
                        Manage your account security and authentication settings.
                      </p>
                    </div>
                    
                    <PasswordUpdateForm />
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div
                    variants={slideUp}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Information</h2>
                      <p className="text-gray-600">
                        Update your personal information and professional details.
                      </p>
                    </div>
                    
                    <div className="text-center py-12">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                      <p className="text-gray-600">
                        Profile editing features will be available in a future update.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'preferences' && (
                  <motion.div
                    variants={slideUp}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Preferences</h2>
                      <p className="text-gray-600">
                        Customize your application preferences and notification settings.
                      </p>
                    </div>
                    
                    <div className="text-center py-12">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                      <p className="text-gray-600">
                        Preference settings will be available in a future update.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
