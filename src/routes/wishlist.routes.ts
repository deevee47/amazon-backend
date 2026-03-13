import { Router } from "express";
import {
  getWishlist,
  toggleWishlistItem,
  clearWishlist,
} from "../controllers/wishlist.controller.ts";

const router = Router();

router.get("/", getWishlist);
router.post("/", toggleWishlistItem);
router.delete("/", clearWishlist);

export default router;
