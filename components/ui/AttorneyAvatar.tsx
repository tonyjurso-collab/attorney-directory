import { getInitials } from '@/lib/utils/avatar';

interface AttorneyAvatarProps {
  /** Profile image URL */
  profileImageUrl?: string | null;
  /** First name for fallback initials */
  firstName?: string | null;
  /** Last name for fallback initials */
  lastName?: string | null;
  /** Size of the avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export function AttorneyAvatar({
  profileImageUrl,
  firstName,
  lastName,
  size = 'md',
  className = '',
}: AttorneyAvatarProps) {
  const initials = getInitials(firstName, lastName);
  const sizeClass = sizeClasses[size];

  if (profileImageUrl) {
    return (
      <img
        src={profileImageUrl}
        alt={getFullName(firstName, lastName)}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    );
  }

  // Check if we're on a dark background (like profile header)
  const isDarkBackground = className.includes('border-white');
  const backgroundClass = isDarkBackground 
    ? 'bg-white/20 text-white' 
    : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white';

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${backgroundClass} ${sizeClass} ${className}`}
    >
      {initials}
    </div>
  );
}

// Helper function to be used elsewhere
function getFullName(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  const fullName = `${first} ${last}`.trim();
  return fullName || 'Attorney profile';
}
