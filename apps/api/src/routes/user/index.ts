import { Router } from "express";
import { UserAdminTypes } from "@repo/types";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { validateMultiple } from "../../lib/validation.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { UserRespository } from "../../repositories/user.repository.js";
import { AdminUserService } from "../../services/adminUser.service.js";
import { AdminUserController } from "../../controllers/adminUser.controller.js";

const router = Router();

const authMiddleware = new AuthMiddleware(
  new JWTService(
    appConfig.JWT_SECRET,
    appConfig.JWT_SECRET,
    appConfig.ACCESS_TOKEN_EXPIRY,
    appConfig.REFRESH_TOKEN_EXPIRY,
  ),
);
const rateLimiter = createRateLimiter();
const controller = new AdminUserController(
  new AdminUserService(prisma, new UserRespository(prisma)),
);

// Directory of customers and staff for the admin panel
router.get(
  "/admin",
  rateLimiter,
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  validateMultiple(UserAdminTypes.ListUsers),
  controller.list,
);

router.get(
  "/admin/:id",
  rateLimiter,
  authMiddleware.authenticate,
  authMiddleware.requireModeratorOrAdmin,
  validateMultiple(UserAdminTypes.GetUser),
  controller.getById,
);

// Changing an account's access is an admin-only action (moderators can only view)
router.patch(
  "/admin/:id/status",
  rateLimiter,
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  validateMultiple(UserAdminTypes.UpdateUserStatus),
  controller.updateStatus,
);

router.delete(
  "/admin/:id",
  rateLimiter,
  authMiddleware.authenticate,
  authMiddleware.requireAdmin,
  validateMultiple(UserAdminTypes.DeleteUser),
  controller.remove,
);

export default router;
