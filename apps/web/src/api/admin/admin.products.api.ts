import axiosInstance from "../axiosInstance";

// ── Types ──────────────────────────────────────────────────────────────

export interface AdminProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

export interface AdminProductVariant {
  id: string
  sku: string
  price: number
  priceWithTax?: number
  sellingPrice?: number | null
  sellingPriceWithTax?: number | null
  taxAmount?: number
  compareAtPrice: number | null
  compareAtPriceWithTax?: number | null
  stock: number
  lowStockThreshold: number | null
  isActive: boolean
  images: AdminProductImage[]
  optionValues: { optionName: string; valueName: string; optionId?: string; optionValueId?: string; swatchColorHex?: string | null }[]
  optionValueIds?: string[]
  filterValues?: { variantId: string; filterValueId: string }[]
  // Client-side only: filter values selected in the variant editor
  filterValueIds?: string[]
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  keyIngredients: string | null;
  basePrice: number | null;
  compareAtPrice: number | null;
  frontImageUrl: string | null;
  hoverImageUrl: string | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  brandId: string | null;
  taxClassId?: string | null;
  taxClass?: { id?: string; name: string; rate: number } | null;
  requiresShipping?: boolean;
  weightGrams?: number | null;
  weightClassId?: string | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  lengthClassId?: string | null;
  brand: { id: string; name: string; slug: string } | null;
  categories: { id: string; name: string; slug: string }[];
  variants: AdminProductVariant[];
  tags: string[];
}

export interface AdminProductListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  brand?: string;
  isActive?: boolean;
}

// ── Product List ───────────────────────────────────────────────────────

// Backend list responses are shaped { items, pagination: { total, page, limit, totalPages } }
const toListResult = (resp: any) => {
  const pg = resp?.data?.pagination ?? resp?.data ?? {}
  return {
    items: (resp?.data?.items || []) as AdminProduct[],
    total: (pg.total as number) || 0,
    page: (pg.page as number) || 1,
    limit: (pg.limit as number) || 10,
    totalPages: (pg.totalPages as number) || 1,
  }
}

export const getAllProductsAdmin = async (params?: AdminProductListParams) => {
  const { data: resp } = await axiosInstance.get('/products/admin/all', { params })
  return toListResult(resp)
}

export const getDeletedProductsAdmin = async (params?: AdminProductListParams) => {
  const { data: resp } = await axiosInstance.get('/products/admin/deleted', { params })
  return toListResult(resp)
}

// ── Product CRUD ───────────────────────────────────────────────────────

export const getProductByIdAdmin = async (
  id: string,
): Promise<AdminProduct> => {
  const { data: resp } = await axiosInstance.get(`/products/admin/${id}`);
  return resp?.data as AdminProduct;
};

export const createProductAdmin = async (
  payload: Record<string, unknown>,
): Promise<AdminProduct> => {
  const { data: resp } = await axiosInstance.post("/products/admin", payload);
  return resp?.data as AdminProduct;
};

export const updateProductAdmin = async (
  id: string,
  payload: Record<string, unknown>,
): Promise<AdminProduct> => {
  const { data: resp } = await axiosInstance.put(
    `/products/admin/${id}`,
    payload,
  );
  return resp?.data as AdminProduct;
};

export const updateProductStatusAdmin = async (
  id: string,
  isActive: boolean,
) => {
  const { data: resp } = await axiosInstance.patch(
    `/products/admin/${id}/status`,
    { isActive },
  );
  return resp?.data as AdminProduct;
};

export const softDeleteProductAdmin = async (id: string) => {
  await axiosInstance.delete(`/products/admin/${id}`)
}

export const hardDeleteProductAdmin = async (id: string) => {
  await axiosInstance.delete(`/products/admin/${id}/hard`);
};

export const restoreProductAdmin = async (id: string) => {
  await axiosInstance.patch(`/products/admin/${id}/restore`);
};

