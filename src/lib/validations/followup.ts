import { z } from 'zod';

export const followupSchema = z.object({
  lead_id: z.string().uuid(),
  type: z.enum(['whatsapp', 'sms', 'email', 'call', 'site_visit']),
  title: z.string().min(1, 'Title is required').max(300),
  notes: z.string().max(2000).optional(),
  template_name: z.string().optional(),
  message_body: z.string().max(2000).optional(),
  scheduled_at: z.string().min(1, 'Schedule date is required'),
});

export const attendanceSchema = z.object({
  check_in_latitude: z.number().optional(),
  check_in_longitude: z.number().optional(),
  check_out_latitude: z.number().optional(),
  check_out_longitude: z.number().optional(),
  notes: z.string().max(1000).optional(),
  field_visit_notes: z.string().max(2000).optional(),
});

export const socialPostSchema = z.object({
  post_type: z.enum(['instagram_reel', 'instagram_post', 'facebook_post', 'linkedin_post', 'story']),
  status: z.enum(['idea', 'draft', 'scheduled', 'published']).default('idea'),
  caption: z.string().max(5000).optional(),
  hashtags: z.array(z.string()).default([]),
  scheduled_at: z.string().optional(),
  notes: z.string().max(2000).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
});

export type FollowupFormData = z.infer<typeof followupSchema>;
export type AttendanceFormData = z.infer<typeof attendanceSchema>;
export type SocialPostFormData = z.infer<typeof socialPostSchema>;
