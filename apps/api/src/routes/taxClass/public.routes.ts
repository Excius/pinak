import type { Router } from "express";
import { TaxClassTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { TaxClassRouteDeps } from "./index.js";

export const registerTaxClassPublicRoutes = (
  router: Router,
  { controller, rateLimiter }: TaxClassRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(TaxClassTypes.List),
    controller.listPublic,
  );

  router.get(
    "/:id",
    rateLimiter,
    validateMultiple(TaxClassTypes.GetById),
    controller.getPublic,
  );
};
