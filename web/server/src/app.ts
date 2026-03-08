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
    },
    paths: {
      __dirname,
      distPath,
      distExists,
      distFiles: distFiles.slice(0, 10)
    }
  });
});

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
  
  // Serve static assets
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true
  }));

  // Catch-all route for SPA
  app.get("*", (req, res) => {
    const indexPath = path.join(distPath, "index.html");
    console.log("📄 Serving index.html from:", indexPath);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("❌ Error serving index.html:", err);
        res.status(500).send("Error loading application");
      }
    });
  });
}

app.use(errorHandler);

export default app;
