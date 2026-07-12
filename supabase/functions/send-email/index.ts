import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID") || "";
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET") || "";
const GMAIL_REFRESH_TOKEN = Deno.env.get("GMAIL_REFRESH_TOKEN") || "";
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@obechlogistics.com";
const SUPPORT_EMAIL = Deno.env.get("SUPPORT_EMAIL") || "support@obechlogistics.com";
const COMPANY_NAME = "Obech Flow Logistics";
const ADMIN_NOTIFICATION_EMAIL = "optiflowafrica@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS options request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const client = new SmtpClient();
    const connectSmtp = async () => {
      await client.connectTLS({
        hostname: "smtp.gmail.com",
        port: 465,
        username: SENDER_EMAIL,
        password: GMAIL_CLIENT_SECRET, // App Password
      });
    };

    // --- CASE 1: Contact Form Inquiry (Direct Invocation) ---
    if (payload.type === "INQUIRY") {
      const { name, email, phone, message } = payload;
      const subject = `New Inquiry from ${name} | Obech Flow`;
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Customer Inquiry</h1>
          </div>
          <div style="padding: 30px;">
            <strong>Name:</strong> ${name}<br/>
            <strong>Email:</strong> ${email}<br/>
            <strong>Phone:</strong> ${phone || "N/A"}<br/><br/>
            <strong>Message:</strong><br/>
            <p style="white-space: pre-wrap; background-color: #f8fafc; padding: 15px; border-radius: 4px; border: 1px solid #e2e8f0;">${message}</p>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            This email was sent automatically from Obech Flow Contact Form.
          </div>
        </div>
      `;

      await connectSmtp();
      await client.send({
        from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
        to: ADMIN_NOTIFICATION_EMAIL,
        replyTo: email,
        subject: subject,
        content: "auto-generated",
        html: htmlBody,
      });
      await client.close();

      return new Response(JSON.stringify({ message: "Inquiry email sent successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // --- CASE 2: Database Webhook Trigger (Shipment Table) ---
    const record = payload.record;

    // Ignore status updates where the status did not change
    if (payload.type === "UPDATE" && payload.old_record.status === record.status) {
      return new Response(JSON.stringify({ message: "Status unchanged" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const status = record.status;
    let subject = "";
    let body = "";

    // 2a. Handle INSERT (New Booking Notification)
    if (payload.type === "INSERT") {
      // 1. Send Notification to Admin (optiflowafrica@gmail.com)
      const adminSubject = `New Booking Request Received | ${record.tracking_id}`;
      const adminBody = `
        <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Booking Request</h1>
          </div>
          <div style="padding: 30px;">
            <p>A new order booking has been placed on the site.</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 150px;">Tracking ID:</td><td>${record.tracking_id}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Client Name:</td><td>${record.client_name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Client Email:</td><td>${record.client_email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Client Phone:</td><td>${record.client_phone || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Pickup Address:</td><td>${record.sender_address}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Delivery Address:</td><td>${record.receiver_address}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Package Type:</td><td>${record.package_type || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Weight:</td><td>${record.weight_kg ? record.weight_kg + ' kg' : 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Vehicle Type:</td><td>${record.delivery_type || 'N/A'}</td></tr>
            </table>
            <br/>
            <a href="https://obechlogistics.com/admin" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold;">Open Admin Dashboard</a>
          </div>
        </div>
      `;

      await connectSmtp();
      await client.send({
        from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
        to: ADMIN_NOTIFICATION_EMAIL,
        replyTo: record.client_email,
        subject: adminSubject,
        content: "auto-generated",
        html: adminBody,
      });

      // 2. Send Booking Confirmation to the Customer
      const customerSubject = `Your Booking Request Received | ${record.tracking_id}`;
      const customerBody = `
        <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${COMPANY_NAME}</h1>
          </div>
          <div style="padding: 30px;">
            Hi ${record.client_name},<br/><br/>
            Thank you for booking with us. We have received your request for tracking ID <strong>${record.tracking_id}</strong>.<br/>
            Our logistics operations team is currently reviewing your shipment details and will contact you shortly to confirm the pricing, scheduling, and driver assignment.<br/><br/>
            <a href="https://obechlogistics.com/track?id=${record.tracking_id}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold;">Track Shipment</a>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            If you have any questions, please reply to this email or contact ${SUPPORT_EMAIL}.
          </div>
        </div>
      `;

      await client.send({
        from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
        to: record.client_email,
        replyTo: SUPPORT_EMAIL,
        subject: customerSubject,
        content: "auto-generated",
        html: customerBody,
      });

      await client.close();

      return new Response(JSON.stringify({ message: "Order notification emails sent successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2b. Handle UPDATE (Status Changes notifications to customer)
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
        return new Response(JSON.stringify({ message: "No email required for status: " + status }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    await connectSmtp();
    await client.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
      to: record.client_email,
      replyTo: SUPPORT_EMAIL,
      subject: subject,
      content: "auto-generated",
      html: htmlBody,
    });
    await client.close();

    return new Response(JSON.stringify({ message: "Status update email sent successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
