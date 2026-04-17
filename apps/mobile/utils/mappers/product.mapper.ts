import type { ProductApi } from "@repo/types";

type ProductListItem =
    ProductApi.ResponseTypes["GetProductsWithCategory"]["data"]["items"][number];

type ProductDetail = ProductApi.ResponseTypes["GetProductById"]["data"];
type ProductVariant = ProductDetail["variants"][number];

export interface ProductCardItem {
    id: string;
    title: string;
    image: string;
    rating: number;
    reviews: number;
    price: number;
    originalPrice?: number;
    badge?: "Bestseller";
    variantId?: string;
}

const PRODUCT_IMAGE_PLACEHOLDER =
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80";

function getVariantImage(variant: ProductVariant): string | null {
    return variant.image?.url || null;
}

function getPrimaryImageFromVariants(variants: ProductVariant[]): string | null {
    const withPrimaryImage = variants.find((variant) => variant.image?.isPrimary);
    if (withPrimaryImage) {
        return getVariantImage(withPrimaryImage);
    }

    const withAnyImage = variants.find((variant) => variant.image?.url);
    return withAnyImage ? getVariantImage(withAnyImage) : null;
}

function getDisplayPrice(variants: ProductVariant[]): {
    price: number;
    originalPrice?: number;
} {
    if (variants.length === 0) {
        return { price: 0 };
    }

    const sortedByPrice = [...variants].sort((a, b) => a.price - b.price);
    const preferredVariant = sortedByPrice[0];

    if (
        preferredVariant.compareAtPrice &&
        preferredVariant.compareAtPrice > preferredVariant.price
    ) {
        return {
            price: preferredVariant.price,
            originalPrice: preferredVariant.compareAtPrice,
        };
    }

    return { price: preferredVariant.price };
}

export function mapProductsToCardItems(products: ProductListItem[]): ProductCardItem[] {
    return products.map((product) => {
        const image =
            product.frontImageUrl ||
            getPrimaryImageFromVariants(product.variants) ||
            PRODUCT_IMAGE_PLACEHOLDER;

        const { price, originalPrice } = getDisplayPrice(product.variants);
        const reviews = product.purchasedCount || 0;
        
        // Get the first variant ID for wishlist operations
        const variantId = product.variants?.[0]?.id;

        return {
            id: product.id,
            title: product.name,
            image,
            rating: reviews > 0 ? 4.5 : 0,
            reviews,
            price,
            originalPrice,
            badge: reviews >= 20 ? "Bestseller" : undefined,
            variantId,
        };
    });
}

export function mapProductDetailImage(
    product: ProductDetail,
    selectedVariant: ProductVariant | null,
): string {
    return (
        selectedVariant?.image?.url ||
        product.frontImageUrl ||
        getPrimaryImageFromVariants(product.variants) ||
        PRODUCT_IMAGE_PLACEHOLDER
    );
}
