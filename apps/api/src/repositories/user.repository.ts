import { AuthProviderType, Prisma, PrismaClient } from "../generated/prisma/client.js";
import { InternalServerError, NotFoundError } from "../lib/error.js";
import logger from "../lib/logger.js";
import { normalizeEmail } from "../lib/email.js";

export class UserRespository {
  constructor(private primsa: PrismaClient) {}

  // User-facing methods (excludes soft deleted users)
  getUserByEmail(email: string) {
    try {
      const normalized = normalizeEmail(email);
      return this.primsa.user.findFirst({
        where: {
          email: normalized,
          status: { not: "DELETED" },
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching user by email:");
      throw new NotFoundError();
    }
  }

  getUserById(id: string) {
    return this.primsa.user.findFirst({
      where: {
        id,
        status: { not: "DELETED" },
      },
    });
  }

  getUserByUsername(username: string) {
    return this.primsa.user.findFirst({
      where: {
        username,
        status: { not: "DELETED" },
      },
    });
  }

  getUserByEmailOrUsername(email: string, username: string) {
    const normalized = normalizeEmail(email);
    return this.primsa.user.findFirst({
      where: {
        OR: [{ email: normalized }, { username }],
        status: { not: "DELETED" },
      },
      include: { authProviders: true },
    });
  }

  // Admin-facing methods (includes soft deleted users)
  getUserByEmailAdmin(email: string) {
    try {
      const normalized = normalizeEmail(email);
      return this.primsa.user.findFirst({
        where: { email: normalized },
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching user by email:");
      throw new NotFoundError();
    }
  }

  getUserByIdAdmin(id: string) {
    return this.primsa.user.findFirst({
      where: { id },
    });
  }

  getUserByUsernameAdmin(username: string) {
    return this.primsa.user.findFirst({
      where: { username },
    });
  }

  getUserByEmailOrUsernameAdmin(email: string, username: string) {
    const normalized = normalizeEmail(email);
    return this.primsa.user.findFirst({
      where: {
        OR: [{ email: normalized }, { username }],
      },
      include: { authProviders: true },
    });
  }

  // Admin utility methods
  getAllUsersAdmin(includeDeleted = false) {
    return this.primsa.user.findMany({
      where: includeDeleted ? {} : { status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
    });
  }

  getDeletedUsersAdmin() {
    return this.primsa.user.findMany({
      where: { status: "DELETED" },
      orderBy: { updatedAt: "desc" },
    });
  }

  // Soft delete operations
  softDeleteUser(userId: string) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { status: "DELETED" },
    });
  }

  restoreUser(userId: string) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });
  }

  create(email: string, hashPassword: string, username: string) {
    const normalized = normalizeEmail(email);
    return this.primsa.user.create({
      data: {
        email: normalized,
        hashPassword: hashPassword,
        username: username,
      },
    });
  }

  createOauthUser(
    email: string,
    username: string,
    provider: AuthProviderType,
    providerId: string,
    name?: string | null,
  ) {
    const normalized = normalizeEmail(email);
    return this.primsa.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalized,
          username: username,
          name: name,
          isEmailVerified: true,
        },
      });

      if (!user) {
        logger.error("Error creating new user from Google OAuth");
        throw new InternalServerError("Failed to create user");
      }

      await tx.authProvider.create({
        data: {
          userId: user.id,
          provider,
          providerId,
        },
      });

      return user;
    });
  }

  updateUserPassword(userId: string, newHashedPassword: string) {
    return this.primsa.user.update({
      where: {
        id: userId,
        status: { not: "DELETED" },
      },
      data: { hashPassword: newHashedPassword },
    });
  }

  updateUserName(userId: string, name: string | null) {
    return this.primsa.user.update({
      where: {
        id: userId,
        status: { not: "DELETED" },
      },
      data: { name: name },
    });
  }

  updateUserEmailVerification(userId: string, isVerified: boolean) {
    return this.primsa.user.update({
      where: {
        id: userId,
        status: { not: "DELETED" },
      },
      data: { isEmailVerified: isVerified },
    });
  }

  // Admin update methods (can update deleted users)
  updateUserPasswordAdmin(userId: string, newHashedPassword: string) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { hashPassword: newHashedPassword },
    });
  }

  updateUserNameAdmin(userId: string, name: string | null) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { name: name },
    });
  }

  updateUserEmailVerificationAdmin(userId: string, isVerified: boolean) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { isEmailVerified: isVerified },
    });
  }

  updateUserStatusAdmin(
    userId: string,
    status: "ACTIVE" | "INACTIVE" | "DELETED",
  ) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  // ── Admin directory (never selects hashPassword) ─────────────────────

  private readonly adminUserSelect = {
    id: true,
    email: true,
    username: true,
    name: true,
    role: true,
    status: true,
    isEmailVerified: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.UserSelect;

  async listUsersAdmin(opts: {
    page: number;
    limit: number;
    search?: string;
    role?: "ADMIN" | "MODERATOR" | "USER";
    status?: "ACTIVE" | "INACTIVE" | "DELETED";
    sortBy: "createdAt" | "name" | "email";
    sortOrder: "asc" | "desc";
  }) {
    const where: Prisma.UserWhereInput = {
      // Soft-deleted accounts are hidden unless explicitly requested
      status: opts.status ?? { not: "DELETED" },
      ...(opts.role ? { role: opts.role } : {}),
      ...(opts.search
        ? {
            OR: [
              { email: { contains: opts.search, mode: "insensitive" } },
              { username: { contains: opts.search, mode: "insensitive" } },
              { name: { contains: opts.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.primsa.user.findMany({
        where,
        select: this.adminUserSelect,
        orderBy: { [opts.sortBy]: opts.sortOrder },
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
      }),
      this.primsa.user.count({ where }),
    ]);
    return { items, total };
  }

  getUserDetailAdmin(id: string) {
    return this.primsa.user.findUnique({
      where: { id },
      select: {
        ...this.adminUserSelect,
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
        authProviders: { select: { provider: true, createdAt: true } },
        orders: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /** Any user, including soft-deleted ones. */
  getUserAnyStatus(id: string) {
    return this.primsa.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, status: true },
    });
  }

  countActiveAdmins(excludeUserId: string) {
    return this.primsa.user.count({
      where: { role: "ADMIN", status: "ACTIVE", id: { not: excludeUserId } },
    });
  }

  setStatus(id: string, status: "ACTIVE" | "INACTIVE" | "DELETED") {
    return this.primsa.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  }
}
