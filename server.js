require('dotenv').config();
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Basic validation helpers ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts digits, spaces, +, -, () — at least 7 digits total
function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

// ---- Mail transport ----
// Reads SMTP config from environment variables (see .env.example).
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587/25
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function buildConfirmationEmail({ name }) {
  const eventName = process.env.EVENT_NAME || 'Yoga Session';
  const eventDate = process.env.EVENT_DATE || 'TBD';
  const eventTime = process.env.EVENT_TIME || 'TBD';
  const eventLocation = process.env.EVENT_LOCATION || 'TBD';

  const text =
    `Hi ${name},\n\n` +
    `You're booked in for ${eventName}!\n\n` +
    `Date: ${eventDate}\n` +
    `Time: ${eventTime}\n` +
    `Location: ${eventLocation}\n\n` +
    `Please arrive 10 minutes early with a mat and water bottle.\n` +
    `If you need to reschedule or cancel, just reply to this email.\n\n` +
    `See you on the mat!\n` +
    `Sunrise Flow Yoga`;

  const html = `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; color:#2b2a28;">
    <h2 style="color:#5b6b4f; margin-bottom: 4px;">Booking confirmed 🧘</h2>
    <p>Hi ${name},</p>
    <p>You're booked in for <strong>${eventName}</strong>.</p>
    <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding:6px 0; color:#7a7568; width:110px;">Date</td><td style="padding:6px 0;">${eventDate}</td></tr>
      <tr><td style="padding:6px 0; color:#7a7568;">Time</td><td style="padding:6px 0;">${eventTime}</td></tr>
      <tr><td style="padding:6px 0; color:#7a7568;">Location</td><td style="padding:6px 0;">${eventLocation}</td></tr>
    </table>
    <p>Please arrive 10 minutes early with a mat and water bottle.</p>
    <p>Need to reschedule or cancel? Just reply to this email.</p>
    <p style="margin-top: 24px;">See you on the mat!<br/>Sunrise Flow Yoga</p>
  </div>`;

  return {
    subject: `You're confirmed: ${eventName}`,
    text,
    html,
  };
}

app.post('/api/book', async (req, res) => {
  try {
    const { name, email, phone } = req.body || {};

    // ---- Validate input ----
    const errors = {};
    if (!name || !name.trim()) errors.name = 'Please enter your name.';
    if (!email || !EMAIL_RE.test(email.trim())) errors.email = 'Please enter a valid email address.';
    if (!phone || !isValidPhone(phone.trim())) errors.phone = 'Please enter a valid phone number.';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ ok: false, errors });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    // ---- Send confirmation email ----
    const { subject, text, html } = buildConfirmationEmail({ name: cleanName });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: cleanEmail,
      subject,
      text,
      html,
    });

    // In a real app you'd also persist the booking (database, calendar, etc.)
    console.log(`Booking confirmed for ${cleanName} <${cleanEmail}> (${cleanPhone})`);

    return res.json({ ok: true, message: `Confirmation email sent to ${cleanEmail}.` });
  } catch (err) {
    console.error('Booking failed:', err);
    return res.status(500).json({
      ok: false,
      message: 'Something went wrong sending the confirmation email. Please try again shortly.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Yoga booking server running at http://localhost:${PORT}`);
});
