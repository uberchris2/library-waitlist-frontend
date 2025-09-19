# Email Authentication Setup Guide

This guide provides steps for setting up authentication for sending emails from your Firebase Functions using a service account

## Overview


## Setup Options

### Option 1: Gmail OAuth2 (Recommended)

This is the most stable method for Gmail authentication.

#### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "IAM & Admin" > "Service Accounts"
4. Click "Create Service Account"
5. Enter a name and description for your service account
6. Click "Create and Continue"
7. Skip role assignment for now (click "Continue")
8. Click "Done"

#### Step 2: Generate JWT Key

1. In the Service Accounts list, click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create" - this will download a JSON file
6. Open the JSON file and copy the following values:
   - `client_email` (the service account email)
   - `private_key` (the private key content)

#### Step 3: Configure Firebase Secrets

```bash
firebase functions:secrets:set CLIENT_EMAIL
# Enter your Client ID when prompted

firebase functions:secrets:set PRIVATE_KEY
# Enter your Private key

firebase functions:secrets:set SENDER_EMAIL
# Enter the email address to send from (e.g., noreply@seattlereconomy.org)
```




## How It Works

### Primary Method: Gmail JWT
- 
- Sends emails from your organization domain
