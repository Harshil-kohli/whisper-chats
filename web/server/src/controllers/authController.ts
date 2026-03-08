import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { clerkClient, getAuth } from "@clerk/express";

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    console.log("📝 getMe called - userId:", req.userId);
    const userId = req.userId;

    const user = await User.findById(userId);
    console.log("👤 getMe - User found:", !!user);

    if (!user) {
      console.log("❌ getMe - User not found for userId:", userId);
      res.status(404).json({ message: "User not found" });
      return;
    }

    console.log("✅ getMe - Success:", user.email);
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ getMe - Error:", error);
    res.status(500);
    next(error);
  }
}

export async function authCallback(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("📝 Auth callback called");
    console.log("🔍 Request headers:", JSON.stringify(req.headers, null, 2));
    
    const { userId: clerkId } = getAuth(req);

    console.log("🔑 Clerk ID:", clerkId);

    if (!clerkId) {
      console.log("❌ No Clerk ID found - Unauthorized");
      res.status(401).json({ message: "Unauthorized - No Clerk ID found" });
      return;
    }

    let user = await User.findOne({ clerkId });
    console.log("👤 Existing user found:", !!user);

    if (!user) {
      console.log("📡 Fetching user from Clerk...");
      console.log("🔑 Using Clerk Secret Key:", process.env.CLERK_SECRET_KEY ? "✅ Present" : "❌ Missing");
      
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        console.log("✅ Clerk user fetched:", clerkUser.emailAddresses[0]?.emailAddress);

        user = await User.create({
          clerkId,
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0],
          email: clerkUser.emailAddresses[0]?.emailAddress,
          avatar: clerkUser.imageUrl,
        });
        console.log("✅ New user created:", user.email);
      } catch (clerkError: any) {
        console.error("❌ Clerk API Error:", {
          message: clerkError.message,
          status: clerkError.status,
          clerkTraceId: clerkError.clerkTraceId,
          errors: clerkError.errors
        });
        throw new Error(`Clerk API failed: ${clerkError.message}`);
      }
    }

    console.log("✅ Auth callback successful");
    res.json(user);
  } catch (error: any) {
    console.error("❌ Auth callback error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: error.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
}
