'use client';

import { useState, useEffect } from 'react';

interface PracticeArea {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export function PracticeAreaManagement() {
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPracticeArea, setEditingPracticeArea] = useState<PracticeArea | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchPracticeAreas();
  }, []);

  const fetchPracticeAreas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/practice-areas');
      if (response.ok) {
        const data = await response.json();
        setPracticeAreas(data);
      }
    } catch (error) {
      console.error('Error fetching practice areas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePracticeArea = async (practiceAreaData: Partial<PracticeArea>) => {
    try {
      const response = await fetch('/api/admin/practice-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(practiceAreaData),
      });

      if (response.ok) {
        await fetchPracticeAreas();
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating practice area:', error);
    }
  };

  const handleUpdatePracticeArea = async (id: string, practiceAreaData: Partial<PracticeArea>) => {
    try {
      const response = await fetch(`/api/admin/practice-areas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(practiceAreaData),
      });

      if (response.ok) {
        await fetchPracticeAreas();
        setEditingPracticeArea(null);
      }
    } catch (error) {
      console.error('Error updating practice area:', error);
    }
  };

  const handleDeletePracticeArea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this practice area?')) return;

    try {
      const response = await fetch(`/api/admin/practice-areas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPracticeAreas();
      }
    } catch (error) {
      console.error('Error deleting practice area:', error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/practice-areas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        await fetchPracticeAreas();
      }
    } catch (error) {
      console.error('Error toggling practice area status:', error);
    }
  };

  const filteredPracticeAreas = practiceAreas.filter(area => {
    const matchesSearch = 
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterActive === 'all' || 
      (filterActive === 'active' && area.is_active) ||
      (filterActive === 'inactive' && !area.is_active);
    
    return matchesSearch && matchesFilter;
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
          <h2 className="text-2xl font-bold text-gray-900">Practice Area Management</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Practice Area
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search practice areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Practice Areas List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPracticeAreas.map((area) => (
                <tr key={area.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{area.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">{area.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {area.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(area.id, area.is_active)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                        area.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {area.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(area.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingPracticeArea(area)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePracticeArea(area.id)}
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
      {(isCreating || editingPracticeArea) && (
        <PracticeAreaForm
          practiceArea={editingPracticeArea}
          onSave={editingPracticeArea ? 
            (data) => handleUpdatePracticeArea(editingPracticeArea.id, data) :
            handleCreatePracticeArea
          }
          onCancel={() => {
            setIsCreating(false);
            setEditingPracticeArea(null);
          }}
        />
      )}
    </div>
  );
}

// Practice Area Form Component
interface PracticeAreaFormProps {
  practiceArea?: PracticeArea | null;
  onSave: (data: Partial<PracticeArea>) => void;
  onCancel: () => void;
}

function PracticeAreaForm({ practiceArea, onSave, onCancel }: PracticeAreaFormProps) {
  const [formData, setFormData] = useState({
    name: practiceArea?.name || '',
    description: practiceArea?.description || '',
    slug: practiceArea?.slug || '',
    is_active: practiceArea?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate slug from name if not provided
    if (!formData.slug && formData.name) {
      formData.slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    onSave(formData);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {practiceArea ? 'Edit Practice Area' : 'Create New Practice Area'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Personal Injury Law"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="e.g., personal-injury-law"
              />
              <p className="mt-1 text-sm text-gray-500">
                URL-friendly version of the name (auto-generated from name)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this practice area..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Active</label>
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
                {practiceArea ? 'Update' : 'Create'} Practice Area
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
