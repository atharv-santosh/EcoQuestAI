# Google OAuth Setup for EcoQuestAI

## Prerequisites
- Google Cloud Console account
- Expo development environment

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: EcoQuestAI
   - User support email: your-email@domain.com
   - Developer contact information: your-email@domain.com
4. Add scopes:
   - `openid`
   - `profile`
   - `email`
5. Add test users (your email addresses)

## Step 3: Create OAuth 2.0 Client IDs

### Web Client (for Expo Web)
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Name: "EcoQuestAI Web Client"
5. Authorized JavaScript origins:
   - `http://localhost:8082`
   - `http://localhost:8083`
   - `http://localhost:19006`
   - `https://your-vercel-domain.vercel.app`
6. Authorized redirect URIs:
   - `http://localhost:8082/auth`
   - `http://localhost:8083/auth`
   - `http://localhost:19006/auth`
   - `https://your-vercel-domain.vercel.app/auth`
   - `com.ecoquestai.app://auth`
7. Copy the Client ID

### iOS Client (for Expo Go)
1. Create another OAuth 2.0 Client ID
2. Choose "iOS"
3. Name: "EcoQuestAI iOS Client"
4. Bundle ID: `com.ecoquestai.app`
5. Copy the Client ID

### Android Client (for Expo Go)
1. Create another OAuth 2.0 Client ID
2. Choose "Android"
3. Name: "EcoQuestAI Android Client"
4. Package name: `com.ecoquestai.app`
5. SHA-1 certificate fingerprint: (get this from your keystore)
6. Copy the Client ID

## Step 4: Update App Configuration

### Update AuthContext.tsx
Replace the placeholder client ID in `src/contexts/AuthContext.tsx`:

```typescript
// Replace this line:
clientId: '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',

// With your actual client IDs:
clientId: Platform.select({
  ios: 'YOUR_IOS_CLIENT_ID',
  android: 'YOUR_ANDROID_CLIENT_ID',
  web: 'YOUR_WEB_CLIENT_ID',
}) || 'YOUR_WEB_CLIENT_ID',
```

### Environment Variables (Optional)
Create a `.env` file in the root directory:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

Then update AuthContext.tsx to use environment variables:

```typescript
clientId: Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
}) || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
```

## Step 5: Test the Setup

1. Run the app: `npx expo start`
2. Try logging in with Google
3. Check the console for any errors
4. Verify that user data is properly retrieved

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Make sure the redirect URI in Google Console matches exactly
   - For Expo Go, use: `com.ecoquestai.app://auth`
   - For web, use: `http://localhost:8082/auth` (or your current port)

2. **"invalid_client" error**
   - Verify the client ID is correct
   - Make sure you're using the right client ID for each platform

3. **"access_denied" error**
   - Check that the user is added to test users
   - Verify the OAuth consent screen is properly configured

4. **App not opening after login**
   - Check that the scheme in app.json matches the redirect URI
   - Verify the bundle ID/package name matches

### For Production:

1. Publish your OAuth consent screen
2. Add your production domain to authorized origins
3. Update redirect URIs for production URLs
4. Consider using environment variables for different environments

## Security Notes

- Never commit client IDs to public repositories
- Use environment variables for sensitive data
- Regularly rotate your OAuth client secrets
- Monitor OAuth usage in Google Cloud Console 