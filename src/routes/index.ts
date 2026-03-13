import { Router } from "express";
import productRoutes from "./product.routes.ts";
import cartRoutes from "./cart.routes.ts";
import orderRoutes from "./order.routes.ts";
import wishlistRoutes from "./wishlist.routes.ts";
import viewingHistoryRoutes from "./viewingHistory.routes.ts";

const router = Router();

router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/history", viewingHistoryRoutes);

export default router;
