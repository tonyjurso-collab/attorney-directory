'use client';

import { useState, useEffect } from 'react';
import { AttorneyWithDetails, MembershipTier } from '@/lib/types/database';

interface AttorneyManagementProps {}

export function AttorneyManagement() {
  const [attorneys, setAttorneys] = useState<AttorneyWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAttorney, setEditingAttorney] = useState<AttorneyWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<MembershipTier | 'all'>('all');

  useEffect(() => {
    fetchAttorneys();
  }, []);

  const fetchAttorneys = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/attorneys');
      if (response.ok) {
        const data = await response.json();
        setAttorneys(data);
      }
    } catch (error) {
      console.error('Error fetching attorneys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAttorney = async (attorneyData: Partial<AttorneyWithDetails>) => {
    try {
      const response = await fetch('/api/admin/attorneys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attorneyData),
      });

      if (response.ok) {
        await fetchAttorneys();
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating attorney:', error);
    }
  };

  const handleUpdateAttorney = async (id: string, attorneyData: Partial<AttorneyWithDetails>) => {
    try {
      const response = await fetch(`/api/admin/attorneys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attorneyData),
      });

      if (response.ok) {
        await fetchAttorneys();
        setEditingAttorney(null);
      }
    } catch (error) {
      console.error('Error updating attorney:', error);
    }
  };

  const handleDeleteAttorney = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attorney?')) return;

    try {
      const response = await fetch(`/api/admin/attorneys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAttorneys();
      }
    } catch (error) {
      console.error('Error deleting attorney:', error);
    }
  };

  const filteredAttorneys = attorneys.filter(attorney => {
    const matchesSearch = 
      attorney.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attorney.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attorney.firm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attorney.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attorney.state?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filterTier === 'all' || attorney.membership_tier === filterTier;
    
    return matchesSearch && matchesTier;
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Attorney Management</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Attorney
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search attorneys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as MembershipTier | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="standard">Standard</option>
            <option value="exclusive">Exclusive</option>
          </select>
        </div>

        {/* Attorney List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attorney
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttorneys.map((attorney) => (
                <tr key={attorney.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {attorney.profile_image_url ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={attorney.profile_image_url}
                            alt={`${attorney.first_name} ${attorney.last_name}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {attorney.first_name[0]}{attorney.last_name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {attorney.first_name} {attorney.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{attorney.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attorney.firm_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attorney.city && attorney.state ? `${attorney.city}, ${attorney.state}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      attorney.membership_tier === 'exclusive' ? 'bg-purple-100 text-purple-800' :
                      attorney.membership_tier === 'standard' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {attorney.membership_tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      attorney.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {attorney.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingAttorney(attorney)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAttorney(attorney.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingAttorney) && (
        <AttorneyForm
          attorney={editingAttorney}
          onSave={editingAttorney ? 
            (data) => handleUpdateAttorney(editingAttorney.id, data) :
            handleCreateAttorney
          }
          onCancel={() => {
            setIsCreating(false);
            setEditingAttorney(null);
          }}
        />
      )}
    </div>
  );
}

// Attorney Form Component
interface AttorneyFormProps {
  attorney?: AttorneyWithDetails | null;
  onSave: (data: Partial<AttorneyWithDetails>) => void;
  onCancel: () => void;
}

function AttorneyForm({ attorney, onSave, onCancel }: AttorneyFormProps) {
  const [formData, setFormData] = useState({
    first_name: attorney?.first_name || '',
    last_name: attorney?.last_name || '',
    firm_name: attorney?.firm_name || '',
    bio: attorney?.bio || '',
    experience_years: attorney?.experience_years || 0,
    phone: attorney?.phone || '',
    email: attorney?.email || '',
    website: attorney?.website || '',
    address_line1: attorney?.address_line1 || '',
    city: attorney?.city || '',
    state: attorney?.state || '',
    zip_code: attorney?.zip_code || '',
    membership_tier: attorney?.membership_tier || 'free' as MembershipTier,
    is_verified: attorney?.is_verified || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {attorney ? 'Edit Attorney' : 'Create New Attorney'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Firm Name</label>
              <input
                type="text"
                value={formData.firm_name}
                onChange={(e) => setFormData({ ...formData, firm_name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Membership Tier</label>
                <select
                  value={formData.membership_tier}
                  onChange={(e) => setFormData({ ...formData, membership_tier: e.target.value as MembershipTier })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="standard">Standard</option>
                  <option value="exclusive">Exclusive</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Verified</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {attorney ? 'Update' : 'Create'} Attorney
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
