import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
const { google } = require('googleapis');
const {JWT} = require('google-auth-library'); //https://www.npmjs.com/package/google-auth-library#json-web-tokens

// Gmail secrets
const clientEmail = defineSecret('CLIENT_EMAIL');
const privateKey = defineSecret('PRIVATE_KEY');
const senderEmail = defineSecret('SENDER_EMAIL');


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
  secrets: [clientEmail, privateKey, senderEmail]}, 
  async (request: functions.https.CallableRequest<EmailData>): Promise<EmailResponse> => {

  // Verify authentication
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  } else if (!request.auth.token?.email?.endsWith('@seattlereconomy.org')) {
    throw new functions.https.HttpsError('unauthenticated', 'User is authenticated with a disallowed account');
  }

  const { to, subject, body } = request.data;

  try {
    const gmailResult = await sendEmailViaGmail(to, subject, body);
    return gmailResult;
  } catch (gmailError) {
    logger.warn('Gmail failed:', gmailError);
    
      throw new functions.https.HttpsError('internal', 'Failed to send email via all providers');
    }
});

export async function sendEmailViaGmail(to: string, subject: string, body: string): Promise<EmailResponse> {
  try {    
    const formattedPrivateKey = privateKey.value().replace(/\\n/g, '\n');

    const client = new JWT({
      email: clientEmail.value(),
      key: formattedPrivateKey,
      subject: senderEmail.value(),
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    client.authorize();
    const gmail = google.gmail({ version: 'v1', auth: client });    

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