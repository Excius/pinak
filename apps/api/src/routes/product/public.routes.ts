import type { Router } from "express";
import type { ProductRouteDeps } from "./index.js";
import { registerProductPublicCategoryRoutes } from "./category.routes.js";
import { registerProductPublicFeaturedRoutes } from "./public-featured.routes.js";
import { registerProductPublicProductRoutes } from "./public-product.routes.js";
import { registerProductPublicRelatedRoutes } from "./related.routes.js";
import { registerProductPublicVariantRoutes } from "./public-variant.routes.js";

export const registerProductPublicRoutes = (
  router: Router,
  deps: ProductRouteDeps,
) => {
  registerProductPublicFeaturedRoutes(router, deps);
  registerProductPublicVariantRoutes(router, deps);
  registerProductPublicCategoryRoutes(router, deps);
  registerProductPublicRelatedRoutes(router, deps);
  registerProductPublicProductRoutes(router, deps);
};
