import { format } from "date-fns";

const COMPANY = {
  name: "Obech Flow Logistics",
  address: "21 Road, opposite I Close, Festac Town, Lagos",
  phone: "+2349066755440",
  email: "info@obechlogistics.com",
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const displayValue = (value) => escapeHtml(value || "—");

export const formatNaira = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

export const printBookingReceipt = (shipment) => {
  if (!shipment) return false;

  const receiptWindow = window.open("", "_blank", "width=900,height=900");
  if (!receiptWindow) return false;

  const total = Number(shipment.total_amount) || 0;
  const paid = Number(shipment.amount_paid) || 0;
  const balance = Math.max(total - paid, 0);
  const paymentStatus = (shipment.payment_status || "unpaid").toUpperCase();
  const route = shipment.routes
    ? `${shipment.routes.origin} to ${shipment.routes.destination}`
    : `${shipment.sender_address || "Pickup"} to ${shipment.receiver_address || "Delivery"}`;
  const createdAt = shipment.created_at
    ? format(new Date(shipment.created_at), "dd MMM yyyy, h:mm a")
    : format(new Date(), "dd MMM yyyy, h:mm a");
  const logoUrl = `${window.location.origin}/logo.png`;

  receiptWindow.document.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${displayValue(shipment.receipt_number || "Booking Receipt")}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 28px; color: #0a192f; font-family: Arial, sans-serif; background: #f4f6f8; }
      .receipt { width: 100%; max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #d9dee5; }
      .header { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 26px 30px; background: #0a192f; color: #fff; }
      .brand { display: flex; align-items: center; gap: 14px; }
      .brand img { width: 52px; height: 52px; object-fit: contain; background: #fff; border-radius: 8px; padding: 4px; }
      .brand h1 { margin: 0; font-size: 22px; }
      .brand p { margin: 5px 0 0; color: #b8c1cd; font-size: 12px; }
      .title { text-align: right; }
      .title strong { display: block; color: #d35400; font-size: 18px; text-transform: uppercase; }
      .title span { display: block; margin-top: 6px; font-family: monospace; font-size: 13px; }
      .content { padding: 28px 30px; }
      .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-bottom: 22px; border-bottom: 1px solid #e4e7eb; }
      .label { color: #687384; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      .value { margin-top: 5px; font-size: 13px; font-weight: 700; overflow-wrap: anywhere; }
      .section { margin-top: 24px; }
      .section h2 { margin: 0 0 12px; color: #d35400; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; }
      .route { padding: 14px; border: 1px solid #e4e7eb; border-radius: 8px; background: #f8fafc; font-size: 13px; line-height: 1.5; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { padding: 11px 10px; border-bottom: 1px solid #e4e7eb; font-size: 12px; text-align: left; }
      th { background: #f8fafc; color: #687384; text-transform: uppercase; font-size: 10px; letter-spacing: .06em; }
      .amount { text-align: right; font-weight: 700; }
      .total td { border-top: 2px solid #0a192f; font-size: 14px; font-weight: 800; }
      .status { display: inline-block; padding: 6px 10px; color: #fff; background: ${paymentStatus === "PAID" ? "#15803d" : paymentStatus === "PARTIAL" ? "#b45309" : "#b91c1c"}; border-radius: 999px; font-size: 10px; font-weight: 800; }
      .footer { padding: 18px 30px 26px; color: #687384; border-top: 1px solid #e4e7eb; font-size: 10px; line-height: 1.6; text-align: center; }
      .actions { display: flex; justify-content: center; gap: 10px; margin: 22px auto 0; }
      button { border: 0; border-radius: 6px; padding: 11px 20px; color: #fff; background: #d35400; font-weight: 700; cursor: pointer; }
      button.secondary { background: #0a192f; }
      @media print {
        body { padding: 0; background: #fff; }
        .receipt { max-width: none; border: 0; }
        .actions { display: none; }
      }
      @media (max-width: 600px) {
        body { padding: 0; }
        .header, .content { padding-left: 18px; padding-right: 18px; }
        .header { align-items: flex-start; flex-direction: column; }
        .title { text-align: left; }
        .meta, .grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <article class="receipt">
      <header class="header">
        <div class="brand">
          <img src="${escapeHtml(logoUrl)}" alt="Obech Flow Logistics logo" />
          <div>
            <h1>${COMPANY.name}</h1>
            <p>${COMPANY.address}</p>
          </div>
        </div>
        <div class="title">
          <strong>Booking Receipt</strong>
          <span>${displayValue(shipment.receipt_number)}</span>
        </div>
      </header>

      <div class="content">
        <div class="meta">
          <div><div class="label">Tracking ID</div><div class="value">${displayValue(shipment.tracking_id)}</div></div>
          <div><div class="label">Date</div><div class="value">${escapeHtml(createdAt)}</div></div>
          <div><div class="label">Payment Status</div><div class="value"><span class="status">${escapeHtml(paymentStatus)}</span></div></div>
        </div>

        <section class="section">
          <h2>Customer</h2>
          <div class="grid">
            <div><div class="label">Name</div><div class="value">${displayValue(shipment.client_name)}</div></div>
            <div><div class="label">Phone</div><div class="value">${displayValue(shipment.client_phone)}</div></div>
            <div><div class="label">Email</div><div class="value">${displayValue(shipment.client_email)}</div></div>
            <div><div class="label">Created By</div><div class="value">${displayValue(shipment.created_by || "Office Admin")}</div></div>
          </div>
        </section>

        <section class="section">
          <h2>Delivery Details</h2>
          <div class="route">${displayValue(route)}</div>
          <div class="grid" style="margin-top: 14px">
            <div><div class="label">Recipient</div><div class="value">${displayValue(shipment.receiver_name)}</div></div>
            <div><div class="label">Recipient Phone</div><div class="value">${displayValue(shipment.receiver_phone)}</div></div>
            <div><div class="label">Package</div><div class="value">${displayValue(shipment.package_type)}</div></div>
            <div><div class="label">Delivery Vehicle</div><div class="value">${displayValue(shipment.delivery_type)}</div></div>
          </div>
        </section>

        <section class="section">
          <h2>Payment</h2>
          <table>
            <thead><tr><th>Description</th><th class="amount">Amount</th></tr></thead>
            <tbody>
              <tr><td>Logistics booking charge</td><td class="amount">${escapeHtml(formatNaira(total))}</td></tr>
              <tr><td>Amount paid (${displayValue(shipment.payment_method)})</td><td class="amount">${escapeHtml(formatNaira(paid))}</td></tr>
              <tr class="total"><td>Balance</td><td class="amount">${escapeHtml(formatNaira(balance))}</td></tr>
            </tbody>
          </table>
          ${shipment.payment_reference ? `<div style="margin-top:10px"><span class="label">Payment Reference:</span> <span class="value">${displayValue(shipment.payment_reference)}</span></div>` : ""}
        </section>
      </div>

      <footer class="footer">
        ${COMPANY.phone} · ${COMPANY.email}<br />
        Keep this receipt and tracking ID for shipment enquiries. This document records the booking and payment position shown above.
      </footer>
    </article>
    <div class="actions">
      <button type="button" onclick="window.print()">Print Receipt</button>
      <button type="button" class="secondary" onclick="window.close()">Close</button>
    </div>
  </body>
</html>`);

  receiptWindow.document.close();
  receiptWindow.focus();
  return true;
};
