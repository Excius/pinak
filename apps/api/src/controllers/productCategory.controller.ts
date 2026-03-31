import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { ProductCategoryService } from "../services/productCategory.service.js";

export class ProductCategoryController {
  constructor(private service: ProductCategoryService) {}

  add = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { categoryId } = req.body;
    const rel = await this.service.addProductToCategory(
      productId as string,
      categoryId as string,
    );
    ResponseHandler.success(res, rel, "Product assigned to category");
  };

  remove = async (req: Request, res: Response) => {
    const { productId, categoryId } = req.params;
    await this.service.removeProductFromCategory(
      productId as string,
      categoryId as string,
    );
    ResponseHandler.success(res, {}, "Product removed from category");
  };

  setCategories = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { categoryIds } = req.body;
    const result = await this.service.setCategoriesForProduct(
      productId as string,
      categoryIds,
    );
    ResponseHandler.success(res, result, "Product categories updated");
  };

  listForProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const list = await this.service.listCategoriesForProduct(
      productId as string,
    );
    ResponseHandler.success(res, list, "Categories for product fetched");
  };
}
