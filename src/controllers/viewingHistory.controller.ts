import type { Request, Response, NextFunction } from "express";
import * as ViewingHistoryService from "../services/viewingHistory.service.ts";
import { AppError } from "../types/index.ts";

function getSessionId(req: Request): string {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId || typeof sessionId !== "string") {
    throw new AppError("x-session-id header is required", 400);
  }
  return sessionId;
}

export async function getViewingHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const { limit = "20" } = req.query as Record<string, string>;
    const history = await ViewingHistoryService.getHistory(sessionId, parseInt(limit, 10));
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function addToViewingHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    const { productId } = req.body;

    if (!productId || typeof productId !== "number") {
      throw new AppError("productId is required and must be a number", 400);
    }

    const item = await ViewingHistoryService.addToHistory(sessionId, productId);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function clearViewingHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req);
    await ViewingHistoryService.clearHistory(sessionId);
    res.json({ success: true, message: "Viewing history cleared" });
  } catch (err) {
    next(err);
  }
}
