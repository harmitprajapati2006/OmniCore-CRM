"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopBarProps {
  userName?: string;
  orgName?: string;
}

export function TopBar({ userName = "User", orgName = "EstateFlow" }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/leads")) return "Leads";
    if (pathname.startsWith("/properties")) return "Properties";
    if (pathname.startsWith("/followups")) return "Follow-ups";
    if (pathname.startsWith("/more/attendance")) return "Attendance";
    if (pathname.startsWith("/more/social")) return "Social Media";
    if (pathname.startsWith("/more/team")) return "Team";
    if (pathname.startsWith("/more/settings")) return "Settings";
    if (pathname.startsWith("/more/integrations")) return "Integrations";
    if (pathname.startsWith("/more/reports")) return "Reports";
    if (pathname.startsWith("/more/notifications")) return "Notifications";
    if (pathname.startsWith("/more")) return "More";
    return "EstateFlow";
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 md:mr-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden md:block text-sm font-semibold text-foreground">
              {orgName}
            </span>
          </Link>
          <h1 className="text-lg font-semibold md:hidden">{getPageTitle()}</h1>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/leads", label: "Leads" },
              { href: "/properties", label: "Properties" },
              { href: "/followups", label: "Follow-ups" },
              { href: "/more/attendance", label: "Attendance" },
              { href: "/more/social", label: "Social" },
              { href: "/more/reports", label: "Reports" },
              { href: "/more/team", label: "Team" },
            ].map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/more/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none rounded-full focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Avatar className="w-8 h-8 hover:opacity-80 transition-opacity">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{orgName}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/more/settings")} className="cursor-pointer">
                <User className="mr-2 w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
