# Google OAuth Setup Guide

## Current Status
✅ **Google Login UI is ready** - The login screen has been polished with a modern design and loading states.

✅ **Google OAuth logic is implemented** - The UserProvider now properly triggers Google OAuth flow.

⚠️ **Client IDs need to be configured** - You need to replace the placeholder client IDs with real ones.

## Setup Steps

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Create credentials for:
   - **Web application** (for development)
   - **iOS application** (for iOS app)
   - **Android application** (for Android app)

### 2. Update Client IDs

Replace the placeholder client IDs in `mobile/app/src/services/UserProvider.tsx`:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',        // ← Replace
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',     // ← Replace  
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com', // ← Replace
  scopes: ['profile', 'email'],
});
```

### 3. Configure App.json

Your `app.json` is already configured with the correct scheme:

```json
{
  "expo": {
    "name": "EcoQuestAI",
    "slug": "ecoquestai",
    "scheme": "ecoquestai"
  }
}
```

### 4. Test the Implementation

1. Run your Expo app: `cd mobile/app && npx expo start`
2. Try logging in with Google
3. The app will fall back to demo user if Google OAuth fails (for development)

## UI Improvements Completed

✅ **LoginScreen** - Modern gradient design, loading states, improved Google button
✅ **HomeScreen** - Better spacing, shadows, and quest cards
✅ **ExploreScreen** - Gradient header, improved map markers, better modals
✅ **HuntScreen** - Enhanced quest progress and challenge UI
✅ **BadgesScreen** - Gradient badges, progress bars, improved modals
✅ **ProfileScreen** - Gradient stats cards, better achievement display

## Features

- **Real Google OAuth** - Proper authentication flow with Google
- **Fallback Demo User** - Works even without Google OAuth configured
- **Modern UI Design** - Consistent gradients, shadows, and spacing
- **Loading States** - Proper loading indicators throughout
- **Error Handling** - Graceful fallbacks and error messages

## Next Steps

1. Replace placeholder client IDs with real ones
2. Test Google login on both iOS and Android
3. Deploy to app stores (optional - can also distribute via Expo Go) 