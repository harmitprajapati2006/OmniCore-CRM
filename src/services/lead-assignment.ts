/**
 * Lead Assignment Service
 * Handles round-robin, manual, and least-busy agent assignment.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile, AssignmentMode } from '@/types';

interface AssignmentResult {
  success: boolean;
  agent?: Profile;
  error?: string;
}

/**
 * Assign a lead to an available sales agent
 */
export async function assignLead(
  organizationId: string,
  mode: AssignmentMode = 'round_robin'
): Promise<AssignmentResult> {
  const supabase = createAdminClient();

  switch (mode) {
    case 'round_robin':
      return assignRoundRobin(supabase, organizationId);
    case 'least_busy':
      return assignLeastBusy(supabase, organizationId);
    case 'manual':
      return { success: false, error: 'Manual assignment requires agent selection' };
    default:
      return assignRoundRobin(supabase, organizationId);
  }
}

/**
 * Round-robin assignment: pick the agent who was least recently assigned a lead
 */
async function assignRoundRobin(supabase: ReturnType<typeof createAdminClient>, organizationId: string): Promise<AssignmentResult> {
  const { data: agents, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('role', 'sales_agent')
    .eq('is_active', true)
    .eq('is_available', true)
    .order('last_lead_assigned_at', { ascending: true, nullsFirst: true })
    .limit(1);

  if (error || !agents?.length) {
    // Fallback: try sales managers
    const { data: managers } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('role', 'sales_manager')
      .eq('is_active', true)
      .order('last_lead_assigned_at', { ascending: true, nullsFirst: true })
      .limit(1);

    if (!managers?.length) {
      return { success: false, error: 'No available agents found' };
    }

    const agent = managers[0] as Profile;
    await updateLastAssigned(supabase, agent.id);
    return { success: true, agent };
  }

  const agent = agents[0] as Profile;
  await updateLastAssigned(supabase, agent.id);
  return { success: true, agent };
}

/**
 * Least-busy assignment: pick the agent with the fewest active leads
 */
async function assignLeastBusy(supabase: ReturnType<typeof createAdminClient>, organizationId: string): Promise<AssignmentResult> {
  // Get all active agents
  const { data: agents, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .in('role', ['sales_agent', 'sales_manager'])
    .eq('is_active', true)
    .eq('is_available', true);

  if (error || !agents?.length) {
    return { success: false, error: 'No available agents found' };
  }

  // Count active leads per agent
  const agentLeadCounts = await Promise.all(
    agents.map(async (agent) => {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_agent_id', agent.id)
        .not('status', 'in', '("won","lost")');

      return { agent: agent as Profile, leadCount: count || 0 };
    })
  );

  // Sort by lead count ascending
  agentLeadCounts.sort((a, b) => a.leadCount - b.leadCount);
  
  const selectedAgent = agentLeadCounts[0].agent;
  await updateLastAssigned(supabase, selectedAgent.id);
  return { success: true, agent: selectedAgent };
}

async function updateLastAssigned(supabase: ReturnType<typeof createAdminClient>, agentId: string) {
  await supabase
    .from('profiles')
    .update({ last_lead_assigned_at: new Date().toISOString() })
    .eq('id', agentId);
}

/**
 * Get the next available agent for call bridge fallback
 */
export async function getNextAvailableAgent(
  organizationId: string,
  excludeAgentId: string
): Promise<Profile | null> {
  const supabase = createAdminClient();

  const { data: agents } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .in('role', ['sales_agent', 'sales_manager'])
    .eq('is_active', true)
    .eq('is_available', true)
    .neq('id', excludeAgentId)
    .order('last_lead_assigned_at', { ascending: true, nullsFirst: true })
    .limit(1);

  return (agents?.[0] as Profile) || null;
}

export const leadAssignmentService = {
  assignLead,
  getNextAvailableAgent,
};

export default leadAssignmentService;
