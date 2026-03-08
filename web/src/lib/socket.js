import { create } from "zustand";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: new Set(),
  typingUsers: new Map(), // chatId -> userId
  queryClient: null,

  connect: (token, queryClient) => {
    const existingSocket = get().socket;
    if (existingSocket?.connected || !queryClient) return;

    // disconnect existing socket if any
    if (existingSocket) existingSocket.disconnect();

    const socket = io(SOCKET_URL, { 
      auth: { token },
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
      forceNew: true
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      // Rejoin active chats on reconnection
      const state = get();
      if (state.activeChats) {
        state.activeChats.forEach(chatId => {
          socket.emit("join-chat", chatId);
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    socket.on("socket-error", (error) => {
      console.error("❌ Socket error:", error);
    });

    socket.on("chat-joined", ({ chatId }) => {
      console.log("✅ Joined chat:", chatId);
      set((state) => ({
        activeChats: new Set([...(state.activeChats || []), chatId])
      }));
    });

    socket.on("message-sent", ({ messageId, tempId }) => {
      console.log("✅ Message sent confirmation:", messageId);
      // Replace temp message with real one
      if (tempId) {
        queryClient.setQueriesData({ queryKey: ["messages"] }, (old) => {
          if (!old) return old;
          return old.map((m) => (m._id === tempId ? { ...m, _id: messageId } : m));
        });
      }
    });

    socket.on("online-users", ({ userIds }) => {
      set({ onlineUsers: new Set(userIds) });
    });

    socket.on("user-online", ({ userId }) => {
      set((state) => ({
        onlineUsers: new Set([...state.onlineUsers, userId]),
      }));
    });

    socket.on("user-offline", ({ userId }) => {
      set((state) => {
        const onlineUsers = new Set(state.onlineUsers);
        onlineUsers.delete(userId);
        return { onlineUsers };
      });
    });

    socket.on("typing", ({ userId, chatId, isTyping }) => {
      set((state) => {
        const typingUsers = new Map(state.typingUsers);
        if (isTyping) typingUsers.set(chatId, userId);
        else typingUsers.delete(chatId);
        return { typingUsers };
      });
    });

    socket.on("new-message", (message) => {
      console.log("📨 New message received:", message._id);
      const senderId = message.sender?._id;

      // update messages in current chat, replacing optimistic messages
      queryClient.setQueryData(["messages", message.chat], (old) => {
        if (!old) return [message];
        // remove any optimistic messages (temp IDs) and add the real one
        const filtered = old.filter((m) => !m._id.startsWith("temp-"));
        const exists = filtered.some((m) => m._id === message._id);
        return exists ? filtered : [...filtered, message];
      });

      // update chat's lastMessage directly for instant UI update
      queryClient.setQueryData(["chats"], (oldChats) => {
        return oldChats?.map((chat) => {
          if (chat._id === message.chat) {
            return {
              ...chat,
              lastMessage: {
                _id: message._id,
                text: message.text,
                sender: senderId,
                createdAt: message.createdAt,
              },
              lastMessageAt: message.createdAt,
            };
          }
          return chat;
        });
      });

      // clear typing indicator when message received
      set((state) => {
        const typingUsers = new Map(state.typingUsers);
        typingUsers.delete(message.chat);
        return { typingUsers };
      });
    });

    set({ socket, queryClient, activeChats: new Set() });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        onlineUsers: new Set(),
        typingUsers: new Map(),
        queryClient: null,
        activeChats: new Set(),
      });
    }
  },

  joinChat: (chatId) => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.emit("join-chat", chatId);
    }
  },

  leaveChat: (chatId) => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.emit("leave-chat", chatId);
      set((state) => {
        const activeChats = new Set(state.activeChats);
        activeChats.delete(chatId);
        return { activeChats };
      });
    }
  },

  sendMessage: (chatId, text, currentUser) => {
    const { socket, queryClient } = get();
    if (!socket?.connected || !queryClient) {
      console.error("❌ Cannot send message: socket not connected");
      return;
    }

    // Validate input
    const sanitizedText = text.trim();
    if (!sanitizedText || sanitizedText.length === 0) {
      console.error("❌ Cannot send empty message");
      return;
    }

    if (sanitizedText.length > 5000) {
      console.error("❌ Message too long");
      return;
    }

    // create optimistic message
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      _id: tempId,
      chat: chatId,
      sender: {
        _id: currentUser._id,
        name: currentUser.fullName || currentUser.firstName || "You",
        email: currentUser.primaryEmailAddress?.emailAddress || "",
        avatar: currentUser.imageUrl,
      },
      text: sanitizedText,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    // add optimistic message immediately
    queryClient.setQueryData(["messages", chatId], (old) => {
      if (!old) return [optimisticMessage];
      return [...old, optimisticMessage];
    });

    console.log("📤 Sending message:", tempId);

    // emit to server with acknowledgment callback
    socket.emit("send-message", { chatId, text: sanitizedText, tempId }, (response) => {
      if (response?.success) {
        console.log("✅ Message acknowledged:", response.message?._id);
        // Message will be replaced by new-message event
      } else {
        console.error("❌ Message send failed:", response?.error);
        // Remove optimistic message on failure
        queryClient.setQueryData(["messages", chatId], (old) => {
          if (!old) return [];
          return old.filter((m) => m._id !== tempId);
        });
      }
    });

    // Timeout fallback - remove optimistic message if no response in 10 seconds
    setTimeout(() => {
      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) return [];
        const stillPending = old.find((m) => m._id === tempId && m.pending);
        if (stillPending) {
          console.error("❌ Message send timeout:", tempId);
          return old.filter((m) => m._id !== tempId);
        }
        return old;
      });
    }, 10000);
  },

  setTyping: (chatId, isTyping) => {
    get().socket?.emit("typing", { chatId, isTyping });
  },
}));
