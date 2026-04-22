import type { Router } from "express";
import { CartTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { CartRouteDeps } from "./index.js";

export const registerCartPublicRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: CartRouteDeps,
) => {
  router.use(authMiddleware.authenticate);

  router.get(
    "/",
    rateLimiter,
    validateMultiple(CartTypes.GetCart),
    controller.getCart,
  );

  router.post(
    "/items",
    rateLimiter,
    validateMultiple(CartTypes.AddToCart),
    controller.addToCart,
  );

  router.put(
    "/items/:itemId",
    rateLimiter,
    validateMultiple(CartTypes.UpdateCartItem),
    controller.updateCartItem,
  );

  router.delete(
    "/items/:itemId",
    rateLimiter,
    validateMultiple(CartTypes.RemoveCartItem),
    controller.removeCartItem,
  );

  router.delete(
    "/",
    rateLimiter,
    validateMultiple(CartTypes.ClearCart),
    controller.clearCart,
  );
};
