import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  location: z.string().min(1, 'Location is required').max(200),
  address: z.string().max(500).optional(),
  property_type: z.enum(['apartment', 'villa', 'plot', 'commercial', 'rental']),
  price: z.coerce.number().min(0).optional(),
  price_per_sqft: z.coerce.number().min(0).optional(),
  size_sqft: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().min(0).max(50).optional(),
  bathrooms: z.coerce.number().min(0).max(50).optional(),
  floor: z.coerce.number().optional(),
  total_floors: z.coerce.number().optional(),
  furnishing: z.enum(['unfurnished', 'semi_furnished', 'fully_furnished']).default('unfurnished'),
  availability: z.enum(['available', 'hold', 'sold', 'rented']).default('available'),
  description: z.string().max(5000).optional(),
  amenities: z.array(z.string()).default([]),
  owner_name: z.string().max(200).optional(),
  owner_phone: z.string().max(20).optional(),
  developer_name: z.string().max(200).optional(),
  project_name: z.string().max(200).optional(),
  units_available: z.coerce.number().min(0).default(1),
  rera_number: z.string().max(100).optional(),
  internal_tags: z.array(z.string()).default([]),
  notes: z.string().max(5000).optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
