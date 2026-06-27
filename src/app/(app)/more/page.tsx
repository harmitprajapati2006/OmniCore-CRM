import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import {
  Clock, CalendarRange, Users, Settings, Plug, BarChart3,
  Bell, ChevronRight
} from "lucide-react";

const menuItems = [
  { href: "/more/attendance", label: "Attendance", description: "Check-in/out & team attendance", icon: Clock, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" },
  { href: "/more/social", label: "Social Media", description: "Content calendar & posts", icon: CalendarRange, color: "bg-pink-50 text-pink-600 dark:bg-pink-950/50" },
  { href: "/more/team", label: "Team", description: "Manage members & roles", icon: Users, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50" },
  { href: "/more/reports", label: "Reports", description: "Business performance", icon: BarChart3, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50" },
  { href: "/more/notifications", label: "Notifications", description: "Alerts & updates", icon: Bell, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50" },
  { href: "/more/integrations", label: "Integrations", description: "Twilio, WhatsApp, Email", icon: Plug, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50" },
  { href: "/more/settings", label: "Settings", description: "App preferences", icon: Settings, color: "bg-gray-50 text-gray-600 dark:bg-gray-950/50" },
];

export default function MorePage() {
  return (
    <div className="animate-slide-up">
      <PageHeader title="More" />
      <div className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99] mb-1 py-0">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
