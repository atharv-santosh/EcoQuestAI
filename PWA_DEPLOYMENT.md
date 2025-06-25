# EcoQuestAI PWA Deployment Guide

## 🎉 Your PWA is Ready!

Your Expo app has been successfully built as a Progressive Web App (PWA). The build files are in the `mobile/app/dist/` folder.

## 📁 What Was Created

```
dist/
├── index.html          # Main HTML file
├── favicon.ico         # App icon
├── metadata.json       # Expo metadata
├── _expo/              # JavaScript bundles
└── assets/             # Static assets
```

## 🚀 Deploy Options

### **Option 1: Vercel (Recommended)**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd mobile/app/dist
   vercel
   ```

3. **Follow the prompts:**
   - Project name: `ecoquestai`
   - Directory: `./` (current directory)
   - Override settings: `No`

### **Option 2: Netlify**

1. **Drag & Drop:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `mobile/app/dist` folder to the deploy area

2. **Or use CLI:**
   ```bash
   npm install -g netlify-cli
   cd mobile/app/dist
   netlify deploy
   ```

### **Option 3: GitHub Pages**

1. **Create a new repository** on GitHub
2. **Push the dist folder:**
   ```bash
   cd mobile/app/dist
   git init
   git add .
   git commit -m "Deploy EcoQuestAI PWA"
   git remote add origin https://github.com/yourusername/ecoquestai-pwa.git
   git push -u origin main
   ```

3. **Enable GitHub Pages** in repository settings

## 📱 PWA Features

Your app includes:
- ✅ **Installable** - Users can add to home screen
- ✅ **Offline support** - Works without internet
- ✅ **App-like experience** - Full screen, no browser UI
- ✅ **Responsive design** - Works on all devices

## 🔧 Customization

### **Update App Icon**
Replace `mobile/app/assets/icon.png` with your custom icon (512x512px recommended)

### **Update App Name**
Edit `mobile/app/app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "shortName": "Short Name"
  }
}
```

### **Add Google OAuth**
1. Get your web client ID from Google Cloud Console
2. Update `mobile/app/src/services/UserProvider.tsx`
3. Set redirect URI to: `https://your-domain.com`

## 🌐 Your App URL

After deployment, your app will be available at:
- **Vercel**: `https://ecoquestai.vercel.app`
- **Netlify**: `https://your-app-name.netlify.app`
- **GitHub Pages**: `https://yourusername.github.io/ecoquestai-pwa`

## 📱 How Users Install

### **Android (Chrome)**
1. Visit your app URL
2. Chrome will show "Add to Home Screen" prompt
3. Tap "Add" to install

### **iOS (Safari)**
1. Visit your app URL in Safari
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add" to install

## 🎯 Next Steps

1. **Deploy to your preferred platform**
2. **Test the PWA** on mobile devices
3. **Add Google OAuth** for real login
4. **Share your app URL** with users!

Your EcoQuestAI PWA is ready to go! 🚀 