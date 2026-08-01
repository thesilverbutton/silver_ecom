import { getResend } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { formatINR } from "@/lib/utils";

const FROM = process.env.EMAIL_FROM || "The Silver Button <enquiry@silverbutton.in>";

interface OrderEmailData {
  email: string;
  orderNumber: string;
  items: { title: string; quantity: number; lineTotal: number }[];
  grandTotal: number;
  shippingAddress: { fullName: string; line1: string; city: string; state: string; pincode: string };
}

/**
 * Send order confirmation email after payment.
 */
export async function sendOrderConfirmation(data: OrderEmailData) {
  try {
    const resend = getResend();

    const itemsHtml = data.items
      .map((item) => `<tr><td style="padding:8px 0;">${item.title} × ${item.quantity}</td><td style="padding:8px 0;text-align:right;">${formatINR(item.lineTotal)}</td></tr>`)
      .join("");

    await resend.emails.send({
      from: FROM,
      to: data.email,
      subject: `Order Confirmed — ${data.orderNumber}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="font-size:24px;font-weight:bold;margin-bottom:8px;">Thank you for your order!</h1>
          <p style="color:#6b7280;">Order <strong>${data.orderNumber}</strong> has been confirmed.</p>
          
          <table style="width:100%;border-collapse:collapse;margin:24px 0;">
            <thead><tr style="border-bottom:1px solid #e5e7eb;"><th style="text-align:left;padding:8px 0;">Item</th><th style="text-align:right;padding:8px 0;">Amount</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot><tr style="border-top:1px solid #e5e7eb;"><td style="padding:12px 0;font-weight:bold;">Total</td><td style="padding:12px 0;text-align:right;font-weight:bold;">${formatINR(data.grandTotal)}</td></tr></tfoot>
          </table>

          <p style="color:#6b7280;font-size:14px;"><strong>Shipping to:</strong><br/>
          ${data.shippingAddress.fullName}<br/>
          ${data.shippingAddress.line1}<br/>
          ${data.shippingAddress.city}, ${data.shippingAddress.state} — ${data.shippingAddress.pincode}</p>

          <p style="margin-top:24px;color:#6b7280;font-size:14px;">We'll notify you when your order ships. For questions, reply to this email.</p>
          <p style="margin-top:32px;font-size:12px;color:#9ca3af;">— The Silver Button</p>
        </div>
      `,
    });

    logger.info("Order confirmation email sent", { email: data.email, orderNumber: data.orderNumber });
  } catch (err) {
    logger.error("Failed to send confirmation email", { email: data.email, error: String(err) });
  }
}

/**
 * Send shipment notification email with tracking.
 */
export async function sendShipmentEmail(email: string, orderNumber: string, courierName?: string, awbCode?: string, trackingUrl?: string) {
  try {
    const resend = getResend();

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Your order ${orderNumber} has shipped!`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="font-size:24px;font-weight:bold;">Your order is on its way!</h1>
          <p style="color:#6b7280;">Order <strong>${orderNumber}</strong> has been shipped.</p>
          ${courierName ? `<p style="margin-top:16px;"><strong>Courier:</strong> ${courierName}</p>` : ""}
          ${awbCode ? `<p><strong>Tracking Number:</strong> ${awbCode}</p>` : ""}
          ${trackingUrl ? `<p style="margin-top:16px;"><a href="${trackingUrl}" style="color:#2C313A;font-weight:bold;">Track your order →</a></p>` : ""}
          <p style="margin-top:32px;font-size:12px;color:#9ca3af;">— The Silver Button</p>
        </div>
      `,
    });

    logger.info("Shipment email sent", { email, orderNumber });
  } catch (err) {
    logger.error("Failed to send shipment email", { email, error: String(err) });
  }
}

/**
 * Send cancellation/refund confirmation email.
 */
export async function sendCancellationEmail(email: string, orderNumber: string, reason: string) {
  try {
    const resend = getResend();

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Order ${orderNumber} cancelled`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="font-size:24px;font-weight:bold;">Order Cancelled</h1>
          <p style="color:#6b7280;">Your order <strong>${orderNumber}</strong> has been cancelled.</p>
          <p style="color:#6b7280;"><strong>Reason:</strong> ${reason}</p>
          <p style="margin-top:16px;color:#6b7280;">If a payment was made, a refund will be processed within 5–7 business days.</p>
          <p style="margin-top:32px;font-size:12px;color:#9ca3af;">— The Silver Button</p>
        </div>
      `,
    });

    logger.info("Cancellation email sent", { email, orderNumber });
  } catch (err) {
    logger.error("Failed to send cancellation email", { email, error: String(err) });
  }
}
