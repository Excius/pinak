import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { CouponService } from "../services/coupon.service.js";

export class CouponController {
  constructor(private couponService: CouponService) {}

  private getAuthenticatedUserId(req: Request, res: Response): string | null {
    const userId = req.user?.id;
    if (!userId) {
      ResponseHandler.unauthorized(res, "Authentication required");
      return null;
    }
    return userId;
  }

  validateCoupon = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { code, cartTotal } = req.body as { code: string; cartTotal: number };
    const result = await this.couponService.validateCoupon(
      code,
      userId,
      cartTotal,
    );

    // Slim down coupon data for public view
    const publicResult = {
      ...result,
      coupon: this.couponService.toPublicCoupon(result.coupon),
    };

    ResponseHandler.success(res, publicResult, "Coupon validated successfully");
  };

  getCoupon = async (req: Request, res: Response) => {
    const { code } = req.params as { code: string };
    const coupon = await this.couponService.getCoupon(code);

    // Slim down coupon data for public view
    const publicCoupon = this.couponService.toPublicCoupon(coupon);

    ResponseHandler.success(res, publicCoupon, "Coupon fetched successfully");
  };

  validateCouponAdmin = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { code, cartTotal } = req.body as { code: string; cartTotal: number };
    const result = await this.couponService.validateCoupon(
      code,
      userId,
      cartTotal,
    );

    ResponseHandler.success(res, result, "Coupon validated successfully (Admin)");
  };

  getCouponAdmin = async (req: Request, res: Response) => {
    const { code } = req.params as { code: string };
    const coupon = await this.couponService.getCoupon(code);
    ResponseHandler.success(res, coupon, "Coupon fetched successfully (Admin)");
  };
}
