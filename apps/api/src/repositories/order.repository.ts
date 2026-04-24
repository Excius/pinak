import { Prisma, PrismaClient, OrderStatus, PaymentStatus } from "../generated/prisma/client.js";

export type OrderFilters = {
  page: number;
  limit: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
};

export type AdminOrderFilters = OrderFilters & {
  userId?: string;
};

export type CreateOrderItemInput = {
  orderId: string;
  productId?: string | null;
  productVariantId?: string | null;
  comboKitId?: string | null;
  productName: string;
  variantDetails?: Prisma.InputJsonValue | null;
  price: number;
  quantity: number;
};

const orderItemInclude = {
  product: {
    include: {
      brand: true,
    },
  },
  productVariant: {
    include: {
      images: {
        where: { isDeleted: false },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
      optionValues: {
        include: {
          optionValue: {
            include: {
              option: true,
            },
          },
        },
      },
    },
  },
  comboKit: {
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  },
} satisfies Prisma.OrderItemInclude;

const orderInclude = {
  items: {
    include: orderItemInclude,
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.OrderInclude;

const adminOrderInclude = {
  ...orderInclude,
  user: true,
} satisfies Prisma.OrderInclude;

export class OrderRepository {
  constructor(private prisma: PrismaClient) {}

  private getDb(tx?: Prisma.TransactionClient): PrismaClient | Prisma.TransactionClient {
    return tx ?? this.prisma;
  }

  async create(data: Prisma.OrderCreateInput, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.order.create({
      data,
      include: orderInclude,
    });
  }

  async createItems(items: CreateOrderItemInput[], tx?: Prisma.TransactionClient) {
    if (items.length === 0) return;
    const db = this.getDb(tx);
    await db.orderItem.createMany({
      data: items.map(item => ({
        ...item,
        variantDetails: item.variantDetails === null ? Prisma.JsonNull : item.variantDetails
      })),
    });
  }

  async findById(orderId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.order.findFirst({
      where: { id: orderId, isDeleted: false },
      include: orderInclude,
    });
  }

  async findByIdWithItems(orderId: string, tx?: Prisma.TransactionClient) {
    return this.findById(orderId, tx);
  }

  async findByIdWithItemsForUser(
    orderId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.getDb(tx);
    return db.order.findFirst({
      where: {
        id: orderId,
        userId,
        isDeleted: false,
      },
      include: orderInclude,
    });
  }

  async findUserOrders(userId: string, filters: OrderFilters, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, filters.limit);
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {
      userId,
      isDeleted: false,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
    };

    const [items, total] = await db.$transaction([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: orderInclude,
      }),
      db.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findAllOrders(filters: AdminOrderFilters, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, filters.limit);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      isDeleted: false,
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
    };

    const [items, total] = await db.$transaction([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: adminOrderInclude,
      }),
      db.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async updateStatus(orderId: string, status: OrderStatus, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.order.update({
      where: { id: orderId },
      data: { status },
      include: adminOrderInclude,
    });
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.getDb(tx);
    return db.order.update({
      where: { id: orderId },
      data: { paymentStatus },
      include: adminOrderInclude,
    });
  }

  async updateStatusAndPayment(
    orderId: string,
    status: OrderStatus,
    paymentStatus: PaymentStatus,
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.getDb(tx);
    return db.order.update({
      where: { id: orderId },
      data: { status, paymentStatus },
      include: adminOrderInclude,
    });
  }

  async hardDelete(orderId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.$transaction(async (dtx) => {
      // Manually delete related records to bypass potential constraint issues
      await dtx.orderItem.deleteMany({ where: { orderId } });
      await dtx.couponUsage.deleteMany({ where: { oderId: orderId } });
      await dtx.inventoryReservation.deleteMany({ where: { orderId } });
      
      return dtx.order.delete({
        where: { id: orderId },
      });
    });
  }
}
