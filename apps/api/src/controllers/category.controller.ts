import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { CategoryService } from "../services/category.service.js";

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  listCategories = async (req: Request, res: Response) => {
    const parentId =
      req.query.parentId !== undefined
        ? (req.query.parentId as string) || null
        : undefined;

    const categories = await this.categoryService.listCategories(parentId);
    ResponseHandler.success(res, categories, "Categories fetched successfully");
  };

  getCategoryTree = async (_req: Request, res: Response) => {
    const tree = await this.categoryService.getCategoryTree();
    ResponseHandler.success(res, tree, "Category tree fetched successfully");
  };

  getCategoryById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await this.categoryService.getCategoryById(id);
    ResponseHandler.success(res, category, "Category fetched successfully");
  };

  getCategoryBySlug = async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const category = await this.categoryService.getCategoryBySlug(slug);
    ResponseHandler.success(res, category, "Category fetched successfully");
  };

  createCategory = async (req: Request, res: Response) => {
    const { name, slug, parentId } = req.body as {
      name: string;
      slug?: string;
      parentId?: string;
    };
    const category = await this.categoryService.createCategory({
      name,
      slug,
      parentId,
    });
    ResponseHandler.created(res, category, "Category created successfully");
  };

  updateCategory = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { name, slug, parentId } = req.body as {
      name?: string;
      slug?: string;
      parentId?: string | null;
    };
    const category = await this.categoryService.updateCategory(id, {
      name,
      slug,
      parentId,
    });
    ResponseHandler.success(res, category, "Category updated successfully");
  };

  deleteCategory = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.categoryService.deleteCategory(id);
    ResponseHandler.success(res, {}, "Category deleted successfully");
  };
}
