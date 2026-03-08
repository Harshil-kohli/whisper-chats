import express from "express";
import path from "path";
import cors from "cors";

import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

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
  res.json({ 
    status: "ok", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasClerkKeys: !!(process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../dist");
  console.log("📁 Serving static files from:", distPath);
  
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

export default app;
