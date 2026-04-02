import type { FeaturedType } from "../../generated/prisma/enums.js";
import type { FeaturedSectionWithCount } from "../../repositories/featuredSection.repository.js";

export type PublicFeaturedSection = {
  id: string;
  title: string;
  type: FeaturedType;
  priority: number;
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
