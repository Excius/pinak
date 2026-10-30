import type { Router } from "express";
import { StoreTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { StoreRouteDeps } from "./index.js";

export const registerStorePublicRoutes = (
  router: Router,
  { storeController, rateLimiter }: StoreRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(StoreTypes.ListStores),
    storeController.listPublic,
  );

  // Register /locations before /:id so Express does not treat "locations" as an id
  router.get(
    "/locations",
    rateLimiter,
    validateMultiple(StoreTypes.GetStoreLocations),
    storeController.getLocationsPublic,
  );

  router.get(
    "/:id",
    rateLimiter,
    validateMultiple(StoreTypes.GetStoreById),
    storeController.getByIdPublic,
  );
};
