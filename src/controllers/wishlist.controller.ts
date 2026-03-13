import type { Request, Response, NextFunction } from "express";
import * as WishlistService from "../services/wishlist.service.ts";
import { AppError } from "../types/index.ts";

function getSessionId(req: Request): string {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId || typeof sessionId !== "string") {
    throw new AppError("x-session-id header is required", 400);
  }
  return sessionId;
}

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const items = await WishlistService.getWishlistItems(sessionId);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function toggleWishlistItem(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const { productId } = req.body;

    if (!productId || typeof productId !== "number") {
      throw new AppError("productId is required and must be a number", 400);
    }

    const result = await WishlistService.toggleWishlistItem(sessionId, productId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function clearWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    await WishlistService.clearWishlist(sessionId);
    res.json({ success: true, message: "Wishlist cleared" });
  } catch (err) {
    next(err);
  }
}
