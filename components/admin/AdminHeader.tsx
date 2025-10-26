'use client';

export function AdminHeader() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage attorneys, practice areas, leads, and system settings
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Welcome back, Admin</p>
            <p className="text-sm font-medium text-gray-900">Administrator</p>
          </div>
          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
