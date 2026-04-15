import type { Router } from "express";
import { FilterAdminTypes, FilterTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { FilterRouteDeps } from "./index.js";

export const registerFilterAdminRoutes = (
  router: Router,
  { filterController, authMiddleware, rateLimiter }: FilterRouteDeps,
) => {
  // Admin read endpoints (full payloads)
  router.get(
    "/admin/groups",
    rateLimiter,
    validateMultiple(FilterAdminTypes.ListGroups),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.listGroupsAdmin,
  );

  router.get(
    "/admin/groups/:id",
    rateLimiter,
    validateMultiple(FilterAdminTypes.GetGroupById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.getGroupAdmin,
  );

  // Admin write endpoints
  router.post(
    "/groups",
    rateLimiter,
    validateMultiple(FilterTypes.CreateGroup),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.createGroup,
  );

  router.put(
    "/groups/:id",
    rateLimiter,
    validateMultiple(FilterTypes.UpdateGroup),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.updateGroup,
  );

  router.delete(
    "/groups/:id",
    rateLimiter,
    validateMultiple(FilterTypes.DeleteGroup),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.deleteGroup,
  );

  router.post(
    "/groups/:groupId/values",
    rateLimiter,
    validateMultiple(FilterTypes.CreateValue),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.createValue,
  );

  router.put(
    "/values/:id",
    rateLimiter,
    validateMultiple(FilterTypes.UpdateValue),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.updateValue,
  );

  router.delete(
    "/values/:id",
    rateLimiter,
    validateMultiple(FilterTypes.DeleteValue),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.deleteValue,
  );

  router.post(
    "/products/:productId/values/:filterValueId",
    rateLimiter,
    validateMultiple(FilterTypes.AddFilterToProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.addFilterToProduct,
  );

  router.delete(
    "/products/:productId/values/:filterValueId",
    rateLimiter,
    validateMultiple(FilterTypes.RemoveFilterFromProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    filterController.removeFilterFromProduct,
  );
};
