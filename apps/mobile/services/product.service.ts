
import { apiRequest } from "./api";
import type { ProductApi } from '@repo/types';


// used for building query params
import { buildQueryParams } from "@/utils/query/buildQueryParams";


// Type imports for each service grouped together
type GetProductResponse = ProductApi.ResponseTypes['GetProducts'];
type GetProductsOptions = Omit<
    Partial<ProductApi.QueryTypes['GetProducts']>,
    'page' | 'limit'
>;


type GetProductByIdResponse = ProductApi.ResponseTypes['GetProductById'];


type GetProductBySlugResponse = ProductApi.ResponseTypes['GetProductBySlug']


type GetProductsByCategoryResponse = ProductApi.ResponseTypes['GetProductsWithCategory'];


type GetFeaturedProductsResponse = ProductApi.ResponseTypes['GetFeaturedProducts']
// type GetProductWithDetailsResponse = ProductApi.ResponseTypes['GetProductWithDetails'];
type GetProductWithVariantsResponse = ProductApi.ResponseTypes['CreateProductVariant'];



//  api module should be stateless and should not hold any state related to user preferences or app state. Instead, the inStock preference should be passed as a parameter to the service functions that require it. This way, the service remains reusable and can be used in different contexts without being tied to a specific state.

// The inStock shoudl be managed and defaulted at the component/interface level and managed therein itself



// let IN_STOCK = false; // Default value, can be updated based on user preference or app state

// export function setInStockPreference(inStock: boolean) {
//     IN_STOCK = inStock;
// }

// export function getInStockPreference() {
//     return IN_STOCK;
// }


export async function getProducts(
    page: number,
    limit: number,
    options: GetProductsOptions = {}
) {

    const queryString = buildQueryParams({
        page,
        limit,
        ...options
    });
    const url = queryString ? `/products?${queryString}` : '/products';

    const response = await apiRequest<GetProductResponse>('get', url);
    return response;
}




export async function getProductById(productId: string) {
    const getProductIdresponse = await apiRequest<GetProductByIdResponse>(
        'get',
        `/products/${productId}`
    )
    return getProductIdresponse;

}






export async function getProductsByCategory(inStock: boolean, categoryId: string, page?: number, limit?: number, filterValueIds?: string[], brand?: string) {
    // filter value represents colors or size of container depending ont the product
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (filterValueIds) queryParams.append('filterValueIds', filterValueIds.join(','));
    if (brand) queryParams.append('brand', brand);
    // setInStockPreference(inStock);
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


export async function getProductwithDetails(productId: string) {

}




export async function getFetauredProductsBySection(sectionId: string) {

}


// extra services just in case we need them in the future, not currently used in the app but can be used in the future when we have more complex product pages with variants and details
export async function getProductBySlug(productSlug: string) {
    const getProductSlugResponse = await apiRequest<GetProductBySlugResponse>(
        'get',
        `/products/slug/${productSlug}`
    )
    return getProductSlugResponse;

}


export async function getProductWithVariants(productId: string) {
    const getProductWithVariantResponse = await apiRequest<GetProductWithVariantsResponse>(
        'get',
        `/products/${productId}/variants`
    );
    return getProductWithVariantResponse;
}
