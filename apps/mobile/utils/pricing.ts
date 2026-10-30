export type PricingVariant = {
    price?: number;
    priceWithTax?: number;
    sellingPrice?: number | null;
    sellingPriceWithTax?: number | null;
};

export function getActivePrice(variant: PricingVariant): number {
    return variant.sellingPrice ?? variant.price ?? 0;
}

export function getActivePriceWithTax(variant: PricingVariant): number {
    return variant.sellingPriceWithTax ?? variant.priceWithTax ?? getActivePrice(variant);
}

export function getOriginalPriceWithTax(variant: PricingVariant): number | undefined {
    return variant.priceWithTax ?? variant.price;
}

export function getDiscountPercent(variant: PricingVariant): number {
    if (variant.sellingPrice == null || variant.price == null || variant.price <= 0) {
        return 0;
    }

    return Math.round(((variant.price - variant.sellingPrice) / variant.price) * 100);
}
