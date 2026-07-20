// Obech Flow Logistics transactional email Edge Function.
import nodemailer from "npm:nodemailer@^6.9.14";

const SMTP_APP_PASSWORD =
  Deno.env.get("SMTP_APP_PASSWORD") ||
  Deno.env.get("GMAIL_APP_PASSWORD") ||
  Deno.env.get("GMAIL_CLIENT_SECRET") ||
  "";

const SENDER_EMAIL =
  Deno.env.get("SENDER_EMAIL") || "obechlogistics@gmail.com";
const SUPPORT_EMAIL =
  Deno.env.get("SUPPORT_EMAIL") || "info@obechlogistics.com";
const INQUIRY_EMAIL =
  Deno.env.get("INQUIRY_EMAIL") || "info@obechlogistics.com";

const COMPANY_NAME = "Obech Global Logistics";
const ADMIN_NOTIFICATION_EMAILS = [
  "obechlogistics@gmail.com",
  "optiflowafrica@gmail.com",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isEmail = (value: unknown) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const uniqueEmails = (emails: string[]) =>
  [...new Set(emails.map((email) => email.trim()).filter(Boolean))];

const page = (content: string) => `
  <div style="font-family:Arial,sans-serif;color:#0f172a;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
    <div style="background:#0f172a;padding:20px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">${COMPANY_NAME}</h1>
    </div>
    <div style="padding:30px">${content}</div>
    <div style="background:#f8fafc;padding:15px;text-align:center;font-size:12px;color:#64748b">
      Questions? Reply to this email or contact ${escapeHtml(SUPPORT_EMAIL)}.
    </div>
  </div>
`;

const getTransporter = () => {
  if (!isEmail(SENDER_EMAIL) || !SMTP_APP_PASSWORD) {
    throw new Error("Email sender configuration is incomplete. Check SENDER_EMAIL and SMTP_APP_PASSWORD / GMAIL_APP_PASSWORD in Supabase Secrets.");
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: SENDER_EMAIL,
      pass: SMTP_APP_PASSWORD,
    },
  });
};

const sendEmail = async ({
  to,
  replyTo,
  subject,
  text,
  html,
}: {
  to: string | string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}) => {
  const transporter = getTransporter();
  return await transporter.sendMail({
    from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
    to,
    replyTo,
    subject,
    text,
    html,
  });
};

