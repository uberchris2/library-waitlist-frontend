# Email Authentication Setup Guide

This guide provides steps for setting up authentication for sending emails from your Firebase Functions using a service account

## Overview

The new implementation includes:
- **OAuth2 with refresh tokens** (primary method for Gmail)
- **SendGrid fallback** (automatic failover)
- **Better error handling and logging**

## Setup Options

### Option 1: Gmail OAuth2 (Recommended)

This is the most stable method for Gmail authentication.

#### Step 1: Get OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URI: `https://developers.google.com/oauthplayground/`
7. Note your Client ID and Client Secret

#### Step 2: Get Refresh Token

1. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click settings (⚙️) and check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In the left panel, select "Gmail API v1" > "https://mail.google.com/"
5. Click "Authorize APIs" and sign in
6. Click "Exchange authorization code for tokens"
7. Copy the **Refresh token** (not access token)

#### Step 3: Configure Firebase Secrets

```bash
firebase functions:secrets:set GMAIL_CLIENT_ID
# Enter your Client ID when prompted

firebase functions:secrets:set GMAIL_CLIENT_SECRET
# Enter your Client Secret when prompted

firebase functions:secrets:set GMAIL_REFRESH_TOKEN
# Enter your Refresh Token when prompted

firebase functions:secrets:set SENDER_EMAIL
# Enter the email address to send from (e.g., noreply@seattlereconomy.org)
```

### Option 2: SendGrid (Fallback/Alternative)

SendGrid is automatically used as a fallback, but you can also use it as your primary method.

#### Step 1: Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free)
3. Verify your sender email address
4. Go to Settings > API Keys
5. Create a new API key with "Mail Send" permissions

#### Step 2: Configure Firebase Secret

```bash
firebase functions:secrets:set SENDGRID_API_KEY
# Enter your SendGrid API key when prompted
```

## Deployment

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy --only functions
   ```

## How It Works

### Primary Method: Gmail OAuth2
- Uses refresh tokens (no expiration issues)
- Automatically handles token refresh
- Sends emails from your organization domain

### Fallback Method: SendGrid
- Automatically used if Gmail fails
- No authentication complexity
- Reliable delivery
- Good for high-volume sending

## Testing

### Test Gmail OAuth2
```bash
# Check logs for successful authentication
firebase functions:log --only sendEmail
```

### Test SendGrid Fallback
```bash
# Temporarily set an invalid Gmail refresh token to test fallback
firebase functions:secrets:set GMAIL_REFRESH_TOKEN
# Enter an invalid token, then test email sending
```

## Troubleshooting

### Common Issues

1. **"Invalid Grant" Error**
   - Your refresh token may have expired
   - Generate a new one using the OAuth Playground

2. **"Access Denied" Error**
   - Make sure the Gmail API is enabled in your Google Cloud project
   - Check that your OAuth2 credentials are correct

3. **SendGrid "Unauthorized" Error**
   - Verify your API key is correct
   - Make sure your sender email is verified in SendGrid

### Debugging

Check the Firebase Functions logs:
```bash
firebase functions:log --only sendEmail --limit 50
```

Look for these log messages:
- `Email sent successfully via Gmail:` - Gmail worked
- `Gmail failed, trying SendGrid fallback:` - Gmail failed, using SendGrid
- `Email sent successfully via SendGrid:` - SendGrid worked
