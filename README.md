# EcoQuestAI

An eco-adventure mobile app built with React Native and Expo, featuring quests, badges, and sustainable exploration.

## 🚀 Quick Start

### Mobile App (Expo)
```bash
cd mobile/app
npx expo start
```

### Backend Server
```bash
npm run dev
```

## 📱 Project Structure

```
EcoQuestAI/
├── mobile/
│   └── app/                    # 🎯 Main Expo app
│       ├── App.tsx            # Entry point
│       ├── src/
│       │   ├── screens/       # All app screens
│       │   └── services/      # API & auth services
│       └── package.json       # Expo dependencies
│
├── server/                    # Backend API (Node.js/Express)
├── client/                    # Web version (React)
└── shared/                    # Shared types & schemas
```

## ✨ Features

- **Google OAuth Login** - Secure authentication
- **Eco Quests** - Location-based challenges
- **Badge System** - Achievement tracking
- **Explore Map** - Discover green spaces
- **Modern UI** - Polished design with gradients

## 🔧 Setup

1. **Install dependencies**:
   ```bash
   # Mobile app
   cd mobile/app && npm install
   
   # Backend
   npm install
   ```

2. **Configure Google OAuth** (see `GOOGLE_OAUTH_SETUP.md`)

3. **Start development**:
   ```bash
   # Terminal 1: Backend
   npm run dev
   
   # Terminal 2: Mobile app
   cd mobile/app && npx expo start
   ```

## 📱 Running the App

- **Expo Go**: Scan QR code with Expo Go app
- **iOS Simulator**: Press `i` in Expo CLI
- **Android Emulator**: Press `a` in Expo CLI

## 🚀 Deployment

- **Mobile**: Use Expo's build service or distribute via Expo Go
- **Backend**: Deploy to Vercel (see `DEPLOYMENT.md`)
- **Database**: Use Neon PostgreSQL

## 📄 Documentation

- [Google OAuth Setup](GOOGLE_OAUTH_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Mobile Deployment](MOBILE_DEPLOYMENT.md)