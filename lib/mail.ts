import nodemailer from "nodemailer";

export async function sendResetPasswordEmail(
  email: string,
  token: string,
  isAdmin: boolean = false
) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/${isAdmin ? "admin/" : ""}reset-password?token=${token}`;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"CrickproBD" <noreply@crickprobd.com>`;

  console.log("-----------------------------------------");
  console.log(`[PASSWORD RESET] Request for ${email} (${isAdmin ? "Admin" : "User"})`);
  console.log(`[PASSWORD RESET] Reset URL: ${resetUrl}`);
  console.log("-----------------------------------------");

  // If credentials are not set, we bypass nodemailer in dev mode
  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP server is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
    }
    console.warn("[WARNING] SMTP is not fully configured. Email was simulated, link printed above.");
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port || "587"),
    secure: port === "465", // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from,
    to: email,
    subject: "Reset your CrickproBD Password",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #03041c;
            color: #d1d5db;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #07092e;
            border: 1px solid rgba(63, 63, 70, 0.4);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          }
          .header {
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid rgba(63, 63, 70, 0.2);
            background: linear-gradient(135deg, #07092e 0%, #121542 100%);
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.5px;
          }
          .accent {
            color: #f59e0b;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            color: #ffffff;
            font-size: 22px;
            margin-top: 0;
            font-weight: 700;
          }
          p {
            font-size: 15px;
            color: #a1a1aa;
            margin-bottom: 24px;
          }
          .btn-container {
            margin: 35px 0;
            text-align: center;
          }
          .btn {
            background-color: #f59e0b;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            font-size: 15px;
            font-weight: bold;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
            transition: all 0.2s ease;
          }
          .btn:hover {
            background-color: #d97706;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
            border-top: 1px solid rgba(63, 63, 70, 0.2);
            background-color: #04051a;
          }
          .divider {
            margin: 25px 0;
            border: 0;
            border-top: 1px solid rgba(63, 63, 70, 0.3);
          }
          .link-fallback {
            word-break: break-all;
            font-family: monospace;
            background-color: #121542;
            padding: 10px;
            border-radius: 6px;
            color: #f59e0b;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Crick<span class="accent">pro</span>BD</span>
          </div>
          <div class="content">
            <h1>Password Reset Request</h1>
            <p>Hello,</p>
            <p>We received a request to reset the password for your account on CrickproBD. Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
            <div class="btn-container">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>
            <p>If the button above does not work, please copy and paste the URL below into your browser:</p>
            <div class="link-fallback">${resetUrl}</div>
            <hr class="divider">
            <p style="font-size: 13px; margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            &copy; 2026 CrickproBD. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, simulated: false };
}

export async function sendPaymentReceivedConfirmationEmail(
  email: string,
  details: { itemName: string; itemPrice: string | number; senderNumber: string; trxId: string }
) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"CrickproBD" <noreply@crickprobd.com>`;

  console.log("-----------------------------------------");
  console.log(`[PAYMENT CONFIRMATION] Sending to user ${email}`);
  console.log(`[PAYMENT CONFIRMATION] Item: ${details.itemName}, Price: ${details.itemPrice}`);
  console.log("-----------------------------------------");

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP server is not configured.");
    }
    console.warn("[WARNING] SMTP is not fully configured. Email simulated.");
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port || "587"),
    secure: port === "465",
    auth: { user, pass },
  });

  const mailOptions = {
    from,
    to: email,
    subject: "JazzCash Payment Received - Pending Admin Verification",
    text: `Hello,\n\nWe have received your payment of ${details.itemPrice} for ${details.itemName}.\n\nOur admin team will verify your transaction (TRX ID: ${details.trxId}). Your account details (email and password) will be sent to you soon (at most 1 hour).\n\nThank you for choosing CrickproBD.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Received</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #03041c;
            color: #d1d5db;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #07092e;
            border: 1px solid rgba(245, 182, 18, 0.2);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          }
          .header {
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid rgba(63, 63, 70, 0.2);
            background: linear-gradient(135deg, #07092e 0%, #121542 100%);
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.5px;
          }
          .accent {
            color: #f59e0b;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            color: #ffffff;
            font-size: 22px;
            margin-top: 0;
            font-weight: 700;
          }
          p {
            font-size: 15px;
            color: #a1a1aa;
            margin-bottom: 24px;
          }
          .details-card {
            background-color: #121542;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid rgba(245, 182, 18, 0.1);
            margin: 25px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .detail-label {
            color: #888;
            font-weight: 600;
          }
          .detail-value {
            color: #fff;
            font-weight: 700;
          }
          .highlight {
            color: #f59e0b;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
            border-top: 1px solid rgba(63, 63, 70, 0.2);
            background-color: #04051a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Crick<span class="accent">pro</span>BD</span>
          </div>
          <div class="content">
            <h1>Payment Received!</h1>
            <p>Hello,</p>
            <p>Thank you for submitting your payment. Our admin team will verify your transaction details shortly.</p>
            
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Product / Plan:</span>
                <span class="detail-value">${details.itemName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value highlight">${details.itemPrice}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Sender JazzCash:</span>
                <span class="detail-value">${details.senderNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value font-mono">${details.trxId}</span>
              </div>
            </div>

            <p><strong>Note:</strong> Admin will confirm your payment and your account login email & password will be sent to you soon (<strong>at most 1 hour</strong>).</p>
          </div>
          <div class="footer">
            &copy; 2026 CrickproBD. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, simulated: false };
}

export async function sendAdminPaymentNotificationEmail(
  adminEmail: string,
  details: { userEmail: string; itemName: string; itemPrice: string | number; senderNumber: string; trxId: string }
) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"CrickproBD System" <noreply@crickprobd.com>`;

  if (!host || !user || !pass) {
    console.warn("[WARNING] SMTP is not fully configured. Notification simulated.");
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port || "587"),
    secure: port === "465",
    auth: { user, pass },
  });

  const mailOptions = {
    from,
    to: adminEmail,
    subject: "New JazzCash Payment Received - Verification Needed",
    text: `Admin Notification:\nA user has completed a JazzCash payment transaction.\n\nUser Email: ${details.userEmail}\nPlan: ${details.itemName}\nPrice: ${details.itemPrice}\nSender JazzCash: ${details.senderNumber}\nTransaction ID: ${details.trxId}\n\nPlease review this in the dashboard and send credentials/confirmation.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Payment Notification</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #03041c;
            color: #d1d5db;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #07092e;
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 16px;
            overflow: hidden;
          }
          .header {
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid rgba(63, 63, 70, 0.2);
            background: linear-gradient(135deg, #07092e 0%, #1e1b4b 100%);
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.5px;
          }
          .accent {
            color: #ef4444;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            color: #ffffff;
            font-size: 22px;
            margin-top: 0;
            font-weight: 700;
          }
          p {
            font-size: 15px;
            color: #a1a1aa;
          }
          .details-card {
            background-color: #111827;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid rgba(239, 68, 68, 0.1);
            margin: 25px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
            border-bottom: 1px solid #1f2937;
            padding-bottom: 8px;
          }
          .detail-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .detail-label {
            color: #9ca3af;
            font-weight: 600;
          }
          .detail-value {
            color: #fff;
            font-weight: 700;
          }
          .highlight {
            color: #ef4444;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
            border-top: 1px solid rgba(63, 63, 70, 0.2);
            background-color: #04051a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Crick<span class="accent">pro</span>BD Admin</span>
          </div>
          <div class="content">
            <h1>New JazzCash Transaction Received</h1>
            <p>A customer has submitted a new payment that requires manual validation.</p>
            
            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Customer Email:</span>
                <span class="detail-value">${details.userEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Product / Plan:</span>
                <span class="detail-value">${details.itemName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value highlight">${details.itemPrice}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Sender JazzCash:</span>
                <span class="detail-value">${details.senderNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value font-mono">${details.trxId}</span>
              </div>
            </div>
            <p>Please log in to your dashboard to review this payment and send the login details.</p>
          </div>
          <div class="footer">
            System generated notification &copy; 2026 CrickproBD.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, simulated: false };
}

export async function sendAdminCustomEmail(
  toEmail: string,
  subject: string,
  body: string
) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"CrickproBD Support" <support@crickprobd.com>`;

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP server is not configured.");
    }
    console.warn("[WARNING] SMTP is not fully configured. Custom email simulated.");
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port || "587"),
    secure: port === "465",
    auth: { user, pass },
  });

  const formattedBody = body.replace(/\n/g, "<br>");

  const mailOptions = {
    from,
    to: toEmail,
    subject: subject,
    text: body,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #03041c;
            color: #d1d5db;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #07092e;
            border: 1px solid rgba(63, 63, 70, 0.4);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          }
          .header {
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid rgba(63, 63, 70, 0.2);
            background: linear-gradient(135deg, #07092e 0%, #121542 100%);
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.5px;
          }
          .accent {
            color: #f59e0b;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
            font-size: 15px;
            color: #d1d5db;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
            border-top: 1px solid rgba(63, 63, 70, 0.2);
            background-color: #04051a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Crick<span class="accent">pro</span>BD</span>
          </div>
          <div class="content">
            ${formattedBody}
          </div>
          <div class="footer">
            &copy; 2026 CrickproBD. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, simulated: false };
}
