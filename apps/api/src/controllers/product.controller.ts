import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { ProductService } from "../services/product.service.js";
import logger from "../lib/logger.js";
import { ProductPaginationOptions } from "../types/pagination.types.js";
import {
  toPublicProduct,
  toPublicProductList,
  toAdminProduct,
  toAdminProductList,
  toPublicVariant,
} from "../lib/mappers/product.mapper.js";

export class ProductController {
  constructor(private productService: ProductService) {}

  getProducts = async (req: Request, res: Response) => {
    const pagination: ProductPaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      search: req.query.search as string,
      categoryId: req.query.categoryId as string,
      isActive: req.query.isActive ? req.query.isActive === "true" : undefined,
      minPrice: req.query.minPrice
        ? parseInt(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseInt(req.query.maxPrice as string)
        : undefined,
      brand: req.query.brand as string,
      inStock: req.query.inStock ? req.query.inStock === "true" : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
      filterValueIds: req.query.filterValueIds
        ? (req.query.filterValueIds as string).split(",")
        : undefined,
    };

    const products = await this.productService.getProducts(pagination);
    const publicData = toPublicProductList(products);
    ResponseHandler.success(res, publicData, "Products fetched successfully");
  };

  getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.getProductById(id as string);

    if (!product) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    const publicData = toPublicProduct(product);
    ResponseHandler.success(res, publicData, "Product fetched successfully");
  };

  getProductBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const product = await this.productService.getProductBySlug(slug as string);

    if (!product) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    // Increment view count asynchronously (non-blocking)
    this.productService.incrementViewCount(product.id).catch((e) => {
      logger.warn("Failed to increment product viewCount", {
        productId: product.id,
        err: e,
      });
    });

    const publicData = toPublicProduct(product);
    ResponseHandler.success(res, publicData, "Product fetched successfully");
  };

  getProductsWithCategory = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const pagination: ProductPaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      brand: req.query.brand as string,
      inStock: req.query.inStock ? req.query.inStock === "true" : undefined,
      filterValueIds: req.query.filterValueIds
        ? (req.query.filterValueIds as string).split(",")
        : undefined,
    };

    const products = await this.productService.getProductsWithCategory(
      categoryId as string,
      pagination,
    );
    const publicData = toPublicProductList(products);
    ResponseHandler.success(res, publicData, "Products fetched successfully");
  };

  getFeaturedProducts = async (req: Request, res: Response) => {
    const pagination: ProductPaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
    };
    const sectionId = req.query.sectionId as string;

    const products = await this.productService.getFeaturedProducts(
      pagination,
      sectionId,
    );
    const publicData = toPublicProductList(products);
    ResponseHandler.success(
      res,
      publicData,
      "Featured products fetched successfully",
    );
  };

  getFeaturedProductsBySection = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const pagination: ProductPaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
    };

    const products = await this.productService.getFeaturedProductsBySection(
      sectionId as string,
      pagination,
    );
    const publicData = toPublicProductList(products);
    ResponseHandler.success(
      res,
      publicData,
      "Featured products fetched successfully",
    );
  };

  searchProducts = async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const filters = {};

    const products = await this.productService.searchProducts(query, filters);
    const publicData = products.map(toPublicProduct);
    ResponseHandler.success(res, publicData, "Products searched successfully");
  };

  getProductVariants = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const variants = await this.productService.getProductVariants(
      productId as string,
    );
    const publicData = variants.map(toPublicVariant);
    ResponseHandler.success(
      res,
      publicData,
      "Product variants fetched successfully",
    );
  };

  getProductWithDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.getProductWithDetails(
      id as string,
    );

    if (!product) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    const publicData = toPublicProduct(product);
    ResponseHandler.success(
      res,
      publicData,
      "Product details fetched successfully",
    );
  };

  // Admin methods
  getProductByIdAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.getProductByIdAdmin(id as string);

    if (!product) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    const adminData = toAdminProduct(product);
    ResponseHandler.success(res, adminData, "Product fetched successfully");
  };

  getAllProductsAdmin = async (req: Request, res: Response) => {
    const pagination: ProductPaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      search: req.query.search as string,
      brand: req.query.brand as string,
      isActive: req.query.isActive ? req.query.isActive === "true" : undefined,
    };

    const products = await this.productService.getAllProductsAdmin(pagination);
    const adminData = toAdminProductList(products);
    ResponseHandler.success(res, adminData, "Products fetched successfully");
  };

  getDeletedProductsAdmin = async (req: Request, res: Response) => {
    const pagination: ProductPaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const products =
      await this.productService.getDeletedProductsAdmin(pagination);
    const adminData = toAdminProductList(products);
    ResponseHandler.success(
      res,
      adminData,
      "Deleted products fetched successfully",
    );
  };

  getProductsByStatusAdmin = async (req: Request, res: Response) => {
    const status = req.params.status as "ACTIVE" | "INACTIVE";
    const pagination: ProductPaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const products = await this.productService.getProductsByStatusAdmin(
      status,
      pagination,
    );
    const adminData = toAdminProductList(products);
    ResponseHandler.success(res, adminData, "Products fetched successfully");
  };

  createProduct = async (req: Request, res: Response) => {
    const data = req.body;
    const product = await this.productService.createProduct(data);
    const adminData = toAdminProduct(product);
    ResponseHandler.success(res, adminData, "Product created successfully");
  };

  updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const product = await this.productService.updateProduct(id as string, data);
    const adminData = toAdminProduct(product);
    ResponseHandler.success(res, adminData, "Product updated successfully");
  };

  updateProductStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const product = await this.productService.updateProductStatus(
      id as string,
      isActive,
    );
    ResponseHandler.success(
      res,
      product,
      "Product status updated successfully",
    );
  };

  createProductVariant = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const data = req.body;
    const variant = await this.productService.createProductVariant(
      productId as string,
      data,
    );
    ResponseHandler.success(
      res,
      variant,
      "Product variant created successfully",
    );
  };

  updateProductVariant = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const variant = await this.productService.updateProductVariant(
      id as string,
      data,
    );
    ResponseHandler.success(
      res,
      variant,
      "Product variant updated successfully",
    );
  };

  addProductImage = async (req: Request, res: Response) => {
    const { variantId } = req.params;
    const data = req.body;

    // TODO: Implement proper image upload with S3 integration
    // Currently expects image URL to be provided directly
    // Future: Handle multipart/form-data uploads and store in S3

    const image = await this.productService.addProductImage(
      variantId as string,
      data,
    );
    ResponseHandler.success(res, image, "Product image added successfully");
  };

  setPrimaryImage = async (req: Request, res: Response) => {
    const { imageId } = req.params;
    const image = await this.productService.setPrimaryImage(imageId as string);
    ResponseHandler.success(res, image, "Primary image set successfully");
  };

  softDeleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.softDeleteProduct(id as string);
    ResponseHandler.success(res, {}, "Product deleted successfully");
  };

  restoreProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.restoreProduct(id as string);
    ResponseHandler.success(res, {}, "Product restored successfully");
  };

  softDeleteProductVariant = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.softDeleteProductVariant(id as string);
    ResponseHandler.success(res, {}, "Product variant deleted successfully");
  };

  restoreProductVariant = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.restoreProductVariant(id as string);
    ResponseHandler.success(res, {}, "Product variant restored successfully");
  };

  softDeleteImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.softDeleteImage(id as string);
    ResponseHandler.success(res, {}, "Image deleted successfully");
  };

  restoreImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.restoreImage(id as string);
    ResponseHandler.success(res, {}, "Image restored successfully");
  };

  addProductToFeatured = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const { productId } = req.body;
    const featuredProduct = await this.productService.addProductToFeatured(
      sectionId as string,
      productId,
    );
    ResponseHandler.success(
      res,
      featuredProduct,
      "Product added to featured successfully",
    );
  };

  removeProductFromFeatured = async (req: Request, res: Response) => {
    const { featuredProductId } = req.params;
    await this.productService.removeProductFromFeatured(
      featuredProductId as string,
    );
    ResponseHandler.success(
      res,
      {},
      "Product removed from featured successfully",
    );
  };

  getOutOfStockProducts = async (req: Request, res: Response) => {
    const products = await this.productService.getOutOfStockProducts();
    ResponseHandler.success(
      res,
      products,
      "Out of stock products fetched successfully",
    );
  };

  getLowStockProducts = async (req: Request, res: Response) => {
    const threshold = parseInt(req.query.threshold as string) || 10;
    const products = await this.productService.getLowStockProducts(threshold);
    ResponseHandler.success(
      res,
      products,
      "Low stock products fetched successfully",
    );
  };

  updateVariantStock = async (req: Request, res: Response) => {
    const { variantId } = req.params;
    const { newStock } = req.body;
    const variant = await this.productService.updateVariantStock(
      variantId as string,
      newStock,
    );
    ResponseHandler.success(res, variant, "Variant stock updated successfully");
  };

  bulkUpdateVariantStock = async (req: Request, res: Response) => {
    const updates = req.body;
    const variants = await this.productService.bulkUpdateVariantStock(updates);
    ResponseHandler.success(
      res,
      variants,
      "Variant stocks updated successfully",
    );
  };

  hardDeleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.hardDeleteProduct(id as string);
    ResponseHandler.success(
      res,
      {},
      "Product permanently deleted successfully",
    );
  };

  hardDeleteProductVariant = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.hardDeleteProductVariant(id as string);
    ResponseHandler.success(
      res,
      {},
      "Product variant permanently deleted successfully",
    );
  };

  hardDeleteImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.hardDeleteImage(id as string);
    ResponseHandler.success(res, {}, "Image permanently deleted successfully");
  };

  // TODO: Implement bulk product operations
  // - Bulk create products
  // - Bulk update products
  // - Bulk delete products
  // - Bulk import/export products (CSV/Excel)

  // TODO: Implement advanced product search features
  // - Full-text search with Elasticsearch
  // - Search suggestions/autocomplete
  // - Search analytics and popular searches

  // TODO: Implement product analytics
  // - Product view tracking
  // - Purchase analytics
  // - Inventory turnover analysis
  // - Product performance metrics

  // TODO: Implement image management features
  // - Image resizing and optimization
  // - Multiple image formats (WebP, AVIF)
  // - Image CDN integration
  // - Image alt-text generation (AI)
  // - Bulk image operations

  // TODO: Implement product review management
  // - Review moderation
  // - Review analytics
  // - Review response system
  // - Review helpfulness voting

  // TODO: Implement advanced inventory features
  // - Low stock alerts (email/notifications)
  // - Automatic reorder points
  // - Inventory forecasting
  // - Stock movement history

  // TODO: Implement product categorization features
  // - Dynamic category creation/management
  // - Category hierarchies
  // - Category-based analytics
  // - Category SEO optimization

  // TODO: Implement product tagging system
  // - Product tags/labels
  // - Tag-based filtering
  // - Tag analytics
  // - Tag suggestions

  // TODO: Implement product variant enhancements
  // - Variant comparison
  // - Variant recommendations
  // - Variant availability notifications
  // - Variant price history
}
