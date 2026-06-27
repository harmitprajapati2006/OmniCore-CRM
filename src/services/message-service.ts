/**
 * Message Service Adapter
 * Handles WhatsApp and SMS messaging with dry-run mode.
 */
import { messageUtils } from "@/lib/message-utils";

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  dryRun: boolean;
}

interface MessageParams {
  to: string;
  body: string;
  channel: 'whatsapp' | 'sms';
  mediaUrls?: string[];
}

const isDryRun = () => process.env.DRY_RUN_MESSAGES === 'true' || !process.env.TWILIO_ACCOUNT_SID;

function getTwilioClient() {
  if (isDryRun()) return null;
  const twilio = require('twilio');
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Send a WhatsApp or SMS message
 */
export async function sendMessage(params: MessageParams): Promise<SendMessageResult> {
  const { to, body, channel, mediaUrls } = params;

  if (isDryRun()) {
    console.log(`[DRY RUN] ${channel.toUpperCase()} message:`);
    console.log(`  To: ${to}`);
    console.log(`  Body: ${body.substring(0, 100)}...`);
    if (mediaUrls?.length) {
      console.log(`  Media: ${mediaUrls.length} files`);
    }
    
    return {
      success: true,
      messageId: `MSG_dry_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      dryRun: true,
    };
  }

  try {
    const client = getTwilioClient();
    if (!client) throw new Error('Twilio client not available');

    const fromNumber = channel === 'whatsapp'
      ? `whatsapp:${process.env.WHATSAPP_SENDER_NUMBER || process.env.TWILIO_PHONE_NUMBER}`
      : process.env.TWILIO_PHONE_NUMBER;

    const toNumber = channel === 'whatsapp' ? `whatsapp:${to}` : to;

    const messageData: Record<string, unknown> = {
      from: fromNumber,
      to: toNumber,
      body,
    };

    if (mediaUrls?.length) {
      messageData.mediaUrl = mediaUrls;
    }

    const message = await client.messages.create(messageData);

    return {
      success: true,
      messageId: message.sid,
      dryRun: false,
    };
  } catch (error) {
    console.error('Message send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      dryRun: false,
    };
  }
}

export const messageService = {
  sendMessage,
  isDryRun,
  ...messageUtils,
};

export default messageService;
