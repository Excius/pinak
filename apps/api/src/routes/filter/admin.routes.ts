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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterAdminTypes.ListGroups),
    filterController.listGroupsAdmin,
  );

  router.get(
    "/admin/groups/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterAdminTypes.GetGroupById),
    filterController.getGroupAdmin,
  );

  // Admin write endpoints
  router.post(
    "/groups",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterTypes.CreateGroup),
    filterController.createGroup,
  );

  router.put(
    "/groups/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterTypes.UpdateGroup),
    filterController.updateGroup,
  );

  router.delete(
    "/groups/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterTypes.DeleteGroup),
    filterController.deleteGroup,
  );

  router.post(
    "/groups/:groupId/values",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterTypes.CreateValue),
    filterController.createValue,
  );

  router.put(
    "/values/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterTypes.UpdateValue),
    filterController.updateValue,
  );

  router.delete(
    "/values/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterTypes.DeleteValue),
    filterController.deleteValue,
  );

  router.post(
    "/variants/:variantId/values/:filterValueId",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterTypes.AddFilterToVariant),
    filterController.addFilterToVariant,
  );

  router.delete(
    "/variants/:variantId/values/:filterValueId",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FilterTypes.RemoveFilterFromVariant),
    filterController.removeFilterFromVariant,
  );
};
