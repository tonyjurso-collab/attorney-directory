/**
 * Utility functions for generating URL-safe slugs
 */

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

export function generateUniqueSlug(baseTitle: string, existingSlugs: string[] = []): string {
  let slug = generateSlug(baseTitle);
  const baseSlug = slug;
  let counter = 1;

  // Ensure uniqueness
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}



