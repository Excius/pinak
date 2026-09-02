import { PrismaClient } from "../generated/prisma/client.js";
import type { Prisma } from "../generated/prisma/client.js";

const featuredSectionWithCountInclude: Prisma.FeaturedSectionInclude = {
  images: {
    where: { isDeleted: false },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
  },
  _count: {
    select: { products: true },
  },
};

export type FeaturedSectionWithCount = Prisma.FeaturedSectionGetPayload<{
  include: typeof featuredSectionWithCountInclude;
}>;

export class FeaturedSectionRepository {
  constructor(private prisma: PrismaClient) {}

  list(): Promise<FeaturedSectionWithCount[]> {
    return this.prisma.featuredSection.findMany({
      where: { isDeleted: false },
      orderBy: { priority: "asc" },
      include: featuredSectionWithCountInclude,
    });
  }

  getById(id: string, includeDeleted = false): Promise<FeaturedSectionWithCount | null> {
    return this.prisma.featuredSection.findFirst({
      where: { id, ...(includeDeleted ? {} : { isDeleted: false }) },
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
    return this.prisma.featuredSection.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  restore(id: string) {
    return this.prisma.featuredSection.update({
      where: { id },
      data: { isDeleted: false },
      include: featuredSectionWithCountInclude,
    });
  }

  hardDelete(id: string) {
    return this.prisma.featuredSection.delete({ where: { id } });
  }

  addFeaturedSectionImage(
    featuredSectionId: string,
    data: Prisma.FeaturedSectionImageCreateInput,
  ) {
    if (data.isPrimary) {
      return this.prisma.$transaction(async (tx) => {
        await tx.featuredSectionImage.updateMany({
          where: { featuredSectionId, isPrimary: true },
          data: { isPrimary: false },
        });
        return tx.featuredSectionImage.create({ data });
      });
    }
    return this.prisma.featuredSectionImage.create({ data });
  }

  setPrimaryImage(imageId: string) {
    return this.prisma.$transaction(async (tx) => {
      const image = await tx.featuredSectionImage.findUnique({
        where: { id: imageId },
      });
      if (!image) {
        return null;
      }
      await tx.featuredSectionImage.updateMany({
        where: { featuredSectionId: image.featuredSectionId, isPrimary: true },
        data: { isPrimary: false },
      });
      return tx.featuredSectionImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });
  }

  softDeleteImage(id: string) {
    return this.prisma.featuredSectionImage.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  restoreImage(id: string) {
    return this.prisma.featuredSectionImage.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  hardDeleteImage(id: string) {
    return this.prisma.featuredSectionImage.delete({ where: { id } });
  }

  getFeaturedSectionImageById(id: string) {
    return this.prisma.featuredSectionImage.findUnique({ where: { id } });
  }

  getAllImages(featuredSectionId: string) {
    return this.prisma.featuredSectionImage.findMany({
      where: { featuredSectionId },
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    });
  }
}
