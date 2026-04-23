import { apiRequest } from "./api";
import { AddressApi } from "@repo/types";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type ApiAddress = AddressApi.ResponseTypes["GetAddressById"]["data"];

const ADDRESS_BASE = "/addresses";
const LEGACY_ADDRESS_BASE = "/address";

const withAddressFallback = async <T>(
    method: HttpMethod,
    path: string,
    data?: unknown,
): Promise<T> => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const primaryUrl = `${ADDRESS_BASE}${normalizedPath}`;

    try {
        return await apiRequest<T>(method, primaryUrl, data);
    } catch (error: any) {
        const status = error?.status || error?.response?.status;
        if (status !== 404) {
            throw error;
        }

        const legacyUrl = `${LEGACY_ADDRESS_BASE}${normalizedPath}`;
        return apiRequest<T>(method, legacyUrl, data);
    }
};

export type Address = {
    id: string;
    userId: string;
    fullName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    label?: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateAddressData = {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    label?: string;
    isDefault?: boolean;
};

export type UpdateAddressData = Partial<CreateAddressData>;

const normalizeAddress = (address: ApiAddress): Address => ({
    ...address,
    createdAt:
        address.createdAt instanceof Date
            ? address.createdAt.toISOString()
            : String(address.createdAt),
    updatedAt:
        address.updatedAt instanceof Date
            ? address.updatedAt.toISOString()
            : String(address.updatedAt),
});

export const addressService = {
    // Get all addresses for the current user
    getAddresses: async (): Promise<Address[]> => {
        const response = await withAddressFallback<AddressApi.ResponseTypes["ListAddresses"]>(
            "get",
            "/",
        );
        return response.data.map(normalizeAddress);
    },

    // Get a specific address by ID
    getAddress: async (id: string): Promise<Address> => {
        const response = await withAddressFallback<AddressApi.ResponseTypes["GetAddressById"]>(
            "get",
            `/${id}`,
        );
        return normalizeAddress(response.data);
    },

    // Create a new address
    createAddress: async (data: CreateAddressData): Promise<Address> => {
        const response = await withAddressFallback<AddressApi.ResponseTypes["CreateAddress"]>(
            "post",
            "/",
            data,
        );
        return normalizeAddress(response.data);
    },

    // Update an existing address
    updateAddress: async (id: string, data: UpdateAddressData): Promise<Address> => {
        const response = await withAddressFallback<AddressApi.ResponseTypes["UpdateAddress"]>(
            "patch",
            `/${id}`,
            data,
        );
        return normalizeAddress(response.data);
    },

    // Delete an address
    deleteAddress: async (id: string): Promise<void> => {
        await withAddressFallback<AddressApi.ResponseTypes["DeleteAddress"]>(
            "delete",
            `/${id}`,
        );
    },

    // Set an address as default
    setDefaultAddress: async (id: string): Promise<Address> => {
        const response = await withAddressFallback<AddressApi.ResponseTypes["SetDefaultAddress"]>(
            "patch",
            `/${id}/default`,
        );
        return normalizeAddress(response.data);
    },
};