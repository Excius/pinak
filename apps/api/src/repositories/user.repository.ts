import { PrismaClient } from "../generated/prisma/client.js";
import { NotFoundError } from "../lib/error.js";
import loggerInstance from "../lib/logger.js";

export class UserRespository {
  constructor(private primsa: PrismaClient) {}

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

  create(email: string, hashPassword: string) {
    return this.primsa.user.create({
      data: { email: email, hashPassword: hashPassword },
    });
  }
}
