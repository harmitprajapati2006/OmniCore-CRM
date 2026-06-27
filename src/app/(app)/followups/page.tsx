import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FollowupsContent } from "./followups-content";

export default async function FollowupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const { data: followups } = await supabase
    .from("followups")
    .select("*, lead:leads(id, full_name, phone), assigned_agent:profiles!followups_assigned_to_fkey(full_name)")
    .eq("organization_id", profile.organization_id)
    .order("scheduled_at", { ascending: true });

  return <FollowupsContent followups={followups || []} currentUserId={user.id} organizationId={profile.organization_id} />;
}
