import { z } from "zod";

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
};
