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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightAdminTypes.ListLength),
    lengthController.listAdmin,
  );

  router.get(
    "/admin/length-classes/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightAdminTypes.GetLengthById),
    lengthController.getAdmin,
  );

  router.get(
    "/admin/weight-classes",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightAdminTypes.ListWeight),
    weightController.listAdmin,
  );

  router.get(
    "/admin/weight-classes/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightAdminTypes.GetWeightById),
    weightController.getAdmin,
  );

  router.post(
    "/length-classes",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightTypes.CreateLength),
    lengthController.create,
  );

  router.put(
    "/length-classes/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightTypes.UpdateLength),
    lengthController.update,
  );

  router.delete(
    "/length-classes/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightTypes.DeleteLength),
    lengthController.delete,
  );

  router.post(
    "/weight-classes",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightTypes.CreateWeight),
    weightController.create,
  );

  router.put(
    "/weight-classes/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightTypes.UpdateWeight),
    weightController.update,
  );

  router.delete(
    "/weight-classes/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(LengthWeightTypes.DeleteWeight),
    weightController.delete,
  );
};
