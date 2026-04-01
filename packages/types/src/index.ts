// Common types used across the monorepo

export * from "./user.js";

// Keep commonly used schema maps available at root.
export { AuthTypes } from "./api/auth.js";
export { ProductTypes } from "./api/product.js";
export { ComboKitTypes } from "./api/comboKit.js";
export {
  BrandTypes,
  OptionTypes,
  FilterTypes,
  TaxClassTypes,
  LengthWeightTypes,
  ProductCategoryTypes,
  RelatedProductTypes,
  CategoryTypes,
  FeaturedSectionTypes,
} from "./api/catalog.js";
export { WishlistTypes } from "./api/wishlist.js";

// Namespaced exports avoid collisions for generic type names
// like BodyTypes / ParamsTypes across different API modules.
export * as AuthApi from "./api/auth.js";
export * as ProductApi from "./api/product.js";
export * as ComboKitApi from "./api/comboKit.js";
export * as CatalogApi from "./api/catalog.js";

// Root-level aliases for auth request/response maps.
export type {
  BodyTypes as AuthBodyTypes,
  ParamsTypes as AuthParamsTypes,
  QueryTypes as AuthQueryTypes,
  ResponseTypes as AuthResponseTypes,
} from "./api/auth.js";
