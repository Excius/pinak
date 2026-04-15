export type FilterValueRecord = {
  id: string;
  filterGroupId?: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FilterGroupRecord = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  values?: FilterValueRecord[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type PublicFilterValue = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type PublicFilterGroup = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  values: PublicFilterValue[];
};

export type AdminFilterValue = {
  id: string;
  filterGroupId?: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AdminFilterGroup = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  values: AdminFilterValue[];
  createdAt?: Date;
  updatedAt?: Date;
};

export const toPublicFilterValue = (
  value: FilterValueRecord,
): PublicFilterValue => ({
  id: value.id,
  name: value.name,
  slug: value.slug,
  sortOrder: value.sortOrder,
});

export const toPublicFilterGroup = (
  group: FilterGroupRecord,
): PublicFilterGroup => ({
  id: group.id,
  name: group.name,
  slug: group.slug,
  sortOrder: group.sortOrder,
  isActive: group.isActive,
  values: (group.values ?? []).map(toPublicFilterValue),
});

export const toPublicFilterGroupList = (
  groups: FilterGroupRecord[],
): PublicFilterGroup[] => groups.map(toPublicFilterGroup);

export const toAdminFilterValue = (value: FilterValueRecord): AdminFilterValue => ({
  id: value.id,
  ...(value.filterGroupId !== undefined && { filterGroupId: value.filterGroupId }),
  name: value.name,
  slug: value.slug,
  sortOrder: value.sortOrder,
  ...(value.createdAt !== undefined && { createdAt: value.createdAt }),
  ...(value.updatedAt !== undefined && { updatedAt: value.updatedAt }),
});

export const toAdminFilterGroup = (group: FilterGroupRecord): AdminFilterGroup => ({
  id: group.id,
  name: group.name,
  slug: group.slug,
  sortOrder: group.sortOrder,
  isActive: group.isActive,
  values: (group.values ?? []).map(toAdminFilterValue),
  ...(group.createdAt !== undefined && { createdAt: group.createdAt }),
  ...(group.updatedAt !== undefined && { updatedAt: group.updatedAt }),
});

export const toAdminFilterGroupList = (
  groups: FilterGroupRecord[],
): AdminFilterGroup[] => groups.map(toAdminFilterGroup);
