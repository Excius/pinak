import { apiRequest } from "./api";
import type { FeaturedSectionApi } from "@repo/types";

// Type imports for featured section service
type ListFeaturedSectionsResponse =
  FeaturedSectionApi.ResponseTypes["ListFeaturedSections"];
type GetFeaturedSectionByIdResponse =
  FeaturedSectionApi.ResponseTypes["GetFeaturedSectionById"];

/**
 * Featured Section Service
 * Handles curated product collections and sections
 * (e.g., "Expert Picks", "Homepage Hero", "Deals")
 */

/**
 * Get all featured sections
 * @returns Array of all featured sections sorted by priority
 */
export async function getFeaturedSections() {
  const response = await apiRequest<ListFeaturedSectionsResponse>(
    "get",
    "/featured-sections"
  );
  return response;
}

/**
 * Get specific featured section by ID with its products
 * @param sectionId - ID of the featured section
 * @returns Section details
 */
export async function getFeaturedSectionById(sectionId: string) {
  const response = await apiRequest<GetFeaturedSectionByIdResponse>(
    "get",
    `/featured-sections/${sectionId}`
  );
  return response;
}
