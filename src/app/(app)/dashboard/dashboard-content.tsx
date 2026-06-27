"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus, Phone, CalendarCheck, Flame, MapPin,
  Building2, Users, Clock, Plus, PhoneCall,
  MessageSquare, ArrowRight
} from "lucide-react";
import type { DashboardStats, UserRole } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface DashboardContentProps {
  stats: DashboardStats;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    created_at: string;
    profiles?: { full_name: string } | null;
  }>;
  userName: string;
  userRole: UserRole;
}

const statCards = [
  { key: "newLeadsToday", label: "New Leads", icon: UserPlus, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50", href: "/leads" },
  { key: "callsMadeToday", label: "Calls Today", icon: Phone, color: "text-green-600 bg-green-50 dark:bg-green-950/50", href: "/leads" },
  { key: "followupsDueToday", label: "Follow-ups Due", icon: CalendarCheck, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/50", href: "/followups" },
  { key: "hotLeads", label: "Hot Leads", icon: Flame, color: "text-red-600 bg-red-50 dark:bg-red-950/50", href: "/leads?temperature=hot" },
  { key: "siteVisitsScheduled", label: "Site Visits", icon: MapPin, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50", href: "/leads?status=site_visit_scheduled" },
  { key: "availableProperties", label: "Properties", icon: Building2, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50", href: "/properties" },
] as const;

const activityIcons: Record<string, string> = {
  lead_created: "🆕",
  lead_assigned: "👤",
  lead_status_changed: "🔄",
  call_made: "📞",
  call_missed: "📵",
  message_sent: "💬",
  email_sent: "📧",
  note_added: "📝",
  followup_created: "📅",
  followup_completed: "✅",
  property_shared: "🏠",
  site_visit_scheduled: "📍",
  attendance_checkin: "🟢",
  attendance_checkout: "🔴",
};

export function DashboardContent({ stats, recentActivities, userName, userRole }: DashboardContentProps) {
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="p-4 space-y-5 animate-slide-up">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold">
          {greeting}, {userName.split(" ")[0]}! 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s your business overview for today
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const value = stats[stat.key as keyof DashboardStats];
          return (
            <Link key={stat.key} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Team Attendance Strip */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Team Attendance</p>
                <p className="text-xs text-muted-foreground">
                  {stats.teamCheckedIn} of {stats.totalTeam} checked in today
                </p>
              </div>
            </div>
            <Link href="/more/attendance">
              <Button variant="ghost" size="sm">
                View <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {stats.totalTeam > 0 && (
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${(stats.teamCheckedIn / stats.totalTeam) * 100}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/leads/new">
            <Card className="hover:shadow-md transition-all cursor-pointer border-0 shadow-sm hover:scale-[1.02] py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Add Lead</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/leads">
            <Card className="hover:shadow-md transition-all cursor-pointer border-0 shadow-sm hover:scale-[1.02] py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/50 flex items-center justify-center text-green-600">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Call Leads</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/followups">
            <Card className="hover:shadow-md transition-all cursor-pointer border-0 shadow-sm hover:scale-[1.02] py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Follow-ups</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/properties/new">
            <Card className="hover:shadow-md transition-all cursor-pointer border-0 shadow-sm hover:scale-[1.02] py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Add Property</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Recent Activity
        </h3>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0 divide-y divide-border">
            {recentActivities.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-4">
                  <span className="text-lg mt-0.5">
                    {activityIcons[activity.type] || "📌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {activity.profiles?.full_name && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {activity.profiles.full_name}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
