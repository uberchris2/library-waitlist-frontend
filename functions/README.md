# Firebase Functions Email Setup

This directory contains Firebase Functions for sending emails using nodemailer.

## Setup Instructions

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure Email Provider

You have several options for email configuration:

#### Option A: Gmail (Recommended for testing)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Set the environment variables:
```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
```

#### Option B: Other Email Providers
Update the transporter configuration in `src/index.ts`:
```typescript
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: functions.config().email?.user || process.env.EMAIL_USER,
    pass: functions.config().email?.password || process.env.EMAIL_PASSWORD,
  },
});
```

### 3. Deploy Functions
```bash
firebase deploy --only functions
```

### 4. Test the Functions
You can test the functions using the Firebase Console or by calling them from your Angular app.

## Available Functions

### `sendEmail`
General purpose email sending function.

**Parameters:**
- `to`: Recipient email address
- `subject`: Email subject
- `body`: Email body
- `from`: (optional) Sender email address


**Parameters:**
- `waitHold`: Object containing name, email, tool, and category

## Security Notes

- All functions require user authentication
- Email logs are stored in Firestore for monitoring
- Consider implementing rate limiting for production use
- Use environment variables for sensitive configuration

## Troubleshooting

### Common Issues:

1. **Authentication Errors**: Make sure the user is signed in to Firebase Auth
2. **Email Provider Issues**: Check your email provider's SMTP settings
3. **Deployment Errors**: Ensure you're in the correct Firebase project

### Logs
View function logs:
```bash
firebase functions:log
```

## Environment Variables

For local development, you can set environment variables in a `.env` file:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

For production, use Firebase Functions config:
```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
``` 