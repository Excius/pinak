import { z } from "zod";

export const INDIAN_STATES_AND_CODES: Record<string, string> = {
  "JAMMU AND KASHMIR": "01",
  "HIMACHAL PRADESH": "02",
  "PUNJAB": "03",
  "CHANDIGARH": "04",
  "UTTARAKHAND": "05",
  "HARYANA": "06",
  "DELHI": "07",
  "RAJASTHAN": "08",
  "UTTAR PRADESH": "09",
  "BIHAR": "10",
  "SIKKIM": "11",
  "ARUNACHAL PRADESH": "12",
  "NAGALAND": "13",
  "MANIPUR": "14",
  "MIZORAM": "15",
  "TRIPURA": "16",
  "MEGHALAYA": "17",
  "ASSAM": "18",
  "WEST BENGAL": "19",
  "JHARKHAND": "20",
  "ODISHA": "21",
  "CHHATTISGARH": "22",
  "MADHYA PRADESH": "23",
  "GUJARAT": "24",
  "DADRA AND NAGAR HAVELI AND DAMAN AND DIU": "26",
  "MAHARASHTRA": "27",
  "ANDHRA PRADESH": "37",
  "KARNATAKA": "29",
  "GOA": "30",
  "LAKSHADWEEP": "31",
  "KERALA": "32",
  "TAMIL NADU": "33",
  "PUDUCHERRY": "34",
  "ANDAMAN AND NICOBAR ISLANDS": "35",
  "TELANGANA": "36",
  "LADAKH": "38",
};

export const INDIAN_STATE_NAMES = Object.keys(INDIAN_STATES_AND_CODES).map(
  (name) =>
    name
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
);

const pincodeValidation = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Pincode must be exactly 6 digits");

const phoneValidation = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

const stateValidation = z
  .string()
  .trim()
  .min(1, "State is required")
  .refine(
    (val) => Boolean(INDIAN_STATES_AND_CODES[val.trim().toUpperCase()]),
    {
      message: "Must be a valid Indian state or union territory",
    }
  );

export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string().trim().min(1, "Full name is required"),
  addressLine1: z.string().trim().min(1, "Address line 1 is required"),
  addressLine2: z.string().trim().nullable().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: stateValidation,
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
      state: stateValidation,
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
      state: stateValidation.optional(),
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
