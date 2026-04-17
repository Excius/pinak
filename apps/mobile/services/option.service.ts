import { apiRequest } from "./api";
import type { OptionApi } from "@repo/types";

// Type imports for option service
type ListOptionsResponse = OptionApi.ResponseTypes["ListOptions"];
type GetOptionByIdResponse = OptionApi.ResponseTypes["GetOptionById"];

/**
 * Option Service
 * Handles product options metadata
 * (e.g., Size, Color, Material - with their possible values)
 */

/**
 * Get all product options available
 * @returns Array of all options with their possible values
 */
export async function getOptions() {
    const response = await apiRequest<ListOptionsResponse>(
        "get",
        "/options"
    );
    return response;
}

/**
 * Get specific option by ID with all its values
 * @param optionId - ID of the option
 * @returns Option details including all possible values
 */
export async function getOptionById(optionId: string) {
    const response = await apiRequest<GetOptionByIdResponse>(
        "get",
        `/options/${optionId}`
    );
    return response;
}
