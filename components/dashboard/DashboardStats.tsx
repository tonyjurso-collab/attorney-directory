'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardStatsProps {
  attorneyId: string;
}

interface StatsData {
  totalLeads: number;
  recentLeads: number;
  averageCaseValue: number;
  averageRating: number;
  reviewCount: number;
}

export function DashboardStats({ attorneyId }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalLeads: 0,
    recentLeads: 0,
    averageCaseValue: 0,
    averageRating: 0,
    reviewCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Check if Supabase is properly configured
        if (!supabase || typeof supabase.from !== 'function') {
          console.log('Supabase not configured, returning default stats');
          setStats({
            totalLeads: 0,
            recentLeads: 0,
            averageCaseValue: 0,
            averageRating: 0,
            reviewCount: 0,
          });
          return;
        }
        
        // Get leads count
        const { count: leadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('attorney_id', attorneyId);

        // Get recent leads (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: recentLeadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('attorney_id', attorneyId)
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Get average case value
        const { data: leads } = await supabase
          .from('leads')
          .select('case_value')
          .eq('attorney_id', attorneyId)
          .not('case_value', 'is', null);

        const averageCaseValue = leads?.length 
          ? leads.reduce((sum: number, lead: any) => sum + (lead.case_value || 0), 0) / leads.length
          : 0;

        // Get reviews count and average rating
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('attorney_id', attorneyId);

        const averageRating = reviews?.length
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
          : 0;

        setStats({
          totalLeads: leadsCount || 0,
          recentLeads: recentLeadsCount || 0,
          averageCaseValue,
          averageRating,
          reviewCount: reviews?.length || 0,
        });
      } catch (error) {
        console.error('Error in fetchStats:', error);
        setStats({
          totalLeads: 0,
          recentLeads: 0,
          averageCaseValue: 0,
          averageRating: 0,
          reviewCount: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    if (attorneyId) {
      fetchStats();
    }
  }, [attorneyId, supabase]);

  const statsData = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      change: `+${stats.recentLeads} this month`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Recent Leads',
      value: stats.recentLeads,
      change: 'Last 30 days',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Avg. Case Value',
      value: `$${stats.averageCaseValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      change: 'Per case',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Rating',
      value: stats.averageRating.toFixed(1),
      change: `${stats.reviewCount} reviews`,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-200">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
              </div>
              <div className="ml-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
