import { Socket, Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "@clerk/express";
import { Message } from "../models/Message";
import { Chat } from "../models/Chat";
import { User } from "../models/User";

export const onlineUsers: Map<string, string> = new Map();

// Rate limiting: track message counts per user
const messageRateLimits: Map<string, { count: number; resetAt: number }> = new Map();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const limit = messageRateLimits.get(userId);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit (10 messages per 10 seconds)
    messageRateLimits.set(userId, { count: 1, resetAt: now + 10000 });
    return true;
  }

  if (limit.count >= 10) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
};

// Basic XSS protection - escape HTML entities
const sanitizeText = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = [
    "http://localhost:8081",
    "http://localhost:5173",
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  const io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const session = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });

      const clerkId = session.sub;

      const user = await User.findOne({ clerkId });
      if (!user) return next(new Error("User not found"));

      socket.data.userId = user._id.toString();

      next();
    } catch (error: any) {
      next(new Error(error));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });

    onlineUsers.set(userId, socket.id);

    socket.broadcast.emit("user-online", { userId });

    socket.join(`user:${userId}`);

    socket.on("join-chat", async (chatId: string) => {
      try {
        // Verify user is participant before joining
        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId,
        });

        if (chat) {
          socket.join(`chat:${chatId}`);
          socket.emit("chat-joined", { chatId });
        } else {
          socket.emit("socket-error", { message: "Not authorized to join this chat" });
        }
      } catch (error) {
        socket.emit("socket-error", { message: "Failed to join chat" });
      }
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on("send-message", async (data: { chatId: string; text: string; tempId?: string }, callback) => {
      try {
        const { chatId, text, tempId } = data;

        // Rate limiting check
        if (!checkRateLimit(userId)) {
          const error = { message: "Rate limit exceeded. Please slow down." };
          socket.emit("socket-error", error);
          if (callback) callback({ success: false, error: error.message });
          console.log(`⚠️ Rate limit exceeded for user ${userId}`);
          return;
        }

        // Input validation
        if (!chatId || !text || typeof text !== "string") {
          const error = { message: "Invalid message data" };
          socket.emit("socket-error", error);
          if (callback) callback({ success: false, error: error.message });
          return;
        }

        // Sanitize and validate text
        const trimmedText = text.trim();
        if (trimmedText.length === 0) {
          const error = { message: "Message cannot be empty" };
          socket.emit("socket-error", error);
          if (callback) callback({ success: false, error: error.message });
          return;
        }

        if (trimmedText.length > 5000) {
          const error = { message: "Message too long (max 5000 characters)" };
          socket.emit("socket-error", error);
          if (callback) callback({ success: false, error: error.message });
          return;
        }

        // Sanitize text to prevent XSS
        const sanitizedText = sanitizeText(trimmedText);

        // Verify user is participant
        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId,
        });

        if (!chat) {
          const error = { message: "Chat not found or access denied" };
          socket.emit("socket-error", error);
          if (callback) callback({ success: false, error: error.message });
          return;
        }

        // Create message
        const message = await Message.create({
          chat: chatId,
          sender: userId,
          text: sanitizedText,
        });

        // Update chat
        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.save();

        // Populate sender info
        await message.populate("sender", "name email avatar");

        // Emit to chat room
        io.to(`chat:${chatId}`).emit("new-message", message);

        // Emit to all participants (for chat list updates)
        for (const participantId of chat.participants) {
          const participantIdStr = participantId.toString();
          io.to(`user:${participantIdStr}`).emit("new-message", message);
        }

        // Send acknowledgment
        if (callback) {
          callback({ success: true, message });
        } else {
          socket.emit("message-sent", { messageId: message._id, tempId });
        }

        console.log(`✅ Message sent: ${message._id} in chat ${chatId}`);
      } catch (error: any) {
        console.error("❌ Error sending message:", error);
        const errorMsg = { message: "Failed to send message" };
        socket.emit("socket-error", errorMsg);
        if (callback) callback({ success: false, error: errorMsg.message });
      }
    });

    socket.on("typing", async (data: { chatId: string; isTyping: boolean }) => {
      const typingPayload = {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      };

      socket.to(`chat:${data.chatId}`).emit("typing", typingPayload);

      try {
        const chat = await Chat.findById(data.chatId);
        if (chat) {
          const otherParticipantId = chat.participants.find((p: any) => p.toString() !== userId);
          if (otherParticipantId) {
            socket.to(`user:${otherParticipantId}`).emit("typing", typingPayload);
          }
        }
      } catch (error) {
        // silently fail
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user-offline", { userId });
    });
  });

  return io;
};
