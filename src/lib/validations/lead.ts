import { z } from 'zod';

export const leadSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(200),
  phone: z.string().min(10, 'Valid phone number is required').max(20),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  source: z.enum(['36_acre', 'magicbricks', 'housing', 'facebook', 'instagram', 'website', 'referral', 'manual', 'other']).default('manual'),
  property_type: z.enum(['apartment', 'villa', 'plot', 'commercial', 'rental']).optional(),
  budget_min: z.coerce.number().min(0).optional(),
  budget_max: z.coerce.number().min(0).optional(),
  preferred_location: z.string().max(200).optional(),
  status: z.enum(['new', 'contacted', 'interested', 'site_visit_scheduled', 'negotiation', 'won', 'lost', 'not_responding']).default('new'),
  temperature: z.enum(['cold', 'warm', 'hot']).default('warm'),
  assigned_agent_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(5000).optional(),
  next_followup_at: z.string().optional().nullable(),
});

export const leadWebhookSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  source: z.string().optional(),
  propertyType: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  preferredLocation: z.string().optional(),
  notes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
export type LeadWebhookData = z.infer<typeof leadWebhookSchema>;
