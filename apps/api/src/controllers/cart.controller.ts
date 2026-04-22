import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { CartService } from "../services/cart.service.js";

export class CartController {
  constructor(private cartService: CartService) {}

  private getAuthenticatedUserId(req: Request, res: Response): string | null {
    const userId = req.user?.id;
    if (!userId) {
      ResponseHandler.unauthorized(res, "Authentication required");
      return null;
    }
    return userId;
  }

  getCart = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const cart = await this.cartService.getCart(userId);
    ResponseHandler.success(res, cart, "Cart fetched successfully");
  };

  addToCart = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { productVariantId, comboKitId, quantity } = req.body as {
      productVariantId?: string;
      comboKitId?: string;
      quantity: number;
    };

    const cart = await this.cartService.addToCart(userId, {
      productVariantId,
      comboKitId,
      quantity,
    });
    ResponseHandler.success(res, cart, "Item added to cart successfully");
  };

  updateCartItem = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { itemId } = req.params as { itemId: string };
    const { quantity } = req.body as { quantity: number };

    const cart = await this.cartService.updateCartItem(userId, itemId, quantity);
    ResponseHandler.success(res, cart, "Cart item updated successfully");
  };

  removeCartItem = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { itemId } = req.params as { itemId: string };
    const cart = await this.cartService.removeCartItem(userId, itemId);
    ResponseHandler.success(res, cart, "Cart item removed successfully");
  };

  clearCart = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const cart = await this.cartService.clearCart(userId);
    ResponseHandler.success(res, cart, "Cart cleared successfully");
  };
}
