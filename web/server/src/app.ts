import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const allowedOrigins = [
  "http://localhost:8081",
  "http://localhost:5173",
  "http://192.168.1.105:8081",
  "exp://192.168.1.105:8081",
  process.env.FRONTEND_URL!,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("⚠️ CORS blocked origin:", origin);
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  const distPath = path.resolve(__dirname, "../../dist");
  const fs = require('fs');
  const distExists = fs.existsSync(distPath);
  const distFiles = distExists ? fs.readdirSync(distPath) : [];
  
  res.json({ 
    status: "ok", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasClerkKeys: !!(process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
      hasMongoUri: !!process.env.MONGODB_URI,
    },
    paths: {
      __dirname,
      distPath,
      distExists,
      distFiles: distFiles.slice(0, 10)
    }
  });
});

// API routes MUST come before static file serving
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Serve static files in production AND development (for Railway)
const shouldServeStatic = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT;

if (shouldServeStatic) {
  // In Docker: __dirname = /app/server/src, so ../../dist = /app/dist ✅
  // But let's also try absolute path as fallback
  let distPath = path.resolve(__dirname, "../../dist");
  
  // Check if dist exists, if not try from /app/dist directly
  const fs = require('fs');
  if (!fs.existsSync(distPath)) {
    console.log("⚠️ Dist not found at:", distPath);
    distPath = "/app/dist"; // Absolute path in Docker
    console.log("🔄 Trying absolute path:", distPath);
  }
  
  console.log("📁 Serving static files from:", distPath);
  console.log("📁 __dirname:", __dirname);
  console.log("📁 NODE_ENV:", process.env.NODE_ENV);
  console.log("📁 RAILWAY_ENVIRONMENT:", process.env.RAILWAY_ENVIRONMENT);
  console.log("📁 Dist exists:", fs.existsSync(distPath));
  console.log("📁 Dist contents:", fs.existsSync(distPath) ? fs.readdirSync(distPath) : "N/A");
  
  // Serve static assets FIRST - this must come before the catch-all
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
    index: false // Don't serve index.html automatically
  }));

  // Catch-all route for SPA - ONLY for routes without file extensions
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // If the file has an extension, it's an asset - let it 404 if not found
    const ext = path.extname(req.path);
    if (ext) {
      // Asset not found, return 404
      console.log("❌ Asset not found:", req.path);
      return res.status(404).send('File not found');
    }
    
    // No extension = SPA route, serve index.html
    const indexPath = path.join(distPath, "index.html");
    console.log("📄 Serving index.html for:", req.path);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("❌ Error serving index.html:", err);
        res.status(500).send("Error loading application");
      }
    });
  });
} else {
  console.log("⚠️ Not serving static files - NODE_ENV:", process.env.NODE_ENV);
}

app.use(errorHandler);

export default app;
