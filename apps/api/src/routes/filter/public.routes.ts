import type { Router } from "express";
import { FilterTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { FilterRouteDeps } from "./index.js";

export const registerFilterPublicRoutes = (
  router: Router,
  { filterController, rateLimiter }: FilterRouteDeps,
) => {
  router.get(
    "/groups",
    rateLimiter,
    validateMultiple(FilterTypes.ListGroups),
    filterController.listGroupsPublic,
  );

  router.get(
    "/groups/:id",
    rateLimiter,
    validateMultiple(FilterTypes.GetGroupById),
    filterController.getGroupPublic,
  );
};
