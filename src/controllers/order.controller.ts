import type { Request, Response, NextFunction } from "express";
import * as OrderService from "../services/order.service.ts";
import { AppError } from "../types/index.ts";
import type { PlaceOrderBody } from "../types/index.ts";

export async function placeOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, shippingAddress, paymentMethod, items } = req.body as PlaceOrderBody;

    if (!email) throw new AppError("email is required", 400);
    if (!shippingAddress) throw new AppError("shippingAddress is required", 400);
    if (!shippingAddress.name) throw new AppError("shippingAddress.name is required", 400);
    if (!shippingAddress.phone) throw new AppError("shippingAddress.phone is required", 400);
    if (!shippingAddress.line1) throw new AppError("shippingAddress.line1 is required", 400);
    if (!shippingAddress.city) throw new AppError("shippingAddress.city is required", 400);
    if (!shippingAddress.zip) throw new AppError("shippingAddress.zip is required", 400);
    if (!paymentMethod) throw new AppError("paymentMethod is required", 400);
    if (!["cod", "card", "upi"].includes(paymentMethod)) {
      throw new AppError("paymentMethod must be one of: cod, card, upi", 400);
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("items must be a non-empty array", 400);
    }

    const order = await OrderService.placeOrder({ email, shippingAddress, paymentMethod, items });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export async function getOrderHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.query as { email?: string };
    if (!email) throw new AppError("email query param is required", 400);

    const orders = await OrderService.findOrdersByEmail(email);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) throw new AppError("Order ID is required", 400);

    const order = await OrderService.findOrderById(id);
    if (!order) throw new AppError("Order not found", 404);

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}
