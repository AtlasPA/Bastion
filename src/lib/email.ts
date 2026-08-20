const FROM_RAW =
  process.env.EMAIL_FROM ?? "Bastion GameVault <login@bastiongamevault.com>";

function parseFrom(raw: string): { email: string; name?: string } {
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { email: raw.trim() };
}

/**
 * Sends an email through SendGrid. Without an API key (local dev) the
 * message is printed to the console instead. Errors are logged, never
 * thrown — email must not break checkout or fulfillment flows.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (recipients.length === 0) return;

  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[dev email] To: ${recipients.join(", ")} — ${subject}`);
    return;
  }

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: recipients.map((email) => ({ email })) }],
        from: parseFrom(FROM_RAW),
        subject,
        content: [{ type: "text/html", value: html }],
        tracking_settings: {
          click_tracking: { enable: false },
          open_tracking: { enable: false },
        },
      }),
    });
    if (!res.ok) {
      console.error(`SendGrid ${res.status}: ${await res.text()}`);
    }
  } catch (e) {
    console.error("SendGrid send failed:", e);
  }
}

const wrap = (body: string) => `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#23282f">
  <p style="font-size:20px;font-weight:bold;margin:0 0 4px">
    <span style="color:#c62f2f">BASTION</span> <span style="color:#2f9ac6">GAMEVAULT</span>
  </p>
  ${body}
  <p style="font-size:12px;color:#8a8f98;border-top:1px solid #e5e5e5;padding-top:12px;margin-top:24px">
    Bastion GameVault — bastiongamevault.com
  </p>
</div>`;

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

type OrderForEmail = {
  id: string;
  totalCents: number;
  shippingName: string | null;
  items: { titleSnapshot: string; priceCentsSnapshot: number; quantity: number }[];
};

function itemRows(order: OrderForEmail) {
  return order.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 0">${i.quantity > 1 ? `${i.quantity} × ` : ""}${i.titleSnapshot}</td><td style="text-align:right;padding:4px 0">${money(i.priceCentsSnapshot * i.quantity)}</td></tr>`
    )
    .join("");
}

export function orderConfirmationEmail(order: OrderForEmail) {
  return {
    subject: `Order confirmed — Bastion GameVault`,
    html: wrap(`
      <h2 style="margin:16px 0 8px">Thanks${order.shippingName ? `, ${order.shippingName.split(" ")[0]}` : ""}! Your order is confirmed.</h2>
      <p>We're packing it up now and will email you tracking as soon as it ships.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${itemRows(order)}
        <tr><td style="padding:8px 0;border-top:1px solid #e5e5e5;font-weight:bold">Total</td>
        <td style="text-align:right;padding:8px 0;border-top:1px solid #e5e5e5;font-weight:bold">${money(order.totalCents)}</td></tr>
      </table>`),
  };
}

export function newOrderAlertEmail(order: OrderForEmail & { email: string }) {
  return {
    subject: `💰 New order — ${money(order.totalCents)}`,
    html: wrap(`
      <h2 style="margin:16px 0 8px">New paid order</h2>
      <p>${order.email}${order.shippingName ? ` (${order.shippingName})` : ""}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${itemRows(order)}</table>
      <p><a href="https://bastiongamevault.com/admin/orders/${order.id}">Open in admin →</a></p>`),
  };
}

export function shippedEmail(
  order: OrderForEmail,
  carrier: string | null,
  tracking: string
) {
  return {
    subject: `Your order has shipped — Bastion GameVault`,
    html: wrap(`
      <h2 style="margin:16px 0 8px">It's on the way!</h2>
      <p>Your order shipped${carrier ? ` via ${carrier}` : ""}. Tracking number:</p>
      <p style="font-size:16px;font-weight:bold">${tracking}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${itemRows(order)}</table>`),
  };
}
