import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { prisma } from "../lib/prisma.js";
import JWTService from "../lib/jwt.js";
import { SessionRespository } from "../repositories/session.repository.js";
import appConfig from "../lib/config.js";

const router = Router();

// Create service instances
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const sessionRepository = new SessionRespository(prisma);
const authService = new AuthService(prisma, jwtService, sessionRepository);
const authController = new AuthController(authService);

// Routes
router.post("/refresh", authController.refresh);

export default router;
