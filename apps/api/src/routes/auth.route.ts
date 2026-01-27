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
import { MagicLinkService } from "../services/magicLink.service.js";
import { MagicLinkRepository } from "../repositories/magicLink.repository.js";
import { createAuthRateLimiter } from "../lib/rateLimit.js";
import { AuthProviderRepository } from "../repositories/authProvider.repository.js";

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
const magicLinkRepository = new MagicLinkRepository(prisma);
const magicEmail = new MagicLinkService(magicLinkRepository);
const authProvider = new AuthProviderRepository(prisma);
const authService = new AuthService(
  prisma,
  jwtService,
  sessionRepository,
  userRespository,
  magicEmail,
  authProvider,
);
const authController = new AuthController(authService);
const authMiddleware = new AuthMiddleware(jwtService);
const authRateLimiter = createAuthRateLimiter();

// Routes
/**
 * User Registration Route
 */
router.post(
  "/register",
  authRateLimiter,
  validateMultiple(AuthTypes.RegisterUser),
  authController.register,
);

/**
 * User Login Route
 */
router.post(
  "/login",
  authRateLimiter,
  validateMultiple(AuthTypes.LoginUser),
  authController.login,
);

/**
 * Token Refresh Route
 */
router.post(
  "/refresh",
  authRateLimiter,
  validateMultiple(AuthTypes.RefreshToken),
  authController.refresh,
);

/**
 * User Logout Route
 */
router.post(
  "/logout",
  authRateLimiter,
  validateMultiple(AuthTypes.LogoutUser),
  authController.logout,
);

/**
 * Forgot Password Route
 */
router.post(
  "/forgot-password",
  authRateLimiter,
  validateMultiple(AuthTypes.ForgotPassword),
  authController.forgotPassword,
);

/**
 * Email Verification Route
 */
router.post(
  "/verify-email",
  authRateLimiter,
  validateMultiple(AuthTypes.VerifyEmail),
  authController.verifyEmail,
);

/**
 * Verify Password Route
 */
router.post(
  "/verify-password",
  authRateLimiter,
  validateMultiple(AuthTypes.VerifyPassword),
  authController.verifyPassword,
);

/**
 * Google OAuth Routes
 */
router.get(
  "/google",
  authRateLimiter,
  validateMultiple(AuthTypes.GoogleOauth),
  authController.googleOauth,
);

/**
 * Google OAuth Callback Route
 */
router.post(
  "/google/callback",
  authRateLimiter,
  validateMultiple(AuthTypes.GoogleOauthCallback),
  authController.googleOauthCallback,
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

//TODO: Add routes for username and verify-username etc.

export default router;
