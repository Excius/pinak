import { apiRequest } from "./api";

import type { CategoryApi } from "@repo/types";

// used for building query params
import { buildQueryParams } from "@/utils/query/buildQueryParams";




type GetTopCategoriesResponse = CategoryApi.ResponseTypes['ListTopCategories']

// this one gets you one level  of subcategories for a given category
// used for the purpose of getting main subcategoires of a main category
type ListSubCategoryResponse = CategoryApi.ResponseTypes['ListCategories']

type GetCategoryTreeResponse = CategoryApi.ResponseTypes['GetCategoryTree']


type GetCategoryByIdResponse = CategoryApi.ResponseTypes['GetCategoryById']

// This service gives  us the top most main categories as displayed in the category field in the mobile
export async function getTopCategories() {
    const getTopcategoryResponse = await apiRequest<GetTopCategoriesResponse>(
        'get',
        '/categories/top',
    )
    return getTopcategoryResponse;

}

export async function getSubCategories(
    parentId: string,
    withChildren: boolean = false
) {
    const queryString = buildQueryParams({
        parentId,
        withChildren
    });
    const url = queryString ? `/categories?${queryString}` : '/categories';

    const getSubCategoryResponse = await apiRequest<ListSubCategoryResponse>(
        'get',
        url,
    );
    return getSubCategoryResponse;
}

export async function getCategoryTree() {
    const getCategoryTreeResponse = await apiRequest<GetCategoryTreeResponse>(
        'get',
        '/categories/tree',
    );
    return getCategoryTreeResponse;
}

export async function getCategoryById(categoryId: string) {
    const getCategoryByIdResponse = await apiRequest<GetCategoryByIdResponse>(
        'get',
        `/categories/${categoryId}`,
    );
    return getCategoryByIdResponse;
}
