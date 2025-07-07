# Firebase Emulator Email Testing Guide

## Overview
When using the Firebase emulator, you don't need real OAuth2 credentials because the emulator uses a mock email service that logs emails to the console instead of actually sending them.

## How It Works

### Mock Email Service
- The emulator detects when `process.env.FUNCTIONS_EMULATOR` is set
- Instead of sending real emails, it logs them to the console with a 📧 emoji
- You'll see output like: `📧 MOCK EMAIL SENT: { to: "...", subject: "...", text: "..." }`

### Testing Steps

1. **Start the Firebase Emulator** (in WSL):
   ```bash
   cd functions
   npm run build
   firebase emulators:start --only functions
   ```

2. **Start Angular with Emulator Connection**:
   ```bash
   # In another terminal
   ng serve
   ```

3. **Test Email Sending**:
   - Go to your app and try sending an email
   - Check the Firebase emulator console for mock email logs
   - The emails will be logged but not actually sent

## For Production (Real Emails)

When you're ready to send real emails, you'll need to:

1. **Set up Gmail OAuth2** (see `GMAIL_OAUTH2_SETUP.md`)
2. **Configure Firebase Functions**:
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com"
   firebase functions:config:set email.client_id="your-client-id"
   firebase functions:config:set email.client_secret="your-client-secret"
   firebase functions:config:set email.refresh_token="your-refresh-token"
   ```

3. **Deploy to Production**:
   ```bash
   firebase deploy --only functions
   ```

## Benefits of This Approach

- ✅ No need for OAuth2 setup during development
- ✅ Fast testing without rate limits
- ✅ Clear logging of what emails would be sent
- ✅ Easy to switch between mock and real email sending
- ✅ No risk of accidentally sending test emails to real users

## Troubleshooting

### Firebase CLI not found in PowerShell
The Firebase CLI needs to be installed globally. Try:
```bash
npm install -g firebase-tools
```

### CORS Issues
Make sure your Angular app is connecting to the emulator:
- Check that `environment.ts` has the correct emulator URLs
- Verify the emulator is running on the expected ports

### TypeScript Errors
The linter errors about missing modules are expected in the emulator environment and won't affect functionality. 