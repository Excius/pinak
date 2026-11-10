import axiosInstance from "./axiosInstance";

export interface PublicPageSummary {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  updatedAt: string;
}

export interface PublicPageDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  updatedAt: string;
}

export const getPages = async (): Promise<PublicPageSummary[]> => {
  const { data: resp } = await axiosInstance.get("/pages");
  return Array.isArray(resp?.data) ? resp.data : [];
};

export const getPageBySlug = async (
  slug: string,
): Promise<PublicPageDetail> => {
  const { data: resp } = await axiosInstance.get(
    `/pages/${encodeURIComponent(slug)}`,
  );
  return resp?.data as PublicPageDetail;
};
