/**
 * ConsentModal Component
 * TCPA consent inline message for lead submission
 */

'use client';

interface ConsentModalProps {
  onAccept: (event?: React.FormEvent) => void;
  onDecline: () => void;
  practiceArea?: string;
  firstName?: string;
}

export function ConsentModal({
  onAccept,
  onDecline,
  practiceArea = 'legal',
  firstName,
}: ConsentModalProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 my-2">
      <h3 className="text-lg font-bold text-gray-900 mb-3">
        {firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'Attorney'}
      </h3>
      <p className="text-gray-700 mb-4">
        May we share your information with a qualified attorney in your area who handles {practiceArea} cases?
      </p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-700">
          <strong className="font-semibold">TCPA Notice:</strong> By clicking 'Yes, Connect Me' I agree by electronic signature to be contacted by LegalHub through telephone calls, text messages, and email. I understand that my consent is not a condition of purchase.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onDecline}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          No, Thanks
        </button>
        <button
          onClick={(e) => onAccept(e)}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Yes, Connect Me
        </button>
      </div>
    </div>
  );
}

