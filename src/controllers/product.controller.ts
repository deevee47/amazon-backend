import type { Request, Response, NextFunction } from "express";
import * as ProductService from "../services/product.service.ts";
import { AppError } from "../types/index.ts";

export async function getAllProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      category,
      search,
      limit = "20",
      offset = "0",
    } = req.query as Record<string, string>;

    const result = await ProductService.findAll({
      category,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id!, 10);
    if (isNaN(id)) throw new AppError("Invalid product ID", 400);

    const product = await ProductService.findById(id);
    if (!product) throw new AppError("Product not found", 404);

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await ProductService.findAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}
