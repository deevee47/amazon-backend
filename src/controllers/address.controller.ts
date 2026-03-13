import type { Request, Response, NextFunction } from "express";
import * as AddressService from "../services/address.service.ts";
import { AppError } from "../types/index.ts";

function getSessionId(req: Request): string {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId || typeof sessionId !== "string") {
    throw new AppError("x-session-id header is required", 400);
  }
  return sessionId;
}

export async function getAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const data = await AddressService.getAddresses(sessionId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const { fullName, email, mobile, pincode, flat, area, landmark, city, state, country, isDefault } = req.body;

    if (!fullName || typeof fullName !== "string") {
      throw new AppError("fullName is required", 400);
    }

    const address = await AddressService.createAddress(sessionId, {
      fullName, email, mobile, pincode, flat, area, landmark, city, state, country, isDefault,
    });
    res.status(201).json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
}

export async function setDefault(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const id = parseInt(req.params.id!, 10);
    if (isNaN(id)) throw new AppError("Invalid address id", 400);

    const address = await AddressService.setDefault(sessionId, id);
    if (!address) throw new AppError("Address not found", 404);

    res.json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
}
