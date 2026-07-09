import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID") || "";
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET") || "";
const GMAIL_REFRESH_TOKEN = Deno.env.get("GMAIL_REFRESH_TOKEN") || "";
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@obechlogistics.com";
const SUPPORT_EMAIL = Deno.env.get("SUPPORT_EMAIL") || "support@obechlogistics.com";
const COMPANY_NAME = "Obech Flow Logistics";

// For simplicity, we assume an App Password or direct SMTP configuration 
// if OAuth is too complex to manage without a token refresh flow.
// If using App Passwords, GMAIL_CLIENT_SECRET could store the App Password.
// Here we just outline the structure of the edge function.

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;
    
    // We only care about updates where status changed, or new inserts
    if (payload.type === "UPDATE" && payload.old_record.status === record.status) {
      return new Response(JSON.stringify({ message: "Status unchanged" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const status = record.status;
    let subject = "";
    let body = "";

    switch (status) {
      case "confirmed":
        subject = `Your booking is confirmed | ${record.tracking_id}`;
        body = `Hi ${record.client_name},<br/><br/>Your shipment with tracking ID <strong>${record.tracking_id}</strong> has been confirmed.`;
        break;
      case "picked_up":
        subject = "Your package has been picked up";
        body = `Hi ${record.client_name},<br/><br/>Your package (Tracking: <strong>${record.tracking_id}</strong>) has been picked up and is on its way to the origin facility.`;
        break;
      case "in_transit":
        subject = "Your shipment is on its way";
        body = `Hi ${record.client_name},<br/><br/>Your shipment (Tracking: <strong>${record.tracking_id}</strong>) is currently in transit.`;
        break;
      case "out_for_delivery":
        subject = "Out for delivery today";
        body = `Hi ${record.client_name},<br/><br/>Good news! Your shipment (Tracking: <strong>${record.tracking_id}</strong>) is out for delivery today.`;
        break;
      case "delivered":
        subject = "Delivered successfully";
        body = `Hi ${record.client_name},<br/><br/>Your shipment (Tracking: <strong>${record.tracking_id}</strong>) has been successfully delivered. Thank you for choosing ${COMPANY_NAME}!`;
        break;
      case "failed":
        subject = "Delivery attempt unsuccessful";
        body = `Hi ${record.client_name},<br/><br/>We attempted to deliver your shipment (Tracking: <strong>${record.tracking_id}</strong>) but were unsuccessful. Please contact support.`;
        break;
      default:
        // No email for 'pending' or other unknown statuses
        return new Response(JSON.stringify({ message: "No email required" }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${COMPANY_NAME}</h1>
        </div>
        <div style="padding: 30px;">
          ${body}
          <br/><br/>
          <a href="https://obechlogistics.com/track?id=${record.tracking_id}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold;">Track Shipment</a>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          If you have any questions, please reply to this email or contact ${SUPPORT_EMAIL}.
        </div>
      </div>
    `;

    const client = new SmtpClient();

    // Use environment variables for SMTP connection
    // For Gmail SMTP: host: smtp.gmail.com, port: 465, secure
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: SENDER_EMAIL,
      password: GMAIL_CLIENT_SECRET, // Assuming App Password is used here for simplicity in this script
    });

    await client.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
      to: record.client_email,
      replyTo: SUPPORT_EMAIL,
      subject: subject,
      content: "auto-generated",
      html: htmlBody,
    });

    await client.close();

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
