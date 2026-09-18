import type { FeaturedType } from "../../generated/prisma/enums.js";
import type { FeaturedSectionWithCount } from "../../repositories/featuredSection.repository.js";

export type PublicFeaturedSectionImage = {
  id: string;
  featuredSectionId: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type PublicFeaturedSection = {
  id: string;
  title: string;
  type: FeaturedType;
  priority: number;
  images: PublicFeaturedSectionImage[];
};

export type AdminFeaturedSection = PublicFeaturedSection & {
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
};

export const toPublicFeaturedSection = (
  section: FeaturedSectionWithCount,
): PublicFeaturedSection => ({
  id: section.id,
  title: section.title,
  type: section.type,
  priority: section.priority,
  images: ((section as any).images ?? []).map((img: any) => ({
    id: img.id,
    featuredSectionId: img.featuredSectionId,
    url: img.url,
    altText: img.altText,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  })),
});

export const toPublicFeaturedSectionList = (
  sections: FeaturedSectionWithCount[],
): PublicFeaturedSection[] => sections.map(toPublicFeaturedSection);

export const toAdminFeaturedSection = (
  section: FeaturedSectionWithCount,
): AdminFeaturedSection => ({
  ...toPublicFeaturedSection(section),
  createdAt: section.createdAt,
  updatedAt: section.updatedAt,
  productCount: section._count.products,
});

export const toAdminFeaturedSectionList = (
  sections: FeaturedSectionWithCount[],
): AdminFeaturedSection[] => sections.map(toAdminFeaturedSection);
