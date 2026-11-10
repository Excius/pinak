import { apiRequest } from "./api";
import type { CouponApi } from "@repo/types";

type ValidateCouponResponse = CouponApi.ResponseTypes["ValidateCoupon"];

export async function validateCoupon(code: string, cartTotal: number) {
  const response = await apiRequest<ValidateCouponResponse>(
    "post",
    "/coupons/validate",
    { code: code.trim(), cartTotal },
  );
  return response;
}
