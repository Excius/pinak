import type { Router } from "express";
import { PageTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { PageRouteDeps } from "./index.js";

export const registerPagePublicRoutes = (
  router: Router,
  { pageController, rateLimiter }: PageRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(PageTypes.ListPages),
    pageController.listPublic,
  );

  router.get(
    "/:slug",
    rateLimiter,
    validateMultiple(PageTypes.GetPageBySlug),
    pageController.getBySlugPublic,
  );
};
