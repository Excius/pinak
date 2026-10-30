import type { Router } from "express";
import { PageAdminTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { PageRouteDeps } from "./index.js";

export const registerPageAdminRoutes = (
  router: Router,
  { pageController, authMiddleware, rateLimiter }: PageRouteDeps,
) => {
  router.get(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(PageAdminTypes.ListPages),
    pageController.listAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(PageAdminTypes.GetPageById),
    pageController.getByIdAdmin,
  );

  router.post(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(PageAdminTypes.CreatePage),
    pageController.create,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(PageAdminTypes.UpdatePage),
    pageController.update,
  );

  router.delete(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(PageAdminTypes.DeletePage),
    pageController.delete,
  );

  router.patch(
    "/admin/:id/restore",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(PageAdminTypes.RestorePage),
    pageController.restore,
  );
};
