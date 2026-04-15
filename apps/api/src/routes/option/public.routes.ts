import type { Router } from "express";
import { OptionTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { OptionRouteDeps } from "./index.js";

export const registerOptionPublicRoutes = (
  router: Router,
  { optionController, rateLimiter }: OptionRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(OptionTypes.ListOptions),
    optionController.listPublic,
  );

  router.get(
    "/:id",
    rateLimiter,
    validateMultiple(OptionTypes.GetOptionById),
    optionController.getByIdPublic,
  );
};
