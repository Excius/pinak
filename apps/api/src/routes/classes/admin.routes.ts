import type { Router } from "express";
import { LengthWeightAdminTypes, LengthWeightTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ClassesRouteDeps } from "./index.js";

export const registerClassesAdminRoutes = (
  router: Router,
  { lengthController, weightController, authMiddleware, rateLimiter }: ClassesRouteDeps,
) => {
  router.get(
    "/admin/length-classes",
    rateLimiter,
    validateMultiple(LengthWeightAdminTypes.ListLength),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    lengthController.listAdmin,
  );

  router.get(
    "/admin/length-classes/:id",
    rateLimiter,
    validateMultiple(LengthWeightAdminTypes.GetLengthById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    lengthController.getAdmin,
  );

  router.get(
    "/admin/weight-classes",
    rateLimiter,
    validateMultiple(LengthWeightAdminTypes.ListWeight),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    weightController.listAdmin,
  );

  router.get(
    "/admin/weight-classes/:id",
    rateLimiter,
    validateMultiple(LengthWeightAdminTypes.GetWeightById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    weightController.getAdmin,
  );

  router.post(
    "/length-classes",
    rateLimiter,
    validateMultiple(LengthWeightTypes.CreateLength),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    lengthController.create,
  );

  router.put(
    "/length-classes/:id",
    rateLimiter,
    validateMultiple(LengthWeightTypes.UpdateLength),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    lengthController.update,
  );

  router.delete(
    "/length-classes/:id",
    rateLimiter,
    validateMultiple(LengthWeightTypes.DeleteLength),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    lengthController.delete,
  );

  router.post(
    "/weight-classes",
    rateLimiter,
    validateMultiple(LengthWeightTypes.CreateWeight),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    weightController.create,
  );

  router.put(
    "/weight-classes/:id",
    rateLimiter,
    validateMultiple(LengthWeightTypes.UpdateWeight),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    weightController.update,
  );

  router.delete(
    "/weight-classes/:id",
    rateLimiter,
    validateMultiple(LengthWeightTypes.DeleteWeight),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    weightController.delete,
  );
};
