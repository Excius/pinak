import { AuthProviderType, PrismaClient } from "../generated/prisma/client.js";
import { InternalServerError, NotFoundError } from "../lib/error.js";
import loggerInstance from "../lib/logger.js";

export class UserRespository {
  constructor(private primsa: PrismaClient) {}

  // TODO: Need to handle the inactive and deleted users as well
  getUserByEmail(email: string) {
    try {
      return this.primsa.user.findUnique({
        where: { email },
      });
    } catch (error) {
      loggerInstance.error("Error fetching user by email:", error);
      throw new NotFoundError();
    }
  }

  getUserById(id: string) {
    return this.primsa.user.findUnique({
      where: { id },
    });
  }

  getUserByUsername(username: string) {
    return this.primsa.user.findUnique({
      where: { username },
    });
  }

  getUserByEmailOrUsername(email: string, username: string) {
    return this.primsa.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      include: { authProviders: true },
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
      where: { id: userId },
      data: { hashPassword: newHashedPassword },
    });
  }

  updateUserName(userId: string, name: string | null) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { name: name },
    });
  }

  updateUserEmailVerification(userId: string, isVerified: boolean) {
    return this.primsa.user.update({
      where: { id: userId },
      data: { isEmailVerified: isVerified },
    });
  }
}
