import { z } from "zod";
import { INDIAN_STATES_AND_CODES } from "./address.js";

export const PublicSettingsSchema = z.record(z.string(), z.string());

export const WhatsAppContactSchema = z.object({
  whatsappNumber: z.string(),
  defaultMessage: z.string().nullable().optional(),
  supportEmail: z.string().nullable().optional(),
  supportPhone: z.string().nullable().optional(),
});

export const SettingItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  group: z.string(),
  description: z.string().nullable().optional(),
  isPublic: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const ShippingConfigSchema = z.object({
  /** Flat shipping charge in paise, applied to orders that need shipping. */
  shippingFee: z.number().int().min(0),
});

export const SupplierDetailsSchema = z.object({
  companyName: z.string(),
  brandName: z.string(),
  gstin: z.string(),
  pan: z.string(),
  state: z.string(),
  stateCode: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),
  pincode: z.string(),
  email: z.string(),
  phone: z.string(),
});

export const SettingTypes = {
  GetPublicSettings: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      group: z.string().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicSettingsSchema,
    }),
  },

  GetWhatsAppContact: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: WhatsAppContactSchema,
    }),
  },

  GetSettingByKey: {
    body: z.object({}),
    params: z.object({
      key: z.string().trim().min(1, { message: "key is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        key: z.string(),
        value: z.string(),
      }),
    }),
  },
};

export const SettingAdminTypes = {
  ListSettings: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      group: z.string().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(SettingItemSchema),
    }),
  },

  UpdateSettings: {
    body: z.record(
      z.string().min(1, "Setting key must not be empty"),
      z.string(),
    ),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicSettingsSchema,
    }),
  },

  SetSetting: {
    body: z.object({
      value: z.string(),
      group: z.string().optional(),
      description: z.string().optional().nullable(),
      isPublic: z.boolean().optional(),
    }),
    params: z.object({
      key: z.string().trim().min(1, { message: "key is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: SettingItemSchema,
    }),
  },

  GetShippingConfig: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: ShippingConfigSchema,
    }),
  },

  UpdateShippingConfig: {
    body: z.object({
      // paise; capped at ₹10,000 to catch a rupees/paise mix-up
      shippingFee: z.number().int().min(0).max(1_000_000),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: ShippingConfigSchema,
    }),
  },

  GetSupplierDetails: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: SupplierDetailsSchema,
    }),
  },

  UpdateSupplierDetails: {
    // The state code is derived from `state` on the server so it can never disagree with it.
    body: z.object({
      companyName: z
        .string()
        .trim()
        .min(1, "Company name is required")
        .max(150),
      gstin: z
        .string()
        .trim()
        .toUpperCase()
        .regex(
          /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
          "GSTIN must be a valid 15-character GSTIN",
        ),
      pan: z
        .string()
        .trim()
        .toUpperCase()
        .regex(
          /^[A-Z]{5}\d{4}[A-Z]$/,
          "PAN must be 10 characters, e.g. AAACP1234A",
        ),
      state: z
        .string()
        .trim()
        .refine((v) => Boolean(INDIAN_STATES_AND_CODES[v.toUpperCase()]), {
          message: "Must be a valid Indian state or union territory",
        }),
      addressLine1: z
        .string()
        .trim()
        .min(1, "Address line 1 is required")
        .max(200),
      addressLine2: z.string().trim().max(200).optional().default(""),
      city: z.string().trim().min(1, "City is required").max(100),
      pincode: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
      email: z.string().trim().email("Enter a valid email address"),
      phone: z
        .string()
        .trim()
        .regex(/^[+\d][\d\s-]{6,19}$/, "Enter a valid phone number"),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: SupplierDetailsSchema,
    }),
  },
};
