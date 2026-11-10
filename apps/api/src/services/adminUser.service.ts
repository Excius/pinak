import type { PrismaClient } from "../generated/prisma/client.js";
import { NotFoundError, ValidationError } from "../lib/error.js";
import { invalidateUserStatus } from "../lib/userStatus.js";
import { UserRespository } from "../repositories/user.repository.js";

type ListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "MODERATOR" | "USER";
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
};

/** Read-only customer/staff directory for the admin panel. */
export class AdminUserService {
  constructor(
    private prisma: PrismaClient,
    private users: UserRespository,
  ) {}

  /** Order count and amount actually paid, per user, for a set of users (2 grouped queries). */
  private async orderStats(userIds: string[]) {
    if (userIds.length === 0)
      return new Map<string, { orderCount: number; totalSpent: number }>();
    const [counts, paid] = await Promise.all([
      this.prisma.order.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds }, isDeleted: false },
        _count: { _all: true },
      }),
      this.prisma.order.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          isDeleted: false,
          paymentStatus: "COMPLETED",
          status: { not: "CANCELLED" },
        },
        _sum: { totalAmount: true },
      }),
    ]);
    const stats = new Map<string, { orderCount: number; totalSpent: number }>();
    for (const id of userIds) stats.set(id, { orderCount: 0, totalSpent: 0 });
    for (const c of counts) stats.get(c.userId)!.orderCount = c._count._all;
    for (const p of paid)
      stats.get(p.userId)!.totalSpent = p._sum.totalAmount ?? 0;
    return stats;
  }

  async list(query: ListQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.users.listUsersAdmin({
      page,
      limit,
      search: query.search || undefined,
      role: query.role,
      status: query.status,
      sortBy: query.sortBy ?? "createdAt",
      sortOrder: query.sortOrder ?? "desc",
    });
    const stats = await this.orderStats(items.map((u) => u.id));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      items: items.map((u) => ({
        ...u,
        orderCount: stats.get(u.id)?.orderCount ?? 0,
        totalSpent: stats.get(u.id)?.totalSpent ?? 0,
      })),
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

  async getById(id: string) {
    const user = await this.users.getUserDetailAdmin(id);
    if (!user) throw new NotFoundError("User not found");
    const [stats, activeSessions] = await Promise.all([
      this.orderStats([id]),
      this.prisma.session.count({
        where: { userId: id, isRevoked: false, expiresAt: { gt: new Date() } },
      }),
    ]);
    return {
      ...user,
      stats: { ...stats.get(id)!, activeSessions },
    };
  }

  /**
   * Activates, deactivates or soft-deletes an account. Anything but ACTIVE also signs the user
   * out everywhere (all refresh sessions revoked) and is enforced on the very next request.
   */
  async changeStatus(
    actor: { id: string; role: string },
    targetId: string,
    status: "ACTIVE" | "INACTIVE" | "DELETED",
  ) {
    if (actor.id === targetId) {
      throw new ValidationError(
        "You cannot change the status of your own account",
      );
    }
    const target = await this.users.getUserAnyStatus(targetId);
    if (!target) throw new NotFoundError("User not found");
    if (target.status === status)
      return { id: target.id, status: target.status };

    // Never leave the store without an admin who can sign in
    if (
      target.role === "ADMIN" &&
      target.status === "ACTIVE" &&
      status !== "ACTIVE"
    ) {
      const otherAdmins = await this.users.countActiveAdmins(targetId);
      if (otherAdmins === 0) {
        throw new ValidationError(
          "Cannot deactivate or delete the last active admin",
        );
      }
    }

    const previousStatus = target.status;
    const updated = await this.users.setStatus(targetId, status);
    if (status !== "ACTIVE") {
      await this.prisma.session.updateMany({
        where: { userId: targetId },
        data: { isRevoked: true },
      });
    }
    invalidateUserStatus(targetId);

    await this.prisma.auditLog.create({
      data: {
        entity: "User",
        entityId: targetId,
        action: status === "DELETED" ? "DELETE" : "STATUS_CHANGE",
        before: { status: previousStatus },
        after: { status },
        actorId: actor.id,
        actorRole: actor.role,
        source: "Admin Panel",
      },
    });
    return updated;
  }
}
