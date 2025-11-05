/**
 * Type definitions for the Attorney Articles system
 */

// Database enums
export type ArticleStatus = 'draft' | 'pending_review' | 'published' | 'rejected';
export type RevisionType = 'created' | 'edited' | 'admin_approved' | 'admin_rejected';

// Main article interface
export interface AttorneyArticle {
  id: string;
  attorney_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_description: string | null;
  status: ArticleStatus;
  published_at: string | null;
  rejection_reason: string | null;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

// Article with relationships
export interface ArticleWithRelations extends AttorneyArticle {
  attorney?: {
    id: string;
    first_name: string;
    last_name: string;
    firm_name: string | null;
    profile_image_url: string | null;
  };
  practice_areas?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }[];
  tags?: {
    id: string;
    name: string;
    slug: string;
  }[];
}

// Article revision
export interface ArticleRevision {
  id: string;
  article_id: string;
  title: string | null;
  content: string | null;
  excerpt: string | null;
  revised_by: string | null;
  revision_type: RevisionType;
  created_at: string;
}

// Article tag
export interface ArticleTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// Practice area (existing table, imported for reference)
export interface PracticeArea {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
}

// Form data for creating/editing articles
export interface ArticleFormData {
  title: string;
  content: string;
  excerpt?: string;
  meta_description?: string;
  practice_area_ids: string[];
  tags: string[]; // Array of tag names (will be created if they don't exist)
}

// AI metadata generation response
export interface AIMetadataResponse {
  excerpt: string;
  meta_description: string;
}

// Article list filters
export interface ArticleFilters {
  status?: ArticleStatus;
  attorney_id?: string;
  practice_area_id?: string;
  tag_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Article list response
export interface ArticleListResponse {
  articles: ArticleWithRelations[];
  total: number;
  limit: number;
  offset: number;
}

// Article approval/rejection data
export interface ArticleApprovalData {
  article_id: string;
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

// Share tracking data
export interface ArticleShareData {
  article_id: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'email' | 'copy_link';
}




