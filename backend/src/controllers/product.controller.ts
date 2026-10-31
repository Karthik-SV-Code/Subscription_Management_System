import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { sendSuccess, sendPaginated } from "../utils/response";

export class ProductController {
  public static async getProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProductService.getProducts(req.query as any);
      sendPaginated(
        res,
        result.products,
        result.pagination,
        "Products retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getProductById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await ProductService.getProductById(req.params.id);
      sendSuccess(res, product, "Product retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async createProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body);
      sendSuccess(res, product, "Product created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  public static async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      sendSuccess(res, product, "Product updated successfully");
    } catch (error) {
      next(error);
    }
  }

  public static async deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProductService.deleteProduct(req.params.id);
      sendSuccess(res, result, `Product '${result.name}' deleted successfully`);
    } catch (error) {
      next(error);
    }
  }
}
