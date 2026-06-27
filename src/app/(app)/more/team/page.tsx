import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ROLE_LABELS } from "@/types";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: true });

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700", sales_manager: "bg-blue-100 text-blue-700",
    sales_agent: "bg-green-100 text-green-700", field_executive: "bg-purple-100 text-purple-700",
    social_media_manager: "bg-pink-100 text-pink-700",
  };

  return (
    <div className="animate-slide-up">
      <PageHeader title="Team" description={`${members?.length || 0} members`} />
      <div className="px-4 space-y-2">
        {members?.map((member) => {
          const initials = member.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
          return (
            <Card key={member.id} className="border-0 shadow-sm py-0">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="w-11 h-11">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{member.full_name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  {member.phone && <p className="text-xs text-muted-foreground">{member.phone}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`text-[10px] px-2 py-0.5 ${roleColors[member.role] || ""}`}>
                    {ROLE_LABELS[member.role as keyof typeof ROLE_LABELS]}
                  </Badge>
                  <Badge variant={member.is_active ? "secondary" : "destructive"} className="text-[10px]">
                    {member.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
