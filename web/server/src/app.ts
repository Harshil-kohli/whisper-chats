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
  const distPath = path.resolve(__dirname, "../../dist");
  console.log("📁 Serving static files from:", distPath);
  console.log("📁 __dirname:", __dirname);
  console.log("📁 NODE_ENV:", process.env.NODE_ENV);
  console.log("📁 RAILWAY_ENVIRONMENT:", process.env.RAILWAY_ENVIRONMENT);
  
  // Serve static assets with proper MIME types
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, filePath) => {
      // Set correct MIME types for JS modules
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    }
  }));

  // Catch-all route for SPA - ONLY for HTML routes (not assets)
  // This should NOT match files with extensions like .js, .css, .png, etc.
  app.get('*', (req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Skip if it's a file with extension (asset)
    if (path.extname(req.path)) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
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
