import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  getCategories,
} from "../controllers/product.controller.ts";

const router = Router();

router.get("/", getAllProducts);
router.get("/categories", getCategories); // Must be before /:id
router.get("/:id", getProductById);

export default router;
