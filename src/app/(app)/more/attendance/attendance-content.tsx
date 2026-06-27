"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { LogIn, LogOut, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { UserRole } from "@/types";

interface AttendanceContentProps {
  myAttendance: {
    id: string; check_in_time: string | null; check_out_time: string | null;
    check_in_latitude: number | null; check_in_longitude: number | null;
    notes: string | null; status: string;
  } | null;
  teamAttendance: Array<{
    id: string; check_in_time: string | null; check_out_time: string | null;
    status: string; notes: string | null;
    user?: { full_name: string; role: string } | null;
  }>;
  userId: string;
  organizationId: string;
  userRole: UserRole;
}

export function AttendanceContent({ myAttendance, teamAttendance, userId, organizationId, userRole }: AttendanceContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const isCheckedIn = !!myAttendance?.check_in_time;
  const isCheckedOut = !!myAttendance?.check_out_time;

  async function getLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function handleCheckIn() {
    setLoading(true);
    const loc = await getLocation();
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    // Determine status based on time (9 AM = on time, after = late)
    const hour = new Date().getHours();
    const status = hour >= 10 ? "late" : "present";

    const { error } = await supabase.from("attendance").insert({
      organization_id: organizationId,
      user_id: userId,
      date: today,
      check_in_time: now,
      check_in_latitude: loc?.lat || null,
      check_in_longitude: loc?.lng || null,
      status,
      notes: notes || null,
    });

    if (error) {
      if (error.code === "23505") {
        // Already checked in - update instead
        await supabase.from("attendance").update({
          check_in_time: now,
          check_in_latitude: loc?.lat || null,
          check_in_longitude: loc?.lng || null,
          status,
        }).eq("user_id", userId).eq("date", today);
      } else {
        toast.error("Failed to check in: " + error.message);
        setLoading(false);
        return;
      }
    }

    toast.success(`Checked in at ${format(new Date(), "hh:mm a")}${status === "late" ? " (Late)" : ""}`);
    setLoading(false);
    router.refresh();
  }

  async function handleCheckOut() {
    setLoading(true);
    const loc = await getLocation();
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    // Calculate hours
    let totalHours: number | null = null;
    if (myAttendance?.check_in_time) {
      const diff = new Date().getTime() - new Date(myAttendance.check_in_time).getTime();
      totalHours = Math.round((diff / 3600000) * 100) / 100;
    }

    await supabase.from("attendance").update({
      check_out_time: now,
      check_out_latitude: loc?.lat || null,
      check_out_longitude: loc?.lng || null,
      total_hours: totalHours,
      field_visit_notes: notes || null,
    }).eq("user_id", userId).eq("date", today);

    toast.success(`Checked out at ${format(new Date(), "hh:mm a")}`);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="animate-slide-up">
      <PageHeader title="Attendance" description={format(new Date(), "EEEE, dd MMMM yyyy")} />

      <div className="px-4 space-y-4">
        {/* Check-in/out Card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className={`h-2 ${isCheckedIn && !isCheckedOut ? "bg-green-500" : isCheckedOut ? "bg-blue-500" : "bg-muted"}`} />
          <CardContent className="p-6 text-center space-y-4">
            {isCheckedOut ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-blue-500 mx-auto" />
                <div>
                  <p className="text-lg font-bold">Day Complete</p>
                  <p className="text-sm text-muted-foreground">
                    {myAttendance?.check_in_time && format(new Date(myAttendance.check_in_time), "hh:mm a")} — {myAttendance?.check_out_time && format(new Date(myAttendance.check_out_time), "hh:mm a")}
                  </p>
                </div>
              </>
            ) : isCheckedIn ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse-subtle">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold">Currently Working</p>
                  <p className="text-sm text-muted-foreground">
                    Checked in at {myAttendance?.check_in_time && format(new Date(myAttendance.check_in_time), "hh:mm a")}
                  </p>
                </div>
                <Textarea placeholder="Field visit notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                <Button onClick={handleCheckOut} disabled={loading} className="w-full h-12 bg-red-500 hover:bg-red-600 text-base font-semibold">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 w-5 h-5" />}
                  Check Out
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <LogIn className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-bold">Ready to start?</p>
                  <p className="text-sm text-muted-foreground">Your location will be recorded</p>
                </div>
                <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                <Button onClick={handleCheckIn} disabled={loading} className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 w-5 h-5" />}
                  Check In
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Team Attendance */}
        {(userRole === "admin" || userRole === "sales_manager") && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Team Today ({teamAttendance.length} checked in)</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {teamAttendance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No one checked in yet</p>
              ) : (
                teamAttendance.map((att) => (
                  <div key={att.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{att.user?.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{att.user?.role?.replace("_", " ")}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={att.status === "late" ? "destructive" : "secondary"} className="text-[10px]">
                        {att.status === "late" ? "Late" : att.check_out_time ? "Done" : "Working"}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {att.check_in_time && format(new Date(att.check_in_time), "hh:mm a")}
                        {att.check_out_time && ` — ${format(new Date(att.check_out_time), "hh:mm a")}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
