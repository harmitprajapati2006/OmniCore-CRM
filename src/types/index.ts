// EstateFlow CRM - Database Types
// These mirror the Supabase schema defined in migrations

// ============================================================
// ENUMS
// ============================================================

export type UserRole = 'admin' | 'sales_manager' | 'sales_agent' | 'field_executive' | 'social_media_manager';

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'site_visit_scheduled' | 'negotiation' | 'won' | 'lost' | 'not_responding';

export type LeadTemperature = 'cold' | 'warm' | 'hot';

export type LeadSource = '36_acre' | 'magicbricks' | 'housing' | 'facebook' | 'instagram' | 'website' | 'referral' | 'manual' | 'other';

export type PropertyType = 'apartment' | 'villa' | 'plot' | 'commercial' | 'rental';

export type PropertyAvailability = 'available' | 'hold' | 'sold' | 'rented';

export type FurnishingStatus = 'unfurnished' | 'semi_furnished' | 'fully_furnished';

export type MessageChannel = 'whatsapp' | 'sms' | 'email';

export type FollowupType = 'whatsapp' | 'sms' | 'email' | 'call' | 'site_visit';

export type FollowupStatus = 'pending' | 'completed' | 'snoozed' | 'cancelled';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'half_day' | 'on_leave';

export type SocialPostType = 'instagram_reel' | 'instagram_post' | 'facebook_post' | 'linkedin_post' | 'story';

export type SocialPostStatus = 'idea' | 'draft' | 'scheduled' | 'published';

export type ActivityType =
  | 'lead_created' | 'lead_assigned' | 'lead_status_changed'
  | 'call_made' | 'call_received' | 'call_missed'
  | 'message_sent' | 'email_sent' | 'note_added'
  | 'followup_created' | 'followup_completed'
  | 'property_shared' | 'site_visit_scheduled' | 'site_visit_completed'
  | 'attendance_checkin' | 'attendance_checkout';

export type NotificationType =
  | 'lead_assigned' | 'call_missed' | 'followup_due'
  | 'site_visit_scheduled' | 'property_shared'
  | 'attendance_issue' | 'social_post_due';

export type CallOutcome =
  | 'connected' | 'no_answer' | 'busy' | 'voicemail'
  | 'wrong_number' | 'not_interested' | 'interested'
  | 'callback_requested' | 'pending';

export type AssignmentMode = 'round_robin' | 'manual' | 'least_busy';

// ============================================================
// TABLE TYPES
// ============================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_available: boolean;
  last_lead_assigned_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  property_type: PropertyType | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_location: string | null;
  status: LeadStatus;
  temperature: LeadTemperature;
  assigned_agent_id: string | null;
  notes: string | null;
  next_followup_at: string | null;
  last_contacted_at: string | null;
  won_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined fields
  assigned_agent?: Profile;
}

