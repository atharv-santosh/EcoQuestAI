# EcoQuest AI

An AI-powered mobile-first Progressive Web App that generates custom eco-friendly scavenger hunts in local areas.

## Running the Application

### Web App (Primary)
```bash
npm install
npm run dev
```
The app will be available at http://localhost:5000

### Mobile App (React Native)
```bash
cd mobile
npm install
npm start
```

## Project Structure

- `/client` - React web application (PWA)
- `/server` - Express.js backend API
- `/mobile` - React Native mobile app
- `/shared` - Shared TypeScript types and schemas

## Features

- 4 eco-adventure themes (Urban Nature, Sustainable Shopping, Pollinator Hunt, Zero-Waste Picnic)
- AI-generated routes with 5-7 stops
- Interactive challenges (photo, trivia, tasks)
- Google Maps integration
- Achievement system
- PWA with offline capabilities

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL database connection
- `GOOGLE_MAPS_API_KEY` - For map functionality
- `SESSION_SECRET` - For user sessions

Optional:
- `OPENAI_API_KEY` - For AI route generation