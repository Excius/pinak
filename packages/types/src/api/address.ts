import { z } from "zod";

const pincodeValidation = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Pincode must be exactly 6 digits");

const phoneValidation = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string().trim().min(1, "Full name is required"),
  addressLine1: z.string().trim().min(1, "Address line 1 is required"),
  addressLine2: z.string().trim().nullable().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  pincode: pincodeValidation,
  phone: phoneValidation,
  label: z.string().trim().nullable().optional(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AddressTypes = {
  CreateAddress: {
    body: z.object({
      fullName: z.string().trim().min(1, "Full name is required"),
      addressLine1: z.string().trim().min(1, "Address line 1 is required"),
      addressLine2: z.string().trim().optional().nullable(),
      city: z.string().trim().min(1, "City is required"),
      state: z.string().trim().min(1, "State is required"),
      pincode: pincodeValidation,
      phone: phoneValidation,
      label: z.string().trim().optional().nullable(),
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
      fullName: z.string().trim().min(1, "Full name is required").optional(),
      addressLine1: z.string().trim().min(1, "Address line 1 is required").optional(),
      addressLine2: z.string().trim().optional().nullable(),
      city: z.string().trim().min(1, "City is required").optional(),
      state: z.string().trim().min(1, "State is required").optional(),
      pincode: pincodeValidation.optional(),
      phone: phoneValidation.optional(),
      label: z.string().trim().optional().nullable(),
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
