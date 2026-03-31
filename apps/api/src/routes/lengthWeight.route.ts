import { Router } from "express";
import appConfig from "../lib/config.js";
import JWTService from "../lib/jwt.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import {
  LengthClassRepository,
  WeightClassRepository,
} from "../repositories/lengthWeight.repository.js";
import {
  LengthClassService,
  WeightClassService,
} from "../services/lengthWeight.service.js";
import {
  LengthClassController,
  WeightClassController,
} from "../controllers/lengthWeight.controller.js";
import { prisma } from "../lib/prisma.js";
import { LengthWeightTypes } from "@repo/types";

const router = Router();
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const lengthRepo = new LengthClassRepository(prisma);
const weightRepo = new WeightClassRepository(prisma);
const lengthService = new LengthClassService(lengthRepo);
const weightService = new WeightClassService(weightRepo);
const lengthController = new LengthClassController(lengthService);
const weightController = new WeightClassController(weightService);
const rateLimiter = createRateLimiter();
const authMiddleware = new AuthMiddleware(jwtService);

// Length classes
router.get(
  "/length-classes",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(LengthWeightTypes.ListLength),
  lengthController.list,
);
router.get(
  "/length-classes/:id",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(LengthWeightTypes.GetLengthById),
  lengthController.get,
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

// Weight classes
router.get(
  "/weight-classes",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(LengthWeightTypes.ListWeight),
  weightController.list,
);
router.get(
  "/weight-classes/:id",
  authMiddleware.authenticate,
  rateLimiter,
  validateMultiple(LengthWeightTypes.GetWeightById),
  weightController.get,
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

export default router;
