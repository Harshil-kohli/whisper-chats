# Whisper - Real-time Messaging App

A modern, real-time messaging application with React frontend and Express backend, fully responsive and mobile-ready.

## Project Structure

```
web/
├── src/              # React frontend
├── server/           # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.ts
│   ├── index.ts
│   └── package.json
├── public/
└── package.json
```

## Features

- ✨ Real-time messaging with Socket.IO
- 🔐 Authentication with Clerk
- 📱 Fully responsive (mobile, tablet, desktop)
- 📲 PWA support with install prompt
- 🚀 Capacitor ready for native apps
- 💬 Typing indicators
- 👥 Online/offline status
- ⚡ Optimistic UI updates

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
bun install
cd ..
```

### 2. Environment Setup

Create `.env` in the web folder:
```env
# Server
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/whisper

# Clerk
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Frontend (Vite requires VITE_ prefix)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000

# URLs
FRONTEND_URL=http://localhost:5173
```

### 3. Start Development

```bash
# Terminal 1: Start backend
cd server
bun run dev

# Terminal 2: Start frontend
npm run dev
```

Visit `http://localhost:5173`

## Scripts

### Frontend
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build

# Capacitor (mobile)
npm run cap:sync         # Sync to native
npm run cap:open:android # Open Android Studio
npm run cap:open:ios     # Open Xcode
```

### Backend
```bash
cd server
bun run dev              # Start with hot reload
bun run start            # Start production
```

## Tech Stack

### Frontend
- React 19
- React Router 7
- Tailwind CSS 4 + DaisyUI
- Socket.IO Client
- Clerk Auth
- TanStack Query
- Zustand
- Capacitor 6

### Backend
- Express 5
- Socket.IO
- MongoDB + Mongoose
- Clerk Express
- TypeScript
- Bun runtime

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Any Node.js host)
```bash
cd server
bun install
bun run start
```

### All-in-One (Production)
The backend serves the frontend in production. Just deploy the entire `web` folder.

## Mobile Apps

Build native apps with Capacitor:

```bash
npm run build
npm run cap:add:android  # or :ios
npm run cap:sync
npm run cap:open:android # or :ios
```

## License

MIT
