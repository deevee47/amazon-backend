import type { Request, Response, NextFunction } from "express";

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-session-id");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
