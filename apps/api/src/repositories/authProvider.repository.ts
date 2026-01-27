import { AuthProviderType, PrismaClient } from "../generated/prisma/client.js";

export class AuthProviderRepository {
  constructor(private prisma: PrismaClient) {}

  async getExistingProvider(provider: AuthProviderType, providerId: string) {
    return this.prisma.authProvider.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: { user: true },
    });
  }

  async create(data: {
    provider: AuthProviderType;
    providerId: string;
    userId: string;
  }) {
    return this.prisma.authProvider.create({
      data,
    });
  }
}
