/**
 * Message Utilities
 * Client-safe string utilities for generating messages and links.
 */

/**
 * Generate a WhatsApp deep link (works without API keys)
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Generate a property share message from template
 */
export function generatePropertyShareMessage(
  leadName: string,
  propertyTitle: string,
  location: string,
  price: string,
  shareLink: string
): string {
  return `Hi ${leadName}, sharing details of ${propertyTitle} in ${location}. Price: ${price}. Photos and details: ${shareLink}`;
}

/**
 * Follow-up message templates
 */
export const FOLLOWUP_TEMPLATES = [
  {
    name: 'check_review',
    label: 'Check if reviewed',
    template: 'Hi {{leadName}}, just checking if you had a chance to review the property details I shared.',
  },
  {
    name: 'quick_call',
    label: 'Request quick call',
    template: 'Hi {{leadName}}, are you available for a quick call today to discuss properties in {{preferredLocation}}?',
  },
  {
    name: 'new_options',
    label: 'New options available',
    template: 'Hi {{leadName}}, we have a few new options matching your budget. Should I share them?',
  },
  {
    name: 'site_visit',
    label: 'Schedule site visit',
    template: 'Hi {{leadName}}, would you like to schedule a site visit this weekend? We have some excellent options in {{preferredLocation}}.',
  },
  {
    name: 'price_update',
    label: 'Price update',
    template: 'Hi {{leadName}}, great news! There is a special price offer on properties you were interested in. Would you like to know more?',
  },
];

/**
 * Replace template variables
 */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return result;
}

export const messageUtils = {
  generateWhatsAppLink,
  generatePropertyShareMessage,
  fillTemplate,
  FOLLOWUP_TEMPLATES,
};
