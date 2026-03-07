import app from "./src/app";
import { connectDB } from "./src/config/database";
import { createServer } from "http";
import { initializeSocket } from "./src/utils/socket";

console.log("🔧 Environment check:");
console.log("- PORT:", process.env.PORT || 3000);
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Missing");
console.log("- CLERK_PUBLISHABLE_KEY:", process.env.CLERK_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing");
console.log("- CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "✅ Set" : "❌ Missing");

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

initializeSocket(httpServer);

connectDB()
  .then(() => {
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log("Server is running on PORT:", PORT);
      console.log("Server is accessible at:");
      console.log("  - http://localhost:3000");
      console.log("  - http://192.168.1.105:3000");
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
