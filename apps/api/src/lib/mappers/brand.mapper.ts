export type BrandRecord = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicBrand = Omit<BrandRecord, "createdAt" | "updatedAt">;

export type AdminBrand = BrandRecord;

export const toPublicBrand = (brand: BrandRecord): PublicBrand => ({
  id: brand.id,
  name: brand.name,
  slug: brand.slug,
  logoUrl: brand.logoUrl,
  isActive: brand.isActive,
});

export const toPublicBrandList = (brands: BrandRecord[]): PublicBrand[] =>
  brands.map(toPublicBrand);

export const toAdminBrand = (brand: BrandRecord): AdminBrand => ({
  id: brand.id,
  name: brand.name,
  slug: brand.slug,
  logoUrl: brand.logoUrl,
  isActive: brand.isActive,
  createdAt: brand.createdAt,
  updatedAt: brand.updatedAt,
});

export const toAdminBrandList = (brands: BrandRecord[]): AdminBrand[] =>
  brands.map(toAdminBrand);
