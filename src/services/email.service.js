import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});


transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Backend Ledger!';
  const text = `Hello ${name},\n\nThank you for registering with Backend Ledger! We're excited to have you on board.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering with <strong>Backend Ledger</strong>! We're excited to have you on board.</p><p>Best regards,<br>The Backend Ledger Team</p>`;  

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, transactionDetails) {
  const subject = 'Transaction Notification';
  const text = `Hello ${name},\n\nA transaction has been made on your account:\n\n${transactionDetails}\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>A transaction has been made on your account:</p><p>${transactionDetails}</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, transactionDetails) {
  const subject = 'Transaction Failure Notification';
  const text = `Hello ${name},\n\nWe regret to inform you that a transaction on your account has failed:\n\n${transactionDetails}\n\nPlease check your account and try again.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>We regret to inform you that a transaction on your account has failed:</p><p>${transactionDetails}</p><p>Please check your account and try again.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
  await sendEmail(userEmail, subject, text, html);
}

export default { sendRegistrationEmail, sendTransactionEmail };