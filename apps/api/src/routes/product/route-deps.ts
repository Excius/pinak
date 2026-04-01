import type { ProductController } from "../../controllers/product.controller.js";
import type { ProductCategoryController } from "../../controllers/productCategory.controller.js";
import type { RelatedProductController } from "../../controllers/relatedProduct.controller.js";
import type { createRateLimiter } from "../../lib/rateLimit.js";
import type { AuthMiddleware } from "../../middlewares/auth.middleware.js";

export type ProductRouteDeps = {
  productController: ProductController;
  productCategoryController: ProductCategoryController;
  relatedProductController: RelatedProductController;
  authMiddleware: AuthMiddleware;
  rateLimiter: ReturnType<typeof createRateLimiter>;
};
