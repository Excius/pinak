import type { Router } from "express";
import type { ProductRouteDeps } from "./route-deps.js";
import { registerProductAdminCategoryRoutes } from "./category.routes.js";
import { registerProductAdminFeaturedRoutes } from "./admin-featured.routes.js";
import { registerProductAdminImageRoutes } from "./admin-image.routes.js";
import { registerProductAdminProductRoutes } from "./admin-product.routes.js";
import { registerProductAdminRelatedRoutes } from "./related.routes.js";
import { registerProductAdminStockRoutes } from "./admin-stock.routes.js";
import { registerProductAdminVariantRoutes } from "./admin-variant.routes.js";

export const registerProductAdminRoutes = (
  router: Router,
  deps: ProductRouteDeps,
) => {
  registerProductAdminProductRoutes(router, deps);
  registerProductAdminVariantRoutes(router, deps);
  registerProductAdminImageRoutes(router, deps);
  registerProductAdminFeaturedRoutes(router, deps);
  registerProductAdminStockRoutes(router, deps);
  registerProductAdminCategoryRoutes(router, deps);
  registerProductAdminRelatedRoutes(router, deps);
};
