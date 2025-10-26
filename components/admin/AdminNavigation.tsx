'use client';

import { useState } from 'react';
import { AdminTab } from './AdminDashboard';

interface AdminNavigationProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export function AdminNavigation({ activeTab, setActiveTab }: AdminNavigationProps) {
  const tabs = [
    { id: 'overview' as AdminTab, name: 'Overview', icon: '📊' },
    { id: 'attorneys' as AdminTab, name: 'Attorneys', icon: '👨‍💼' },
    { id: 'practice-areas' as AdminTab, name: 'Practice Areas', icon: '⚖️' },
    { id: 'leads' as AdminTab, name: 'Leads', icon: '📋' },
    { id: 'users' as AdminTab, name: 'Users', icon: '👥' },
    { id: 'settings' as AdminTab, name: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
