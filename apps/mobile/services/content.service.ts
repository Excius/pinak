import { apiRequest } from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface WhatsAppContact {
  whatsappNumber: string;
  defaultMessage: string;
  supportEmail: string;
  supportPhone: string;
}

export interface PublicPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt: string;
}

export async function getWhatsAppContact(): Promise<WhatsAppContact> {
  const response = await apiRequest<ApiResponse<WhatsAppContact>>(
    "get",
    "/settings/whatsapp",
  );
  return response.data;
}

export async function getPublicPage(slug: string): Promise<PublicPage> {
  const response = await apiRequest<ApiResponse<PublicPage>>(
    "get",
    `/pages/${encodeURIComponent(slug)}`,
  );
  return response.data;
}
