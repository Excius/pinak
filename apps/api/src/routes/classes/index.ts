import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import {
  LengthClassController,
  WeightClassController,
} from "../../controllers/lengthWeight.controller.js";
import {
  LengthClassRepository,
  WeightClassRepository,
} from "../../repositories/lengthWeight.repository.js";
import {
  LengthClassService,
  WeightClassService,
} from "../../services/lengthWeight.service.js";
import { registerClassesAdminRoutes } from "./admin.routes.js";
import { registerClassesPublicRoutes } from "./public.routes.js";

export type ClassesRouteDeps = {
  lengthController: LengthClassController;
  weightController: WeightClassController;
  authMiddleware: AuthMiddleware;
  rateLimiter: ReturnType<typeof createRateLimiter>;
};

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

const deps: ClassesRouteDeps = {
  lengthController,
  weightController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerClassesPublicRoutes(router, deps);
registerClassesAdminRoutes(router, deps);

export default router;
