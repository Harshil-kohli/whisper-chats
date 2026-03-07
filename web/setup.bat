@echo off

echo Setting up Whisper Chat App...

echo Installing frontend dependencies...
call npm install

echo Installing backend dependencies...
cd server
call bun install
cd ..

echo Setup complete!
echo.
echo Next steps:
echo 1. Configure .env with your MongoDB and Clerk credentials
echo 2. Start backend: cd server ^&^& bun run dev
echo 3. Start frontend: npm run dev
