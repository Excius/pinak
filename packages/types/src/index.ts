// Common types used across the monorepo

export * from "./user.js";

// Keep commonly used schema maps available at root.
export { AuthTypes } from "./api/auth.js";
export { ProductTypes } from "./api/product.js";
export { ComboKitTypes } from "./api/comboKit.js";
export { BrandTypes } from "./api/brand.js";
export { OptionTypes } from "./api/option.js";
export { FilterTypes } from "./api/filter.js";
export { TaxClassTypes } from "./api/taxClass.js";
export { LengthWeightTypes } from "./api/lengthWeight.js";
export { ProductCategoryTypes } from "./api/productCategory.js";
export { RelatedProductTypes } from "./api/relatedProduct.js";
export { CategoryTypes } from "./api/category.js";
export { FeaturedSectionTypes } from "./api/featuredSection.js";
export { WishlistTypes } from "./api/wishlist.js";

// Namespaced exports avoid collisions for generic type names
// like BodyTypes / ParamsTypes across different API modules.
export * as AuthApi from "./api/auth.js";
export * as ProductApi from "./api/product.js";
export * as ComboKitApi from "./api/comboKit.js";
export * as BrandApi from "./api/brand.js";
export * as OptionApi from "./api/option.js";
export * as FilterApi from "./api/filter.js";
export * as TaxClassApi from "./api/taxClass.js";
export * as LengthWeightApi from "./api/lengthWeight.js";
export * as ProductCategoryApi from "./api/productCategory.js";
export * as RelatedProductApi from "./api/relatedProduct.js";
export * as CategoryApi from "./api/category.js";
export * as FeaturedSectionApi from "./api/featuredSection.js";
export * as WishlistApi from "./api/wishlist.js";
