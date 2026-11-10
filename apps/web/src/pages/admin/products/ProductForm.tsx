import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getProductByIdAdmin,
  createProductAdmin,
  updateProductAdmin,
  updateProductVariantAdmin,
  createProductVariantAdmin,
  deleteProductVariantAdmin,
  addProductImageAdmin,
  updateProductImageAdmin,
  deleteProductImageAdmin,
  setPrimaryImageAdmin,
  setProductCategoriesAdmin,
  getRelatedProductsAdmin,
  addRelatedProductAdmin,
  removeRelatedProductAdmin,
  getAllProductsAdmin,
} from "../../../api/admin/admin.products.api";
import type {
  AdminProduct,
  AdminProductVariant,
} from "../../../api/admin/admin.products.api";
import {
  getAllCategoriesAdmin,
  getAllBrandsAdmin,
} from "../../../api/admin/admin.catalog.api";
import type {
  AdminCategory,
  AdminBrand,
} from "../../../api/admin/admin.catalog.api";
import {
  getOptions,
  type AdminOption,
} from "../../../api/admin/admin.options.api";
import {
  getAllTaxClasses,
  getAllWeightClasses,
  getAllLengthClasses,
  type TaxClass,
  type WeightClass,
  type LengthClass,
} from "../../../api/admin/admin.settings.api";
import {
  getFilterGroups,
  addFilterToVariantAdmin,
  removeFilterFromVariantAdmin,
  type AdminFilterGroup,
} from "../../../api/admin/admin.filters.api";
import { formatPaise } from "../../../utils/currency";

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [options, setOptions] = useState<AdminOption[]>([]);
  const [filterGroups, setFilterGroups] = useState<AdminFilterGroup[]>([]);
  const [taxClasses, setTaxClasses] = useState<TaxClass[]>([]);
  const [weightClasses, setWeightClasses] = useState<WeightClass[]>([]);
  const [lengthClasses, setLengthClasses] = useState<LengthClass[]>([]);
  const [editingVariant, setEditingVariant] =
    useState<AdminProductVariant | null>(null);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: "",
    slug: "",
    description: "",
    isActive: true,
    tags: [],
    brandId: "",
    metaTitle: "",
    metaDescription: "",
    keyIngredients: "",
    categories: [],
    variants: [],
  });

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showAddRelated, setShowAddRelated] = useState(false);
  const [relatedSearchQuery, setRelatedSearchQuery] = useState("");
  const [relatedSearchResults, setRelatedSearchResults] = useState<
    AdminProduct[]
  >([]);
  const [isSearchingRelated, setIsSearchingRelated] = useState(false);

  // â”€â”€ Data Fetching â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brs, opts, groups, taxes, weights, lengths] =
          await Promise.all([
            getAllCategoriesAdmin(),
            getAllBrandsAdmin(),
            getOptions(),
            getFilterGroups().catch(() => [] as AdminFilterGroup[]),
            getAllTaxClasses().catch(() => [] as TaxClass[]),
            getAllWeightClasses().catch(() => [] as WeightClass[]),
            getAllLengthClasses().catch(() => [] as LengthClass[]),
          ]);
        setTaxClasses(taxes);
        setWeightClasses(weights);
        setLengthClasses(lengths);
        setCategories(cats);
        setBrands(brs);
        setOptions(opts);
        setFilterGroups(groups);

        if (isEdit && id) {
          const product = await getProductByIdAdmin(id);
          setFormData(product);

          const related = await getRelatedProductsAdmin(id);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      // Extract only the fields the backend CreateProduct / UpdateProduct schemas accept
      const allowedFields = [
        "name",
        "slug",
        "description",
        "keyIngredients",
        "metaTitle",
        "metaDescription",
        "metaKeywords",
        "seoKeyword",
        "model",
        "ean",
        "frontImageUrl",
        "tags",
        "brandId",
        "requiresShipping",
        "outOfStockStatus",
        "dimensionLength",
        "dimensionWidth",
        "dimensionHeight",
        "lengthClassId",
        "weightGrams",
        "weightClassId",
        "taxClassId",
        "sortOrder",
        "isActive",
      ];

      const cleanData: Record<string, unknown> = {};
      for (const key of allowedFields) {
        const val = (formData as Record<string, unknown>)[key];
        // Skip empty strings, null, undefined â€” backend validates strictly
        if (val !== "" && val !== null && val !== undefined) {
          cleanData[key] = val;
        }
      }

      // Blank optional fields must be sent as null when editing, otherwise they could never be cleared
      if (isEdit) {
        for (const key of [
          "dimensionLength",
          "dimensionWidth",
          "dimensionHeight",
          "lengthClassId",
          "weightGrams",
          "weightClassId",
          "taxClassId",
        ]) {
          const val = (formData as Record<string, unknown>)[key];
          if (val === "" || val === null || val === undefined)
            cleanData[key] = null;
        }
      }

      // Categories are handled via a separate junction endpoint
      // The API response may have categories as { id, name } or { categoryId, category: { id, name } }
      const categoryIds = (formData.categories || [])
        .map((c: any) => getCatId(c))
        .filter(
          (id: unknown): id is string =>
            typeof id === "string" && id.length > 0,
        );

      if (isEdit && id) {
        await updateProductAdmin(id, cleanData);
        // Save categories separately â€” don't let it block the product save
        if (categoryIds.length > 0) {
          try {
            await setProductCategoriesAdmin(id, categoryIds);
          } catch (catErr) {
            console.warn("Category assignment failed (non-blocking):", catErr);
          }
        }
        toast.success("Product updated successfully!");
        navigate("/admin/products");
      } else {
        // name is required for creation
        if (!cleanData.name) {
          setSaveMessage({ type: "error", text: "Product name is required." });
          setSaving(false);
          return;
        }
        const newProd = await createProductAdmin(cleanData);
        if (categoryIds.length > 0) {
          try {
            await setProductCategoriesAdmin(newProd.id, categoryIds);
          } catch (catErr) {
            console.warn("Category assignment failed (non-blocking):", catErr);
          }
        }
        navigate(`/admin/products/${newProd.id}`, { replace: true });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save product";
      console.error("Save failed", err);
      setSaveMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const openEditVariant = (variant: AdminProductVariant | null) => {
    if (!variant) {
      setEditingVariant(null);
      return;
    }

    // Map option values to IDs: prefer the id the API sends, fall back to a name lookup
    let optionValueIds: string[] = [];
    if (variant.optionValues) {
      optionValueIds = variant.optionValues
        .map((ov) => {
          if (ov.optionValueId) return ov.optionValueId;
          const opt = options.find((o) => o.name === ov.optionName);
          const val = opt?.values.find((v) => v.value === ov.valueName);
          return val?.id || "";
        })
        .filter((id) => id !== "");
    }

    const filterValueIds = (variant.filterValues || []).map(
      (fv) => fv.filterValueId,
    );
    setEditingVariant({ ...variant, optionValueIds, filterValueIds });
  };

  // What this variant would inherit: its selected option values (by option order), then the product
  const inheritedMeasurements = (() => {
    const chosen = editingVariant?.optionValueIds ?? [];
    const fromOptions = options
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .flatMap((o) =>
        o.values
          .filter((v) => chosen.includes(v.id))
          .map((v) => ({ v, label: `${o.name} ${v.value}` })),
      );
    const w = fromOptions.find((x) => x.v.weightGrams != null);
    const d = fromOptions.find(
      (x) =>
        x.v.dimensionLength != null ||
        x.v.dimensionWidth != null ||
        x.v.dimensionHeight != null,
    );
    return {
      weight: w
        ? {
            grams: w.v.weightGrams as number,
            weightClassId: w.v.weightClassId ?? null,
            source: w.label,
          }
        : formData.weightGrams != null
          ? {
              grams: formData.weightGrams,
              weightClassId: formData.weightClassId ?? null,
              source: "product",
            }
          : null,
      dimensions: d
        ? {
            length: d.v.dimensionLength ?? null,
            width: d.v.dimensionWidth ?? null,
            height: d.v.dimensionHeight ?? null,
            lengthClassId: d.v.lengthClassId ?? null,
            source: d.label,
          }
        : formData.dimensionLength != null ||
            formData.dimensionWidth != null ||
            formData.dimensionHeight != null
          ? {
              length: formData.dimensionLength ?? null,
              width: formData.dimensionWidth ?? null,
              height: formData.dimensionHeight ?? null,
              lengthClassId: formData.lengthClassId ?? null,
              source: "product",
            }
          : null,
    };
  })();

  const handleUpdateVariant = async (variant: AdminProductVariant) => {
    try {
      // Validate sellingPrice
      if (variant.sellingPrice != null && variant.sellingPrice !== undefined) {
        if (variant.sellingPrice < 0) {
          setSaveMessage({ type: "error", text: "Selling price must be >= 0" });
          return;
        }
        if (variant.sellingPrice > variant.price) {
          setSaveMessage({
            type: "error",
            text: "Selling price cannot be higher than the main MRP price",
          });
          return;
        }
      }

      if (!variant.id) {
        // Create new variant
        if (!id) return; // Need product ID
        const created = await createProductVariantAdmin(id, {
          sku: variant.sku,
          price: variant.price,
          sellingPrice:
            variant.sellingPrice !== undefined ? variant.sellingPrice : null,
          stock: variant.stock,
          optionValueIds: variant.optionValueIds,
          ...(variant.taxClassId ? { taxClassId: variant.taxClassId } : {}),
          ...(variant.weightGrams != null
            ? { weightGrams: variant.weightGrams }
            : {}),
          ...(variant.weightClassId
            ? { weightClassId: variant.weightClassId }
            : {}),
          ...(variant.dimensionLength != null
            ? { dimensionLength: variant.dimensionLength }
            : {}),
          ...(variant.dimensionWidth != null
            ? { dimensionWidth: variant.dimensionWidth }
            : {}),
          ...(variant.dimensionHeight != null
            ? { dimensionHeight: variant.dimensionHeight }
            : {}),
          ...(variant.lengthClassId
            ? { lengthClassId: variant.lengthClassId }
            : {}),
        });
        const filterValues = await syncVariantFilters(
          created.id,
          [],
          variant.filterValueIds || [],
        );
        setFormData((prev) => ({
          ...prev,
          variants: [...(prev.variants || []), { ...created, filterValues }],
        }));
      } else {
        // Update existing variant
        const updated = await updateProductVariantAdmin(variant.id, {
          price: variant.price,
          sellingPrice:
            variant.sellingPrice !== undefined ? variant.sellingPrice : null,
          stock: variant.stock,
          sku: variant.sku,
          optionValueIds: variant.optionValueIds,
          // null clears the override so the variant uses its product's tax class again
          taxClassId: variant.taxClassId || null,
          // null clears the override so the variant uses its product's weight again
          weightGrams: variant.weightGrams ?? null,
          weightClassId: variant.weightClassId || null,
          dimensionLength: variant.dimensionLength ?? null,
          dimensionWidth: variant.dimensionWidth ?? null,
          dimensionHeight: variant.dimensionHeight ?? null,
          lengthClassId: variant.lengthClassId || null,
        });
        const originalIds = (
          formData.variants?.find((v) => v.id === variant.id)?.filterValues ||
          []
        ).map((fv) => fv.filterValueId);
        const filterValues = await syncVariantFilters(
          variant.id,
          originalIds,
          variant.filterValueIds || [],
        );
        setFormData((prev) => ({
          ...prev,
          variants: prev.variants?.map((v) =>
            v.id === variant.id ? { ...v, ...updated, filterValues } : v,
          ),
        }));
      }
      setEditingVariant(null);
    } catch (err: any) {
      console.error("Failed to save variant", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save variant";
      setSaveMessage({ type: "error", text: msg });
    }
  };

  // Filters are per variant: apply the difference between what was saved and what is selected.
  const syncVariantFilters = async (
    variantId: string,
    originalIds: string[],
    desiredIds: string[],
  ) => {
    const toAdd = desiredIds.filter((fid) => !originalIds.includes(fid));
    const toRemove = originalIds.filter((fid) => !desiredIds.includes(fid));
    await Promise.all([
      ...toAdd.map((fid) => addFilterToVariantAdmin(variantId, fid)),
      ...toRemove.map((fid) => removeFilterFromVariantAdmin(variantId, fid)),
    ]);
    return desiredIds.map((filterValueId) => ({ variantId, filterValueId }));
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!window.confirm("Are you sure you want to delete this variant?"))
      return;
    try {
      await deleteProductVariantAdmin(variantId);
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants?.filter((v) => v.id !== variantId),
      }));
    } catch (err) {
      console.error("Failed to delete variant", err);
      setSaveMessage({ type: "error", text: "Failed to delete variant." });
    }
  };

  const handleImageUpload = async (variantId: string, file: File) => {
    const data = new FormData();
    data.append("image", file);
    // The first image of a variant becomes its primary image
    const hasImages =
      (formData.variants?.find((v) => v.id === variantId)?.images?.length ??
        0) > 0;
    data.append("isPrimary", hasImages ? "false" : "true");
    try {
      await addProductImageAdmin(variantId, data);
      // Refresh product data to see new image
      if (id) {
        const product = await getProductByIdAdmin(id);
        setFormData(product);
        // Also refresh the editing variant if it's the same one
        if (editingVariant?.id === variantId) {
          const refreshedVariant = product.variants?.find(
            (v) => v.id === variantId,
          );
          // Only the images changed: keep the unsaved form edits (options, filters, tax class, prices...)
          if (refreshedVariant)
            setEditingVariant((prev) =>
              prev ? { ...prev, images: refreshedVariant.images } : prev,
            );
        }
      }
    } catch (err: any) {
      console.error("Image upload failed", err);
      setSaveMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to upload image.",
      });
    }
  };

  // Replace the file of an existing image (PUT, multipart)
  const handleReplaceImage = async (
    imageId: string,
    variantId: string,
    file: File,
  ) => {
    const data = new FormData();
    data.append("image", file);
    try {
      await updateProductImageAdmin(imageId, data);
      if (id) {
        const product = await getProductByIdAdmin(id);
        setFormData(product);
        if (editingVariant?.id === variantId) {
          const refreshedVariant = product.variants?.find(
            (v) => v.id === variantId,
          );
          if (refreshedVariant)
            setEditingVariant((prev) =>
              prev ? { ...prev, images: refreshedVariant.images } : prev,
            );
        }
      }
    } catch (err: any) {
      console.error("Image replace failed", err);
      setSaveMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to replace image.",
      });
    }
  };

  const handleDeleteImage = async (imageId: string, variantId: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await deleteProductImageAdmin(imageId);
      if (id) {
        const product = await getProductByIdAdmin(id);
        setFormData(product);
        if (editingVariant?.id === variantId) {
          const refreshedVariant = product.variants?.find(
            (v) => v.id === variantId,
          );
          // Only the images changed: keep the unsaved form edits (options, filters, tax class, prices...)
          if (refreshedVariant)
            setEditingVariant((prev) =>
              prev ? { ...prev, images: refreshedVariant.images } : prev,
            );
        }
      }
    } catch (err) {
      console.error("Image delete failed", err);
    }
  };

  const handleSetPrimaryImage = async (imageId: string, variantId: string) => {
    try {
      await setPrimaryImageAdmin(imageId);
      if (id) {
        const product = await getProductByIdAdmin(id);
        setFormData(product);
        if (editingVariant?.id === variantId) {
          const refreshedVariant = product.variants?.find(
            (v) => v.id === variantId,
          );
          // Only the images changed: keep the unsaved form edits (options, filters, tax class, prices...)
          if (refreshedVariant)
            setEditingVariant((prev) =>
              prev ? { ...prev, images: refreshedVariant.images } : prev,
            );
        }
      }
    } catch (err) {
      console.error("Set primary image failed", err);
    }
  };

  // Helper: extract category ID from either API shape { categoryId, category } or flat { id }
  const getCatId = (c: any): string =>
    c.categoryId || c.category?.id || c.id || "";

  const toggleCategory = (cat: AdminCategory) => {
    const exists = formData.categories?.some((c) => getCatId(c) === cat.id);
    setFormData((prev) => ({
      ...prev,
      categories: exists
        ? prev.categories?.filter((c) => getCatId(c) !== cat.id)
        : [
            ...(prev.categories || []),
            { id: cat.id, name: cat.name, slug: cat.slug },
          ],
    }));
  };

  // â”€â”€ Related Products Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (relatedSearchQuery.trim().length > 1) {
        setIsSearchingRelated(true);
        try {
          const res = await getAllProductsAdmin({
            search: relatedSearchQuery,
            limit: 10,
          });
          setRelatedSearchResults(res.items.filter((p) => p.id !== id)); // exclude self
        } catch (err) {
          console.error("Failed to search related products", err);
        } finally {
          setIsSearchingRelated(false);
        }
      } else {
        setRelatedSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [relatedSearchQuery, id]);

  const handleAddRelatedProduct = async (relatedProductId: string) => {
    if (!id) return;
    try {
      await addRelatedProductAdmin(id, relatedProductId, 0);
      const updatedRelated = await getRelatedProductsAdmin(id);
      setRelatedProducts(updatedRelated);
      setRelatedSearchQuery("");
      setShowAddRelated(false);
    } catch (err) {
      console.error("Failed to add related product", err);
      setSaveMessage({ type: "error", text: "Failed to add related product." });
    }
  };

  const handleRemoveRelatedProduct = async (relatedProductId: string) => {
    if (!id) return;
    if (
      !window.confirm("Are you sure you want to remove this related product?")
    )
      return;
    try {
      await removeRelatedProductAdmin(id, relatedProductId);
      setRelatedProducts((prev) =>
        prev.filter((rp) => rp.relatedProductId !== relatedProductId),
      );
    } catch (err) {
      console.error("Failed to remove related product", err);
      setSaveMessage({
        type: "error",
        text: "Failed to remove related product.",
      });
    }
  };

  // â”€â”€ Loading State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-text-muted">Loading product data...</p>
        </div>
      </div>
    );
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* â”€â”€ Variant Edit Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {editingVariant && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingVariant(null)}
          />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-8 w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-text-main-light mb-4">
              {editingVariant.id
                ? `Edit Variant: ${editingVariant.sku}`
                : "Add New Variant"}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4">
              {/* Left column: identity, pricing, tax and packaging */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={editingVariant.sku}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        sku: e.target.value,
                      })
                    }
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase">
                      Price / MRP (₹) *
                    </label>
                    <input
                      type="number"
                      value={
                        editingVariant.price !== undefined
                          ? editingVariant.price / 100
                          : ""
                      }
                      onChange={(e) =>
                        setEditingVariant({
                          ...editingVariant,
                          price: Math.round(Number(e.target.value) * 100),
                        })
                      }
                      className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                      placeholder="MRP (₹)"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      value={
                        editingVariant.sellingPrice != null
                          ? editingVariant.sellingPrice / 100
                          : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setEditingVariant({
                          ...editingVariant,
                          sellingPrice:
                            val === "" ? null : Math.round(Number(val) * 100),
                        });
                      }}
                      className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                      placeholder="Optional (Discounted)"
                    />
                    <p className="text-[10px] text-text-muted">
                      Empty to remove discount
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={editingVariant.stock}
                      onChange={(e) =>
                        setEditingVariant({
                          ...editingVariant,
                          stock: Number(e.target.value),
                        })
                      }
                      className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Weight & size — per variant. Blank = inherited from the selected option values (or the product) */}
                <div className="space-y-3 mt-4 p-4 rounded-xl border border-primary/10 bg-background-main/40">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase">
                      Package weight &amp; dimensions (for shipping)
                    </label>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      The packed parcel, not the product quantity (30ml, 50ml…
                      is chosen under Options).{" "}
                      {inheritedMeasurements.weight ||
                      inheritedMeasurements.dimensions
                        ? "Leave a field blank to use the value inherited from the selected options."
                        : "Leave blank if not needed, or set it once on an option value (Admin → Options) so every matching variant inherits it."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase">
                        Weight
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={editingVariant.weightGrams ?? ""}
                        onChange={(e) =>
                          setEditingVariant({
                            ...editingVariant,
                            weightGrams:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                        placeholder={
                          inheritedMeasurements.weight
                            ? `${inheritedMeasurements.weight.grams} (${inheritedMeasurements.weight.source})`
                            : ""
                        }
                        className="w-full bg-background-main border border-primary/20 rounded-lg px-3 py-2 text-sm text-text-main-light outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase">
                        Weight Class
                      </label>
                      <select
                        value={editingVariant.weightClassId || ""}
                        onChange={(e) =>
                          setEditingVariant({
                            ...editingVariant,
                            weightClassId: e.target.value || null,
                          })
                        }
                        className="w-full bg-background-main border border-primary/20 rounded-lg px-3 py-2 text-sm text-text-main-light outline-none focus:border-primary"
                      >
                        <option value="">
                          {inheritedMeasurements.weight?.weightClassId
                            ? "Inherited"
                            : "None"}
                        </option>
                        {weightClasses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {(
                      [
                        ["dimensionLength", "Length", "length"],
                        ["dimensionWidth", "Width", "width"],
                        ["dimensionHeight", "Height", "height"],
                      ] as const
                    ).map(([key, label, dimKey]) => (
                      <div key={key} className="space-y-1 min-w-0">
                        <label className="text-[11px] font-bold text-text-muted uppercase">
                          {label}
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={editingVariant[key] ?? ""}
                          onChange={(e) =>
                            setEditingVariant({
                              ...editingVariant,
                              [key]:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            })
                          }
                          placeholder={
                            inheritedMeasurements.dimensions?.[dimKey] != null
                              ? String(inheritedMeasurements.dimensions[dimKey])
                              : ""
                          }
                          className="w-full bg-background-main border border-primary/20 rounded-lg px-3 py-2 text-sm text-text-main-light outline-none focus:border-primary"
                        />
                      </div>
                    ))}
                    <div className="space-y-1 min-w-0">
                      <label className="text-[11px] font-bold text-text-muted uppercase">
                        Unit
                      </label>
                      <select
                        value={editingVariant.lengthClassId || ""}
                        onChange={(e) =>
                          setEditingVariant({
                            ...editingVariant,
                            lengthClassId: e.target.value || null,
                          })
                        }
                        className="w-full bg-background-main border border-primary/20 rounded-lg px-2 py-2 text-sm text-text-main-light outline-none focus:border-primary"
                      >
                        <option value="">
                          {inheritedMeasurements.dimensions?.lengthClassId
                            ? "Inherited"
                            : "None"}
                        </option>
                        {lengthClasses.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {inheritedMeasurements.weight &&
                    editingVariant.weightGrams == null && (
                      <p className="text-[11px] text-primary">
                        Weight inherited from{" "}
                        {inheritedMeasurements.weight.source}:{" "}
                        {inheritedMeasurements.weight.grams} g
                      </p>
                    )}
                  {inheritedMeasurements.dimensions &&
                    editingVariant.dimensionLength == null &&
                    editingVariant.dimensionWidth == null &&
                    editingVariant.dimensionHeight == null && (
                      <p className="text-[11px] text-primary">
                        Package size inherited from{" "}
                        {inheritedMeasurements.dimensions.source}:{" "}
                        {[
                          inheritedMeasurements.dimensions.length,
                          inheritedMeasurements.dimensions.width,
                          inheritedMeasurements.dimensions.height,
                        ]
                          .map((d) => d ?? "–")
                          .join(" × ")}
                      </p>
                    )}
                </div>

                {/* Tax class — per variant; blank means "same as the product" */}
                <div className="space-y-2 mt-4">
                  <label className="text-xs font-bold text-text-muted uppercase">
                    Tax Class
                  </label>
                  <select
                    value={editingVariant.taxClassId || ""}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        taxClassId: e.target.value || null,
                      })
                    }
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                  >
                    <option value="">
                      {formData.taxClassId
                        ? `Same as product (${taxClasses.find((t) => t.id === formData.taxClassId)?.name ?? "product tax class"})`
                        : "Same as product (no tax class set)"}
                    </option>
                    {taxClasses.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.rate}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-text-muted">
                    Overrides the product's tax class for this variant only.
                  </p>
                </div>
              </div>

              {/* Right column: what the shopper picks (options), how it is found (filters), pictures */}
              <div className="space-y-4">
                {/* Options (Size, Shade, etc) — compact grid; scrolls if many options are added */}
                {options.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase">
                      Options{" "}
                      <span className="normal-case font-normal text-text-muted">
                        — what the shopper picks, e.g. Size 30ml / 50ml, Shade
                      </span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                      {options.map((opt) => {
                        const selectedValId =
                          editingVariant.optionValueIds?.find((id) =>
                            opt.values.some((v) => v.id === id),
                          ) || "";
                        return (
                          <div key={opt.id} className="space-y-1 min-w-0">
                            <label className="text-[11px] font-bold text-text-muted uppercase truncate block">
                              {opt.name}
                            </label>
                            <select
                              value={selectedValId}
                              onChange={(e) => {
                                const newId = e.target.value;
                                const otherIds = (
                                  editingVariant.optionValueIds || []
                                ).filter(
                                  (id) => !opt.values.some((v) => v.id === id),
                                );
                                setEditingVariant({
                                  ...editingVariant,
                                  optionValueIds: newId
                                    ? [...otherIds, newId]
                                    : otherIds,
                                });
                              }}
                              className="w-full bg-background-main border border-primary/20 rounded-lg px-3 py-2 text-sm text-text-main-light outline-none focus:border-primary"
                            >
                              <option value="">None</option>
                              {opt.values.map((val) => (
                                <option key={val.id} value={val.id}>
                                  {val.value}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Filters — per variant, since each variant can belong to different filters */}
                {filterGroups.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase">
                      Filters{" "}
                      <span className="normal-case font-normal text-text-muted">
                        — tags used by the shop's filter sidebar to help
                        shoppers find this variant
                      </span>
                    </label>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {filterGroups
                        .filter(
                          (g) =>
                            g.isActive !== false && (g.values || []).length > 0,
                        )
                        .map((group) => (
                          <div key={group.id} className="space-y-1.5">
                            <p className="text-[11px] font-bold text-text-muted uppercase">
                              {group.name}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {group.values.map((val) => {
                                const on = (
                                  editingVariant.filterValueIds || []
                                ).includes(val.id);
                                return (
                                  <button
                                    key={val.id}
                                    type="button"
                                    onClick={() =>
                                      setEditingVariant({
                                        ...editingVariant,
                                        filterValueIds: on
                                          ? (
                                              editingVariant.filterValueIds ||
                                              []
                                            ).filter((fid) => fid !== val.id)
                                          : [
                                              ...(editingVariant.filterValueIds ||
                                                []),
                                              val.id,
                                            ],
                                      })
                                    }
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                      on
                                        ? "bg-primary text-white border-primary"
                                        : "bg-background-main text-text-muted border-primary/20 hover:border-primary/50"
                                    }`}
                                  >
                                    {val.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div className="space-y-2 mt-4">
                  <label className="text-xs font-bold text-text-muted uppercase">
                    Variant Images
                  </label>
                  {editingVariant.id ? (
                    <>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-background-main border border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary transition-all">
                        <span className="material-icons-outlined text-primary">
                          cloud_upload
                        </span>
                        <span className="text-sm text-text-muted">
                          Upload Image
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file)
                              handleImageUpload(editingVariant.id, file);
                          }}
                        />
                      </label>
                      {editingVariant.images?.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 py-2">
                          {editingVariant.images.map((img) => (
                            <div
                              key={img.id}
                              className={`relative group rounded-xl border-2 overflow-hidden ${img.isPrimary ? "border-primary shadow-[0_0_8px_rgba(212,175,55,0.3)]" : "border-primary/10"}`}
                            >
                              <div className="w-full aspect-square">
                                <img
                                  src={img.url}
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              </div>
                              {img.isPrimary && (
                                <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                  Primary
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {!img.isPrimary && (
                                  <button
                                    onClick={() =>
                                      handleSetPrimaryImage(
                                        img.id,
                                        editingVariant.id,
                                      )
                                    }
                                    className="p-1.5 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors"
                                    title="Set as primary image"
                                  >
                                    <span className="material-icons-outlined text-sm">
                                      star
                                    </span>
                                  </button>
                                )}
                                <label
                                  className="p-1.5 bg-background-main/90 text-text-main-light rounded-lg hover:bg-background-main transition-colors cursor-pointer"
                                  title="Replace image file"
                                >
                                  <span className="material-icons-outlined text-sm">
                                    swap_horiz
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file)
                                        handleReplaceImage(
                                          img.id,
                                          editingVariant.id,
                                          file,
                                        );
                                      e.target.value = "";
                                    }}
                                  />
                                </label>
                                <button
                                  onClick={() =>
                                    handleDeleteImage(img.id, editingVariant.id)
                                  }
                                  className="p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-colors"
                                  title="Delete image"
                                >
                                  <span className="material-icons-outlined text-sm">
                                    delete
                                  </span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-background-main rounded-xl border border-primary/10 text-center">
                      <p className="text-xs text-text-muted">
                        Save this variant first to upload images.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-2 lg:col-span-2">
                <button
                  onClick={() => setEditingVariant(null)}
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateVariant(editingVariant)}
                  className="flex-1 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/30 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Save Feedback Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {saveMessage && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            saveMessage.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <span className="material-icons-outlined text-lg">
            {saveMessage.type === "success" ? "check_circle" : "error"}
          </span>
          {saveMessage.text}
        </div>
      )}

      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">
            {isEdit ? `Edit: ${formData.name}` : "Create New Product"}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Configure your product specifications and variants.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/products")}
            className="px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      {/* â”€â”€ Form Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column â€” Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-4">
              General Information
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">
                Product Name
              </label>
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="e.g. Hydrating Face Cream"
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Slug
                </label>
                <input
                  name="slug"
                  value={formData.slug || ""}
                  onChange={handleChange}
                  placeholder="hydrating-face-cream"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all"
                />
              </div>

              {/* Custom Brand Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Brand
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light text-left flex justify-between items-center focus:border-primary/50 outline-none transition-all"
                  >
                    <span
                      className={
                        formData.brandId
                          ? "text-text-main-light"
                          : "text-text-muted"
                      }
                    >
                      {brands.find((b) => b.id === formData.brandId)?.name ||
                        "Select Brand"}
                    </span>
                    <span
                      className={`material-icons-outlined text-text-muted transition-transform ${showBrandDropdown ? "rotate-180" : ""}`}
                    >
                      expand_more
                    </span>
                  </button>

                  {showBrandDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowBrandDropdown(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0a0a0a] border border-primary/20 rounded-xl shadow-2xl py-2 max-h-60 overflow-y-auto">
                        <div
                          className="px-4 py-2.5 hover:bg-primary/10 text-text-muted cursor-pointer text-sm"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, brandId: "" }));
                            setShowBrandDropdown(false);
                          }}
                        >
                          None
                        </div>
                        {brands.map((b) => (
                          <div
                            key={b.id}
                            className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                              formData.brandId === b.id
                                ? "text-primary font-bold bg-primary/5"
                                : "text-text-main-light hover:bg-primary/10"
                            }`}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                brandId: b.id,
                              }));
                              setShowBrandDropdown(false);
                            }}
                          >
                            {b.name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">
                Tax Class
              </label>
              <select
                value={formData.taxClassId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    taxClassId: e.target.value || null,
                  }))
                }
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all"
              >
                <option value="">No tax class</option>
                {taxClasses.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.rate}%)
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-text-muted">
                Default for all variants. Each variant can override it when
                editing the variant.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={5}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light focus:border-primary/50 outline-none transition-all resize-y"
              />
            </div>
          </section>

          {/* Shipping */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-3">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase">
              Shipping
            </h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresShipping ?? true}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requiresShipping: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-text-main-light">
                This product needs shipping
              </span>
            </label>
            <p className="text-[11px] text-text-muted">
              Package weight and dimensions are set on each variant (or once on
              an option value such as Size 50ml, which its variants inherit).
            </p>
          </section>

          {/* Variants (edit mode only) */}
          {isEdit && (
            <section className="bg-background-light rounded-2xl border border-primary/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase">
                    Product Variants
                  </h2>
                  <span className="text-xs text-text-muted">
                    {formData.variants?.length || 0} variant
                    {formData.variants?.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  onClick={() =>
                    openEditVariant({
                      id: "",
                      sku: "",
                      price: 0,
                      sellingPrice: null,
                      stock: 0,
                      compareAtPrice: null,
                      isActive: true,
                      lowStockThreshold: null,
                      optionValues: [],
                      images: [],
                      optionValueIds: [],
                    })
                  }
                  className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                >
                  + Add Variant
                </button>
              </div>

              {formData.variants && formData.variants.length > 0 ? (
                <div className="space-y-3">
                  {formData.variants.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 bg-background-main rounded-xl border border-primary/5 flex items-center justify-between group hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-background-light flex items-center justify-center border border-primary/10 overflow-hidden">
                          {v.images?.[0]?.url ? (
                            <img
                              src={v.images[0].url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <span className="material-icons-outlined text-text-muted text-sm">
                              image
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main-light">
                            {v.sku}
                          </p>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">
                            {v.optionValues?.length > 0
                              ? v.optionValues
                                  .map(
                                    (ov) => `${ov.optionName}: ${ov.valueName}`,
                                  )
                                  .join(" / ")
                              : "Standard Variant"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          {v.sellingPrice != null ? (
                            <div>
                              <p className="text-sm font-bold text-primary">
                                {formatPaise(v.sellingPrice)}
                              </p>
                              <p className="text-[10px] text-text-muted line-through">
                                {formatPaise(v.price ?? 0)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm font-bold text-primary">
                              {formatPaise(v.price ?? 0)}
                            </p>
                          )}
                          <p className="text-[10px] text-text-muted">
                            Stock:{" "}
                            <span
                              className={
                                v.stock < 10 ? "text-red-400" : "text-green-400"
                              }
                            >
                              {v.stock}
                            </span>
                            {v.measurements?.weight && (
                              <span
                                className="ml-2 text-text-muted"
                                title={`Weight from ${v.measurements.weight.source}`}
                              >
                                {v.measurements.weight.grams} g
                              </span>
                            )}
                            {v.measurements?.dimensions && (
                              <span
                                className="ml-2 text-text-muted"
                                title={`Size from ${v.measurements.dimensions.source}`}
                              >
                                {[
                                  v.measurements.dimensions.length,
                                  v.measurements.dimensions.width,
                                  v.measurements.dimensions.height,
                                ]
                                  .map((d) => d ?? "–")
                                  .join("×")}
                              </span>
                            )}
                            {v.taxClass?.overridden && v.taxClass.name && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                                {v.taxClass.name}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditVariant(v)}
                            className="p-2 text-text-muted hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-primary/5"
                            title="Edit Variant"
                          >
                            <span className="material-icons-outlined text-xl">
                              settings
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteVariant(v.id)}
                            className="p-2 text-text-muted hover:text-red-500 transition-colors cursor-pointer rounded-lg hover:bg-red-500/5"
                            title="Delete Variant"
                          >
                            <span className="material-icons-outlined text-xl">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-background-main border border-primary/10 rounded-xl">
                  <span className="material-icons-outlined text-text-muted text-4xl mb-2">
                    inventory_2
                  </span>
                  <p className="text-sm text-text-main-light font-medium">
                    No variants yet
                  </p>
                  <p className="text-xs text-text-muted mt-1 mb-4">
                    You need at least one variant to sell this product.
                  </p>
                  <button
                    onClick={() =>
                      openEditVariant({
                        id: "",
                        sku: "",
                        price: 0,
                        stock: 0,
                        compareAtPrice: null,
                        isActive: true,
                        lowStockThreshold: null,
                        optionValues: [],
                        images: [],
                        optionValueIds: [],
                      })
                    }
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow hover:bg-primary/90 transition-colors"
                  >
                    Add First Variant
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Related Products (edit mode only) */}
          {isEdit && (
            <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase">
                  Related Products
                </h2>
                <button
                  onClick={() => setShowAddRelated(!showAddRelated)}
                  className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                >
                  {showAddRelated ? "Cancel" : "+ Add Related"}
                </button>
              </div>

              {showAddRelated && (
                <div className="bg-background-main border border-primary/20 p-4 rounded-xl space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search products by name..."
                    value={relatedSearchQuery}
                    onChange={(e) => setRelatedSearchQuery(e.target.value)}
                    className="w-full bg-background-light border border-primary/20 rounded-xl px-4 py-2 text-text-main-light focus:border-primary/50 outline-none text-sm transition-all"
                  />
                  {isSearchingRelated && (
                    <p className="text-xs text-text-muted">Searching...</p>
                  )}
                  {!isSearchingRelated && relatedSearchResults.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {relatedSearchResults.map((product) => {
                        const isAlreadyRelated = relatedProducts.some(
                          (rp) => rp.relatedProductId === product.id,
                        );
                        return (
                          <div
                            key={product.id}
                            className="flex justify-between items-center bg-background-light p-2 rounded-lg border border-primary/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-background-main overflow-hidden">
                                {product.frontImageUrl ? (
                                  <img
                                    src={product.frontImageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="material-icons-outlined text-text-muted text-xs flex items-center justify-center w-full h-full">
                                    image
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-text-main-light">
                                {product.name}
                              </span>
                            </div>
                            <button
                              disabled={isAlreadyRelated}
                              onClick={() =>
                                handleAddRelatedProduct(product.id)
                              }
                              className={`px-3 py-1 rounded text-xs font-bold ${
                                isAlreadyRelated
                                  ? "bg-background-main text-text-muted cursor-not-allowed"
                                  : "bg-primary text-white hover:bg-primary/90"
                              }`}
                            >
                              {isAlreadyRelated ? "Added" : "Add"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {!isSearchingRelated &&
                    relatedSearchQuery.length > 1 &&
                    relatedSearchResults.length === 0 && (
                      <p className="text-xs text-text-muted">
                        No products found.
                      </p>
                    )}
                </div>
              )}

              <div className="space-y-3">
                {relatedProducts.length > 0 ? (
                  relatedProducts.map((rp) => (
                    <div
                      key={rp.relatedProductId}
                      className="p-3 bg-background-main rounded-xl border border-primary/5 flex items-center justify-between group hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background-light flex items-center justify-center border border-primary/10 overflow-hidden">
                          {rp.relatedProduct?.frontImageUrl ? (
                            <img
                              src={rp.relatedProduct.frontImageUrl}
                              alt={rp.relatedProduct.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-icons-outlined text-text-muted text-sm">
                              image
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main-light line-clamp-1">
                            {rp.relatedProduct?.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            Status:{" "}
                            {rp.relatedProduct?.isActive
                              ? "Active"
                              : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveRelatedProduct(rp.relatedProductId)
                        }
                        className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove related product"
                      >
                        <span className="material-icons-outlined text-lg">
                          delete_outline
                        </span>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-muted italic text-center py-4">
                    No related products assigned.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Column â€” Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">
              Publishing
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-main-light">Status</span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none ${formData.isActive ? "bg-primary" : "bg-gray-600"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
            <p className="text-[10px] text-text-muted italic">
              {formData.isActive
                ? "Product is live on the storefront."
                : "Product is hidden (draft)."}
            </p>
          </section>

          {/* Organization â€” Categories */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">
              Categories
            </h2>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 text-sm text-text-main-light cursor-pointer hover:text-primary transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={
                      formData.categories?.some(
                        (c) => getCatId(c) === cat.id,
                      ) || false
                    }
                    onChange={() => toggleCategory(cat)}
                    className="rounded border-primary/20 bg-background-main text-primary accent-amber-500"
                  />
                  {cat.name}
                </label>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-text-muted italic">
                  No categories found.
                </p>
              )}
            </div>
          </section>

          {/* SEO */}
          <section className="bg-background-light rounded-2xl border border-primary/10 p-6 space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-2">
              SEO Details
            </h2>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">
                Meta Title
              </label>
              <input
                name="metaTitle"
                value={formData.metaTitle || ""}
                onChange={handleChange}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-2 text-sm text-text-main-light outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription || ""}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-main border border-primary/20 rounded-xl px-3 py-2 text-sm text-text-main-light outline-none resize-y"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
