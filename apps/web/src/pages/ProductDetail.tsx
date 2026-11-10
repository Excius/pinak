import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import { ProductDetailSkeleton } from "../components/Skeleton";
import {
  getProductBySlug,
  getProductVariants,
  getRelatedProducts,
  getProductsByCategory,
} from "../api/products.api";
import { useCart } from "../context/CartContext";
import { addToWishlist } from "../api/wishlist.api";
import toast from "react-hot-toast";
import type { Product, VariantDetail } from "../api/products.api";
import { formatPaise } from "../utils/currency";

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<VariantDetail[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<VariantDetail | null>(
    null,
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  interface OptionValueItem {
    valueName: string;
    swatchColorHex?: string | null;
    optionValueId?: string;
  }

  interface OptionGroupItem {
    optionName: string;
    isColor: boolean;
    values: OptionValueItem[];
  }

  const [availableOptions, setAvailableOptions] = useState<OptionGroupItem[]>(
    [],
  );
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"description" | "ingredients">(
    "description",
  );
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      setError("");
      try {
        const prod = await getProductBySlug(slug);
        setProduct(prod);

        // Fetch variants
        if (prod?.id) {
          const varList = await getProductVariants(prod.id);
          setVariants(varList);

          // Fetch related products or fallback to category
          let relList = await getRelatedProducts(prod.id);
          if (!relList || relList.length === 0) {
            const catId = prod.categories?.[0]?.id;
            if (catId) {
              const fallback = await getProductsByCategory(catId, { limit: 5 });
              relList = fallback.filter((p) => p.id !== prod.id).slice(0, 4);
            }
          }
          setRelatedProducts(relList || []);

          const firstActive = varList.find((v) => v.isActive) || varList[0];
          if (firstActive) {
            setSelectedVariant(firstActive);
            const initialOpts: Record<string, string> = {};
            firstActive.optionValues?.forEach((ov) => {
              initialOpts[ov.optionName] = ov.valueName;
            });
            setSelectedOptions(initialOpts);

            const primary = firstActive.images?.find((img) => img.isPrimary);
            setSelectedImage(
              primary?.url ||
                firstActive.images?.[0]?.url ||
                prod.frontImageUrl ||
                "",
            );
          } else {
            setSelectedImage(prod.frontImageUrl || "");
          }

          // Build available options groups with dynamic swatches
          const optionsMap = new Map<string, Map<string, OptionValueItem>>();
          varList.forEach((v) => {
            if (v.isActive) {
              v.optionValues?.forEach((ov) => {
                if (!optionsMap.has(ov.optionName)) {
                  optionsMap.set(ov.optionName, new Map());
                }
                const valGroup = optionsMap.get(ov.optionName)!;
                if (!valGroup.has(ov.valueName)) {
                  valGroup.set(ov.valueName, {
                    valueName: ov.valueName,
                    swatchColorHex: ov.swatchColorHex || null,
                    optionValueId: ov.optionValueId,
                  });
                }
              });
            }
          });

          const optsArray: OptionGroupItem[] = Array.from(
            optionsMap.entries(),
          ).map(([optionName, valMap]) => {
            const values = Array.from(valMap.values());
            const isColor =
              /color|shade/i.test(optionName) ||
              values.some((v) => !!v.swatchColorHex);
            return {
              optionName,
              isColor,
              values,
            };
          });
          setAvailableOptions(optsArray);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load product",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // When some active variants have no option values, option pills can never reach them,
  // so list the variants themselves instead.
  const activeVariants = variants.filter((v) => v.isActive);
  const needsVariantPicker =
    activeVariants.length > 1 &&
    activeVariants.some((v) => !v.optionValues || v.optionValues.length === 0);

  const handleVariantPick = (v: VariantDetail) => {
    setSelectedVariant(v);
    const opts: Record<string, string> = {};
    v.optionValues?.forEach((ov) => {
      opts[ov.optionName] = ov.valueName;
    });
    setSelectedOptions(opts);
    const primary = v.images?.find((img) => img.isPrimary);
    setSelectedImage(
      primary?.url || v.images?.[0]?.url || product?.frontImageUrl || "",
    );
    setQuantity(1);
  };

  // When some active variants have no option values, option pills can never reach them,
  // so list the variants themselves instead.
  const activeVariants = variants.filter((v) => v.isActive)
  const needsVariantPicker =
    activeVariants.length > 1 && activeVariants.some((v) => !v.optionValues || v.optionValues.length === 0)

  const handleVariantPick = (v: VariantDetail) => {
    setSelectedVariant(v)
    const opts: Record<string, string> = {}
    v.optionValues?.forEach((ov) => {
      opts[ov.optionName] = ov.valueName
    })
    setSelectedOptions(opts)
    const primary = v.images?.find((img) => img.isPrimary)
    setSelectedImage(primary?.url || v.images?.[0]?.url || product?.frontImageUrl || '')
    setQuantity(1)
  }

  const handleOptionSelect = (optionName: string, valueName: string) => {
    const nextOptions = { ...selectedOptions, [optionName]: valueName };
    setSelectedOptions(nextOptions);

    // Try to find a variant that perfectly matches the new options
    let match = variants.find(
      (v) =>
        v.isActive &&
        v.optionValues?.every(
          (ov) => nextOptions[ov.optionName] === ov.valueName,
        ),
    );

    // If no perfect match exists, find the first variant that at least has the newly selected value
    if (!match) {
      match = variants.find(
        (v) =>
          v.isActive &&
          v.optionValues?.some(
            (ov) => ov.optionName === optionName && ov.valueName === valueName,
          ),
      );
      // Update the rest of the options to match this fallback variant so the UI stays consistent
      if (match) {
        const fallbackOpts: Record<string, string> = {};
        match.optionValues?.forEach((ov) => {
          fallbackOpts[ov.optionName] = ov.valueName;
        });
        setSelectedOptions(fallbackOpts);
      }
    }

    if (match) {
      setSelectedVariant(match);
      const primary = match.images?.find((img) => img.isPrimary);
      setSelectedImage(
        primary?.url || match.images?.[0]?.url || product?.frontImageUrl || "",
      );
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      productVariantId: selectedVariant.id,
      quantity,
    });
  };

  const handleAddToWishlist = async () => {
    if (!selectedVariant) return;
    setWishlistLoading(true);
    try {
      await addToWishlist(selectedVariant.id);
      setWishlistAdded(true);
      setTimeout(() => setWishlistAdded(false), 3000);
    } catch {
      // silently fail
    } finally {
      setWishlistLoading(false);
    }
  };

  const isDiscounted = selectedVariant?.sellingPrice != null;
  const displayPrice = isDiscounted
    ? (selectedVariant.sellingPriceWithTax ?? selectedVariant.sellingPrice)
    : (selectedVariant?.priceWithTax ?? selectedVariant?.price);
  const originalMRP = selectedVariant?.priceWithTax ?? selectedVariant?.price;
  const displayComparePrice =
    selectedVariant?.compareAtPriceWithTax ?? selectedVariant?.compareAtPrice;

  const discount =
    isDiscounted && selectedVariant?.price
      ? Math.round(
          ((selectedVariant.price - selectedVariant.sellingPrice!) /
            selectedVariant.price) *
            100,
        )
      : displayComparePrice &&
          displayPrice &&
          displayComparePrice > displayPrice
        ? Math.round(
            ((displayComparePrice - displayPrice) / displayComparePrice) * 100,
          )
        : null;

  const allImages: string[] = [];
  if (product?.frontImageUrl) allImages.push(product.frontImageUrl);
  if (selectedVariant?.images) {
    selectedVariant.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((img) => {
        if (!allImages.includes(img.url)) allImages.push(img.url);
      });
  }

  if (loading) {
    return (
      <Layout>
        <ProductDetailSkeleton />
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50">
            <span className="material-icons-outlined text-3xl text-red-400">
              error
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold">
            {error || "Product not found"}
          </h2>
          <button
            className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer"
            onClick={() => navigate("/shop")}
          >
            Back to Shop
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <a
            className="hover:text-primary cursor-pointer"
            onClick={() => navigate("/")}
          >
            Home
          </a>
          <span className="material-icons-outlined text-xs">chevron_right</span>
          <a
            className="hover:text-primary cursor-pointer"
            onClick={() => navigate("/shop")}
          >
            Shop
          </a>
          <span className="material-icons-outlined text-xs">chevron_right</span>
          <span className="text-text-main-light truncate">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-dark border border-primary/10 img-zoom">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-icons-outlined text-8xl text-text-muted/30">
                    image
                  </span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === url
                        ? "border-primary shadow-lg shadow-primary/20"
                        : "border-primary/10 hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedImage(url)}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 space-y-6">
            {product.brand && (
              <span className="text-primary text-sm uppercase tracking-widest font-bold">
                {product.brand.name}
              </span>
            )}

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              {product.name}
            </h1>

            {selectedVariant?.sku && (
              <div className="text-xs text-text-muted">
                SKU:{" "}
                <span className="font-mono tracking-wider">
                  {selectedVariant.sku}
                </span>
              </div>
            )}

            {product.categories && product.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => navigate(`/categories/${cat.slug}`)}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {selectedVariant && (
              <div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary price-glow">
                    {formatPaise(displayPrice!)}
                  </span>
                  {isDiscounted &&
                  originalMRP != null &&
                  originalMRP > (displayPrice || 0) ? (
                    <span className="text-lg text-text-muted line-through">
                      {formatPaise(originalMRP)}
                    </span>
                  ) : (
                    displayComparePrice &&
                    displayComparePrice > displayPrice! && (
                      <span className="text-lg text-text-muted line-through">
                        {formatPaise(displayComparePrice)}
                      </span>
                    )
                  )}
                  {discount && (
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Price inclusive of all taxes
                  {(selectedVariant?.taxClass ?? product.taxClass)?.name
                    ? ` (${(selectedVariant?.taxClass ?? product.taxClass)?.name})`
                    : ""}
                </p>
              </div>
            )}

            {selectedVariant && (
              <div className="flex items-center gap-2">
                {selectedVariant.stock > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-sm text-green-400 font-medium">
                      In Stock ({selectedVariant.stock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="text-sm text-red-400 font-medium">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="h-px bg-primary/10"></div>

            {needsVariantPicker && (
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-widest text-primary/70 uppercase">Select Variant</label>
                <div className="flex flex-wrap gap-2.5">
                  {activeVariants.map((v) => {
                    const label = v.optionValues?.length
                      ? v.optionValues.map((ov) => ov.valueName).join(' / ')
                      : `Standard (${v.sku})`
                    const isSelected = selectedVariant?.id === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantPick(v)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                            : 'border-primary/20 text-text-muted hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {!needsVariantPicker && availableOptions.length > 0 && (
              <div className="space-y-5">
                {availableOptions.map((optGroup) => (
                  <div key={optGroup.optionName} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold tracking-widest text-primary/70 uppercase">
                        Select {optGroup.optionName}
                      </label>
                      {selectedOptions[optGroup.optionName] && (
                        <span className="text-xs text-text-main-light font-medium flex items-center gap-1.5">
                          {selectedOptions[optGroup.optionName]}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {optGroup.values.map((val) => {
                        const isSelected =
                          selectedOptions[optGroup.optionName] ===
                          val.valueName;

                        // If it's a color or has swatchColorHex, render dynamic swatch button
                        if (val.swatchColorHex || optGroup.isColor) {
                          const hex = val.swatchColorHex || "#8B8B8B";
                          return (
                            <button
                              key={val.valueName}
                              type="button"
                              onClick={() =>
                                handleOptionSelect(
                                  optGroup.optionName,
                                  val.valueName,
                                )
                              }
                              title={val.valueName}
                              className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_rgba(212,175,55,0.3)] ring-1 ring-primary/40"
                                  : "border-primary/20 text-text-muted hover:border-primary/50 hover:text-text-main-light hover:bg-white/[0.02]"
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full border shadow-sm transition-transform group-hover:scale-110 ${
                                  isSelected
                                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background-main border-white/60"
                                    : "border-white/20"
                                }`}
                                style={{ backgroundColor: hex }}
                              />
                              <span className="font-medium">
                                {val.valueName}
                              </span>
                            </button>
                          );
                        }

                        // Regular size / text pill
                        return (
                          <button
                            key={val.valueName}
                            type="button"
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                                : "border-primary/20 text-text-muted hover:border-primary/40 hover:text-primary"
                            }`}
                            onClick={() =>
                              handleOptionSelect(
                                optGroup.optionName,
                                val.valueName,
                              )
                            }
                          >
                            {val.valueName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-bold tracking-widest text-primary/70 uppercase">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  className="w-10 h-10 rounded-xl border border-primary/20 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <span className="material-icons-outlined">remove</span>
                </button>
                <span className="text-lg font-semibold w-8 text-center">
                  {quantity}
                </span>
                <button
                  className="w-10 h-10 rounded-xl border border-primary/20 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
                  onClick={() => {
                    if (selectedVariant && quantity >= selectedVariant.stock) {
                      toast.error(
                        `Only ${selectedVariant.stock} items available in stock.`,
                      );
                    } else {
                      setQuantity(quantity + 1);
                    }
                  }}
                >
                  <span className="material-icons-outlined">add</span>
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                className="flex-1 bg-primary hover:bg-primary-hover text-black py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all glow-gold cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
              >
                {selectedVariant && selectedVariant.stock > 0
                  ? "Add to Bag"
                  : "Out of Stock"}
              </button>
              <button
                className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  wishlistAdded
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-primary/20 text-text-muted hover:text-primary hover:border-primary"
                }`}
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
              >
                <span className="material-icons-outlined">
                  {wishlistAdded ? "favorite" : "favorite_border"}
                </span>
              </button>
            </div>

            <div className="h-px bg-primary/10"></div>

            <div>
              <div className="flex gap-6 border-b border-primary/10">
                <button
                  className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === "description"
                      ? "text-primary border-b-2 border-primary"
                      : "text-text-muted hover:text-primary"
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  Description
                </button>
                {product.keyIngredients && (
                  <button
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === "ingredients"
                        ? "text-primary border-b-2 border-primary"
                        : "text-text-muted hover:text-primary"
                    }`}
                    onClick={() => setActiveTab("ingredients")}
                  >
                    Key Ingredients
                  </button>
                )}
              </div>
              <div className="pt-6">
                {activeTab === "description" ? (
                  <p className="text-text-muted leading-relaxed whitespace-pre-line">
                    {product.description || "No description available."}
                  </p>
                ) : (
                  <p className="text-text-muted leading-relaxed whitespace-pre-line">
                    {product.keyIngredients}
                  </p>
                )}
              </div>
            </div>

            {((product.tags && product.tags.length > 0) ||
              (selectedVariant?.tags && selectedVariant.tags.length > 0)) && (
              <div className="flex flex-wrap gap-2 pt-4">
                {product.tags?.map((tag, i) => (
                  <span
                    key={`p-${i}`}
                    className="px-3 py-1 rounded-full bg-surface-elevated text-text-muted text-xs border border-primary/5"
                  >
                    #{tag}
                  </span>
                ))}
                {selectedVariant?.tags?.map((tag, i) => (
                  <span
                    key={`v-${i}`}
                    className="px-3 py-1 rounded-full bg-surface-elevated text-primary/80 text-xs border border-primary/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-primary/10 pt-16">
            <div className="flex flex-col items-center justify-center mb-12 space-y-4">
              <span className="text-primary text-xs tracking-[0.2em] font-bold uppercase">
                Discover More
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-text-main-light">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.slice(0, 4).map((rel) => {
                const bestVariant =
                  rel.variants?.find((v) => v.isActive) || rel.variants?.[0];
                return (
                  <ProductCard
                    key={rel.id}
                    id={rel.id}
                    name={rel.name}
                    slug={rel.slug}
                    imageUrl={
                      rel.frontImageUrl || bestVariant?.image?.url || ""
                    }
                    price={bestVariant?.price}
                    priceWithTax={bestVariant?.priceWithTax}
                    sellingPrice={bestVariant?.sellingPrice}
                    sellingPriceWithTax={bestVariant?.sellingPriceWithTax}
                    comparePrice={bestVariant?.compareAtPrice ?? undefined}
                    compareAtPriceWithTax={
                      bestVariant?.compareAtPriceWithTax ?? undefined
                    }
                    category={rel.categories?.[0]?.name || ""}
                    variantId={bestVariant?.id}
                    variantLabel={
                      bestVariant?.optionValues
                        ?.map((ov) => ov.valueName)
                        .join(" / ") || ""
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
