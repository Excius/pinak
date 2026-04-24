import type { Router } from "express";
import { LengthWeightTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ClassesRouteDeps } from "./index.js";

export const registerClassesPublicRoutes = (
  router: Router,
  { lengthController, weightController, rateLimiter }: ClassesRouteDeps,
) => {
  router.get(
    "/length-classes",
    rateLimiter,
    validateMultiple(LengthWeightTypes.ListLength),
    lengthController.listPublic,
  );

  router.get(
    "/length-classes/:id",
    rateLimiter,
    validateMultiple(LengthWeightTypes.GetLengthById),
    lengthController.getPublic,
  );

  router.get(
    "/weight-classes",
    rateLimiter,
    validateMultiple(LengthWeightTypes.ListWeight),
    weightController.listPublic,
  );

  router.get(
    "/weight-classes/:id",
    rateLimiter,
    validateMultiple(LengthWeightTypes.GetWeightById),
    weightController.getPublic,
  );
};
