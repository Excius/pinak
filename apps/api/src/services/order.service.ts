import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import { NotFoundError, ValidationError } from "../lib/error.js";
import { CartRepository } from "../repositories/cart.repository.js";
import { AddressRepository } from "../repositories/address.repository.js";
import {
  AdminOrderFilters,
  CreateOrderItemInput,
  OrderFilters,
  OrderRepository,
} from "../repositories/order.repository.js";
import { CouponService } from "./coupon.service.js";
import { StockReservationService } from "./stockReservation.service.js";
import {
  IPaymentGateway,
  PaymentWebhookPayload,
} from "./payment/IPaymentGateway.js";

type AddressInput = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

type CreateOrderInput = {
  couponCode?: string;
  shippingAddress?: AddressInput;
  billingAddress?: AddressInput;
  shippingAddressId?: string;
  billingAddressId?: string;
};

type OrderItemResponse = {
  id: string;
  productId: string | null;
  productVariantId: string | null;
  comboKitId: string | null;
  productName: string;
  variantDetails: Record<string, unknown> | null;
  price: number;
  quantity: number;
  lineTotal: number;
  createdAt: Date;
  updatedAt: Date;
};

type OrderResponse = {
  id: string;
  userId: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  couponCode: string | null;
  couponDiscount: number;
  reservationExpiresAt: Date | null;
  shippingAddress: AddressInput | null;
  billingAddress: AddressInput | null;
  items: OrderItemResponse[];
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
};

type OrderSummaryResponse = Omit<OrderResponse, "items">;

type AdminOrderResponse = OrderResponse & {
  user: {
    id: string;
    email: string;
    username: string;
    name: string | null;
    role: "ADMIN" | "USER" | "MODERATOR";
  };
};

const ORDER_STATUS_VALUES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
const PAYMENT_STATUS_VALUES = ["PENDING", "COMPLETED", "FAILED"] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseAddress = (value: unknown): AddressInput | null => {
  if (!isRecord(value)) return null;
  const fullName = value.fullName;
  const addressLine1 = value.addressLine1;
  const city = value.city;
  const state = value.state;
  const pincode = value.pincode;
  const phone = value.phone;

  if (
    typeof fullName !== "string" ||
    typeof addressLine1 !== "string" ||
    typeof city !== "string" ||
    typeof state !== "string" ||
    typeof pincode !== "string" ||
    typeof phone !== "string"
  ) {
    return null;
  }

  return {
    fullName,
    addressLine1,
    addressLine2:
      typeof value.addressLine2 === "string" || value.addressLine2 === null
        ? value.addressLine2
        : undefined,
    city,
    state,
    pincode,
    phone,
  };
};

export class OrderService {
  constructor(
    private prisma: PrismaClient,
    private orderRepository: OrderRepository,
    private cartRepository: CartRepository,
    private stockReservationService: StockReservationService,
    private couponService: CouponService,
    private paymentService: IPaymentGateway,
    private addressRepository: AddressRepository,
  ) {}

  private parseOrderStatus(status: string): OrderResponse["status"] {
    if (ORDER_STATUS_VALUES.includes(status as OrderResponse["status"])) {
      return status as OrderResponse["status"];
    }
    throw new ValidationError("Invalid order status");
  }

  private parsePaymentStatus(status: string): OrderResponse["paymentStatus"] {
    if (
      PAYMENT_STATUS_VALUES.includes(status as OrderResponse["paymentStatus"])
    ) {
      return status as OrderResponse["paymentStatus"];
    }
    throw new ValidationError("Invalid payment status");
  }

