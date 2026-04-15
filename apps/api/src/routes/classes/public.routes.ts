import type { Router } from "express";
import { LengthWeightTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ClassesRouteDeps } from "./index.js";

export const registerClassesPublicRoutes = (
  router: Router,
  { lengthController, weightController, authMiddleware, rateLimiter }: ClassesRouteDeps,
) => {
  router.get(
    "/length-classes",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(LengthWeightTypes.ListLength),
    lengthController.listPublic,
  );

  router.get(
    "/length-classes/:id",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(LengthWeightTypes.GetLengthById),
    lengthController.getPublic,
  );

  router.get(
    "/weight-classes",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(LengthWeightTypes.ListWeight),
    weightController.listPublic,
  );

  router.get(
    "/weight-classes/:id",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(LengthWeightTypes.GetWeightById),
    weightController.getPublic,
  );
};
