import { WorkerEnv } from '../types';

export interface TemplateVariables {
  customer_name?: string;
  company_name?: string;
  product_name?: string;
  invite_url?: string;
  order_id?: string;
  [key: string]: string | undefined;
}

/**
 * Replaces {{variable_name}} tokens in a template string with actual values.
 * Gracefully handles missing variables with sensible fallbacks.
 */
export function interpolateTemplate(template: string, variables: TemplateVariables): string {
  if (!template) return '';

  return template.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_match, token) => {
    const key = token.toLowerCase();
    if (variables[key] !== undefined && variables[key] !== null) {
      return variables[key]!;
    }
    // Fallbacks for known tokens
    if (key === 'customer_name') return 'there';
    if (key === 'company_name') return 'our team';
    if (key === 'product_name') return 'your recent purchase';
    if (key === 'invite_url') return variables.invite_url || '#';
    return '';
  });
}

/**
 * Dispatches an automated review invite email via Resend API (or safe mock simulation in test/sandbox).
 */
export async function dispatchEmailInvite(
  env: WorkerEnv,
  params: {
    to: string;
    subject: string;
    textBody: string;
    ctaUrl: string;
    ctaText?: string;
    senderName?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, subject, textBody, ctaUrl, ctaText = 'Share Your Feedback', senderName = 'Panda Praise' } = params;

  if (!to || !to.includes('@')) {
    return { success: false, error: 'Invalid recipient email' };
  }

  // If Resend API Key is configured, make real API call
  if (env.RESEND_API_KEY) {
    try {
      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; color: #1e293b; line-height: 1.6;">
          <div style="margin-bottom: 24px; font-weight: 700; font-size: 18px; color: #0f172a;">
            🐼 ${senderName}
          </div>
          <div style="font-size: 15px; margin-bottom: 28px; white-space: pre-wrap;">
            ${textBody.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>
          <div style="margin-bottom: 32px;">
            <a href="${ctaUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
              ${ctaText} &rarr;
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Automated review request powered by <a href="https://pandapraise.com" style="color: #64748b; text-decoration: underline;">Panda Praise</a>.
          </p>
        </div>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${senderName} <invites@pandapraise.com>`,
          to: [to],
          subject: subject || 'How was your recent experience?',
          text: textBody,
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Resend API error: ${errorText}` };
      }

      const resData = (await response.json()) as any;
      return { success: true, messageId: resData.id || `resend_${Date.now()}` };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to dispatch email' };
    }
  }

  // Sandbox simulation mode (when no Resend API key is present)
  return {
    success: true,
    messageId: `sim_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
}

/**
 * Dispatches a WhatsApp review invite message via Twilio API (or safe mock simulation in test/sandbox).
 */
export async function dispatchWhatsAppInvite(
  env: WorkerEnv,
  params: {
    to: string;
    message: string;
    ctaUrl: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, message, ctaUrl } = params;

  if (!to) {
    return { success: false, error: 'Recipient phone number is required' };
  }

  const fullMessage = `${message}\n\n👉 ${ctaUrl}`;

  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_NUMBER) {
    try {
      const fromNumber = env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
        ? env.TWILIO_WHATSAPP_NUMBER
        : `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`;
      const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      const basicAuth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
      const bodyParams = new URLSearchParams();
      bodyParams.set('From', fromNumber);
      bodyParams.set('To', toNumber);
      bodyParams.set('Body', fullMessage);

      const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Twilio API error: ${errorText}` };
      }

      const data = (await response.json()) as any;
      return { success: true, messageId: data.sid || `twilio_${Date.now()}` };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to dispatch WhatsApp message' };
    }
  }

  // Sandbox simulation mode
  return {
    success: true,
    messageId: `sim_wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
}
