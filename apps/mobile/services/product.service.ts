
import { apiRequest } from "./api";
import type { ProductApi } from '@repo/types';

// Type imports for responses
type GetProductResponse = ProductApi.ResponseTypes['GetProducts'];
type GetProductByIdResponse = ProductApi.ResponseTypes['GetProductById'];
type GetProductBySlugResponse = ProductApi.ResponseTypes['GetProductBySlug']
type GetProductsByCategoryResponse = ProductApi.ResponseTypes['GetProductsWithCategory'];
type GetFeaturedProductsResponse = ProductApi.ResponseTypes['GetFeaturedProducts']


export async function getProducts() {
    const getAllProductresposne = await apiRequest<GetProductResponse>(
        'get',
        '/products'
    );
    return getAllProductresposne;
}

export async function getProductById(productId: string) {
    const getProductIdresponse = await apiRequest<GetProductByIdResponse>(
        'get',
        `/products/${productId}`
    )
    return getProductIdresponse;

}

export async function getProductBySlug(productSlug: string) {
    const getProductSlugResponse = await apiRequest<GetProductBySlugResponse>(
        'get',
        `/products/slug/${productSlug}`
    )
    return getProductSlugResponse;

}

export async function getProductsByCategory(categoryId: string, page?: number, limit?: number, filterValueIds?: string[], brand?: string, inStock: boolean = true) {
    // filter value represents colors or size of container depending ont the product
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (filterValueIds) queryParams.append('filterValueIds', filterValueIds.join(','));
    if (brand) queryParams.append('brand', brand);
    queryParams.append('inStock', inStock.toString());

    const getProductsByCategoryResponse = await apiRequest<GetProductsByCategoryResponse>(
        'get',
        `/products/category/${categoryId}?${queryParams.toString()}`
    );
    return getProductsByCategoryResponse;

}

export async function getFeaturedProducts(page?: number, limit?: number) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());

    const getFeaturedProductResponse = await apiRequest<GetFeaturedProductsResponse>(
        'get',
        `/products/featured?${queryParams.toString()}`
    );
    return getFeaturedProductResponse;


}