const trackingButton = (trackingId: unknown) => {
  const safeId = escapeHtml(trackingId);
  const url = `https://obechlogistics.com/track?id=${encodeURIComponent(
    String(trackingId ?? ""),
  )}`;

  return `
    <p style="margin-top:24px">
      <a href="${url}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 20px;border-radius:4px;font-weight:bold">
        Track ${safeId}
      </a>
    </p>
  `;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = await req.json();

    // --- CASE 1: Contact Form Inquiry ---
    if (payload?.type === "INQUIRY") {
      const name = String(payload.name || "").trim();
      const email = String(payload.email || "").trim();
      const phone = String(payload.phone || "").trim();
      const message = String(payload.message || "").trim();

      if (!name || !isEmail(email) || !message) {
        return jsonResponse(
          { error: "Name, a valid email, and message are required" },
          400,
        );
      }

      const recipients = uniqueEmails([
        INQUIRY_EMAIL,
        ...ADMIN_NOTIFICATION_EMAILS,
      ]);
      const subject = `New Inquiry from ${name} | Obech Flow`;
      const html = page(`
        <h2 style="margin-top:0">New Customer Inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "N/A")}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;background:#f8fafc;padding:15px;border-radius:4px;border:1px solid #e2e8f0">${escapeHtml(
          message,
        )}</p>
      `);

      await sendEmail({
        to: recipients,
        replyTo: email,
        subject,
        text: `New inquiry from ${name} (${email}, ${phone || "no phone"}):\n\n${message}`,
        html,
      });

      return jsonResponse({ message: "Inquiry email sent successfully" });
    }

    // --- CASE 2: Quote Requests or New Orders (INSERT / QUOTE) ---
    const record = payload?.record || payload;
    const oldRecord = payload?.old_record;

    if (!record || typeof record !== "object") {
      return jsonResponse({ error: "A payload record or quotation details are required" }, 400);
    }

    if (
      payload.type === "UPDATE" &&
      oldRecord?.status === record.status
    ) {
      return jsonResponse({ message: "Status unchanged" });
    }

    const trackingId = String(record.tracking_id || record.id || "").trim();
    const clientName = String(record.client_name || record.fullName || "Valued Customer").trim();
    const clientEmail = String(record.client_email || record.email || "").trim();
    const clientPhone = String(record.client_phone || record.phone || "N/A").trim();
    const origin = String(record.sender_address || record.originCountry || "N/A").trim();
    const destination = String(record.receiver_address || record.destinationCountry || "N/A").trim();
    const serviceType = String(record.service_type || record.freightType || "Air Freight").trim();
    const weight = String(record.weight_kg || record.weight || record.estimatedWeight || "N/A").trim();
    const notes = String(record.special_instructions || record.additionalMessage || "None").trim();

    // Check for NEW QUOTE or INSERT
    if (payload.type === "QUOTE" || payload.type === "INSERT") {
      const adminSubject = `New Quote/Booking Request Received | ${trackingId || "Obech"}`;
      const adminHtml = page(`
        <h2 style="margin-top:0">New Quote / Order Booking</h2>
        <p>A new shipping quotation has been requested on the website.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:7px 0;font-weight:bold">Tracking ID:</td><td>${escapeHtml(trackingId)}</td></tr>
          <tr><td style="padding:7px 0;font-weight:bold">Client Name:</td><td>${escapeHtml(clientName)}</td></tr>
          <tr><td style="padding:7px 0;font-weight:bold">Client Email:</td><td>${escapeHtml(clientEmail)}</td></tr>
          <tr><td style="padding:7px 0;font-weight:bold">Client Phone:</td><td>${escapeHtml(clientPhone)}</td></tr>
          <tr><td style="padding:7px 0;font-weight:bold">Service Type:</td><td>${escapeHtml(serviceType)}</td></tr>
          <tr><td style="padding:7px 0;font-weight:bold">Origin:</td><td>${escapeHtml(origin)}</td></tr>
          <tr><td style="padding:7px 0;font-weight:bold">Destination:</td><td>${escapeHtml(destination)}</td></tr>
          <tr><td style="padding:7px 0;font-weight:bold">Est. Weight:</td><td>${escapeHtml(weight !== "N/A" ? `${weight} kg` : "N/A")}</td></tr>
          <tr><td style="padding:7px 0;font-weight:bold">Notes / Specs:</td><td>${escapeHtml(notes)}</td></tr>
        </table>
        <p style="margin-top:24px"><a href="https://obechlogistics.com/admin/bookings" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 20px;border-radius:4px;font-weight:bold">Open Admin Dashboard</a></p>
      `);

      await sendEmail({
        to: ADMIN_NOTIFICATION_EMAILS,
        replyTo: isEmail(clientEmail) ? clientEmail : SUPPORT_EMAIL,
        subject: adminSubject,
        text: `New quote request ${trackingId} from ${clientName} (${clientEmail}, ${clientPhone}). Origin: ${origin}, Destination: ${destination}.`,
        html: adminHtml,
      });

      // Send Customer Confirmation if email provided
      if (isEmail(clientEmail)) {
        const customerSubject = `Your Quote Request Received | ${trackingId || "Obech"}`;
        const customerHtml = page(`
          <p>Hi ${escapeHtml(clientName)},</p>
          <p>Thank you for requesting a freight quote with ${COMPANY_NAME}. We received your inquiry for <strong>${escapeHtml(serviceType)}</strong> shipment (${escapeHtml(origin)} → ${escapeHtml(destination)}).</p>
          <p>Your reference tracking ID is <strong>${escapeHtml(trackingId)}</strong>.</p>
          <p>Our international logistics operations team is reviewing your specs and will email you a custom shipping rate quote shortly.</p>
          ${trackingButton(trackingId)}
        `);

        await sendEmail({
          to: clientEmail,
          replyTo: SUPPORT_EMAIL,
          subject: customerSubject,
          text: `Hi ${clientName}, we received your quote request for tracking ID ${trackingId}. Our team will contact you shortly.`,
          html: customerHtml,
        });
      }

      return jsonResponse({
        message: "Quote/Booking notification emails sent successfully",
      });
    }

    if (payload.type !== "UPDATE") {
      return jsonResponse({ message: `No email required for ${payload.type}` });
    }

    if (!isEmail(clientEmail)) {
      return jsonResponse(
        { error: "Status update requires a valid client email" },
        400,
      );
    }

    const messages: Record<string, { subject: string; message: string }> = {
      confirmed: {
        subject: `Your booking is confirmed | ${trackingId}`,
        message: `Your shipment with tracking ID ${trackingId} has been confirmed.`,
      },
      picked_up: {
        subject: `Your package has been picked up | ${trackingId}`,
        message: `Your package with tracking ID ${trackingId} has been picked up.`,
      },
      in_transit: {
        subject: `Your shipment is on its way | ${trackingId}`,
        message: `Your shipment with tracking ID ${trackingId} is currently in transit.`,
      },
      out_for_delivery: {
        subject: `Out for delivery | ${trackingId}`,
        message: `Your shipment with tracking ID ${trackingId} is out for delivery.`,
      },
      delivered: {
        subject: `Delivered successfully | ${trackingId}`,
        message: `Your shipment with tracking ID ${trackingId} has been delivered successfully. Thank you for choosing ${COMPANY_NAME}.`,
      },
      failed: {
        subject: `Delivery attempt unsuccessful | ${trackingId}`,
        message: `The delivery attempt for shipment ${trackingId} was unsuccessful. Please contact us for assistance.`,
      },
    };

    const notification = messages[String(record.status || "").toLowerCase()];
    if (!notification) {
      return jsonResponse({
        message: `No email required for status: ${record.status}`,
      });
    }

    const html = page(`
      <p>Hi ${escapeHtml(clientName)},</p>
      <p>${escapeHtml(notification.message)}</p>
      ${trackingButton(trackingId)}
    `);

    await sendEmail({
      to: clientEmail,
      replyTo: SUPPORT_EMAIL,
      subject: notification.subject,
      text: `Hi ${clientName}, ${notification.message}`,
      html,
    });

    return jsonResponse({ message: "Status update email sent successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error sending email:", message);
    return jsonResponse({ error: message }, 500);
  }
});
