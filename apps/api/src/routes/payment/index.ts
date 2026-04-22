import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { createRateLimiter } from "../../lib/rateLimit.js";
import { CartRepository } from "../../repositories/cart.repository.js";
import { CouponRepository } from "../../repositories/coupon.repository.js";
import { OrderRepository } from "../../repositories/order.repository.js";
import { CouponService } from "../../services/coupon.service.js";
import { OrderService } from "../../services/order.service.js";
import { StockReservationService } from "../../services/stockReservation.service.js";
import { MockPaymentService } from "../../services/payment/MockPaymentService.js";
import { PaymentController } from "../../controllers/payment.controller.js";
import { registerPaymentPublicRoutes } from "./public.routes.js";

export type PaymentRouteDeps = {
  controller: PaymentController;
  rateLimiter: ReturnType<typeof createRateLimiter>;
};

const router = Router();

const cartRepository = new CartRepository(prisma);
const couponRepository = new CouponRepository(prisma);
const orderRepository = new OrderRepository(prisma);
const stockReservationService = new StockReservationService(prisma);
const couponService = new CouponService(couponRepository);
const paymentService = new MockPaymentService();
const orderService = new OrderService(
  prisma,
  orderRepository,
  cartRepository,
  stockReservationService,
  couponService,
  paymentService,
);
const controller = new PaymentController(orderService, paymentService);

const deps: PaymentRouteDeps = {
  controller,
  rateLimiter: createRateLimiter(),
};

registerPaymentPublicRoutes(router, deps);

export default router;
