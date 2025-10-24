import { Calendar, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatRelativeTime } from '@/lib/utils/format';

interface RecentLeadsProps {
  attorneyId: string;
}

async function getRecentLeads(attorneyId: string) {
  try {
    const supabase = await createClient();
    
    // Check if Supabase is properly configured
    if (!supabase || typeof supabase.from !== 'function') {
      console.log('Supabase not configured, returning empty leads');
      return [];
    }
    
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        practice_areas (
          name
        )
      `)
      .eq('attorney_id', attorneyId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    return leads || [];
  } catch (error) {
    console.error('Error in getRecentLeads:', error);
    return [];
  }
}

export async function RecentLeads({ attorneyId }: RecentLeadsProps) {
  const leads = await getRecentLeads(attorneyId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
          <p className="text-gray-500">
            When clients contact you through the platform, their information will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
        <a
          href="/dashboard/leads"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          View all
          <ExternalLink className="h-4 w-4 ml-1" />
        </a>
      </div>

      <div className="space-y-4">
        {leads.map((lead: any) => (
          <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900">
                    {lead.first_name} {lead.last_name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  {lead.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  
                  {lead.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                        {lead.phone}
                      </a>
                    </div>
                  )}
                  
                  {lead.zip_code && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{lead.zip_code}</span>
                    </div>
                  )}
                </div>

                {lead.case_description && (
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {lead.case_description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatRelativeTime(lead.created_at)}</span>
                    </div>
                    
                    {lead.practice_areas && (
                      <span className="text-blue-600">
                        {lead.practice_areas.name}
                      </span>
                    )}
                    
                    {lead.case_value && (
                      <span className="font-medium text-green-600">
                        ${lead.case_value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
