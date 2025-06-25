# Deployment Guide

## Step 1: Set up Neon Database

1. **Go to [neon.tech](https://neon.tech)** and create an account
2. **Create a new project** called "ecoquest"
3. **Copy the connection string** from the dashboard
4. **Run the database migration**:
   ```bash
   npm run db:push
   ```

## Step 2: Deploy Backend to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Set environment variables**:
   ```bash
   vercel env add DATABASE_URL
   # Paste your Neon connection string
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

5. **Copy the deployment URL** (e.g., `https://your-app.vercel.app`)

## Step 3: Update Mobile App

1. **Update API base URL** in `mobile/TempExpoApp/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-app.vercel.app/api';
   ```

2. **Deploy mobile app to Expo**:
   ```bash
   cd mobile/TempExpoApp
   npx expo publish
   ```

## Step 4: Test Everything

1. **Test the API endpoints** using the Vercel URL
2. **Test the mobile app** with the new API URL
3. **Verify database operations** work correctly

## Environment Variables

Make sure these are set in Vercel:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NODE_ENV`: production

## Troubleshooting

- **Database connection issues**: Check your Neon connection string
- **API errors**: Check Vercel function logs
- **Mobile app issues**: Verify API base URL is correct 