import { apiRequest } from "./api";
import type { FilterApi } from "@repo/types";

// Type imports for filter service
type ListGroupsResponse = FilterApi.ResponseTypes["ListGroups"];
type GetGroupByIdResponse = FilterApi.ResponseTypes["GetGroupById"];

/**
 * Filter Service
 * Handles product filter groups for faceted search
 * (e.g., color, size, price ranges)
 */

/**
 * Get all active filter groups
 * @param activeOnly - If true, returns only active filters (default: false)
 * @returns Array of filter groups with their values
 */
export async function getFilterGroups(activeOnly: boolean = false) {
    const response = await apiRequest<ListGroupsResponse>(
        "get",
        `/filters/groups?activeOnly=${activeOnly}`
    );
    return response;
}

/**
 * Get specific filter group by ID with all its values
 * @param groupId - ID of the filter group
 * @returns Filter group with all available filter values
 */
export async function getFilterGroupById(groupId: string) {
    const response = await apiRequest<GetGroupByIdResponse>(
        "get",
        `/filters/groups/${groupId}`
    );
    return response;
}
