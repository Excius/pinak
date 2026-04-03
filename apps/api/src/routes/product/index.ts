import { Router } from "express";
import { ProductController } from "../../controllers/product.controller.js";
import { ProductCategoryController } from "../../controllers/productCategory.controller.js";
import { RelatedProductController } from "../../controllers/relatedProduct.controller.js";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ProductCategoryRepository } from "../../repositories/productCategory.repository.js";
import { ProductRepository } from "../../repositories/product.repository.js";
import { RelatedProductRepository } from "../../repositories/relatedProduct.repository.js";
import { ProductCategoryService } from "../../services/productCategory.service.js";
import { ProductService } from "../../services/product.service.js";
import { RelatedProductService } from "../../services/relatedProduct.service.js";
import { registerProductAdminRoutes } from "./admin.routes.js";
import { registerProductPublicRoutes } from "./public.routes.js";

export type ProductRouteDeps = {
  productController: ProductController;
  productCategoryController: ProductCategoryController;
  relatedProductController: RelatedProductController;
  authMiddleware: AuthMiddleware;
  rateLimiter: ReturnType<typeof createRateLimiter>;
};

const router = Router();

const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);

const productRepository = new ProductRepository(prisma);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

const productCategoryRepository = new ProductCategoryRepository(prisma);
const productCategoryService = new ProductCategoryService(
  productCategoryRepository,
);
const productCategoryController = new ProductCategoryController(
  productCategoryService,
);

const relatedProductRepository = new RelatedProductRepository(prisma);
const relatedProductService = new RelatedProductService(
  relatedProductRepository,
);
const relatedProductController = new RelatedProductController(
  relatedProductService,
);

export const deps: ProductRouteDeps = {
  productController,
  productCategoryController,
  relatedProductController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerProductPublicRoutes(router, deps);
registerProductAdminRoutes(router, deps);

export default router;
