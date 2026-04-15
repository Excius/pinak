import type { Router } from "express";
import { WishlistTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { WishlistRouteDeps } from "./index.js";

export const registerWishlistPublicRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: WishlistRouteDeps,
) => {
  router.use(authMiddleware.authenticate);

  router.get(
    "/",
    rateLimiter,
    validateMultiple(WishlistTypes.GetWishlist),
    controller.getWishlist,
  );

  router.post(
    "/items",
    rateLimiter,
    validateMultiple(WishlistTypes.AddToWishlist),
    controller.addToWishlist,
  );

  router.delete(
    "/items/:itemId",
    rateLimiter,
    validateMultiple(WishlistTypes.RemoveFromWishlist),
    controller.removeFromWishlist,
  );

  router.delete(
    "/",
    rateLimiter,
    validateMultiple(WishlistTypes.ClearWishlist),
    controller.clearWishlist,
  );
};
