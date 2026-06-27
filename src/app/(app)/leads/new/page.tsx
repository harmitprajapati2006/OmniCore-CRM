import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddLeadForm } from "./add-lead-form";

export default async function NewLeadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: agents } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("organization_id", profile.organization_id)
    .in("role", ["sales_agent", "sales_manager"])
    .eq("is_active", true);

  return <AddLeadForm organizationId={profile.organization_id} agents={agents || []} />;
}
