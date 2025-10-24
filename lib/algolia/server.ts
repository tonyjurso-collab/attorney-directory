import { algoliasearch } from 'algoliasearch';
import { AttorneyWithDetails } from '@/lib/types/database';
import { transformAttorneyForAlgolia } from './client';

// Initialize Algolia admin client
export const adminSearchClient = process.env.ALGOLIA_ADMIN_API_KEY
  ? algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY)
  : null;

export const attorneysAdminIndex = adminSearchClient?.initIndex('attorneys');

// Index attorney data to Algolia
export async function indexAttorney(attorney: AttorneyWithDetails) {
  if (!attorneysAdminIndex) {
    console.log('Algolia not configured, skipping indexing');
    return { success: true };
  }

  try {
    const transformedAttorney = transformAttorneyForAlgolia(attorney);
    await attorneysAdminIndex.saveObject(transformedAttorney);
    console.log('Successfully indexed attorney:', attorney.id);
    return { success: true };
  } catch (error) {
    console.error('Error indexing attorney:', error);
    return { success: false, error };
  }
}

// Remove attorney from Algolia index
export async function removeAttorneyFromIndex(attorneyId: string) {
  if (!attorneysAdminIndex) {
    console.log('Algolia not configured, skipping removal');
    return { success: true };
  }

  try {
    await attorneysAdminIndex.deleteObject(attorneyId);
    console.log('Successfully removed attorney from index:', attorneyId);
    return { success: true };
  } catch (error) {
    console.error('Error removing attorney from index:', error);
    return { success: false, error };
  }
}

// Batch index multiple attorneys
export async function batchIndexAttorneys(attorneys: AttorneyWithDetails[]) {
  if (!attorneysAdminIndex) {
    console.log('Algolia not configured, skipping batch indexing');
    return { success: true };
  }

  try {
    const transformedAttorneys = attorneys.map(transformAttorneyForAlgolia);
    await attorneysAdminIndex.saveObjects(transformedAttorneys);
    console.log('Successfully batch indexed attorneys:', attorneys.length);
    return { success: true };
  } catch (error) {
    console.error('Error batch indexing attorneys:', error);
    return { success: false, error };
  }
}
