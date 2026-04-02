import { PrismaClient } from "../generated/prisma/client.js";
import type { Prisma } from "../generated/prisma/client.js";

const featuredSectionWithCountInclude = {
  _count: {
    select: { products: true },
  },
} as const;

export type FeaturedSectionWithCount = Prisma.FeaturedSectionGetPayload<{
  include: typeof featuredSectionWithCountInclude;
}>;

export class FeaturedSectionRepository {
  constructor(private prisma: PrismaClient) {}

  list(): Promise<FeaturedSectionWithCount[]> {
    return this.prisma.featuredSection.findMany({
      orderBy: { priority: "asc" },
      include: featuredSectionWithCountInclude,
    });
  }

  getById(id: string): Promise<FeaturedSectionWithCount | null> {
    return this.prisma.featuredSection.findUnique({
      where: { id },
      include: featuredSectionWithCountInclude,
    });
  }

  create(data: Prisma.FeaturedSectionCreateInput): Promise<FeaturedSectionWithCount> {
    return this.prisma.featuredSection.create({
      data,
      include: featuredSectionWithCountInclude,
    });
  }

  update(
    id: string,
    data: Prisma.FeaturedSectionUpdateInput,
  ): Promise<FeaturedSectionWithCount> {
    return this.prisma.featuredSection.update({
      where: { id },
      data,
      include: featuredSectionWithCountInclude,
    });
  }

  delete(id: string) {
    return this.prisma.featuredSection.delete({ where: { id } });
  }
}
