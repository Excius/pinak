import { AuthProviderType, PrismaClient } from "../generated/prisma/client.js";
import { InternalServerError, NotFoundError } from "../lib/error.js";
import loggerInstance from "../lib/logger.js";

export class UserRespository {
  constructor(private primsa: PrismaClient) {}

  // User-facing methods (excludes soft deleted users)
  getUserByEmail(email: string) {
    try {
      return this.primsa.user.findFirst({
        where: { 
          email,
          status: { not: 'DELETED' }
        },
      });
    } catch (error) {
      loggerInstance.error("Error fetching user by email:", error);
      throw new NotFoundError();
    }
  }

  getUserById(id: string) {
    return this.primsa.user.findFirst({
      where: { 
        id,
        status: { not: 'DELETED' }
      },
    });
  }

  getUserByUsername(username: string) {
    return this.primsa.user.findFirst({
      where: { 
        username,
        status: { not: 'DELETED' }
      },
    });
  }

  getUserByEmailOrUsername(email: string, username: string) {
    return this.primsa.user.findFirst({
      where: {
        OR: [{ email }, { username }],
        status: { not: 'DELETED' }
      },
      include: { authProviders: true },
    });
  }

  // Admin-facing methods (includes soft deleted users)
  getUserByEmailAdmin(email: string) {
    try {
      return this.primsa.user.findFirst({
        where: { email },
      });
    } catch (error) {
      loggerInstance.error("Error fetching user by email:", error);
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
    return this.primsa.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      include: { authProviders: true },
    });
  }

  // Admin utility methods
  getAllUsersAdmin(includeDeleted = false) {
    return this.primsa.user.findMany({
      where: includeDeleted ? {} : { status: { not: 'DELETED' } },
      orderBy: { createdAt: 'desc' }
    });
  }

  getDeletedUsersAdmin() {
    return this.primsa.user.findMany({
      where: { status: 'DELETED' },
      orderBy: { updatedAt: 'desc' }
    });
  }

  // Soft delete operations
  softDeleteUser(userId: string) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { status: 'DELETED' }
    });
  }

  restoreUser(userId: string) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' }
    });
  }

  create(email: string, hashPassword: string, username: string) {
    return this.primsa.user.create({
      data: { email: email, hashPassword: hashPassword, username: username },
    });
  }

  createOauthUser(
    email: string,
    username: string,
    provider: AuthProviderType,
    providerId: string,
    name?: string | null,
  ) {
    return this.primsa.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email,
          username: username,
          name: name,
          isEmailVerified: true,
        },
      });

      if (!user) {
        loggerInstance.error("Error creating new user from Google OAuth");
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
        status: { not: 'DELETED' }
      },
      data: { hashPassword: newHashedPassword },
    });
  }

  updateUserName(userId: string, name: string | null) {
    return this.primsa.user.update({
      where: { 
        id: userId,
        status: { not: 'DELETED' }
      },
      data: { name: name },
    });
  }

  updateUserEmailVerification(userId: string, isVerified: boolean) {
    return this.primsa.user.update({
      where: { 
        id: userId,
        status: { not: 'DELETED' }
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

  updateUserStatusAdmin(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'DELETED') {
    return this.primsa.user.update({
      where: { id: userId },
      data: { status },
    });
  }
}
