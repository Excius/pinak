import { z } from "zod";

const VariantOptionValueSchema = z.object({
  optionName: z.string(),
  valueName: z.string(),
});

const VariantImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  altText: z.string().nullable(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
});

const CartVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  price: z.number(),
  isActive: z.boolean(),
  image: VariantImageSchema.nullable(),
  optionValues: z.array(VariantOptionValueSchema),
  product: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    frontImageUrl: z.string().nullable(),
    metaTitle: z.string().nullable(),
    metaDescription: z.string().nullable(),
    metaKeywords: z.string().nullable(),
    seoKeyword: z.string().nullable(),
    brand: z
      .object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        logoUrl: z.string().nullable(),
      })
      .nullable(),
  }),
});

const ComboComponentVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  price: z.number(),
  image: VariantImageSchema.nullable(),
});

const ComboComponentSchema = z.object({
  id: z.string(),
  productVariantId: z.string(),
  quantity: z.number().int(),
  sortOrder: z.number().int(),
  isRequired: z.boolean(),
  productVariant: ComboComponentVariantSchema.nullable(),
});

const CartComboKitSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number(),
  imageUrl: z.string().nullable(),
  isActive: z.boolean(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  metaKeywords: z.string().nullable(),
  seoKeyword: z.string().nullable(),
  items: z.array(ComboComponentSchema),
});

const CartItemSchema = z.object({
  id: z.string(),
  itemType: z.enum(["PRODUCT_VARIANT", "COMBO_KIT"]),
  quantity: z.number().int().min(1),
  unitPrice: z.number(),
  lineTotal: z.number(),
  availableStock: z.number().int().min(0),
  productVariantId: z.string().nullable(),
  comboKitId: z.string().nullable(),
  productVariant: CartVariantSchema.nullable(),
  comboKit: CartComboKitSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CartSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(CartItemSchema),
  totalItems: z.number().int().min(0),
  totalQuantity: z.number().int().min(0),
  subtotal: z.number().min(0),
  total: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const addToCartBodySchema = z
  .object({
    productVariantId: z.string().min(1).optional(),
    comboKitId: z.string().min(1).optional(),
    quantity: z.coerce.number().int().min(1).default(1),
  })
  .refine(
    (value) => Number(Boolean(value.productVariantId)) + Number(Boolean(value.comboKitId)) === 1,
    {
      message: "Provide exactly one of productVariantId or comboKitId",
      path: ["productVariantId"],
    },
  );

export const CartTypes = {
  GetCart: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CartSchema,
    }),
  },
  AddToCart: {
    body: addToCartBodySchema,
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CartSchema,
    }),
  },
  UpdateCartItem: {
    body: z.object({
      quantity: z.coerce.number().int().min(1),
    }),
    params: z.object({
      itemId: z.string().min(1, { message: "itemId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CartSchema,
    }),
  },
  RemoveCartItem: {
    body: z.object({}),
    params: z.object({
      itemId: z.string().min(1, { message: "itemId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CartSchema,
    }),
  },
  ClearCart: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CartSchema,
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof CartTypes]: z.infer<(typeof CartTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof CartTypes]: z.infer<(typeof CartTypes)[K]["params"]>;
};

export type QueryTypes = {
  [K in keyof typeof CartTypes]: z.infer<(typeof CartTypes)[K]["query"]>;
};

export type ResponseTypes = {
  [K in keyof typeof CartTypes]: z.infer<(typeof CartTypes)[K]["response"]>;
};
