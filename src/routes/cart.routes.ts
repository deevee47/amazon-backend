import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.ts";

const router = Router();

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:productId", updateCartItem);
router.delete("/clear", clearCart); // Must be before /:productId
router.delete("/:productId", removeCartItem);

export default router;
