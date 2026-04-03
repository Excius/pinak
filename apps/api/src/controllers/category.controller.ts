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
    const withChildrenRaw = req.query.withChildren;
    const includeChildren =
      withChildrenRaw === undefined
        ? true
        : String(withChildrenRaw).toLowerCase() === "true";

    const categories = await this.categoryService.listCategories(
      parentId,
      includeChildren,
    );
    ResponseHandler.success(res, categories, "Categories fetched successfully");
  };

  listTopCategories = async (_req: Request, res: Response) => {
    const categories = await this.categoryService.listTopCategories();
    ResponseHandler.success(res, categories, "Top-level categories fetched successfully");
  };

  listTopCategoriesAdmin = async (_req: Request, res: Response) => {
    const categories = await this.categoryService.listTopCategoriesAdmin();
    ResponseHandler.success(res, categories, "Top-level categories fetched successfully");
  };

  getCategoryTree = async (_req: Request, res: Response) => {
    const tree = await this.categoryService.getCategoryTree();
    ResponseHandler.success(res, tree, "Category tree fetched successfully");
  };

  listCategoriesAdmin = async (req: Request, res: Response) => {
    const parentId =
      req.query.parentId !== undefined
        ? (req.query.parentId as string) || null
        : undefined;

    const categories = await this.categoryService.listCategoriesAdmin(parentId);
    ResponseHandler.success(res, categories, "Categories fetched successfully");
  };

  getCategoryTreeAdmin = async (_req: Request, res: Response) => {
    const tree = await this.categoryService.getCategoryTreeAdmin();
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

  // Admin read endpoints (full content)
  getCategoryByIdAdmin = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await this.categoryService.getCategoryByIdAdmin(id);
    ResponseHandler.success(res, category, "Category fetched successfully");
  };

  getCategoryBySlugAdmin = async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const category = await this.categoryService.getCategoryBySlugAdmin(slug);
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

  addCategoryImage = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const data = req.body;

    const image = await this.categoryService.addCategoryImage(
      categoryId as string,
      data,
    );
    ResponseHandler.success(res, image, "Category image added successfully");
  };

  setPrimaryImage = async (req: Request, res: Response) => {
    const { imageId } = req.params;
    const image = await this.categoryService.setPrimaryImage(imageId as string);
    ResponseHandler.success(res, image, "Primary image set successfully");
  };

  softDeleteImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.categoryService.softDeleteImage(id as string);
    ResponseHandler.success(res, {}, "Image deleted successfully");
  };

  restoreImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.categoryService.restoreImage(id as string);
    ResponseHandler.success(res, {}, "Image restored successfully");
  };

  hardDeleteImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.categoryService.hardDeleteImage(id as string);
    ResponseHandler.success(
      res,
      {},
      "Image permanently deleted successfully",
    );
  };
}
