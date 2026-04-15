import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { WishlistService } from "../services/wishlist.service.js";

export class WishlistController {
  constructor(private service: WishlistService) {}

  private getAuthenticatedUserId(req: Request, res: Response): string | null {
    const userId = req.user?.id;
    if (!userId) {
      ResponseHandler.unauthorized(res, "Authentication required");
      return null;
    }
    return userId;
  }

  getWishlist = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;
    const wishlist = await this.service.getWishlist(userId);
    ResponseHandler.success(res, wishlist, "Wishlist fetched successfully");
  };

  addToWishlist = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;
    const { productVariantId } = req.body as { productVariantId: string };

    const result = await this.service.addToWishlist(userId, productVariantId);
    ResponseHandler.created(res, result, result.message);
  };

  removeFromWishlist = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;
    const { itemId } = req.params as { itemId: string };

    const result = await this.service.removeFromWishlist(userId, itemId);
    ResponseHandler.success(res, {}, result.message);
  };

  clearWishlist = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;
    const result = await this.service.clearWishlist(userId);
    ResponseHandler.success(res, result, result.message);
  };
}
