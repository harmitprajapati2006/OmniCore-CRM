/**
 * EstateFlow CRM - Seed Script
 * 
 * Run with: npx tsx scripts/seed.ts
 * 
 * Creates sample data for development:
 * - 1 organization (Skyline Realty Group)
 * - 1 admin user
 * - 2 sales agents
 * - 1 field executive  
 * - 1 social media manager
 * - 20 sample leads
 * - Sample calls, follow-ups, attendance, social posts
 * 
 * Prerequisites: 
 * - Supabase project with migrations applied
 * - .env.local with SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ORG_ID = 'a0000000-0000-0000-0000-000000000001';

async function createUser(email: string, password: string, fullName: string, role: string) {
  const { data: authUser, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.log(`  User ${email} may already exist:`, error.message);
    // Try to get existing user
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existing = users?.find(u => u.email === email);
    if (existing) {
      console.log(`  Found existing user: ${existing.id}`);
      return existing.id;
    }
    return null;
  }

  // Create profile
  await supabase.from('profiles').insert({
    id: authUser.user.id,
    organization_id: ORG_ID,
    full_name: fullName,
    email,
    phone: '+91' + Math.floor(9000000000 + Math.random() * 999999999),
    role,
    is_active: true,
    is_available: true,
  });

  console.log(`  Created user: ${fullName} (${email}) - ${role}`);
  return authUser.user.id;
}

async function seed() {
  console.log('🌱 Starting seed...\n');

  // 1. Create organization (if not from migration)
  console.log('📁 Setting up organization...');
  const { error: orgError } = await supabase
    .from('organizations')
    .upsert({
      id: ORG_ID,
      name: 'Skyline Realty Group',
      slug: 'skyline-realty',
      phone: '+919876543210',
      email: 'admin@skylinerealty.com',
    });
  if (orgError) console.log('  Org may exist:', orgError.message);
  else console.log('  Organization created');

  // 2. Create users
  console.log('\n👥 Creating users...');
  const adminId = await createUser('admin@skylinerealty.com', 'password123', 'Vikram Patel', 'admin');
  const agent1Id = await createUser('agent1@skylinerealty.com', 'password123', 'Priya Sharma', 'sales_agent');
  const agent2Id = await createUser('agent2@skylinerealty.com', 'password123', 'Rahul Kumar', 'sales_agent');
  const fieldExecId = await createUser('field@skylinerealty.com', 'password123', 'Amit Singh', 'field_executive');
  const socialId = await createUser('social@skylinerealty.com', 'password123', 'Neha Gupta', 'social_media_manager');

  const agentIds = [agent1Id, agent2Id].filter(Boolean) as string[];

  // 3. Create sample leads
  console.log('\n📋 Creating sample leads...');
  const leadNames = [
    'Rajesh Verma', 'Sunita Agarwal', 'Mohammed Iqbal', 'Deepika Nair',
    'Arjun Reddy', 'Kavita Joshi', 'Sanjay Malhotra', 'Pooja Kapoor',
    'Vikas Tiwari', 'Anita Desai', 'Nikhil Chauhan', 'Ritu Saxena',
    'Gaurav Mehta', 'Swati Pandey', 'Manish Gupta', 'Divya Bhatt',
    'Rohit Srivastava', 'Sneha Iyer', 'Anil Dubey', 'Meera Pillai',
  ];

  const sources = ['36_acre', 'magicbricks', 'housing', 'facebook', 'instagram', 'website', 'referral', 'manual'];
  const statuses = ['new', 'contacted', 'interested', 'site_visit_scheduled', 'negotiation', 'won', 'lost', 'not_responding'];
  const temps = ['cold', 'warm', 'hot'];
  const types = ['apartment', 'villa', 'plot', 'commercial', 'rental'];
  const locations = ['Gurgaon', 'Noida', 'Delhi', 'Bangalore', 'Mumbai'];

  for (let i = 0; i < leadNames.length; i++) {
    const name = leadNames[i];
    const agentId = agentIds[i % agentIds.length];
    
    const { data: lead } = await supabase.from('leads').insert({
      organization_id: ORG_ID,
      full_name: name,
      phone: '+91' + (9000000000 + i * 111111111).toString().slice(0, 10),
      email: name.toLowerCase().replace(' ', '.') + '@gmail.com',
      source: sources[i % sources.length],
      property_type: types[i % types.length],
      budget_min: (3 + i) * 1000000,
      budget_max: (8 + i) * 1000000,
      preferred_location: locations[i % locations.length],
      status: statuses[i % statuses.length],
      temperature: temps[i % temps.length],
      assigned_agent_id: agentId,
      notes: `Interested in ${types[i % types.length]} in ${locations[i % locations.length]}. Budget: ₹${((3 + i) / 10).toFixed(1)}Cr - ₹${((8 + i) / 10).toFixed(1)}Cr`,
    }).select().single();

    if (lead) {
      // Create activity
      await supabase.from('activities').insert({
        organization_id: ORG_ID,
        lead_id: lead.id,
        user_id: agentId,
        type: 'lead_created',
        title: `Lead created: ${name}`,
        description: `Source: ${sources[i % sources.length]}`,
      });
    }
  }
  console.log(`  Created ${leadNames.length} leads`);

  // 4. Sample social posts
  console.log('\n📱 Creating social posts...');
  const postTypes = ['instagram_post', 'instagram_reel', 'facebook_post', 'linkedin_post', 'story'];
  const postStatuses = ['idea', 'draft', 'scheduled', 'published'];
  for (let i = 0; i < 5; i++) {
    await supabase.from('social_posts').insert({
      organization_id: ORG_ID,
      created_by: socialId,
      assigned_to: socialId,
      post_type: postTypes[i],
      status: postStatuses[i % postStatuses.length],
      caption: `🏠 Check out this amazing ${types[i % types.length]} in ${locations[i % locations.length]}! #realestate #luxury #home`,
      hashtags: ['realestate', 'luxury', 'home', locations[i % locations.length].toLowerCase()],
      scheduled_at: new Date(Date.now() + i * 86400000).toISOString(),
    });
  }
  console.log('  Created 5 social posts');

  console.log('\n✅ Seed complete!');
  console.log('\n📧 Login credentials:');
  console.log('  Admin: admin@skylinerealty.com / password123');
  console.log('  Agent 1: agent1@skylinerealty.com / password123');
  console.log('  Agent 2: agent2@skylinerealty.com / password123');
  console.log('  Field Exec: field@skylinerealty.com / password123');
  console.log('  Social: social@skylinerealty.com / password123');
}

seed().catch(console.error);
