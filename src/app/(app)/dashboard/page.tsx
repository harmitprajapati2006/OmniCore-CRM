import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Account Incomplete</h1>
        <p className="mb-6 text-muted-foreground">Your previous signup attempt was interrupted. Please sign out and try again.</p>
        <form action={async () => {
          "use server";
          const supabase = await createClient();
          await supabase.auth.signOut();
          redirect("/signup");
        }}>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">
            Sign Out & Try Again
          </button>
        </form>
      </div>
    );
  }

  const orgId = profile.organization_id;
  const today = new Date().toISOString().split("T")[0];

  // Fetch dashboard stats in parallel
  const [
    newLeadsRes,
    callsRes,
    followupsRes,
    hotLeadsRes,
    siteVisitsRes,
    propertiesRes,
    teamRes,
    attendanceRes,
    recentActivitiesRes,
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true })
      .eq("organization_id", orgId).gte("created_at", `${today}T00:00:00`),
    supabase.from("calls").select("*", { count: "exact", head: true })
      .eq("organization_id", orgId).gte("created_at", `${today}T00:00:00`),
    supabase.from("followups").select("*", { count: "exact", head: true })
      .eq("organization_id", orgId).eq("status", "pending")
      .lte("scheduled_at", `${today}T23:59:59`),
    supabase.from("leads").select("*", { count: "exact", head: true })
      .eq("organization_id", orgId).eq("temperature", "hot")
      .not("status", "in", '("won","lost")'),
    supabase.from("leads").select("*", { count: "exact", head: true })
      .eq("organization_id", orgId).eq("status", "site_visit_scheduled"),
    supabase.from("properties").select("*", { count: "exact", head: true })
      .eq("organization_id", orgId).eq("availability", "available"),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .eq("organization_id", orgId).eq("is_active", true),
    supabase.from("attendance").select("*", { count: "exact", head: true })
      .eq("organization_id", orgId).eq("date", today)
      .not("check_in_time", "is", null),
    supabase.from("activities").select("*, profiles:user_id(full_name)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const stats = {
    newLeadsToday: newLeadsRes.count || 0,
    callsMadeToday: callsRes.count || 0,
    followupsDueToday: followupsRes.count || 0,
    hotLeads: hotLeadsRes.count || 0,
    siteVisitsScheduled: siteVisitsRes.count || 0,
    availableProperties: propertiesRes.count || 0,
    teamCheckedIn: attendanceRes.count || 0,
    totalTeam: teamRes.count || 0,
  };

  const recentActivities = recentActivitiesRes.data || [];

  return (
    <DashboardContent
      stats={stats}
      recentActivities={recentActivities}
      userName={profile.full_name}
      userRole={profile.role}
    />
  );
}
