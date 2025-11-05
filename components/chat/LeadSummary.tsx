'use client';

import { useState } from 'react';

interface LeadSummaryProps {
  leadData: Record<string, any>;
  onEdit: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LeadSummary({
  leadData,
  onEdit,
  onSubmit,
  onCancel,
  isLoading = false,
}: LeadSummaryProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleEditSave = () => {
    if (editingField) {
      onEdit(editingField, editValue);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const formatFieldName = (field: string): string => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatFieldValue = (field: string, value: any): string => {
    if (!value) return 'Not provided';
    
    switch (field) {
      case 'phone':
        return typeof value === 'string' ? value : 'Invalid phone';
      case 'email':
        return typeof value === 'string' ? value : 'Invalid email';
      case 'zip_code':
        return typeof value === 'string' ? value : 'Invalid ZIP';
      case 'date_of_incident':
        return typeof value === 'string' ? value : 'Invalid date';
      case 'bodily_injury':
      case 'at_fault':
      case 'has_attorney':
      case 'children_involved':
        return value === 'yes' ? 'Yes' : value === 'no' ? 'No' : 'Not specified';
      default:
        return typeof value === 'string' ? value : String(value);
    }
  };

  const getFieldIcon = (field: string): string => {
    switch (field) {
      case 'first_name':
      case 'last_name':
        return '👤';
      case 'email':
        return '📧';
      case 'phone':
        return '📞';
      case 'city':
      case 'state':
      case 'zip_code':
        return '📍';
      case 'date_of_incident':
        return '📅';
      case 'bodily_injury':
        return '🏥';
      case 'at_fault':
        return '⚠️';
      case 'has_attorney':
        return '⚖️';
      case 'children_involved':
        return '👶';
      case 'describe':
        return '📝';
      default:
        return '📋';
    }
  };

  const isEditableField = (field: string): boolean => {
    const nonEditableFields = [
      'main_category',
      'sub_category',
      'lp_campaign_id',
      'lp_supplier_id',
      'lp_key',
      'ip_address',
      'user_agent',
      'landing_page_url',
      'jornaya_leadid',
      'trustedform_cert_url',
      'tcpa_text',
    ];
    return !nonEditableFields.includes(field);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Review Your Information
        </h3>
        <p className="text-gray-600 text-sm">
          Please review the information below and make any necessary changes before submitting.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {Object.entries(leadData).map(([field, value]) => {
          if (!value || value === '') return null;
          
          const isEditing = editingField === field;
          const canEdit = isEditableField(field);
          
          return (
            <div key={field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-lg">{getFieldIcon(field)}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">
                    {formatFieldName(field)}
                  </div>
                  {isEditing ? (
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={handleEditSave}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900 mt-1">
                      {formatFieldValue(field, value)}
                    </div>
                  )}
                </div>
              </div>
              
              {canEdit && !isEditing && (
                <button
                  onClick={() => handleEditStart(field, value)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Edit
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* TCPA Consent */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="tcpa-consent"
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="tcpa-consent" className="text-sm text-gray-700">
            <span className="font-medium">Consent to Contact:</span> By checking this box and submitting this form, 
            I consent to receive calls, text messages, and emails from attorneys and legal service providers 
            regarding my legal matter. I understand that I may be contacted using automated technology and 
            that consent is not required to purchase goods or services. I also understand that I can opt out 
            at any time by replying "STOP" to text messages or by contacting the attorney directly.
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading || !(document.getElementById('tcpa-consent') as HTMLInputElement)?.checked}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </div>
          ) : (
            'Submit Information'
          )}
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          Your information is secure and will only be shared with qualified attorneys 
          who can help with your legal matter. We respect your privacy and will not 
          sell your information to third parties.
        </p>
      </div>
    </div>
  );
}
