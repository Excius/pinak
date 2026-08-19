import type { Router } from "express";
import type { ProductRouteDeps } from "./index.js";
import { registerProductAdminCategoryRoutes } from "./category.routes.js";
import { registerProductAdminFeaturedRoutes } from "./admin-featured.routes.js";
import { registerProductAdminImageRoutes } from "./admin-image.routes.js";
import { registerProductAdminProductRoutes } from "./admin-product.routes.js";
import { registerProductAdminRelatedRoutes } from "./related.routes.js";
import { registerProductAdminStockRoutes } from "./admin-stock.routes.js";
import { registerProductAdminVariantRoutes } from "./admin-variant.routes.js";
import { registerProductAdminBestSellerRoutes } from "./admin-bestseller.routes.js";

export const registerProductAdminRoutes = (
  router: Router,
  deps: ProductRouteDeps,
) => {
  registerProductAdminBestSellerRoutes(router, deps);
  registerProductAdminProductRoutes(router, deps);
  registerProductAdminVariantRoutes(router, deps);
  registerProductAdminImageRoutes(router, deps);
  registerProductAdminFeaturedRoutes(router, deps);
  registerProductAdminStockRoutes(router, deps);
  registerProductAdminCategoryRoutes(router, deps);
  registerProductAdminRelatedRoutes(router, deps);
};
