/**
 * Call Service Adapter
 * Handles Twilio Voice integration with dry-run mode for development.
 * 
 * Production: Places real calls via Twilio API
 * Dry-run: Simulates call flow with console logging
 */

import type { Lead, Profile, CallOutcome } from '@/types';

interface BridgeCallResult {
  success: boolean;
  callSid?: string;
  conferenceSid?: string;
  error?: string;
  dryRun: boolean;
}

interface CallResult {
  success: boolean;
  callSid?: string;
  error?: string;
  dryRun: boolean;
}

const isDryRun = () => process.env.DRY_RUN_CALLS === 'true' || !process.env.TWILIO_ACCOUNT_SID;

function getTwilioClient() {
  if (isDryRun()) return null;
  // Dynamic import to avoid issues when Twilio is not configured
  const twilio = require('twilio');
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Initiate a bridge call: 
 * 1. Call the agent first
 * 2. When agent answers, play announcement and get confirmation
 * 3. Call the lead and bridge both into a conference
 */
export async function initiateBridgeCall(
  lead: Lead,
  agent: Profile,
  organizationId: string
): Promise<BridgeCallResult> {
  if (isDryRun()) {
    console.log(`[DRY RUN] Bridge call initiated:`);
    console.log(`  Agent: ${agent.full_name} (${agent.phone})`);
    console.log(`  Lead: ${lead.full_name} (${lead.phone})`);
    console.log(`  Source: ${lead.source}`);
    
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const fakeSid = `CA_dry_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fakeConf = `CF_dry_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    console.log(`[DRY RUN] Call SID: ${fakeSid}`);
    console.log(`[DRY RUN] Conference SID: ${fakeConf}`);
    console.log(`[DRY RUN] Agent would receive call with message:`);
    console.log(`  "New real estate lead from ${lead.source}. Press any key to connect with ${lead.full_name}."`);
    
    return {
      success: true,
      callSid: fakeSid,
      conferenceSid: fakeConf,
      dryRun: true,
    };
  }

  try {
    const client = getTwilioClient();
    if (!client) throw new Error('Twilio client not available');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const conferenceName = `bridge_${lead.id}_${Date.now()}`;

    // Step 1: Call the agent first
    const agentCall = await client.calls.create({
      to: agent.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${appUrl}/api/twilio/voice?action=agent-announce&leadId=${lead.id}&leadName=${encodeURIComponent(lead.full_name)}&source=${encodeURIComponent(lead.source)}&conference=${encodeURIComponent(conferenceName)}`,
      statusCallback: `${appUrl}/api/twilio/status?type=bridge&leadId=${lead.id}&agentId=${agent.id}`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      timeout: 30,
    });

    return {
      success: true,
      callSid: agentCall.sid,
      conferenceSid: conferenceName,
      dryRun: false,
    };
  } catch (error) {
    console.error('Bridge call error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      dryRun: false,
    };
  }
}

/**
 * Place a direct call to a lead
 */
export async function placeCall(
  leadPhone: string,
  agentPhone: string,
  leadId: string,
  agentId: string
): Promise<CallResult> {
  if (isDryRun()) {
    console.log(`[DRY RUN] Direct call: ${agentPhone} → ${leadPhone}`);
    const fakeSid = `CA_dry_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return { success: true, callSid: fakeSid, dryRun: true };
  }

  try {
    const client = getTwilioClient();
    if (!client) throw new Error('Twilio client not available');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const call = await client.calls.create({
      to: leadPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${appUrl}/api/twilio/voice?action=connect&agentPhone=${encodeURIComponent(agentPhone)}`,
      statusCallback: `${appUrl}/api/twilio/status?type=direct&leadId=${leadId}&agentId=${agentId}`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    return { success: true, callSid: call.sid, dryRun: false };
  } catch (error) {
    console.error('Direct call error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      dryRun: false,
    };
  }
}

/**
 * Generate TwiML for agent announcement
 */
export function generateAgentAnnounceTwiML(
  leadName: string,
  source: string,
  conferenceName: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="${appUrl}/api/twilio/voice?action=agent-confirmed&conference=${encodeURIComponent(conferenceName)}" method="POST">
    <Say voice="alice">New real estate lead from ${source}. Press any key to connect with ${leadName}.</Say>
  </Gather>
  <Say voice="alice">No input received. Goodbye.</Say>
</Response>`;
}

/**
 * Generate TwiML to join a conference
 */
export function generateConferenceJoinTwiML(conferenceName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Conference startConferenceOnEnter="true" endConferenceOnExit="false" record="record-from-start">
      ${conferenceName}
    </Conference>
  </Dial>
</Response>`;
}

/**
 * Generate TwiML to call and connect the lead to the conference  
 */
export function generateCallLeadTwiML(leadPhone: string, conferenceName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${process.env.TWILIO_PHONE_NUMBER}">
    <Conference startConferenceOnEnter="true" endConferenceOnExit="true">
      ${conferenceName}
    </Conference>
  </Dial>
</Response>`;
}

export const callService = {
  initiateBridgeCall,
  placeCall,
  generateAgentAnnounceTwiML,
  generateConferenceJoinTwiML,
  generateCallLeadTwiML,
  isDryRun,
};

export default callService;
