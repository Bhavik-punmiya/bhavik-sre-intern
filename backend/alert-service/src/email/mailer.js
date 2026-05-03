import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from the root of the alert-service or the src folder
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'src', '.env') });

let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  console.log(`[MAILER] Initializing Ethereal transport for ${process.env.SMTP_USER}...`);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export const sendEmail = async (to, subject, text) => {
  if (!transporter) {
    console.log('----------------------------------------------------');
    console.log(`[MOCK EMAIL LOG] (No SMTP Config Found)`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('----------------------------------------------------');
    return { messageId: 'mock-id-' + Date.now() };
  }

  try {
    const info = await transporter.sendMail({
      from: '"IMS Alert System" <alerts@ims.local>',
      to,
      subject,
      text
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[ALERT] Email sent to ${to}`);
    // Ethereal automatically provides a preview URL in the terminal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[ALERT] Preview URL: ${previewUrl}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    return info;
  } catch (err) {
    console.error(`[MAILER ERROR] Failed to send email:`, err.message);
    throw err;
  }
};
