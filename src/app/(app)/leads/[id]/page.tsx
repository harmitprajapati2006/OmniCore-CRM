import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { LeadDetailContent } from "./lead-detail-content";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Get lead
  const { data: lead } = await supabase
    .from("leads")
    .select("*, assigned_agent:profiles!leads_assigned_agent_id_fkey(id, full_name, phone, avatar_url)")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!lead) notFound();

  // Get timeline activities
  const { data: activities } = await supabase
    .from("activities")
    .select("*, profiles:user_id(full_name)")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get calls
  const { data: calls } = await supabase
    .from("calls")
    .select("*, agent:profiles!calls_agent_id_fkey(full_name)")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get follow-ups
  const { data: followups } = await supabase
    .from("followups")
    .select("*")
    .eq("lead_id", id)
    .order("scheduled_at", { ascending: false })
    .limit(20);

  // Get property shares
  const { data: shares } = await supabase
    .from("lead_property_shares")
    .select("*, property:properties(id, title, location, price)")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get recommended properties
  let propQuery = supabase
    .from("properties")
    .select("*, images:property_images(id, url, is_primary)")
    .eq("organization_id", profile.organization_id)
    .eq("availability", "available")
    .limit(5);

  if (lead.property_type) propQuery = propQuery.eq("property_type", lead.property_type);
  if (lead.budget_max) propQuery = propQuery.lte("price", lead.budget_max);
  if (lead.budget_min) propQuery = propQuery.gte("price", lead.budget_min);

  const { data: recommendedProperties } = await propQuery;

  // Get agents for reassignment
  const { data: agents } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("organization_id", profile.organization_id)
    .in("role", ["sales_agent", "sales_manager"])
    .eq("is_active", true);

  return (
    <LeadDetailContent
      lead={lead}
      activities={activities || []}
      calls={calls || []}
      followups={followups || []}
      shares={shares || []}
      recommendedProperties={recommendedProperties || []}
      agents={agents || []}
      currentUserId={user.id}
      organizationId={profile.organization_id}
    />
  );
}
