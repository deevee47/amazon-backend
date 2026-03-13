import { Router } from "express";
import {
  placeOrder,
  getOrderHistory,
  getOrderById,
} from "../controllers/order.controller.ts";

const router = Router();

router.post("/", placeOrder);
router.get("/", getOrderHistory);
router.get("/:id", getOrderById);

export default router;
