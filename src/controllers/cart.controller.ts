import type { Request, Response, NextFunction } from "express";
import * as CartService from "../services/cart.service.ts";
import { AppError } from "../types/index.ts";

function getSessionId(req: Request): string {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId || typeof sessionId !== "string") {
    throw new AppError("x-session-id header is required", 400);
  }
  return sessionId;
}

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const items = await CartService.getCartItems(sessionId);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const { productId, quantity = 1 } = req.body;

    if (!productId || typeof productId !== "number") {
      throw new AppError("productId is required and must be a number", 400);
    }

    const item = await CartService.upsertCartItem(sessionId, productId, quantity);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const productId = parseInt(req.params.productId!, 10);
    const { quantity } = req.body;

    if (isNaN(productId)) throw new AppError("Invalid productId", 400);
    if (!quantity || typeof quantity !== "number" || quantity < 1) {
      throw new AppError("quantity must be a number >= 1", 400);
    }

    const item = await CartService.updateCartItemQuantity(sessionId, productId, quantity);
    if (!item.length) throw new AppError("Cart item not found", 404);

    res.json({ success: true, data: item[0] });
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const productId = parseInt(req.params.productId!, 10);
    if (isNaN(productId)) throw new AppError("Invalid productId", 400);

    await CartService.removeCartItem(sessionId, productId);
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    await CartService.clearCart(sessionId);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
}
