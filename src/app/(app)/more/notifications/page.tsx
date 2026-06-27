import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const typeIcons: Record<string, string> = {
  lead_assigned: "👤", call_missed: "📵", followup_due: "📅",
  site_visit_scheduled: "📍", property_shared: "🏠",
  attendance_issue: "⚠️", social_post_due: "📱",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Mark all as read
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);

  return (
    <div className="animate-slide-up">
      <PageHeader title="Notifications" />
      <div className="px-4 space-y-2">
        {!notifications?.length ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          notifications.map((notif) => (
            <Link key={notif.id} href={notif.link || "#"}>
              <Card className={`border-0 shadow-sm py-0 hover:shadow-md transition-all cursor-pointer ${!notif.is_read ? "bg-primary/5" : ""}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-lg">{typeIcons[notif.type] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notif.title}</p>
                    {notif.body && <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