  private mapOrderItem(item: {
    id: string;
    productId: string | null;
    productVariantId: string | null;
    comboKitId: string | null;
    productName: string;
    variantDetails: Prisma.JsonValue | null;
    price: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
  }): OrderItemResponse {
    const variantDetails = isRecord(item.variantDetails)
      ? item.variantDetails
      : null;
    return {
      id: item.id,
      productId: item.productId,
      productVariantId: item.productVariantId,
      comboKitId: item.comboKitId,
      productName: item.productName,
      variantDetails,
      price: item.price,
      quantity: item.quantity,
      lineTotal: item.price * item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapOrder(order: {
    id: string;
    userId: string;
    status: string;
    paymentStatus: string;
    subtotalAmount: number;
    taxAmount: number;
    discountAmount: number;
    shippingAmount: number;
    totalAmount: number;
    couponcode: string | null;
    couponDiscount: number;
    getBreakup: Prisma.JsonValue | null;
    items: Array<{
      id: string;
      productId: string | null;
      productVariantId: string | null;
      comboKitId: string | null;
      productName: string;
      variantDetails: Prisma.JsonValue | null;
      price: number;
      quantity: number;
      createdAt: Date;
      updatedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): OrderResponse {
    const breakup = isRecord(order.getBreakup) ? order.getBreakup : {};
    const shippingAddress = parseAddress(breakup.shippingAddress);
    const billingAddress = parseAddress(breakup.billingAddress);
    const reservationExpiresAtRaw = breakup.reservationExpiresAt;
    const reservationExpiresAt =
      typeof reservationExpiresAtRaw === "string"
        ? new Date(reservationExpiresAtRaw)
        : null;

    const items = order.items.map((item) => this.mapOrderItem(item));
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: order.id,
      userId: order.userId,
      status: this.parseOrderStatus(order.status),
      paymentStatus: this.parsePaymentStatus(order.paymentStatus),
      subtotalAmount: order.subtotalAmount,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      shippingAmount: order.shippingAmount,
      totalAmount: order.totalAmount,
      couponCode: order.couponcode,
      couponDiscount: order.couponDiscount,
      reservationExpiresAt,
      shippingAddress,
      billingAddress,
      items,
      totalItems,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private mapOrderAdmin(order: any): any {
    const publicOrder = this.mapOrder(order);
    return {
      ...publicOrder,
      gstPercentage: order.gstPercentage,
      gstNumber: order.gstNumber,
      getBreakup: order.getBreakup,
      user: order.user,
    };
  }

  private mapOrderSummary(
    order: Parameters<typeof this.mapOrder>[0],
  ): OrderSummaryResponse {
    const mapped = this.mapOrder(order);
    return {
      id: mapped.id,
      userId: mapped.userId,
      status: mapped.status,
      paymentStatus: mapped.paymentStatus,
      subtotalAmount: mapped.subtotalAmount,
      taxAmount: mapped.taxAmount,
      discountAmount: mapped.discountAmount,
      shippingAmount: mapped.shippingAmount,
      totalAmount: mapped.totalAmount,
      couponCode: mapped.couponCode,
      couponDiscount: mapped.couponDiscount,
      reservationExpiresAt: mapped.reservationExpiresAt,
      shippingAddress: mapped.shippingAddress,
      billingAddress: mapped.billingAddress,
      totalItems: mapped.totalItems,
      createdAt: mapped.createdAt,
      updatedAt: mapped.updatedAt,
    };
  }

  async createOrder(userId: string, input: CreateOrderInput) {
    let shippingAddress: AddressInput;
    let billingAddress: AddressInput;

    if (input.shippingAddressId) {
      const addr = await this.addressRepository.findById(
        input.shippingAddressId,
        userId,
      );
      if (!addr) throw new ValidationError("Shipping address not found");
      shippingAddress = {
        fullName: addr.fullName,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        phone: addr.phone,
      };
    } else if (input.shippingAddress) {
      shippingAddress = input.shippingAddress;
    } else {
      throw new ValidationError(
        "shippingAddress or shippingAddressId is required",
      );
    }

    if (input.billingAddressId) {
      const addr = await this.addressRepository.findById(
        input.billingAddressId,
        userId,
      );
      if (!addr) throw new ValidationError("Billing address not found");
      billingAddress = {
        fullName: addr.fullName,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        phone: addr.phone,
      };
    } else if (input.billingAddress) {
      billingAddress = input.billingAddress;
    } else {
      billingAddress = shippingAddress;
    }

    return this.prisma.$transaction(
      async (tx) => {
        const cart = await this.cartRepository.getCartWithItems(userId, tx);
        if (cart.items.length === 0) {
          throw new ValidationError("Cart is empty");
        }

        const reservationRequirements: Array<{
          productVariantId?: string | null;
          comboKitId?: string | null;
          quantity: number;
        }> = [];
        const orderItems: CreateOrderItemInput[] = [];
        const taxBreakdown: Array<{
          label: string;
          rate: number;
          amount: number;
        }> = [];

        let subtotalAmount = 0;
        let taxAmount = 0;
        let shippingRequired = false;

        for (const item of cart.items) {
          if (item.productVariantId && item.productVariant) {
            const variant = item.productVariant;
            const lineSubtotal = variant.price * item.quantity;
            const taxRate = variant.product.taxClass?.rate ?? 0;
            const lineTax = Math.round((lineSubtotal * taxRate) / 100);

            subtotalAmount += lineSubtotal;
            taxAmount += lineTax;
            shippingRequired =
              shippingRequired || variant.product.requiresShipping;

            reservationRequirements.push({
              productVariantId: variant.id,
              quantity: item.quantity,
            });

            orderItems.push({
              orderId: "",
              productId: variant.productId,
              productVariantId: variant.id,
              productName: variant.product.name,
              variantDetails: {
                itemType: "PRODUCT_VARIANT",
                sku: variant.sku,
                ean: variant.ean,
                tags: variant.tags,
                optionValues: variant.optionValues.map((entry) => ({
                  optionName: entry.optionValue.option.name,
                  valueName: entry.optionValue.value,
                })),
              },
              price: variant.price,
              quantity: item.quantity,
            });

            taxBreakdown.push({
              label: variant.product.name,
              rate: taxRate,
              amount: lineTax,
            });

            continue;
          }

          if (item.comboKitId && item.comboKit) {
            const comboKit = item.comboKit;
            const lineSubtotal = comboKit.price * item.quantity;
            subtotalAmount += lineSubtotal;

            const componentSnapshot = comboKit.items.map((comboItem) => {
              if (!comboItem.productVariant) {
                throw new ValidationError("Combo kit contains invalid variant");
              }

              shippingRequired =
                shippingRequired ||
                comboItem.productVariant.product.requiresShipping;

              const componentTaxRate =
                comboItem.productVariant.product.taxClass?.rate ?? 0;
              const componentUnitPrice =
                comboItem.discountedPrice ??
                comboItem.originalPrice ??
                comboItem.productVariant.price;
              const componentSubtotal =
                componentUnitPrice * comboItem.quantity * item.quantity;
              const componentTax = Math.round(
                (componentSubtotal * componentTaxRate) / 100,
              );
              taxAmount += componentTax;

              taxBreakdown.push({
                label: `${comboKit.name} / ${comboItem.productVariant.product.name}`,
                rate: componentTaxRate,
                amount: componentTax,
              });

              return {
                comboItemId: comboItem.id,
                productVariantId: comboItem.productVariantId,
                quantityPerCombo: comboItem.quantity,
                sku: comboItem.productVariant.sku,
              };
            });

            reservationRequirements.push({
              comboKitId: comboKit.id,
              quantity: item.quantity,
            });

            orderItems.push({
              orderId: "",
              comboKitId: comboKit.id,
              productName: comboKit.name,
              variantDetails: {
                itemType: "COMBO_KIT",
                slug: comboKit.slug,
                components: componentSnapshot,
              },
              price: comboKit.price,
              quantity: item.quantity,
            });

            continue;
          }

          throw new ValidationError("Cart contains invalid items");
        }

        let discountAmount = 0;
        let couponCode: string | null = null;

        if (input.couponCode) {
          const couponValidation = await this.couponService.validateCoupon(
            input.couponCode,
            userId,
            subtotalAmount,
            tx,
          );
          discountAmount = couponValidation.discountAmount;
          couponCode = couponValidation.coupon.code;
        }

        const shippingAmount = shippingRequired ? 100 : 0;
        const totalAmount = Math.max(
          0,
          subtotalAmount + taxAmount + shippingAmount - discountAmount,
        );

        const gstPercentage =
          subtotalAmount > 0
            ? Number(((taxAmount / subtotalAmount) * 100).toFixed(2))
            : 0;

        const order = await this.orderRepository.create(
          {
            user: { connect: { id: userId } },
            status: "PENDING",
            paymentStatus: "PENDING",
            subtotalAmount,
            taxAmount,
            discountAmount,
            shippingAmount,
            totalAmount,
            gstPercentage,
            couponcode: couponCode,
            couponDiscount: discountAmount,
            getBreakup: {
              taxBreakdown,
              shippingAddress,
              billingAddress,
            },
          },
          tx,
        );

        const reservation =
          await this.stockReservationService.createReservations(
            order.id,
            reservationRequirements,
            tx,
          );

        const orderItemPayload = orderItems.map((item) => ({
          ...item,
          orderId: order.id,
        }));
        await this.orderRepository.createItems(orderItemPayload, tx);

        if (couponCode) {
          await this.couponService.applyCoupon(
            order.id,
            couponCode,
            userId,
            subtotalAmount,
            tx,
          );
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            getBreakup: {
              taxBreakdown,
              shippingAddress,
              billingAddress,
              reservationExpiresAt: reservation.expiresAt.toISOString(),
            },
          },
        });

        const finalOrder = await this.orderRepository.findByIdWithItems(
          order.id,
          tx,
        );
        if (!finalOrder) {
          throw new NotFoundError("Order not found after creation");
        }

        const payment = await this.paymentService.createPayment({
          orderId: finalOrder.id,
          amount: finalOrder.totalAmount,
        });

        await this.cartRepository.clearCartByUser(userId, tx);

        return {
          order: this.mapOrder(finalOrder),
          payment,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async getUserOrders(userId: string, filters: OrderFilters) {
    const result = await this.orderRepository.findUserOrders(userId, filters);
    return {
      items: result.items.map((order) => this.mapOrderSummary(order)),
      pagination: result.pagination,
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.orderRepository.findByIdWithItemsForUser(
      orderId,
      userId,
    );
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    return this.mapOrder(order);
  }

  async cancelOrder(userId: string, orderId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await this.orderRepository.findByIdWithItemsForUser(
          orderId,
          userId,
          tx,
        );
        if (!order) {
          throw new NotFoundError("Order not found");
        }

        if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
          throw new ValidationError(
            "Order cannot be cancelled in current state",
          );
        }

        if (order.paymentStatus === "COMPLETED") {
          const restockMap = new Map<string, number>();

          for (const item of order.items) {
            if (item.productVariantId) {
              const current = restockMap.get(item.productVariantId) ?? 0;
              restockMap.set(item.productVariantId, current + item.quantity);
              continue;
            }

            if (item.comboKitId && isRecord(item.variantDetails)) {
              const components = item.variantDetails.components;
              if (Array.isArray(components)) {
                for (const component of components) {
                  if (!isRecord(component)) continue;
                  const variantId = component.productVariantId;
                  const quantityPerCombo = component.quantityPerCombo;
                  if (
                    typeof variantId === "string" &&
                    typeof quantityPerCombo === "number"
                  ) {
                    const current = restockMap.get(variantId) ?? 0;
                    restockMap.set(
                      variantId,
                      current + quantityPerCombo * item.quantity,
                    );
                  }
                }
              }
            }
          }

          for (const [productVariantId, quantity] of restockMap.entries()) {
            await tx.productVariant.update({
              where: { id: productVariantId },
              data: { stock: { increment: quantity } },
            });
          }
        } else {
          await this.stockReservationService.releaseReservations(order.id, tx);
        }

        const updated = await this.orderRepository.updateStatusAndPayment(
          order.id,
          "CANCELLED",
          order.paymentStatus === "COMPLETED" ? "COMPLETED" : "FAILED",
          tx,
        );

        return this.mapOrder(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async listOrdersAdmin(filters: AdminOrderFilters) {
    const { items, pagination } =
      await this.orderRepository.findAllOrders(filters);
    return {
      orders: items.map((o) => this.mapOrderAdmin(o)),
      pagination,
    };
  }

  async updateOrderStatusAdmin(
    orderId: string,
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  ) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    const updated = await this.orderRepository.updateStatus(orderId, status);
    return this.mapOrderAdmin(updated);
  }

  async updatePaymentStatusAdmin(
    orderId: string,
    paymentStatus: "PENDING" | "COMPLETED" | "FAILED",
  ) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    const updated = await this.orderRepository.updatePaymentStatus(
      orderId,
      paymentStatus,
    );
    return this.mapOrderAdmin(updated);
  }

  async confirmPayment(orderId: string, paymentData: PaymentWebhookPayload) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await this.orderRepository.findByIdWithItems(orderId, tx);
        if (!order) {
          throw new NotFoundError("Order not found");
        }

        if (order.paymentStatus === "COMPLETED") {
          return this.mapOrder(order);
        }

        if (order.status === "CANCELLED") {
          throw new ValidationError(
            "Cancelled orders cannot be marked as paid",
          );
        }

        await this.stockReservationService.confirmReservations(orderId, tx);
        await this.cartRepository.clearCartByUser(order.userId, tx);

        const existingBreakup = isRecord(order.getBreakup)
          ? order.getBreakup
          : {};
        await tx.order.update({
          where: { id: orderId },
          data: {
            getBreakup: {
              ...existingBreakup,
              payment: {
                paymentId: paymentData.paymentId ?? null,
                status: paymentData.status,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        });

        const updated = await this.orderRepository.updateStatusAndPayment(
          orderId,
          "PROCESSING",
          "COMPLETED",
          tx,
        );

        return this.mapOrder(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async handlePaymentFailure(orderId: string, reason: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await this.orderRepository.findByIdWithItems(orderId, tx);
        if (!order) {
          throw new NotFoundError("Order not found");
        }

        if (order.status === "CANCELLED" && order.paymentStatus === "FAILED") {
          return this.mapOrder(order);
        }

        await this.stockReservationService.releaseReservations(orderId, tx);

        const existingBreakup = isRecord(order.getBreakup)
          ? order.getBreakup
          : {};
        await tx.order.update({
          where: { id: orderId },
          data: {
            getBreakup: {
              ...existingBreakup,
              paymentFailure: {
                reason,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        });

        const updated = await this.orderRepository.updateStatusAndPayment(
          orderId,
          "CANCELLED",
          "FAILED",
          tx,
        );
        return this.mapOrder(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async hardDeleteOrderAdmin(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    return this.orderRepository.hardDelete(orderId);
  }
}
