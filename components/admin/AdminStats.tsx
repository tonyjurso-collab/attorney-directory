'use client';

import { useState, useEffect } from 'react';

interface AdminStatsData {
  totalAttorneys: number;
  activeAttorneys: number;
  totalLeads: number;
  newLeads: number;
  totalPracticeAreas: number;
  activePracticeAreas: number;
  totalUsers: number;
  adminUsers: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData>({
    totalAttorneys: 0,
    activeAttorneys: 0,
    totalLeads: 0,
    newLeads: 0,
    totalPracticeAreas: 0,
    activePracticeAreas: 0,
    totalUsers: 0,
    adminUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Attorneys',
      value: stats.totalAttorneys,
      subtitle: `${stats.activeAttorneys} active`,
      icon: '👨‍💼',
      color: 'blue',
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      subtitle: `${stats.newLeads} new`,
      icon: '📋',
      color: 'green',
    },
    {
      title: 'Practice Areas',
      value: stats.totalPracticeAreas,
      subtitle: `${stats.activePracticeAreas} active`,
      icon: '⚖️',
      color: 'purple',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.adminUsers} admins`,
      icon: '👥',
      color: 'orange',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">New attorney registrations</span>
              <span className="text-sm font-medium text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">New leads today</span>
              <span className="text-sm font-medium text-gray-900">8</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Practice area updates</span>
              <span className="text-sm font-medium text-gray-900">3</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">System alerts</span>
              <span className="text-sm font-medium text-red-600">1</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Add New Attorney
            </button>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Create Practice Area
            </button>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
              View All Leads
            </button>
            <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