export const restoreProductAdmin = async (id: string) => {
  await axiosInstance.patch(`/products/admin/${id}/restore`)
}

// ── Product ↔ Category junction ────────────────────────────────────────

export const setProductCategoriesAdmin = async (
  productId: string,
  categoryIds: string[],
) => {
  await axiosInstance.put(`/products/admin/${productId}/categories`, {
    categoryIds,
  });
};

// ── Variant CRUD ───────────────────────────────────────────────────────

export const createProductVariantAdmin = async (
  productId: string,
  payload: {
    sku: string;
    price: number;
    sellingPrice?: number | null;
    stock: number;
    comparePrice?: number;
    optionValueIds?: string[];
    taxClassId?: string | null;
    weightGrams?: number | null;
    weightClassId?: string | null;
    dimensionLength?: number | null;
    dimensionWidth?: number | null;
    dimensionHeight?: number | null;
    lengthClassId?: string | null;
  },
): Promise<AdminProductVariant> => {
  const { data: resp } = await axiosInstance.post(
    `/products/admin/${productId}/variants`,
    payload,
  );
  return resp?.data as AdminProductVariant;
};

export const updateProductVariantAdmin = async (
  id: string,
  payload: {
    sku?: string;
    price?: number;
    sellingPrice?: number | null;
    stock?: number;
    optionValueIds?: string[];
    taxClassId?: string | null;
    weightGrams?: number | null;
    weightClassId?: string | null;
    dimensionLength?: number | null;
    dimensionWidth?: number | null;
    dimensionHeight?: number | null;
    lengthClassId?: string | null;
  },
): Promise<AdminProductVariant> => {
  const { data: resp } = await axiosInstance.put(
    `/products/admin/variants/${id}`,
    payload,
  );
  return resp?.data as AdminProductVariant;
};

export const deleteProductVariantAdmin = async (id: string) => {
  await axiosInstance.delete(`/products/admin/variants/${id}`);
};

export const restoreProductVariantAdmin = async (id: string) => {
  await axiosInstance.patch(`/products/admin/variants/${id}/restore`);
};

export const hardDeleteProductVariantAdmin = async (id: string) => {
  await axiosInstance.delete(`/products/admin/variants/${id}/hard`);
};

// ── Image Management ───────────────────────────────────────────────────

