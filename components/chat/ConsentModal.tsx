/**
 * ConsentModal Component
 * TCPA consent modal for lead submission
 */

'use client';

interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
  practiceArea?: string;
}

export function ConsentModal({
  onAccept,
  onDecline,
  practiceArea = 'legal',
}: ConsentModalProps) {
  return (
    <div className="bg-white border-2 border-indigo-300 rounded-lg p-6 mx-4 my-4 shadow-lg">
        <div className="mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Connect with an Attorney
          </h3>
          <p className="text-gray-600">
            May we share your information with a qualified attorney in your area who
            handles {practiceArea} cases?
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong className="font-semibold">TCPA Notice:</strong> By clicking 'Yes,
            Connect Me' I agree by electronic signature to be contacted by LegalHub
            through telephone calls, text messages, and email. I understand that my
            consent is not a condition of purchase.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            No, Thanks
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg"
          >
            Yes, Connect Me
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Secure & Confidential
        </p>
    </div>
  );
}

