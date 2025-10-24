import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, FileText, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';

interface ClientDashboardProps {
  client: {
    id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    city?: string;
    state?: string;
  };
}

async function getClientStats(clientId: string) {
  const supabase = await createClient();
  
  // Get leads count
  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId);

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select(`
      *,
      attorneys (
        first_name,
        last_name,
        firm_name
      ),
      practice_areas (
        name
      )
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    totalLeads: leadsCount || 0,
    recentLeads: recentLeads || [],
  };
}

export async function ClientDashboard({ client }: ClientDashboardProps) {
  const stats = await getClientStats(client.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {client.first_name}!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your legal inquiries and connect with attorneys
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                Legal inquiries submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.recentLeads.filter((lead: any) => lead.status === 'new' || lead.status === 'contacted').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently being reviewed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attorneys Contacted</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(stats.recentLeads.map((lead: any) => lead.attorney_id)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Different attorneys reached
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalLeads > 0 
                  ? Math.round((stats.recentLeads.filter((lead: any) => lead.status === 'qualified' || lead.status === 'converted').length / stats.totalLeads) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Inquiries that led to contact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Find an Attorney
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Search for qualified attorneys in your area by practice area and location.
              </p>
              <Button asChild className="w-full">
                <Link href="/search">Search Attorneys</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Submit New Inquiry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Submit a new legal inquiry to get matched with qualified attorneys.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/submit-inquiry">Submit Inquiry</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                My Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View and manage your submitted legal inquiries and responses.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/my-inquiries">View Inquiries</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentLeads.length > 0 ? (
              <div className="space-y-4">
                {stats.recentLeads.map((lead: any) => (
                  <div key={lead.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {lead.practice_areas?.name || 'Legal Inquiry'}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                            lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {lead.attorneys && (
                          <p className="text-sm text-gray-600 mb-1">
                            Attorney: {lead.attorneys.first_name} {lead.attorneys.last_name}
                            {lead.attorneys.firm_name && ` - ${lead.attorneys.firm_name}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {lead.case_description && (
                      <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                        {lead.case_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                <p className="text-gray-600 mb-4">
                  Submit your first legal inquiry to get started.
                </p>
                <Button asChild>
                  <Link href="/submit-inquiry">Submit Your First Inquiry</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
