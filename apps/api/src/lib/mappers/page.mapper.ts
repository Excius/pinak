export type PageRecord = {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicPageSummary = {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  updatedAt: Date;
};

export type PublicPage = PublicPageSummary & {
  content: string;
};

export type AdminPage = PublicPage & {
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
};

export const toPublicPageSummary = (page: PageRecord): PublicPageSummary => ({
  id: page.id,
  slug: page.slug,
  title: page.title,
  metaTitle: page.metaTitle,
  metaDescription: page.metaDescription,
  updatedAt: page.updatedAt,
});

export const toPublicPage = (page: PageRecord): PublicPage => ({
  id: page.id,
  slug: page.slug,
  title: page.title,
  content: page.content,
  metaTitle: page.metaTitle,
  metaDescription: page.metaDescription,
  updatedAt: page.updatedAt,
});

export const toAdminPage = (page: PageRecord): AdminPage => ({
  id: page.id,
  slug: page.slug,
  title: page.title,
  content: page.content,
  metaTitle: page.metaTitle,
  metaDescription: page.metaDescription,
  isActive: page.isActive,
  isDeleted: page.isDeleted,
  createdAt: page.createdAt,
  updatedAt: page.updatedAt,
});
