/**
 * Generates avatar initials from a name, with proper fallbacks
 * @param firstName - First name
 * @param lastName - Last name
 * @param fallback - Fallback character if no initials available (default: '?')
 * @returns Initials string (1-2 characters) or fallback character
 */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  fallback: string = '?'
): string {
  const firstInitial = firstName?.[0]?.toUpperCase() || '';
  const lastInitial = lastName?.[0]?.toUpperCase() || '';
  
  const initials = firstInitial + lastInitial;
  return initials || fallback;
}

/**
 * Generates a full name string safely
 * @param firstName - First name
 * @param lastName - Last name
 * @param fallback - Fallback text if no name available (default: 'Attorney')
 * @returns Full name string
 */
export function getFullName(
  firstName?: string | null,
  lastName?: string | null,
  fallback: string = 'Attorney'
): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  const fullName = `${first} ${last}`.trim();
  return fullName || fallback;
}