export const addProductImageAdmin = async (
  variantId: string,
  formData: FormData,
) => {
  const { data: resp } = await axiosInstance.post(
    `/products/admin/variants/${variantId}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return resp?.data;
};

/** Replace an image's file and/or edit its alt text / primary flag (multipart: image?, altText?, isPrimary?). */
export const updateProductImageAdmin = async (
  imageId: string,
  formData: FormData,
) => {
  const { data: resp } = await axiosInstance.put(
    `/products/admin/images/${imageId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return resp?.data;
};

export const deleteProductImageAdmin = async (imageId: string) => {
  await axiosInstance.delete(`/products/admin/images/${imageId}`);
};

export const setPrimaryImageAdmin = async (imageId: string) => {
  const { data: resp } = await axiosInstance.patch(
    `/products/admin/images/${imageId}/primary`,
  );
  return resp?.data;
};

// ── Related Products ───────────────────────────────────────────────────

export const getRelatedProductsAdmin = async (productId: string) => {
  const { data: resp } = await axiosInstance.get(
    `/products/${productId}/related`,
  );
  return resp?.data || [];
};

export const addRelatedProductAdmin = async (
  productId: string,
  relatedProductId: string,
  sortOrder?: number,
) => {
  const { data: resp } = await axiosInstance.post(
    `/products/admin/${productId}/related`,
    { relatedProductId, sortOrder },
  );
  return resp?.data;
};

export const removeRelatedProductAdmin = async (
  productId: string,
  relatedProductId: string,
) => {
  await axiosInstance.delete(
    `/products/admin/${productId}/related/${relatedProductId}`,
  );
};

export const getOutOfStockProductsAdmin = async (
  page: number = 1,
  limit: number = 20,
) => {
  const { data } = await axiosInstance.get(
    "/products/admin/stock/out-of-stock",
    { params: { page, limit } },
  );
  return data.data;
};

export const getLowStockProductsAdmin = async (
  page: number = 1,
  limit: number = 20,
) => {
  const { data } = await axiosInstance.get("/products/admin/stock/low-stock", {
    params: { page, limit },
  });
  return data.data;
};

// ── Spreadsheet Inventory Management ───────────────────────────────────

export interface ImportInventoryResult {
  totalProcessed: number;
  createdProducts: number;
  updatedProducts: number;
  createdVariants: number;
  updatedVariants: number;
  skippedCount: number;
  errors: { row: number; name?: string; error: string }[];
}

export const importInventorySpreadsheetAdmin = async (
  fileOrCsv: File | string,
): Promise<ImportInventoryResult> => {
  if (typeof fileOrCsv === "string") {
    const { data: resp } = await axiosInstance.post(
      "/products/admin/inventory/import",
      {
        csv: fileOrCsv,
      },
    );
    return resp?.data as ImportInventoryResult;
  }

export const getLowStockProductsAdmin = async (page: number = 1, limit: number = 20) => {
  const { data } = await axiosInstance.get('/products/admin/stock/low-stock', { params: { page, limit } })
  return data.data
}

// ── Spreadsheet Inventory Management ───────────────────────────────────

export interface ImportInventoryResult {
  totalProcessed: number
  createdProducts: number
  updatedProducts: number
  createdVariants: number
  updatedVariants: number
  skippedCount: number
  errors: { row: number; name?: string; error: string }[]
}

export const importInventorySpreadsheetAdmin = async (
  fileOrCsv: File | string,
): Promise<ImportInventoryResult> => {
  if (typeof fileOrCsv === 'string') {
    const { data: resp } = await axiosInstance.post('/products/admin/inventory/import', {
      csv: fileOrCsv,
    })
    return resp?.data as ImportInventoryResult
  }

  const formData = new FormData()
  formData.append('file', fileOrCsv)
  const { data: resp } = await axiosInstance.post(
    '/products/admin/inventory/import',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return resp?.data as ImportInventoryResult
}

export const exportInventorySpreadsheetAdmin = async (params?: {
  format?: 'csv' | 'xlsx' | 'json'
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE'
  brandId?: string
  categoryId?: string
  search?: string
}): Promise<{ blob: Blob; filename: string }> => {
  const format = params?.format || 'csv'
  let response
  try {
    response = await axiosInstance.get('/products/admin/inventory/export', {
      params,
      responseType: 'blob',
    })
  } catch (err: any) {
    // With responseType 'blob' the JSON error body arrives as a Blob; unwrap it for the UI.
    const body = err?.response?.data
    if (body instanceof Blob) {
      try {
        const parsed = JSON.parse(await body.text())
        err.response.data = parsed
      } catch {
        /* keep original error */
      }
    }
    throw err
  }

  const disposition = response.headers['content-disposition'] as string | undefined
  let filename = `inventory-export-${new Date().toISOString().slice(0, 10)}.${format}`
  if (disposition) {
    const match = disposition.match(/filename="?([^";]+)"?/)
    if (match && match[1]) filename = match[1]
  }

  return { blob: response.data as Blob, filename }
}

export const bulkUpdateProductStatusAdmin = async (
  productIds: string[],
  isActive: boolean,
): Promise<{ updatedCount: number; isActive: boolean }> => {
  const { data: resp } = await axiosInstance.patch('/products/admin/inventory/bulk-status', {
    productIds,
    isActive,
  })
  return resp?.data
}

export const getProductsByStatusAdmin = async (
  status: 'ACTIVE' | 'INACTIVE',
  params?: AdminProductListParams,
) => {
  const { data: resp } = await axiosInstance.get(`/products/admin/status/${status}`, {
    params,
  })
  return toListResult(resp)
}
