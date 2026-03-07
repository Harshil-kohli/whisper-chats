#!/bin/bash

echo "🚀 Setting up Whisper Chat App..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
bun install
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env with your MongoDB and Clerk credentials"
echo "2. Start backend: cd server && bun run dev"
echo "3. Start frontend: npm run dev"
