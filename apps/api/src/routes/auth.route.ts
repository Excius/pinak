import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { prisma } from "../lib/prisma.js";
import JWTService from "../lib/jwt.js";
import { SessionRespository } from "../repositories/session.repository.js";
import appConfig from "../lib/config.js";
import { UserRespository } from "../repositories/user.repository.js";
import { validateMultiple } from "../lib/validation.js";
import { AuthTypes } from "@repo/types";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Create service instances
const jwtService = new JWTService(
  appConfig.JWT_SECRET,
  appConfig.JWT_SECRET,
  appConfig.ACCESS_TOKEN_EXPIRY,
  appConfig.REFRESH_TOKEN_EXPIRY,
);
const sessionRepository = new SessionRespository(prisma);
const userRespository = new UserRespository(prisma);
const authService = new AuthService(
  prisma,
  jwtService,
  sessionRepository,
  userRespository,
);
const authController = new AuthController(authService);
const authMiddleware = new AuthMiddleware(jwtService);

// Routes
/**
 * User Registration Route
 */
router.post(
  "/register",
  validateMultiple(AuthTypes.RegisterUser),
  authController.register,
);

/**
 * User Login Route
 */
router.post(
  "/login",
  validateMultiple(AuthTypes.LoginUser),
  authController.login,
);

/**
 * Token Refresh Route
 */
router.post(
  "/refresh",
  validateMultiple(AuthTypes.RefreshToken),
  authController.refresh,
);

/**
 * User Logout Route
 */
router.post(
  "/logout",
  validateMultiple(AuthTypes.LogoutUser),
  authController.logout,
);

/**
 * Get Current User Route
 */
router.get(
  "/me",
  validateMultiple(AuthTypes.Me),
  authMiddleware.authenticate,
  authController.me,
);

export default router;
