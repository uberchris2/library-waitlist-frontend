import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
const { google } = require('googleapis');
// const sgMail = require('@sendgrid/mail');

// Gmail OAuth2 secrets
const gmailClientId = defineSecret('GMAIL_CLIENT_ID');
const gmailClientSecret = defineSecret('GMAIL_CLIENT_SECRET');
const gmailRefreshToken = defineSecret('GMAIL_REFRESH_TOKEN');
const senderEmail = defineSecret('SENDER_EMAIL');

// SendGrid fallback
// const sendGridApiKey = defineSecret('SENDGRID_API_KEY');

admin.initializeApp();

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

interface EmailResponse {
  success: boolean;
  messageId: string;
}

export const sendEmail = functions.https.onCall({
  secrets: [gmailClientId, gmailClientSecret, gmailRefreshToken, senderEmail]}, 
  async (request: functions.https.CallableRequest<EmailData>): Promise<EmailResponse> => {

  // Verify authentication
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  } else if (!request.auth.token?.email?.endsWith('@seattlereconomy.org')) {
    throw new functions.https.HttpsError('unauthenticated', 'User is authenticated with a disallowed account');
  }

  const { to, subject, body } = request.data;

  // Try Gmail OAuth2 first, fallback to SendGrid
  try {
    const gmailResult = await sendEmailViaGmail(to, subject, body);
    return gmailResult;
  } catch (gmailError) {
    logger.warn('Gmail failed, trying SendGrid fallback:', gmailError);
    
    // try {
    //   const sendGridResult = await sendEmailViaSendGrid(to, subject, body);
    //   return sendGridResult;
    // } catch (sendGridError) {
      logger.error('Both Gmail and SendGrid failed:', { gmailError });
      throw new functions.https.HttpsError('internal', 'Failed to send email via all providers');
    }
});

async function sendEmailViaGmail(to: string, subject: string, body: string): Promise<EmailResponse> {
  try {
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      gmailClientId.value(),
      gmailClientSecret.value(),
      'urn:ietf:wg:oauth:2.0:oob' // For server-to-server
    );

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: gmailRefreshToken.value()
    });

    // Get access token
    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('Failed to get access token');
    }

    // Create Gmail API instance
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Convert newlines to HTML breaks for proper email formatting
    const htmlBody = body.replace(/\n/g, '<br>');
    
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `From: ${senderEmail.value()}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlBody
    ].join('\n');

    const encodedEmail = Buffer.from(email).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });

    logger.info('Email sent successfully via Gmail:', result.data.id);
    return { success: true, messageId: result.data.id };

  } catch (error) {
    logger.error('Gmail send error:', error);
    throw error;
  }
}

// async function sendEmailViaSendGrid(to: string, subject: string, body: string): Promise<EmailResponse> {
//   try {
//     // Initialize SendGrid
//     sgMail.setApiKey(sendGridApiKey.value());

//     const msg = {
//       to: to,
//       from: senderEmail.value(),
//       subject: subject,
//       html: body,
//     };

//     const result = await sgMail.send(msg);
    
//     logger.info('Email sent successfully via SendGrid:', result[0].headers['x-message-id']);
//     return { success: true, messageId: result[0].headers['x-message-id'] };

//   } catch (error) {
//     logger.error('SendGrid send error:', error);
//     throw error;
//   }
// }