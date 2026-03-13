import { Router } from "express";
import {
  getViewingHistory,
  addToViewingHistory,
  clearViewingHistory,
} from "../controllers/viewingHistory.controller.ts";

const router = Router();

router.get("/", getViewingHistory);
router.post("/", addToViewingHistory);
router.delete("/", clearViewingHistory);

export default router;
