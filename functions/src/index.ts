import { onCall, onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as nodemailer from 'nodemailer';
import * as cors from 'cors';

// Initialize Firebase Admin
initializeApp();

// Enhanced CORS configuration
const corsHandler = cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:3000',
    'https://waitlist-firebase.web.app',
    'https://waitlist-shoreline.web.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'], // Add OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization'] // Add headers you need
});

// Email configuration - Use mock for emulator, real for production
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_CLIENT_SECRET,
    refreshToken: process.env.EMAIL_REFRESH_TOKEN,
    accessToken: process.env.EMAIL_ACCESS_TOKEN,
  },
});

// Mock transporter for emulator testing
const mockTransporter = {
  sendMail: async (mailOptions: any) => {
    console.log('📧 MOCK EMAIL SENT:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text
    });
    return { messageId: 'mock-message-id-' + Date.now() };
  }
};

// Interface for email data
interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
  check?: boolean; // Added for check functionality
}

// Function to send emails
export const sendEmail = onCall(async (request: any) => {
  const { data, auth } = request;
  
  // Check if user is authenticated
  if (!auth) {
    throw new Error('User must be authenticated');
  }

  const emailData = data as EmailData;

  // If this is a check request, just return available: true
  if (data && data.check) {
    return { available: true };
  }

  try {
    const mailOptions = {
      from: emailData.from || process.env.EMAIL_USER,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.body,
      html: emailData.body.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
    };

    // Use mock transporter in emulator, real transporter in production
    const emailTransporter = process.env.FUNCTIONS_EMULATOR ? mockTransporter : transporter;
    const result = await emailTransporter.sendMail(mailOptions);
    
    // Log the email send attempt
    const firestore = getFirestore();
    await firestore.collection('email_logs').add({
      to: emailData.to,
      subject: emailData.subject,
      sentAt: new Date(),
      success: true,
      messageId: result.messageId,
      userId: auth.uid,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log the error
    const firestore = getFirestore();
    await firestore.collection('email_logs').add({
      to: emailData.to,
      subject: emailData.subject,
      sentAt: new Date(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: auth.uid,
    });

    throw new Error('Failed to send email');
  }
});

// Alternative HTTP function with CORS support for testing
export const sendEmailHttp = onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // For testing purposes, you can bypass auth check
      const emailData = req.body as EmailData;
      
      const mailOptions = {
        from: emailData.from || process.env.EMAIL_USER,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.body,
        html: emailData.body.replace(/\n/g, '<br>'),
      };

      // Use mock transporter in emulator, real transporter in production
      const emailTransporter = process.env.FUNCTIONS_EMULATOR ? mockTransporter : transporter;
      const result = await emailTransporter.sendMail(mailOptions);
      
      // Log the email send attempt
      const firestore = getFirestore();
      await firestore.collection('email_logs').add({
        to: emailData.to,
        subject: emailData.subject,
        sentAt: new Date(),
        success: true,
        messageId: result.messageId,
        userId: 'test-user', // For testing
      });

      res.json({ success: true, messageId: result.messageId });
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Log the error
      const firestore = getFirestore();
      await firestore.collection('email_logs').add({
        to: req.body?.to || 'unknown',
        subject: req.body?.subject || 'unknown',
        sentAt: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: 'test-user',
      });

      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  });
}); 