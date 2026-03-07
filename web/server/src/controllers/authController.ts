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
    const { userId: clerkId } = getAuth(req);

    console.log("🔑 Clerk ID:", clerkId);

    if (!clerkId) {
      console.log("❌ No Clerk ID found - Unauthorized");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let user = await User.findOne({ clerkId });
    console.log("👤 Existing user found:", !!user);

    if (!user) {
      console.log("📡 Fetching user from Clerk...");
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
    }

    console.log("✅ Auth callback successful");
    res.json(user);
  } catch (error) {
    console.error("❌ Auth callback error:", error);
    res.status(500);
    next(error);
  }
}
