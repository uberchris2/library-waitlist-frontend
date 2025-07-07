# Gmail OAuth2 Setup Guide

Since Google is discouraging app passwords, here's how to set up OAuth2 authentication for Gmail.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it

## Step 2: Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add these authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for testing)
   - `https://your-firebase-project.firebaseapp.com/auth/google/callback` (for production)
5. Note down your Client ID and Client Secret

## Step 3: Get Refresh Token

### Option A: Using Google's OAuth Playground (Easiest)

1. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the settings icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. Close settings
6. In the left panel, scroll down and select "Gmail API v1"
7. Select "https://mail.google.com/"
8. Click "Authorize APIs"
9. Sign in with your Gmail account
10. Click "Exchange authorization code for tokens"
11. Copy the "Refresh token" value

### Option B: Using a Node.js Script

Create a file called `get-refresh-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/auth/google/callback'
);

const scopes = [
  'https://mail.google.com/'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Refresh token:', tokens.refresh_token);
    rl.close();
  });
});
```

Run it with:
```bash
npm install googleapis
node get-refresh-token.js
```

## Step 4: Configure Firebase Functions

Set the environment variables in Firebase:

```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.client_id="your-client-id"
firebase functions:config:set email.client_secret="your-client-secret"
firebase functions:config:set email.refresh_token="your-refresh-token"
```

## Step 5: Deploy and Test

```bash
cd functions
npm run build
firebase deploy --only functions
```

## Troubleshooting

### Common Issues:

1. **"Invalid Credentials"**: Make sure your Client ID and Secret are correct
2. **"Invalid Grant"**: Your refresh token may have expired. Generate a new one
3. **"Quota Exceeded"**: Gmail has daily sending limits. Check your usage

### Security Notes:

- Never commit your credentials to version control
- Use Firebase Functions config for production
- Consider using a dedicated Gmail account for sending emails
- Monitor your email logs in Firestore

## Alternative: Use a Different Email Provider

If Gmail OAuth2 is too complex, consider:

- **SendGrid**: Free tier with 100 emails/day
- **Mailgun**: Free tier with 5,000 emails/month
- **AWS SES**: Very cheap for high volume

For these providers, you'd just need to update the transporter configuration in `functions/src/index.ts`. 