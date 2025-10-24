export type MembershipTier = 'free' | 'standard' | 'exclusive';
export type UserRole = 'attorney' | 'admin';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      attorneys: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          firm_name: string | null;
          bio: string | null;
          experience_years: number | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string;
          location: string | null; // PostGIS point as string
          latitude: number | null;
          longitude: number | null;
          formatted_address: string | null;
          profile_image_url: string | null;
          firm_logo_url: string | null;
          membership_tier: MembershipTier;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          is_active: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          firm_name?: string | null;
          bio?: string | null;
          experience_years?: number | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          formatted_address?: string | null;
          profile_image_url?: string | null;
          firm_logo_url?: string | null;
          membership_tier?: MembershipTier;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          is_active?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          firm_name?: string | null;
          bio?: string | null;
          experience_years?: number | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          formatted_address?: string | null;
          profile_image_url?: string | null;
          firm_logo_url?: string | null;
          membership_tier?: MembershipTier;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          is_active?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      practice_areas: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          slug: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          slug: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          slug?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      attorney_practice_areas: {
        Row: {
          id: string;
          attorney_id: string;
          practice_area_id: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          attorney_id: string;
          practice_area_id: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          attorney_id?: string;
          practice_area_id?: string;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          attorney_id: string | null;
          practice_area_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          zip_code: string | null;
          case_description: string | null;
          case_value: number | null;
          urgency: string | null;
          status: LeadStatus;
          source: string;
          leadprosper_lead_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          attorney_id?: string | null;
          practice_area_id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          zip_code?: string | null;
          case_description?: string | null;
          case_value?: number | null;
          urgency?: string | null;
          status?: LeadStatus;
          source?: string;
          leadprosper_lead_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          attorney_id?: string | null;
          practice_area_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          zip_code?: string | null;
          case_description?: string | null;
          case_value?: number | null;
          urgency?: string | null;
          status?: LeadStatus;
          source?: string;
          leadprosper_lead_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          attorney_id: string;
          client_name: string;
          client_email: string | null;
          rating: number;
          review_text: string | null;
          is_verified: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          attorney_id: string;
          client_name: string;
          client_email?: string | null;
          rating: number;
          review_text?: string | null;
          is_verified?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          attorney_id?: string;
          client_name?: string;
          client_email?: string | null;
          rating?: number;
          review_text?: string | null;
          is_verified?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Extended types for application use
export interface AttorneyWithDetails {
  id: string;
  first_name: string;
  last_name: string;
  firm_name: string | null;
  bio: string | null;
  experience_years: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  formatted_address: string | null;
  profile_image_url: string | null;
  firm_logo_url: string | null;
  membership_tier: MembershipTier;
  is_verified: boolean;
  practice_areas: {
    id: string;
    name: string;
    slug: string;
    is_primary: boolean;
  }[];
  reviews?: {
    id: string;
    rating: number;
    review_text: string | null;
    client_name: string;
    created_at: string;
  }[];
  average_rating?: number;
  review_count?: number;
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  zip_code?: string;
  practice_area_id: string;
  case_description: string;
  case_value?: number;
  urgency?: string;
}

export interface SearchFilters {
  practice_area?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  membership_tier?: MembershipTier;
  radius?: number; // in miles
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  zip_code?: string;
}
