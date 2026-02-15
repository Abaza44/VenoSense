# VeinoTronic 2.0 — AI-Powered Vein Visualization Platform

> Hackathon project: AI-assisted vein visualization and smart needle recommendation system.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and add your Firebase credentials (optional)
cp .env.example .env

# 3. Start development server
npm run dev
```

The app runs without Firebase configured — it falls back to local sample data automatically.

## Features

### AR Vein Scanner (`/ar`)
Camera-based vein overlay with scan animation, pulsing glow effects, and interactive hotspots.

### Smart Needle Recommender (`/recommend`)
Multi-factor AI scoring model that recommends needle gauge, length, and provides risk assessment.

### Patient VeinMap (`/patients`)
Cloud-based patient profiles with scan history and side-by-side comparison.

## Tech Stack

- **React 18** + Vite + React Router
- **Tailwind CSS** for styling
- **Canvas API** for vein overlay rendering
- **WebRTC** for camera access
- **Firebase Firestore** for cloud data (with local fallback)

## Firebase Setup (Optional)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database (test mode)
3. Create a web app and copy the config to `.env`
4. Seed sample data: `npm run seed`

## Project Structure

```
src/
├── features/           # Feature modules (AR, Recommender, Digital Twin)
├── components/         # Shared UI components
├── context/            # React Context providers
├── hooks/              # Custom hooks
├── services/           # Firebase + simulated device
├── utils/              # Constants, formatters, validators
└── pages/              # Dashboard
```

## Deploy

```bash
npm run build
npx vercel --prod
```
