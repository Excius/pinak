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
    const coupon = await this.couponService.getCoupon(code, true);

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

    ResponseHandler.success(
      res,
      result,
      "Coupon validated successfully (Admin)",
    );
  };

  getCouponAdmin = async (req: Request, res: Response) => {
    const { code } = req.params as { code: string };
    const coupon = await this.couponService.getCoupon(code);
    ResponseHandler.success(res, coupon, "Coupon fetched successfully (Admin)");
  };

  listCouponsAdmin = async (req: Request, res: Response) => {
    // Validated query values are not written back to req.query (read-only in
    // Express), so numbers arrive as strings and must be parsed here.
    const q = req.query as Record<string, string | undefined>;
    const page = Number.parseInt(q.page ?? "", 10);
    const limit = Number.parseInt(q.limit ?? "", 10);
    const data = await this.couponService.listCouponsAdmin({
      page: Number.isFinite(page) && page > 0 ? page : undefined,
      limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : undefined,
      search: q.search,
      isActive: q.isActive,
      deleted: q.deleted,
    });
    ResponseHandler.success(res, data, "Coupons fetched successfully");
  };

  createCouponAdmin = async (req: Request, res: Response) => {
    const coupon = await this.couponService.createCouponAdmin(req.body);
    ResponseHandler.created(res, coupon, "Coupon created successfully");
  };

  updateCouponAdmin = async (req: Request, res: Response) => {
    const coupon = await this.couponService.updateCouponAdmin(
      req.params.id as string,
      req.body,
    );
    ResponseHandler.success(res, coupon, "Coupon updated successfully");
  };

  updateCouponStatusAdmin = async (req: Request, res: Response) => {
    const coupon = await this.couponService.setCouponActiveAdmin(
      req.params.id as string,
      Boolean(req.body.isActive),
    );
    ResponseHandler.success(res, coupon, "Coupon status updated successfully");
  };

  softDeleteCouponAdmin = async (req: Request, res: Response) => {
    await this.couponService.softDeleteCouponAdmin(req.params.id as string);
    ResponseHandler.success(res, null, "Coupon moved to trash");
  };

  restoreCouponAdmin = async (req: Request, res: Response) => {
    await this.couponService.restoreCouponAdmin(req.params.id as string);
    ResponseHandler.success(res, null, "Coupon restored");
  };

  hardDeleteCouponAdmin = async (req: Request, res: Response) => {
    await this.couponService.hardDeleteCouponAdmin(req.params.id as string);
    ResponseHandler.success(res, null, "Coupon permanently deleted");
  };
}
