import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AttendanceContent } from "./attendance-content";

export default async function AttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // Get user's today attendance
  const { data: myAttendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  // Get team attendance (for admins/managers)
  const { data: teamAttendance } = await supabase
    .from("attendance")
    .select("*, user:profiles!attendance_user_id_fkey(full_name, role)")
    .eq("organization_id", profile.organization_id)
    .eq("date", today)
    .order("check_in_time", { ascending: true });

  return (
    <AttendanceContent
      myAttendance={myAttendance}
      teamAttendance={teamAttendance || []}
      userId={user.id}
      organizationId={profile.organization_id}
      userRole={profile.role}
    />
  );
}
