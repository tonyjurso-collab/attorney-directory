import { Bell, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { AttorneyWithDetails } from '@/lib/types/database';

interface DashboardHeaderProps {
  attorney: AttorneyWithDetails;
}

export function DashboardHeader({ attorney }: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {attorney.first_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome to your attorney dashboard
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <Link 
            href="/dashboard/profile"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="h-6 w-6" />
          </Link>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            {attorney.profile_image_url ? (
              <img
                src={attorney.profile_image_url}
                alt={`${attorney.first_name || ''} ${attorney.last_name || ''}`.trim() || 'Attorney profile'}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {(() => {
                  const firstInitial = attorney.first_name?.[0] || '';
                  const lastInitial = attorney.last_name?.[0] || '';
                  return firstInitial + lastInitial || '?';
                })()}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {attorney.first_name} {attorney.last_name}
              </p>
              <p className="text-xs text-gray-500">
                {attorney.membership_tier.charAt(0).toUpperCase() + attorney.membership_tier.slice(1)} Member
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
