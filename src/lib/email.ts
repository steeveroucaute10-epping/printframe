// src/lib/email.ts
/**
 * Email notification service
 * Supports:
 * - Order confirmation
 * - Order status updates
 * - Shipping notifications
 */

interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

// In production, integrate with:
// - Resend.com (recommended for Next.js)
// - SendGrid
// - AWS SES
// - Mailgun

export async function sendEmail(template: EmailTemplate): Promise<void> {
  // For now, log to console (production: integrate with email provider)
  console.log('📧 Sending email:', {
    to: template.to,
    subject: template.subject,
  })

  // Production integration example:
  // const res = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     from: 'PrintFrame <orders@printframe.com>',
  //     to: [template.to],
  //     subject: template.subject,
  //     html: template.html,
  //   }),
  // })
}

export async function sendOrderConfirmation(email: string, orderNumber: string, total: number) {
  const template: EmailTemplate = {
    to: email,
    subject: `PrintFrame Order Confirmation #${orderNumber}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
        <div style="background: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">PrintFrame</h1>
        </div>
        <div style="padding: 32px 24px; background: #f8fafc;">
          <h2 style="color: #0f172a;">Thank you for your order!</h2>
          <p style="color: #64748b;">Your order <strong>#${orderNumber}</strong> has been received.</p>
          <div style="background: white; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 8px 0; color: #0f172a;">
              <strong>Order Total:</strong> $${total.toFixed(2)}
            </p>
            <p style="color: #64748b; font-size: 14px;">
              We'll send you a shipping notification once your order is on its way.
            </p>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            Questions? Reply to this email or contact us at support@printframe.com
          </p>
        </div>
      </div>
    `,
  }

  await sendEmail(template)
}

export async function sendOrderStatusUpdate(
  email: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string
) {
  const statusMessages: Record<string, string> = {
    processing: 'Your order is being processed.',
    shipped: `Your order has been shipped!${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
    delivered: 'Your order has been delivered!',
  }

  const template: EmailTemplate = {
    to: email,
    subject: `PrintFrame Order Update - #${orderNumber}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
        <div style="background: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">PrintFrame</h1>
        </div>
        <div style="padding: 32px 24px; background: #f8fafc;">
          <h2 style="color: #0f172a;">Order Update</h2>
          <p style="color: #64748b;">Your order <strong>#${orderNumber}</strong> is now: ${status}</p>
          <p style="color: #64748b;">${statusMessages[status] || 'We have an update for your order.'}</p>
        </div>
      </div>
    `,
  }

  await sendEmail(template)
}
