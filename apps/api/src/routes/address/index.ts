import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { AddressRepository } from "../../repositories/address.repository.js";
import { AddressService } from "../../services/address.service.js";
import { AddressController } from "../../controllers/address.controller.js";
import { registerAddressPublicRoutes } from "./public.routes.js";

export type AddressRouteDeps = {
  controller: AddressController;
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

const repository = new AddressRepository(prisma);
const service = new AddressService(repository);
const controller = new AddressController(service);

const deps: AddressRouteDeps = {
  controller,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerAddressPublicRoutes(router, deps);

export default router;
