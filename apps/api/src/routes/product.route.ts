import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { ProductRepository } from "../repositories/product.repositoy.js";
import { ProductService } from "../services/product.service.js";
import { prisma } from "../lib/prisma.js";
import { ProductTypes } from "@repo/types";

const router = Router();

// Create service instances
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const productRepository = new ProductRepository(prisma);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

// Public routes
router.get(
  "/",
  rateLimiter,
  validateMultiple(ProductTypes.GetProducts),
  productController.getProducts,
);

router.get(
  "/:id",
  rateLimiter,
  validateMultiple(ProductTypes.GetProductById),
  productController.getProductById,
);

router.get(
  "/slug/:slug",
  rateLimiter,
  validateMultiple(ProductTypes.GetProductBySlug),
  productController.getProductBySlug,
);

router.get(
  "/category/:categoryId",
  rateLimiter,
  validateMultiple(ProductTypes.GetProductsWithCategory),
  productController.getProductsWithCategory,
);

router.get(
  "/featured",
  rateLimiter,
  validateMultiple(ProductTypes.GetFeaturedProducts),
  productController.getFeaturedProducts,
);

router.get(
  "/featured/section/:sectionId",
  rateLimiter,
  validateMultiple(ProductTypes.GetFeaturedProducts),
  productController.getFeaturedProductsBySection,
);

router.get(
  "/search",
  rateLimiter,
  validateMultiple(ProductTypes.SearchProducts),
  productController.searchProducts,
);

router.get(
  "/:productId/variants",
  rateLimiter,
  validateMultiple(ProductTypes.GetProductVariants),
  productController.getProductVariants,
);

router.get(
  "/:id/details",
  rateLimiter,
  validateMultiple(ProductTypes.GetProductById),
  productController.getProductWithDetails,
);

// Admin routes
router.get(
  "/admin/all",
  rateLimiter,
  validateMultiple(ProductTypes.GetAllProductsAdmin),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.getAllProductsAdmin,
);

router.get(
  "/admin/deleted",
  rateLimiter,
  validateMultiple(ProductTypes.GetAllProductsAdmin),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.getDeletedProductsAdmin,
);

router.get(
  "/admin/status/:status",
  rateLimiter,
  validateMultiple(ProductTypes.GetAllProductsAdmin),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.getProductsByStatusAdmin,
);

router.get(
  "/admin/:id",
  rateLimiter,
  validateMultiple(ProductTypes.GetProductById),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.getProductByIdAdmin,
);

router.post(
  "/",
  rateLimiter,
  validateMultiple(ProductTypes.CreateProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.createProduct,
);

router.put(
  "/:id",
  rateLimiter,
  validateMultiple(ProductTypes.UpdateProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.updateProduct,
);

router.patch(
  "/:id/status",
  rateLimiter,
  validateMultiple(ProductTypes.UpdateProductStatus),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.updateProductStatus,
);

router.post(
  "/:productId/variants",
  rateLimiter,
  validateMultiple(ProductTypes.CreateProductVariant),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.createProductVariant,
);

router.put(
  "/variants/:id",
  rateLimiter,
  validateMultiple(ProductTypes.UpdateProductVariant),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.updateProductVariant,
);

router.post(
  "/variants/:variantId/images",
  rateLimiter,
  validateMultiple(ProductTypes.AddProductImage),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.addProductImage,
);

router.patch(
  "/images/:imageId/primary",
  rateLimiter,
  validateMultiple(ProductTypes.SetPrimaryImage),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.setPrimaryImage,
);

router.delete(
  "/:id",
  rateLimiter,
  validateMultiple(ProductTypes.SoftDeleteProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.softDeleteProduct,
);

router.patch(
  "/:id/restore",
  rateLimiter,
  validateMultiple(ProductTypes.RestoreProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.restoreProduct,
);

router.delete(
  "/variants/:id",
  rateLimiter,
  validateMultiple(ProductTypes.SoftDeleteProductVariant),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.softDeleteProductVariant,
);

router.patch(
  "/variants/:id/restore",
  rateLimiter,
  validateMultiple(ProductTypes.RestoreProductVariant),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.restoreProductVariant,
);

router.delete(
  "/images/:id",
  rateLimiter,
  validateMultiple(ProductTypes.SoftDeleteProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.softDeleteImage,
);

router.patch(
  "/images/:id/restore",
  rateLimiter,
  validateMultiple(ProductTypes.RestoreProduct),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.restoreImage,
);

router.post(
  "/featured/:sectionId",
  rateLimiter,
  validateMultiple(ProductTypes.AddProductToFeatured),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.addProductToFeatured,
);

router.delete(
  "/featured/:featuredProductId",
  rateLimiter,
  validateMultiple(ProductTypes.RemoveProductFromFeatured),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.removeProductFromFeatured,
);

router.get(
  "/admin/stock/out-of-stock",
  rateLimiter,
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.getOutOfStockProducts,
);

router.get(
  "/admin/stock/low-stock",
  rateLimiter,
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.getLowStockProducts,
);

router.patch(
  "/variants/:variantId/stock",
  rateLimiter,
  validateMultiple(ProductTypes.UpdateVariantStock),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.updateVariantStock,
);

router.patch(
  "/variants/stock/bulk",
  rateLimiter,
  validateMultiple(ProductTypes.BulkUpdateVariantStock),
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  productController.bulkUpdateVariantStock,
);

// Admin-only hard delete routes
router.delete(
  "/admin/:id/hard",
  rateLimiter,
  validateMultiple(ProductTypes.HardDeleteProduct),
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  productController.hardDeleteProduct,
);

router.delete(
  "/admin/variants/:id/hard",
  rateLimiter,
  validateMultiple(ProductTypes.HardDeleteProductVariant),
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  productController.hardDeleteProductVariant,
);

router.delete(
  "/admin/images/:id/hard",
  rateLimiter,
  validateMultiple(ProductTypes.HardDeleteProduct),
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  productController.hardDeleteImage,
);

// TODO: Implement additional API endpoints
// - POST /bulk (bulk product operations)
// - GET /analytics/:id (product analytics)
// - POST /:id/reviews (product reviews)
// - GET /categories (category management)
// - POST /categories (create category)
// - PUT /categories/:id (update category)
// - POST /import (bulk import)
// - GET /export (bulk export)
// - GET /search/suggestions (search autocomplete)
// - POST /:id/images/upload (multipart image upload)
// - DELETE /:id/images/bulk (bulk image delete)

export default router;
