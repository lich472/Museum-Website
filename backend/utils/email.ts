import { Resend } from "resend";

/*
 * The client is deliberately NOT created here, at module load.
 *
 * `new Resend(undefined)` throws "Missing API key" immediately, and because
 * booking.controller.ts imports this module, that error stopped the whole API
 * from starting whenever RESEND_API_KEY was unset — a mail integration turning
 * into a hard startup requirement. The client is created inside
 * sendBookingEmail instead, which is only called after a booking has been saved
 * and which its caller already wraps in .catch(). So a missing key now means
 * "the confirmation email is logged as failed and not sent", not "the museum
 * has no website".
 */

const money = (cents: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(cents / 100);

const LABELS: Record<string, string> = {
  adult: "Adult",
  child: "Child",
  concession: "Concession",
  infant: "Child (0-3 years)",
};

const PRICES: Record<string, number> = { adult: 2000, child: 1000, concession: 1500, infant: 0 };

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export async function sendBookingEmail(booking: any) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const rows = Object.entries(booking.quantities as Record<string, number>)
    .filter(([, qty]) => qty > 0)
    .map(
      ([type, qty]) =>
        `<tr><td>${qty} × ${LABELS[type]}</td><td style="text-align:right">${money(PRICES[type] * qty)}</td></tr>`
    )
    .join("");

  const date = new Date(`${booking.date}T12:00:00`).toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const { error } = await resend.emails.send({
    from: `South Australia Regional Museum <${process.env.EMAIL_FROM}>`,
    to: booking.details.email,
    subject: `Your museum booking ${booking.reference}`,
    html: `
      <h1>Your booking is confirmed</h1>
      <p>Hi ${escapeHtml(booking.details.firstName)}, thanks for booking your visit.</p>
      <p><strong>Booking reference:</strong> ${booking.reference}</p>
      <p><strong>Visit date:</strong> ${date}</p>
      <table width="100%" cellpadding="6">${rows}
        <tr><td><strong>Total (AUD)</strong></td><td style="text-align:right"><strong>${money(booking.totalCents)}</strong></td></tr>
      </table>
      <p>This is a booking summary, not an admission ticket. Please arrive together.</p>
    `,
  });

  if (error) throw new Error(error.message);
}