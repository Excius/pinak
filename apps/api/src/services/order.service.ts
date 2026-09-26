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
  invoiceNumber?: string | null;
  invoiceDate?: Date | null;
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
  const fullName = typeof value.fullName === "string" ? value.fullName.trim() : "";
  const addressLine1 = typeof value.addressLine1 === "string" ? value.addressLine1.trim() : "";
  const city = typeof value.city === "string" ? value.city.trim() : "";
  const state = typeof value.state === "string" ? value.state.trim() : "";
  const pincode = typeof value.pincode === "string" ? value.pincode.trim() : "";
  const phone = typeof value.phone === "string" ? value.phone.trim() : "";

  if (
    !fullName ||
    !addressLine1 ||
    !city ||
    !state ||
    !/^\d{6}$/.test(pincode) ||
    !/^\d{10}$/.test(phone)
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

import { InvoiceService } from "./invoice.service.js";

export class OrderService {
  constructor(
    private prisma: PrismaClient,
    private orderRepository: OrderRepository,
    private cartRepository: CartRepository,
    private stockReservationService: StockReservationService,
    private couponService: CouponService,
    private paymentService: IPaymentGateway,
    private addressRepository: AddressRepository,
    private invoiceService?: InvoiceService,
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
    invoiceNumber?: string | null;
    invoiceDate?: Date | null;
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
      invoiceNumber: order.invoiceNumber ?? null,
      invoiceDate: order.invoiceDate ?? null,
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

    const MAX_RETRIES = 5;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await this.prisma.$transaction(
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

            type ParsedCartItem = {
              item: typeof cart.items[0];
              lineSubtotal: number;
              taxRate: number;
              label: string;
              itemType: "PRODUCT_VARIANT" | "COMBO_KIT";
              variant?: any;
              comboKit?: any;
              componentSnapshot?: any;
            };

            const parsedItems: ParsedCartItem[] = [];
            let subtotalAmount = 0;
            let shippingRequired = false;

            for (const item of cart.items) {
              if (item.productVariantId && item.productVariant) {
                const variant = item.productVariant;
                const lineSubtotal = variant.price * item.quantity;
                const taxRate = variant.product.taxClass?.rate ?? 0;

                subtotalAmount += lineSubtotal;
                shippingRequired = shippingRequired || variant.product.requiresShipping;

                parsedItems.push({
                  item,
                  lineSubtotal,
                  taxRate,
                  label: variant.product.name,
                  itemType: "PRODUCT_VARIANT",
                  variant,
                });

                reservationRequirements.push({
                  productVariantId: variant.id,
                  quantity: item.quantity,
                });

                continue;
              }

              if (item.comboKitId && item.comboKit) {
                const comboKit = item.comboKit;
                const lineSubtotal = comboKit.price * item.quantity;
                subtotalAmount += lineSubtotal;

                const maxTaxRate = Math.max(
                  0,
                  ...comboKit.items.map(
                    (comboItem) => comboItem.productVariant?.product?.taxClass?.rate ?? 0
                  )
                );

                const componentSnapshot = comboKit.items.map((comboItem) => {
                  if (!comboItem.productVariant) {
                    throw new ValidationError("Combo kit contains invalid variant");
                  }

                  shippingRequired =
                    shippingRequired ||
                    comboItem.productVariant.product.requiresShipping;

                  return {
                    comboItemId: comboItem.id,
                    productVariantId: comboItem.productVariantId,
                    quantityPerCombo: comboItem.quantity,
                    sku: comboItem.productVariant.sku,
                  };
                });

                parsedItems.push({
                  item,
                  lineSubtotal,
                  taxRate: maxTaxRate,
                  label: comboKit.name,
                  itemType: "COMBO_KIT",
                  comboKit,
                  componentSnapshot,
                });

                reservationRequirements.push({
                  comboKitId: comboKit.id,
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

            // Pro-rata discount allocation across items for GST compliance (CGST Act Sec 15(3))
            const itemDiscounts: number[] = parsedItems.map(() => 0);
            if (discountAmount > 0 && subtotalAmount > 0) {
              let allocatedSum = 0;
              let maxSubtotalIndex = 0;
              let maxSubtotalValue = -1;

              parsedItems.forEach((pItem, idx) => {
                if (pItem.lineSubtotal > maxSubtotalValue) {
                  maxSubtotalValue = pItem.lineSubtotal;
                  maxSubtotalIndex = idx;
                }
                const alloc = Math.round((pItem.lineSubtotal / subtotalAmount) * discountAmount);
                itemDiscounts[idx] = alloc;
                allocatedSum += alloc;
              });

              // Adjust any rounding residue (1-2 paise) on the item with highest subtotal
              const residue = discountAmount - allocatedSum;
              if (residue !== 0) {
                itemDiscounts[maxSubtotalIndex] = (itemDiscounts[maxSubtotalIndex] ?? 0) + residue;
              }
            }

            let taxAmount = 0;
            const taxBreakdown: Array<{
              label: string;
              rate: number;
              taxableValue: number;
              discountAmount: number;
              amount: number;
            }> = [];

            parsedItems.forEach((pItem, idx) => {
              const allocatedDisc = itemDiscounts[idx] ?? 0;
              const netTaxable = Math.max(0, pItem.lineSubtotal - allocatedDisc);
              const lineTax = Math.round((netTaxable * pItem.taxRate) / 100);

              taxAmount += lineTax;

              taxBreakdown.push({
                label: pItem.label,
                rate: pItem.taxRate,
                taxableValue: netTaxable,
                discountAmount: allocatedDisc,
                amount: lineTax,
              });

              if (pItem.itemType === "PRODUCT_VARIANT") {
                const variant = pItem.variant;
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
                    optionValues: variant.optionValues.map((entry: any) => ({
                      optionName: entry.optionValue.option.name,
                      valueName: entry.optionValue.value,
                    })),
                  },
                  price: variant.price,
                  quantity: pItem.item.quantity,
                });
              } else {
                const comboKit = pItem.comboKit;
                orderItems.push({
                  orderId: "",
                  comboKitId: comboKit.id,
                  productName: comboKit.name,
                  variantDetails: {
                    itemType: "COMBO_KIT",
                    slug: comboKit.slug,
                    components: pItem.componentSnapshot,
                  },
                  price: comboKit.price,
                  quantity: pItem.item.quantity,
                });
              }
            });

            // If shipping is required, charge 10000 paise (₹100)
            const shippingAmount = shippingRequired ? 10000 : 0;
            const netSubtotal = Math.max(0, subtotalAmount - discountAmount);
            const totalAmount = Math.max(0, netSubtotal + taxAmount + shippingAmount);

            const gstPercentage =
              netSubtotal > 0
                ? Number(((taxAmount / netSubtotal) * 100).toFixed(2))
                : 0;

            const invoiceNumber = this.invoiceService
              ? await this.invoiceService.generateInvoiceNumber(tx)
              : undefined;
            const invoiceDate = invoiceNumber ? new Date() : undefined;

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
                invoiceNumber,
                invoiceDate,
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

            // Store the Razorpay order ID
            await tx.order.update({
              where: { id: finalOrder.id },
              data: { gatewayOrderId: payment.id },
            });

            await this.cartRepository.clearCartByUser(userId, tx);

            return {
              order: this.mapOrder(finalOrder),
              payment,
            };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error: any) {
        const isUniqueInvoiceError =
          error?.code === "P2002" &&
          (JSON.stringify(error?.meta ?? "").includes("invoiceNumber") ||
            String(error?.message ?? "").includes("Order_invoiceNumber_key") ||
            error?.meta?.modelName === "Order");
        const isSerializationError = error?.code === "P2034";

        if ((isUniqueInvoiceError || isSerializationError) && attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));
          continue;
        }

        throw error;
      }
    }
    throw new ValidationError("Failed to process order due to high concurrency. Please try again.");
  }

  private async checkAndExpireOrderIfNeed(order: {
    id: string;
    status: string;
    paymentStatus: string;
    getBreakup: Prisma.JsonValue | null;
  }) {
    if (order.status === "PENDING" && order.paymentStatus === "PENDING") {
      const breakup = isRecord(order.getBreakup) ? order.getBreakup : {};
      const reservationExpiresAtRaw = breakup.reservationExpiresAt;
      if (typeof reservationExpiresAtRaw === "string") {
        const expiresAt = new Date(reservationExpiresAtRaw);
        if (!isNaN(expiresAt.getTime()) && expiresAt < new Date()) {
          try {
            await this.stockReservationService.releaseReservations(order.id);
            await this.orderRepository.updateStatusAndPayment(
              order.id,
              "CANCELLED",
              "FAILED",
            );
            order.status = "CANCELLED";
            order.paymentStatus = "FAILED";
          } catch {}
        }
      }
    }
  }

  async getUserOrders(userId: string, filters: OrderFilters) {
    const result = await this.orderRepository.findUserOrders(userId, filters);
    for (const order of result.items) {
      await this.checkAndExpireOrderIfNeed(order);
    }
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
    await this.checkAndExpireOrderIfNeed(order);
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
    for (const order of items) {
      await this.checkAndExpireOrderIfNeed(order);
    }
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

        const isReserved = await this.stockReservationService.isReservationActive(orderId);
        if (!isReserved) {
          let refundIssued = false;
          if (paymentData.paymentId && this.paymentService.refundPayment) {
            try {
              await this.paymentService.refundPayment(
                paymentData.paymentId,
                order.totalAmount,
                "Stock reservation expired",
              );
              refundIssued = true;
            } catch (refundErr) {
              console.error("Auto-refund error for expired order:", refundErr);
            }
          }

          const existingBreakup = isRecord(order.getBreakup) ? order.getBreakup : {};
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: "CANCELLED",
              paymentStatus: refundIssued ? "COMPLETED" : "FAILED",
              getBreakup: {
                ...existingBreakup,
                paymentRefund: {
                  refunded: refundIssued,
                  reason: "Stock reservation expired",
                  updatedAt: new Date().toISOString(),
                },
              },
            },
          });

          throw new ValidationError(
            refundIssued
              ? "Stock reservation for this order expired. Your payment has been automatically refunded."
              : "Stock reservation for this order has expired. Payment cannot be processed.",
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

  async confirmPaymentByGatewayOrderId(
    gatewayOrderId: string,
    paymentData: { paymentId: string; signature: string; method?: string },
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findFirst({
          where: { gatewayOrderId },
          include: { items: true },
        });

        if (!order) {
          throw new NotFoundError(`Order not found for gatewayOrderId: ${gatewayOrderId}`);
        }

        if (order.paymentStatus === "COMPLETED") {
          return this.mapOrder(order);
        }

        if (order.status === "CANCELLED") {
          throw new ValidationError("Cancelled orders cannot be marked as paid");
        }

        const isReserved = await this.stockReservationService.isReservationActive(order.id);
        if (!isReserved) {
          let refundIssued = false;
          if (paymentData.paymentId && this.paymentService.refundPayment) {
            try {
              await this.paymentService.refundPayment(
                paymentData.paymentId,
                order.totalAmount,
                "Stock reservation expired",
              );
              refundIssued = true;
            } catch (refundErr) {
              console.error("Auto-refund error for expired order:", refundErr);
            }
          }

          const existingBreakup = isRecord(order.getBreakup) ? order.getBreakup : {};
          await tx.order.update({
            where: { id: order.id },
            data: {
              gatewayPaymentId: paymentData.paymentId,
              gatewaySignature: paymentData.signature,
              paymentMethod: paymentData.method,
              status: "CANCELLED",
              paymentStatus: refundIssued ? "COMPLETED" : "FAILED",
              getBreakup: {
                ...existingBreakup,
                paymentRefund: {
                  refunded: refundIssued,
                  reason: "Stock reservation expired",
                  updatedAt: new Date().toISOString(),
                },
              },
            },
          });

          throw new ValidationError(
            refundIssued
              ? "Stock reservation for this order expired. Your payment has been automatically refunded."
              : "Stock reservation for this order has expired. Payment cannot be processed.",
          );
        }

        await this.stockReservationService.confirmReservations(order.id, tx);
        await this.cartRepository.clearCartByUser(order.userId, tx);

        const existingBreakup = isRecord(order.getBreakup) ? order.getBreakup : {};
        
        await tx.order.update({
          where: { id: order.id },
          data: {
            gatewayPaymentId: paymentData.paymentId,
            gatewaySignature: paymentData.signature,
            paymentMethod: paymentData.method,
            status: "PROCESSING",
            paymentStatus: "COMPLETED",
            getBreakup: {
              ...existingBreakup,
              payment: {
                paymentId: paymentData.paymentId,
                status: "SUCCESS",
                updatedAt: new Date().toISOString(),
              },
            },
          },
        });

        const updated = await this.orderRepository.findByIdWithItems(order.id, tx);
        return this.mapOrder(updated!);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async handlePaymentFailureByGatewayOrderId(gatewayOrderId: string, reason: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findFirst({
          where: { gatewayOrderId },
          include: { items: true },
        });

        if (!order) {
          throw new NotFoundError(`Order not found for gatewayOrderId: ${gatewayOrderId}`);
        }

        if (order.status === "CANCELLED" && order.paymentStatus === "FAILED") {
          return this.mapOrder(order);
        }

        await this.stockReservationService.releaseReservations(order.id, tx);

        const existingBreakup = isRecord(order.getBreakup) ? order.getBreakup : {};
        
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            paymentStatus: "FAILED",
            getBreakup: {
              ...existingBreakup,
              paymentFailure: {
                reason,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        });

        const updated = await this.orderRepository.findByIdWithItems(order.id, tx);
        return this.mapOrder(updated!);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
