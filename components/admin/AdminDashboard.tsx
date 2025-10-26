'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminStats } from './AdminStats';
import { AdminNavigation } from './AdminNavigation';
import { AttorneyManagement } from './AttorneyManagement';
import { PracticeAreaManagement } from './PracticeAreaManagement';
import { LeadManagement } from './LeadManagement';
import { UserManagement } from './UserManagement';
import { AdminSettings } from './AdminSettings';

export type AdminTab = 'overview' | 'attorneys' | 'practice-areas' | 'leads' | 'users' | 'settings';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminStats />;
      case 'attorneys':
        return <AttorneyManagement />;
      case 'practice-areas':
        return <PracticeAreaManagement />;
      case 'leads':
        return <LeadManagement />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminHeader />
      
      <div className="mt-8">
        <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="mt-8">
        {renderTabContent()}
      </div>
    </div>
  );
}
