import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { leadWebhookSchema } from "@/lib/validations/lead";
import { leadAssignmentService } from "@/services/lead-assignment";
import { callService } from "@/services/call-service";

/**
 * POST /api/webhooks/leads
 * Accept leads from external platforms (36 Acre, Zapier, Make, Facebook, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Optional webhook secret validation
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = request.headers.get("authorization");
      const providedSecret = authHeader?.replace("Bearer ", "");
      if (providedSecret !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    
    // Validate payload
    const parsed = leadWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // Map source string to enum
    const sourceMap: Record<string, string> = {
      "36 acre": "36_acre", "36acre": "36_acre",
      "magicbricks": "magicbricks", "magic bricks": "magicbricks",
      "housing": "housing", "housing.com": "housing",
      "facebook": "facebook", "facebook ads": "facebook",
      "instagram": "instagram", "instagram ads": "instagram",
      "website": "website", "referral": "referral",
    };

    const source = sourceMap[data.source?.toLowerCase() || ""] || "other";

    // Property type map
    const typeMap: Record<string, string> = {
      "apartment": "apartment", "flat": "apartment",
      "villa": "villa", "house": "villa",
      "plot": "plot", "land": "plot",
      "commercial": "commercial", "office": "commercial",
      "rental": "rental", "rent": "rental",
    };

    const propertyType = typeMap[data.propertyType?.toLowerCase() || ""] || null;

    // Get the first organization (for webhook leads)
    // In production, you'd use the webhook secret to identify the org
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id")
      .limit(1);

    if (!orgs?.length) {
      return NextResponse.json({ error: "No organization found" }, { status: 500 });
    }

    const organizationId = orgs[0].id;

    // Assign agent via round-robin
    const assignment = await leadAssignmentService.assignLead(organizationId, "round_robin");

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        organization_id: organizationId,
        full_name: data.fullName,
        phone: data.phone,
        email: data.email || null,
        source,
        property_type: propertyType,
        budget_min: data.budgetMin || null,
        budget_max: data.budgetMax || null,
        preferred_location: data.preferredLocation || null,
        notes: data.notes || null,
        status: "new",
        temperature: "warm",
        assigned_agent_id: assignment.agent?.id || null,
      })
      .select()
      .single();

    if (leadError) {
      console.error("Lead creation error:", leadError);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    // Create activity log
    await supabase.from("activities").insert({
      organization_id: organizationId,
      lead_id: lead.id,
      user_id: assignment.agent?.id || null,
      type: "lead_created",
      title: `New lead from webhook: ${data.fullName}`,
      description: `Source: ${data.source || "webhook"}, Phone: ${data.phone}`,
    });

    // Create assignment activity
    if (assignment.agent) {
      await supabase.from("activities").insert({
        organization_id: organizationId,
        lead_id: lead.id,
        user_id: assignment.agent.id,
        type: "lead_assigned",
        title: `Lead assigned to ${assignment.agent.full_name}`,
      });

      // Create notification for agent
      await supabase.from("notifications").insert({
        organization_id: organizationId,
        user_id: assignment.agent.id,
        type: "lead_assigned",
        title: "New lead assigned",
        body: `${data.fullName} from ${data.source || "webhook"} - ${data.phone}`,
        link: `/leads/${lead.id}`,
      });

      // Trigger bridge call automation
      if (assignment.agent.phone) {
        const callResult = await callService.initiateBridgeCall(
          lead,
          assignment.agent,
          organizationId
        );

        if (callResult.success) {
          // Log the call
          await supabase.from("calls").insert({
            organization_id: organizationId,
            lead_id: lead.id,
            agent_id: assignment.agent.id,
            call_sid: callResult.callSid,
            conference_sid: callResult.conferenceSid,
            status: callResult.dryRun ? "dry_run" : "initiated",
            is_bridge_call: true,
            outcome: "pending",
          });

          await supabase.from("activities").insert({
            organization_id: organizationId,
            lead_id: lead.id,
            user_id: assignment.agent.id,
            type: "call_made",
            title: callResult.dryRun
              ? `[DRY RUN] Bridge call initiated to ${assignment.agent.full_name}`
              : `Bridge call initiated to ${assignment.agent.full_name}`,
          });
        } else {
          // Bridge call failed - create follow-up task
          await supabase.from("followups").insert({
            organization_id: organizationId,
            lead_id: lead.id,
            assigned_to: assignment.agent.id,
            created_by: assignment.agent.id,
            type: "call",
            title: `Call ${data.fullName}`,
            notes: `Auto-generated: Bridge call failed. Error: ${callResult.error}`,
            scheduled_at: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      assigned_agent: assignment.agent?.full_name || null,
      message: "Lead created successfully",
    }, { status: 201 });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
