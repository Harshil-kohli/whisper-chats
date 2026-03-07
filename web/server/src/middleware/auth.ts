import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { User } from "../models/User";
import { requireAuth } from "@clerk/express";

export type AuthRequest = Request & {
  userId?: string;
};

export const protectRoute = [
  requireAuth(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId: clerkId } = getAuth(req);
      console.log("🔐 protectRoute - Clerk ID:", clerkId);

      const user = await User.findOne({ clerkId });
      console.log("👤 protectRoute - User found:", !!user);
      
      if (!user) {
        console.log("❌ protectRoute - User not found in DB for clerkId:", clerkId);
        return res.status(404).json({ message: "User not found" });
      }

      req.userId = user._id.toString();
      console.log("✅ protectRoute - Success, userId:", req.userId);

      next();
    } catch (error) {
      console.error("❌ protectRoute - Error:", error);
      res.status(500);
      next(error);
    }
  },
];
