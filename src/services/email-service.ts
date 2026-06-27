/**
 * Email Service Adapter
 * Handles email sending via Resend or SMTP with dry-run mode.
 */

interface SendEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
  dryRun: boolean;
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

const isDryRun = () => process.env.DRY_RUN_EMAILS === 'true' || !process.env.RESEND_API_KEY;

/**
 * Send an email via Resend
 */
export async function sendEmail(params: EmailParams): Promise<SendEmailResult> {
  const { to, subject, html, from, replyTo } = params;

  if (isDryRun()) {
    console.log(`[DRY RUN] Email:`);
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body length: ${html.length} chars`);
    
    return {
      success: true,
      emailId: `EMAIL_dry_${Date.now()}`,
      dryRun: true,
    };
  }

  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'EstateFlow CRM <noreply@estateflow.com>',
      to: [to],
      subject,
      html,
      reply_to: replyTo,
    });

    if (error) {
      return { success: false, error: error.message, dryRun: false };
    }

    return { success: true, emailId: data?.id, dryRun: false };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      dryRun: false,
    };
  }
}

/**
 * Generate property details email HTML
 */
export function generatePropertyEmailHtml(
  leadName: string,
  propertyTitle: string,
  location: string,
  price: string,
  description: string,
  shareLink: string,
  imageUrls: string[]
): string {
  const images = imageUrls
    .slice(0, 3)
    .map(url => `<img src="${url}" alt="${propertyTitle}" style="width:100%;max-width:400px;border-radius:8px;margin:8px 0;" />`)
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#1a1a1a;">Property Details for You</h2>
      <p>Hi ${leadName},</p>
      <p>Here are the details of a property we think you'll love:</p>
      <div style="background:#f8f9fa;padding:16px;border-radius:12px;margin:16px 0;">
        <h3 style="color:#2563eb;margin:0 0 8px;">${propertyTitle}</h3>
        <p style="color:#666;margin:4px 0;">📍 ${location}</p>
        <p style="color:#666;margin:4px 0;">💰 ${price}</p>
        <p style="margin:12px 0;">${description || ''}</p>
        ${images}
      </div>
      <a href="${shareLink}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
        View Full Details
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px;">
        Sent via EstateFlow CRM
      </p>
    </div>
  `;
}

export const emailService = {
  sendEmail,
  generatePropertyEmailHtml,
  isDryRun,
};

export default emailService;
