import { Request, Response } from "express";
import { ResponseHandler } from "../lib/response.js";
import { OrderService } from "../services/order.service.js";

export class OrderController {
  constructor(private orderService: OrderService) {}

  private getAuthenticatedUserId(req: Request, res: Response): string | null {
    const userId = req.user?.id;
    if (!userId) {
      ResponseHandler.unauthorized(res, "Authentication required");
      return null;
    }
    return userId;
  }

  createOrder = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { 
      couponCode, 
      shippingAddress, 
      billingAddress, 
      shippingAddressId, 
      billingAddressId 
    } = req.body as {
      couponCode?: string;
      shippingAddress?: any;
      billingAddress?: any;
      shippingAddressId?: string;
      billingAddressId?: string;
    };

    const result = await this.orderService.createOrder(userId, {
      couponCode,
      shippingAddress,
      billingAddress,
      shippingAddressId,
      billingAddressId,
    });
    ResponseHandler.success(res, result, "Order created successfully");
  };

  getOrders = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status =
      req.query.status !== undefined ? String(req.query.status) : undefined;
    const paymentStatus =
      req.query.paymentStatus !== undefined
        ? String(req.query.paymentStatus)
        : undefined;

    const result = await this.orderService.getUserOrders(userId, {
      page,
      limit,
      status: status as
        | "PENDING"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED"
        | undefined,
      paymentStatus: paymentStatus as "PENDING" | "COMPLETED" | "FAILED" | undefined,
    });
    ResponseHandler.success(res, result, "Orders fetched successfully");
  };

  getOrderById = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { orderId } = req.params as { orderId: string };
    const order = await this.orderService.getOrderById(userId, orderId);
    ResponseHandler.success(res, order, "Order fetched successfully");
  };

  cancelOrder = async (req: Request, res: Response) => {
    const userId = this.getAuthenticatedUserId(req, res);
    if (!userId) return;

    const { orderId } = req.params as { orderId: string };
    const order = await this.orderService.cancelOrder(userId, orderId);
    ResponseHandler.success(res, order, "Order cancelled successfully");
  };

  listOrdersAdmin = async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status =
      req.query.status !== undefined ? String(req.query.status) : undefined;
    const paymentStatus =
      req.query.paymentStatus !== undefined
        ? String(req.query.paymentStatus)
        : undefined;
    const userId =
      req.query.userId !== undefined ? String(req.query.userId) : undefined;

    const result = await this.orderService.listOrdersAdmin({
      page,
      limit,
      userId,
      status: status as
        | "PENDING"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED"
        | undefined,
      paymentStatus: paymentStatus as "PENDING" | "COMPLETED" | "FAILED" | undefined,
    });
    ResponseHandler.success(res, result, "Orders fetched successfully");
  };

  updateOrderStatusAdmin = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as {
      status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    };
    const order = await this.orderService.updateOrderStatusAdmin(id, status);
    ResponseHandler.success(res, order, "Order status updated successfully");
  };

  updatePaymentStatusAdmin = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { paymentStatus } = req.body as {
      paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
    };
    const order = await this.orderService.updatePaymentStatusAdmin(
      id,
      paymentStatus,
    );
    ResponseHandler.success(res, order, "Payment status updated successfully");
  };

  hardDeleteOrderAdmin = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await this.orderService.hardDeleteOrderAdmin(id);
    ResponseHandler.success(res, {}, "Order permanently deleted");
  };
}
