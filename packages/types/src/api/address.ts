import { z } from "zod";

export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().nullable().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  label: z.string().nullable().optional(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AddressTypes = {
  CreateAddress: {
    body: z.object({
      fullName: z.string().min(1),
      addressLine1: z.string().min(1),
      addressLine2: z.string().optional().nullable(),
      city: z.string().min(1),
      state: z.string().min(1),
      pincode: z.string().min(6),
      phone: z.string().min(10),
      label: z.string().optional().nullable(),
      isDefault: z.boolean().optional().default(false),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AddressSchema,
    }),
  },
  UpdateAddress: {
    body: z.object({
      fullName: z.string().min(1).optional(),
      addressLine1: z.string().min(1).optional(),
      addressLine2: z.string().optional().nullable(),
      city: z.string().min(1).optional(),
      state: z.string().min(1).optional(),
      pincode: z.string().min(6).optional(),
      phone: z.string().min(10).optional(),
      label: z.string().optional().nullable(),
      isDefault: z.boolean().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AddressSchema,
    }),
  },
  ListAddresses: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AddressSchema),
    }),
  },
  GetAddressById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AddressSchema,
    }),
  },
  DeleteAddress: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },
  SetDefaultAddress: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AddressSchema,
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof AddressTypes]: z.infer<(typeof AddressTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof AddressTypes]: z.infer<(typeof AddressTypes)[K]["params"]>;
};

export type QueryTypes = {
  [K in keyof typeof AddressTypes]: z.infer<(typeof AddressTypes)[K]["query"]>;
};

export type ResponseTypes = {
  [K in keyof typeof AddressTypes]: z.infer<(typeof AddressTypes)[K]["response"]>;
};
