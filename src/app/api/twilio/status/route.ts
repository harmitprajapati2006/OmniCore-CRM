import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/twilio/status
 * Handles Twilio call status callbacks
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // "bridge" or "direct"
    const leadId = url.searchParams.get("leadId");
    const agentId = url.searchParams.get("agentId");

    const formData = await request.formData();
    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as string;
    const callDuration = formData.get("CallDuration") as string;
    const recordingUrl = formData.get("RecordingUrl") as string;

    if (!callSid) {
      return NextResponse.json({ error: "Missing CallSid" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Update call record
    const updateData: Record<string, unknown> = {
      status: callStatus,
    };

    if (callDuration) updateData.duration = parseInt(callDuration);
    if (recordingUrl) updateData.recording_url = recordingUrl;

    if (callStatus === "completed" || callStatus === "no-answer" || callStatus === "busy" || callStatus === "failed") {
      updateData.ended_at = new Date().toISOString();

      // Map Twilio status to our outcome
      const outcomeMap: Record<string, string> = {
        completed: "connected",
        "no-answer": "no_answer",
        busy: "busy",
        failed: "no_answer",
        canceled: "no_answer",
      };
      updateData.outcome = outcomeMap[callStatus] || "pending";
    }

    await supabase
      .from("calls")
      .update(updateData)
      .eq("call_sid", callSid);

    // Update lead's last_contacted_at if call was completed
    if (callStatus === "completed" && leadId) {
      await supabase
        .from("leads")
        .update({ last_contacted_at: new Date().toISOString() })
        .eq("id", leadId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Twilio status callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
