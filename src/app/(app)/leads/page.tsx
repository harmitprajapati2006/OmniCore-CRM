import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeadsListContent } from "./leads-list-content";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const params = await searchParams;
  const status = params.status;
  const source = params.source;
  const temperature = params.temperature;
  const search = params.search;
  const agentId = params.agent;

  let query = supabase
    .from("leads")
    .select("*, assigned_agent:profiles!leads_assigned_agent_id_fkey(id, full_name, avatar_url)")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);
  if (source) query = query.eq("source", source);
  if (temperature) query = query.eq("temperature", temperature);
  if (agentId) query = query.eq("assigned_agent_id", agentId);
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: leads } = await query;

  // Get agents for filter
  const { data: agents } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("organization_id", profile.organization_id)
    .in("role", ["sales_agent", "sales_manager"])
    .eq("is_active", true);

  return (
    <LeadsListContent
      leads={leads || []}
      agents={agents || []}
      currentFilters={{ status, source, temperature, search, agent: agentId }}
      userRole={profile.role}
    />
  );
}
