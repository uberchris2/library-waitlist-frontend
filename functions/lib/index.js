"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
// Initialize Firebase Admin
admin.initializeApp();
// Email configuration with OAuth2
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: functions.config().email?.user || process.env.EMAIL_USER,
        clientId: functions.config().email?.client_id || process.env.EMAIL_CLIENT_ID,
        clientSecret: functions.config().email?.client_secret || process.env.EMAIL_CLIENT_SECRET,
        refreshToken: functions.config().email?.refresh_token || process.env.EMAIL_REFRESH_TOKEN,
        accessToken: functions.config().email?.access_token || process.env.EMAIL_ACCESS_TOKEN,
    },
});
// Function to send emails
exports.sendEmail = functions.https.onCall(async (request) => {
    const { data, auth } = request;
    // Check if user is authenticated
    if (!auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const emailData = data;
    try {
        const mailOptions = {
            from: emailData.from || functions.config().email?.user || process.env.EMAIL_USER,
            to: emailData.to,
            subject: emailData.subject,
            text: emailData.body,
            html: emailData.body.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
        };
        const result = await transporter.sendMail(mailOptions);
        // Log the email send attempt
        await admin.firestore().collection('email_logs').add({
            to: emailData.to,
            subject: emailData.subject,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            success: true,
            messageId: result.messageId,
            userId: auth.uid,
        });
        return { success: true, messageId: result.messageId };
    }
    catch (error) {
        console.error('Error sending email:', error);
        // Log the error
        await admin.firestore().collection('email_logs').add({
            to: emailData.to,
            subject: emailData.subject,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: auth.uid,
        });
        throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
});
//# sourceMappingURL=index.js.map