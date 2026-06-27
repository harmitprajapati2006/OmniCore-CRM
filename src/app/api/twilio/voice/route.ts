import { NextRequest, NextResponse } from "next/server";
import { callService } from "@/services/call-service";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/twilio/voice
 * Handles Twilio voice callbacks (TwiML responses)
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "agent-announce": {
        const leadName = url.searchParams.get("leadName") || "Unknown";
        const source = url.searchParams.get("source") || "webhook";
        const conference = url.searchParams.get("conference") || "";

        const twiml = callService.generateAgentAnnounceTwiML(leadName, source, conference);
        return new NextResponse(twiml, {
          headers: { "Content-Type": "text/xml" },
        });
      }

      case "agent-confirmed": {
        const conference = url.searchParams.get("conference") || "";
        
        // Agent confirmed - join them to conference and call the lead
        const twiml = callService.generateConferenceJoinTwiML(conference);
        
        // TODO: In production, also trigger the call to the lead here
        // using the conference name to bridge them
        
        return new NextResponse(twiml, {
          headers: { "Content-Type": "text/xml" },
        });
      }

      case "connect": {
        const agentPhone = url.searchParams.get("agentPhone") || "";
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${process.env.TWILIO_PHONE_NUMBER}">
    <Number>${agentPhone}</Number>
  </Dial>
</Response>`;
        return new NextResponse(twiml, {
          headers: { "Content-Type": "text/xml" },
        });
      }

      default:
        return new NextResponse(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Unknown action</Say></Response>`,
          { headers: { "Content-Type": "text/xml" } }
        );
    }
  } catch (error) {
    console.error("Twilio voice callback error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred</Say></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