export interface Property {
  id: string;
  organization_id: string;
  title: string;
  location: string;
  address: string | null;
  property_type: PropertyType;
  price: number | null;
  price_per_sqft: number | null;
  size_sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  total_floors: number | null;
  furnishing: FurnishingStatus;
  availability: PropertyAvailability;
  description: string | null;
  amenities: string[];
  owner_name: string | null;
  owner_phone: string | null;
  developer_name: string | null;
  project_name: string | null;
  units_available: number;
  rera_number: string | null;
  internal_tags: string[];
  notes: string | null;
  share_slug: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined fields
  images?: PropertyImage[];
  documents?: PropertyDocument[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  organization_id: string;
  url: string;
  storage_path: string | null;
  caption: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  organization_id: string;
  name: string;
  url: string;
  storage_path: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface Activity {
  id: string;
  organization_id: string;
  lead_id: string | null;
  user_id: string | null;
  property_id: string | null;
  type: ActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined fields
  user?: Profile;
  lead?: Lead;
  property?: Property;
}

export interface Call {
  id: string;
  organization_id: string;
  lead_id: string;
  agent_id: string;
  call_sid: string | null;
  conference_sid: string | null;
  status: string;
  duration: number;
  recording_url: string | null;
  outcome: CallOutcome;
  notes: string | null;
  is_bridge_call: boolean;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  agent?: Profile;
  lead?: Lead;
}

export interface Message {
  id: string;
  organization_id: string;
  lead_id: string;
  user_id: string | null;
  channel: MessageChannel;
  direction: 'inbound' | 'outbound';
  to_number: string | null;
  from_number: string | null;
  subject: string | null;
  body: string;
  template_name: string | null;
  status: string;
  external_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LeadPropertyShare {
  id: string;
  organization_id: string;
  lead_id: string;
  property_id: string;
  shared_by: string | null;
  channel: MessageChannel | null;
  share_link: string | null;
  message_body: string | null;
  viewed_at: string | null;
  created_at: string;
  // Joined
  property?: Property;
  lead?: Lead;
}

export interface Followup {
  id: string;
  organization_id: string;
  lead_id: string;
  assigned_to: string;
  created_by: string | null;
  type: FollowupType;
  status: FollowupStatus;
  title: string;
  notes: string | null;
  template_name: string | null;
  message_body: string | null;
  scheduled_at: string;
  completed_at: string | null;
  snoozed_until: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  lead?: Lead;
  assigned_agent?: Profile;
}

export interface Attendance {
  id: string;
  organization_id: string;
  user_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  check_out_latitude: number | null;
  check_out_longitude: number | null;
  check_in_selfie_url: string | null;
  status: AttendanceStatus;
  notes: string | null;
  field_visit_notes: string | null;
  total_hours: number | null;
  created_at: string;
  updated_at: string;
  // Joined
  user?: Profile;
}

export interface SocialPost {
  id: string;
  organization_id: string;
  created_by: string | null;
  assigned_to: string | null;
  post_type: SocialPostType;
  status: SocialPostStatus;
  caption: string | null;
  media_urls: string[];
  storage_paths: string[];
  hashtags: string[];
  scheduled_at: string | null;
  published_at: string | null;
  publish_url: string | null;
  notes: string | null;
  ai_generated: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined
  creator?: Profile;
  assignee?: Profile;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  assigned_to: string | null;
  created_by: string | null;
  lead_id: string | null;
  property_id: string | null;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationSetting {
  id: string;
  organization_id: string;
  key: string;
  value: string | null;
  is_secret: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// WEBHOOK TYPES
// ============================================================

export interface LeadWebhookPayload {
  fullName: string;
  phone: string;
  email?: string;
  source?: string;
  propertyType?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  notes?: string;
}

// ============================================================
// HELPER TYPES
// ============================================================

export interface DashboardStats {
  newLeadsToday: number;
  callsMadeToday: number;
  followupsDueToday: number;
  hotLeads: number;
  siteVisitsScheduled: number;
  availableProperties: number;
  teamCheckedIn: number;
  totalTeam: number;
}

export interface ReportData {
  leadsBySource: { source: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  agentPerformance: {
    agent_name: string;
    calls_made: number;
    leads_won: number;
    followups_completed: number;
  }[];
  leadsTrend: { date: string; count: number }[];
}

// Label maps for display
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  site_visit_scheduled: 'Site Visit',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
  not_responding: 'Not Responding',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  '36_acre': '36 Acre',
  magicbricks: 'MagicBricks',
  housing: 'Housing.com',
  facebook: 'Facebook',
  instagram: 'Instagram',
  website: 'Website',
  referral: 'Referral',
  manual: 'Manual',
  other: 'Other',
};

export const TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  cold: 'Cold',
  warm: 'Warm',
  hot: 'Hot',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  plot: 'Plot',
  commercial: 'Commercial',
  rental: 'Rental',
};

export const AVAILABILITY_LABELS: Record<PropertyAvailability, string> = {
  available: 'Available',
  hold: 'On Hold',
  sold: 'Sold',
  rented: 'Rented',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  sales_manager: 'Sales Manager',
  sales_agent: 'Sales Agent',
  field_executive: 'Field Executive',
  social_media_manager: 'Social Media Manager',
};
