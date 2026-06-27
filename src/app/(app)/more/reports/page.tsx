import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from "@/types";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const orgId = profile.organization_id;

  // Leads by status
  const { data: allLeads } = await supabase.from("leads").select("status, source, temperature, assigned_agent_id").eq("organization_id", orgId);
  const leads = allLeads || [];

  const byStatus: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byTemp: Record<string, number> = {};
  leads.forEach((l) => {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    bySource[l.source] = (bySource[l.source] || 0) + 1;
    byTemp[l.temperature] = (byTemp[l.temperature] || 0) + 1;
  });

  // Calls count
  const { count: totalCalls } = await supabase.from("calls").select("*", { count: "exact", head: true }).eq("organization_id", orgId);

  // Follow-ups completed
  const { count: completedFollowups } = await supabase.from("followups").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "completed");

  // Properties shared
  const { count: totalShares } = await supabase.from("lead_property_shares").select("*", { count: "exact", head: true }).eq("organization_id", orgId);

  const statusColors: Record<string, string> = {
    new: "bg-blue-500", contacted: "bg-sky-500", interested: "bg-green-500",
    site_visit_scheduled: "bg-purple-500", negotiation: "bg-amber-500",
    won: "bg-emerald-500", lost: "bg-red-500", not_responding: "bg-gray-400",
  };

  return (
    <div className="animate-slide-up">
      <PageHeader title="Reports" description="Business performance overview" />
      <div className="px-4 space-y-4 pb-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm py-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{leads.length}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm py-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{totalCalls || 0}</p>
              <p className="text-xs text-muted-foreground">Total Calls</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm py-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{completedFollowups || 0}</p>
              <p className="text-xs text-muted-foreground">Follow-ups Done</p>
            </CardContent>
          </Card>
        </div>

        {/* Leads by Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">Leads by Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusColors[status] || "bg-gray-400"}`} />
                <span className="text-sm flex-1">{LEAD_STATUS_LABELS[status as keyof typeof LEAD_STATUS_LABELS] || status}</span>
                <span className="text-sm font-semibold">{count}</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${statusColors[status] || "bg-gray-400"}`} style={{ width: `${(count / leads.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leads by Source */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">Leads by Source</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm">{LEAD_SOURCE_LABELS[source as keyof typeof LEAD_SOURCE_LABELS] || source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{count}</span>
                  <span className="text-xs text-muted-foreground">({Math.round((count / leads.length) * 100)}%)</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Won/Lost */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm">Conversion</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-green-600">{byStatus["won"] || 0}</p>
                <p className="text-xs text-muted-foreground">Won</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{byStatus["lost"] || 0}</p>
                <p className="text-xs text-muted-foreground">Lost</p>
              </div>
            </div>
            {leads.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {Math.round(((byStatus["won"] || 0) / leads.length) * 100)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Properties Shared */}
        <Card className="border-0 shadow-sm py-0">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm">Properties Shared</span>
            <span className="text-lg font-bold">{totalShares || 0}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
