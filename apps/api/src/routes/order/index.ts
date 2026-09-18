import { Router } from "express";
import appConfig from "../../lib/config.js";
import JWTService from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { CartRepository } from "../../repositories/cart.repository.js";
import { CouponRepository } from "../../repositories/coupon.repository.js";
import { OrderRepository } from "../../repositories/order.repository.js";
import { CouponService } from "../../services/coupon.service.js";
import { OrderService } from "../../services/order.service.js";
import { StockReservationService } from "../../services/stockReservation.service.js";
import { RazorpayPaymentService } from "../../services/payment/RazorpayPaymentService.js";
import { OrderController } from "../../controllers/order.controller.js";
import { AddressRepository } from "../../repositories/address.repository.js";
import { InvoiceService } from "../../services/invoice.service.js";
import { InvoiceController } from "../../controllers/invoice.controller.js";
import { registerOrderPublicRoutes } from "./public.routes.js";
import { registerOrderAdminRoutes } from "./admin.routes.js";

export type OrderRouteDeps = {
  controller: OrderController;
  invoiceController: InvoiceController;
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

const cartRepository = new CartRepository(prisma);
const couponRepository = new CouponRepository(prisma);
const orderRepository = new OrderRepository(prisma);
const addressRepository = new AddressRepository(prisma);

const stockReservationService = new StockReservationService(prisma);
const couponService = new CouponService(couponRepository);
const paymentService = new RazorpayPaymentService();
const invoiceService = new InvoiceService(prisma);
const orderService = new OrderService(
  prisma,
  orderRepository,
  cartRepository,
  stockReservationService,
  couponService,
  paymentService,
  addressRepository,
  invoiceService,
);
const controller = new OrderController(orderService);
const invoiceController = new InvoiceController(invoiceService);

const deps: OrderRouteDeps = {
  controller,
  invoiceController,
  authMiddleware: new AuthMiddleware(jwtService),
  rateLimiter: createRateLimiter(),
};

registerOrderAdminRoutes(router, deps);
registerOrderPublicRoutes(router, deps);

export default router;
