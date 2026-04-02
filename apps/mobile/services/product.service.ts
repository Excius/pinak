
import { apiRequest } from "./api";
import type { ProductApi, CatalogApi } from '@repo/types';


// used for building query params
import { buildQueryParams } from "@/utils/query/buildQueryParams";


// Type imports for each service grouped together

// Products
type GetProductResponse = ProductApi.ResponseTypes['GetProducts'];
type GetProductsOptions = Omit<
    Partial<ProductApi.QueryTypes['GetProducts']>,
    'page' | 'limit'
>;

type GetProductByIdResponse = ProductApi.ResponseTypes['GetProductById'];

type GetProductsByCategoryResponse = ProductApi.ResponseTypes['GetProductsWithCategory'];
type GetProductByCategoryOptions = Omit<Partial<ProductApi.QueryTypes['GetProductsWithCategory']>,
    'page' | 'limit'
>;


type SearchProductsResponse = ProductApi.ResponseTypes['SearchProducts'];


// Variants
type GetProductWithVariantsResponse = ProductApi.ResponseTypes['GetProductVariants'];


// Featured Products
type GetFeaturedProductsResponse = ProductApi.ResponseTypes['GetFeaturedProducts']


// categories


// reelated products
// type RelatedProductsResponse = ProductApi.ResponseTypes['GetRelatedProducts']   
type GetProductBySlugResponse = ProductApi.ResponseTypes['GetProductBySlug']






// type GetProductWithDetailsResponse = ProductApi.ResponseTypes['GetProductWithDetails'];




//  api module should be stateless and should not hold any state related to user preferences or app state. Instead, the inStock preference should be passed as a parameter to the service functions that require it. This way, the service remains reusable and can be used in different contexts without being tied to a specific state.

// The inStock shoudl be managed and defaulted at the component/interface level and managed therein itself





// Product Services
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



export async function getProductsByCategory(
    categoryId: string,
    page: number,
    limit: number,
    options: GetProductByCategoryOptions = {}) {
    // filter value represents colors or size of container depending ont the product
    const queryString = buildQueryParams({
        page,
        limit,
        ...options
    });

    const getProductsByCategoryResponse = await apiRequest<GetProductsByCategoryResponse>(
        'get',
        `/products/category/${categoryId}?${queryString}`
    );
    return getProductsByCategoryResponse;

}

export async function searchProducts(
    query: string,
    page: number,
    limit: number
) {
    const queryString = buildQueryParams({
        q: query,
        page,
        limit
    });

    const url = queryString ? `/products/search?${queryString}` : '/products/search';
    const searchProductsResponse = await apiRequest<SearchProductsResponse>(
        'get',
        url
    );
    return searchProductsResponse;
}



// Product Variant services
export async function getProductWithVariants(productId: string) {
    const getProductWithVariantResponse = await apiRequest<GetProductWithVariantsResponse>(
        'get',
        `/products/${productId}/variants`
    );
    return getProductWithVariantResponse;
}




//  Featured Product services
export async function getFeaturedProducts(page?: number, limit?: number) {
    const queryString = buildQueryParams({
        page,
        limit
    });

    const getFeaturedProductResponse = await apiRequest<GetFeaturedProductsResponse>(
        'get',
        `/products/featured?${queryString}`
    );
    return getFeaturedProductResponse;
}


export async function getFeaturedProductsBySection(sectionId: string, page?: number, limit?: number) {
    const queryString = buildQueryParams({
        page,
        limit
    });

    const getFeaturedProductsBySectionResponse = await apiRequest<GetFeaturedProductsResponse>(
        'get',
        `/products/featured/section/${sectionId}?${queryString}`
    );
    return getFeaturedProductsBySectionResponse;
}



// extra services just in case we need them in the future, not currently used in the app but can be used in the future when we have more complex product pages with variants and details
export async function getProductBySlug(productSlug: string) {
    const getProductSlugResponse = await apiRequest<GetProductBySlugResponse>(
        'get',
        `/products/slug/${productSlug}`
    )
    return getProductSlugResponse;

}



