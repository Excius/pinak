import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAllProductsAdmin,
  getDeletedProductsAdmin,
  updateProductStatusAdmin,
  softDeleteProductAdmin,
  restoreProductAdmin,
  hardDeleteProductAdmin,
  bulkUpdateProductStatusAdmin,
  getProductsByStatusAdmin,
} from "../../../api/admin/admin.products.api";
import type {
  AdminProduct,
  AdminProductListParams,
} from "../../../api/admin/admin.products.api";
import { formatPaise } from "../../../utils/currency";
import { ImportInventoryModal } from "./components/ImportInventoryModal";
import { ExportInventoryModal } from "./components/ExportInventoryModal";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "DELETED";

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<StatusFilter>(
    (location.state as { tab?: StatusFilter } | null)?.tab ?? "ALL",
  );
  const [params, setParams] = useState<AdminProductListParams>({
    page: 1,
    limit: 15,
    search: "",
  });

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Confirmation modals state
  const [softDeleteTarget, setSoftDeleteTarget] = useState<AdminProduct | null>(
    null,
  );
  const [hardDeleteTarget, setHardDeleteTarget] = useState<AdminProduct | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (activeTab === "ACTIVE") {
        const { items, total } = await getProductsByStatusAdmin(
          "ACTIVE",
          params,
        );
        setProducts(items);
        setTotal(total);
      } else if (activeTab === "INACTIVE") {
        const { items, total } = await getProductsByStatusAdmin(
          "INACTIVE",
          params,
        );
        setProducts(items);
        setTotal(total);
      } else if (activeTab === "DELETED") {
        const { items, total } = await getDeletedProductsAdmin(params);
        setProducts(items);
        setTotal(total);
      } else {
        const { items, total } = await getAllProductsAdmin(params);
        setProducts(items);
        setTotal(total);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
    fetchProducts();
  }, [params, activeTab]);

  const handleStatusToggle = async (product: AdminProduct) => {
    try {
      const nextStatus = !product.isActive;
      const updated = await updateProductStatusAdmin(product.id, nextStatus);
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, isActive: updated.isActive } : p,
        ),
      );
      toast.success(
        nextStatus
          ? `Product "${product.name}" activated!`
          : `Product "${product.name}" set to inactive.`,
      );
      // If we are filtering by INACTIVE and activated the product, refresh list
      if (activeTab === "INACTIVE" && nextStatus) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setTotal((prev) => Math.max(0, prev - 1));
      } else if (activeTab === "ACTIVE" && !nextStatus) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update product status");
    }
  };

  const handleSoftDelete = async () => {
    if (!softDeleteTarget) return;
    setActionLoading(true);
    try {
      await softDeleteProductAdmin(softDeleteTarget.id);
      setSoftDeleteTarget(null);
      setFeedback({
        type: "success",
        message: `"${softDeleteTarget.name}" moved to Trash.`,
      });
      await fetchProducts();
    } catch (err: any) {
      console.error("Failed to soft delete product", err);
      const msg =
        err?.response?.data?.message || "Failed to move product to trash.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (product: AdminProduct) => {
    setActionLoading(true);
    try {
      await restoreProductAdmin(product.id);
      setFeedback({
        type: "success",
        message: `"${product.name}" restored to Active Inventory.`,
      });
      await fetchProducts();
    } catch (err: any) {
      console.error("Failed to restore product", err);
      const msg = err?.response?.data?.message || "Failed to restore product.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleHardDelete = async () => {
    if (!hardDeleteTarget) return;
    setActionLoading(true);
    try {
      await hardDeleteProductAdmin(hardDeleteTarget.id);
      setHardDeleteTarget(null);
      setFeedback({
        type: "success",
        message: `"${hardDeleteTarget.name}" was permanently deleted.`,
      });
      await fetchProducts();
    } catch (err: any) {
      console.error("Failed to permanently delete product", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to permanently delete product. It may have existing orders or dependencies.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkActivate = async (activate: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      setIsBulkUpdating(true);
      await bulkUpdateProductStatusAdmin(selectedIds, activate);
      toast.success(
        `Successfully ${activate ? "activated" : "deactivated"} ${selectedIds.length} products!`,
      );
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error("Failed bulk status update", err);
      toast.error("Failed to update selected products");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, search: e.target.value, page: 1 });
  };

  const formatDeletedDate = (dateStr: string | null) => {
    if (!dateStr) return "Recently";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Soft Delete Modal */}
      {softDeleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !actionLoading && setSoftDeleteTarget(null)}
          />
          <div className="relative bg-background-light border border-amber-500/20 rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-4">
              <span className="material-icons-outlined text-3xl">delete</span>
            </div>
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">
              Move to Trash?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Are you sure you want to move{" "}
              <strong className="text-text-main-light font-semibold">
                "{softDeleteTarget.name}"
              </strong>{" "}
              to trash? It will be hidden from the storefront, but you can
              restore it anytime from the Trash tab.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setSoftDeleteTarget(null)}
                className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSoftDelete}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hard Delete Modal */}
      {hardDeleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !actionLoading && setHardDeleteTarget(null)}
          />
          <div className="relative bg-background-light border border-red-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-4">
              <span className="material-icons-outlined text-3xl">
                delete_forever
              </span>
            </div>
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">
              Permanently Delete Product?
            </h3>
            <p className="text-sm text-text-muted mb-2">
              Are you sure you want to permanently delete{" "}
              <strong className="text-text-main-light font-semibold">
                "{hardDeleteTarget.name}"
              </strong>
              ?
            </p>
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 font-medium">
              Warning: This action CANNOT be undone. All variants, images, and
              data associated with this product will be permanently purged.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setHardDeleteTarget(null)}
                className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleHardDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header with Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">
            Catalog & Inventory Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your store products, verify imported items, and export
            inventory spreadsheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Import Spreadsheet */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 bg-background-light hover:bg-background-main border border-primary/20 hover:border-primary/50 text-text-main-light rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-icons-outlined text-primary text-[18px]">
              upload_file
            </span>
            Import Sheet
          </button>

          {/* Export Spreadsheet */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 bg-background-light hover:bg-background-main border border-primary/20 hover:border-primary/50 text-text-main-light rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-icons-outlined text-primary text-[18px]">
              file_download
            </span>
            Export Sheet
          </button>

          {/* New Product */}
          <Link
            to="/admin/products/new"
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
          >
            <span className="material-icons-outlined text-[18px]">add</span>
            New Product
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-base">
              {feedback.type === "success" ? "check_circle" : "error_outline"}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-text-muted hover:text-text-main-light transition-colors"
          >
            <span className="material-icons-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-primary/10 pb-1">
        {[
          { key: "ALL", label: "All Products", icon: "apps" },
          { key: "ACTIVE", label: "Active in Store", icon: "check_circle" },
          {
            key: "INACTIVE",
            label: "Pending Verification (Inactive)",
            icon: "pending_actions",
            badge: "New Import",
          },
          { key: "DELETED", label: "Archived / Deleted", icon: "archive" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as StatusFilter);
                setParams((prev) => ({ ...prev, page: 1 }));
              }}
              className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                isActive
                  ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                  : "text-text-muted hover:text-text-main-light border-transparent hover:bg-background-light/40"
              }`}
            >
              <span className="material-icons-outlined text-[17px]">
                {tab.icon}
              </span>
              {tab.label}
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] bg-yellow-500/20 text-yellow-400 font-extrabold normal-case">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/15 border border-primary/30 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-primary text-[20px]">
              checklist
            </span>
            <span className="text-sm font-bold text-text-main-light">
              {selectedIds.length} product{selectedIds.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => handleBulkActivate(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span className="material-icons-outlined text-[16px]">check</span>
              Activate All Selected
            </button>

            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => handleBulkActivate(false)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span className="material-icons-outlined text-[16px]">pause</span>
              Deactivate Selected
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 text-xs font-bold text-text-muted hover:text-text-main-light hover:bg-background-light rounded-xl transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-background-light rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-primary/10 flex flex-wrap gap-4 items-center justify-between bg-background-main/50">
          <div className="relative w-full sm:w-80">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search products by name, code, brand..."
              className="w-full pl-10 pr-4 py-2 bg-background-light border border-primary/20 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text-main-light placeholder:text-text-muted/50"
              value={params.search || ""}
              onChange={handleSearch}
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-text-muted font-bold">
            <span>
              Total: <strong className="text-primary">{total}</strong> Products
            </span>
            {activeTab === "INACTIVE" && (
              <span className="px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                Awaiting Verification
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light/50 border-b border-primary/10 text-xs tracking-widest text-primary/70 uppercase">
                <th className="px-4 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      products.length > 0 &&
                      selectedIds.length === products.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-primary/30 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Brand / HSN</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Price / MRP</th>
                <th className="px-6 py-4 font-bold">Stock</th>
                <th className="px-6 py-4 font-bold text-right">
                  Quick Verify & Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    <span className="material-icons-outlined text-3xl animate-spin text-primary mb-2 block">
                      refresh
                    </span>
                    Loading catalog inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    <span className="material-icons-outlined text-4xl mb-3 block text-primary/30">
                      inventory_2
                    </span>
                    No products found in this view.
                    {activeTab === "INACTIVE" && (
                      <p className="mt-2 text-xs text-primary font-bold">
                        All imported products have been verified and activated!
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const primaryVariant = product.variants?.[0];
                  const hsnTag = product.tags?.find((t) =>
                    t.startsWith("HSN:"),
                  );
                  const hsnCode = hsnTag ? hsnTag.replace("HSN:", "") : "";

                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-primary/5 hover:bg-background-light/30 transition-colors ${
                        product.isDeleted ? "opacity-50" : ""
                      } ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(product.id)}
                          className="rounded border-primary/30 text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>

                      {/* Product Name & SKU */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-background-light border border-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.frontImageUrl ? (
                              <img
                                src={product.frontImageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-icons-outlined text-text-muted">
                                image
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text-main-light truncate max-w-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-text-muted font-mono mt-0.5">
                              {product.variants && product.variants.length > 0
                                ? product.variants
                                    .slice(0, 2)
                                    .map((v: any) => v.sku)
                                    .join(", ") +
                                  (product.variants.length > 2 ? " ..." : "")
                                : "NO SKU"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Brand & HSN */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-text-main-light block">
                          {product.brand?.name || "No Brand"}
                        </span>
                        {hsnCode && (
                          <span className="text-[11px] font-mono text-text-muted">
                            HSN: {hsnCode}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {product.isDeleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            Deleted
                            <span className="font-mono font-normal text-[10px]">
                              {formatDeletedDate(product.deletedAt)}
                            </span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                              product.isActive
                                ? "bg-green-50 text-green-600"
                                : "bg-yellow-50 text-yellow-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.isActive
                                  ? "bg-green-600"
                                  : "bg-yellow-600"
                              }`}
                            ></span>
                            {product.isActive ? "Active" : "Inactive (Review)"}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-sm font-medium text-text-main-light">
                        {product.variants && product.variants.length > 0
                          ? formatPaise(
                              Math.min(
                                ...product.variants.map(
                                  (v: any) => v.price ?? Infinity,
                                ),
                              ),
                            )
                          : "--"}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-md ${
                            (primaryVariant?.stock ?? 0) > 0
                              ? "bg-background-main text-text-main-light"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {primaryVariant?.stock ?? 0} in stock
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* One-by-One Status Toggle */}
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(product)}
                            disabled={product.isDeleted}
                            title={
                              product.isActive
                                ? "Click to make inactive"
                                : "Verify & Activate"
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              product.isActive
                                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                : "bg-primary text-white shadow-[0_0_10px_rgba(212,175,55,0.4)] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)]"
                            } ${product.isDeleted ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            <span className="material-icons-outlined text-[15px]">
                              {product.isActive ? "check" : "publish"}
                            </span>
                            {product.isActive ? "Active" : "Activate"}
                          </button>

                          {/* Edit Details */}
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            title="Edit Product Details"
                          >
                            <span className="material-icons-outlined text-[19px]">
                              edit
                            </span>
                          </Link>

                          {/* Soft Delete / Restore */}
                          {product.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(product)}
                              disabled={actionLoading}
                              className="p-2 rounded-lg transition-colors cursor-pointer text-green-500 hover:bg-green-50 disabled:opacity-50"
                              title="Restore"
                            >
                              <span className="material-icons-outlined text-[19px]">
                                restore
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSoftDeleteTarget(product)}
                              className="p-2 rounded-lg transition-colors cursor-pointer text-red-500 hover:bg-red-50"
                              title="Move to Trash"
                            >
                              <span className="material-icons-outlined text-[19px]">
                                delete
                              </span>
                            </button>
                          )}

                          {/* Permanent delete (archived products only) */}
                          {product.isDeleted && (
                            <button
                              type="button"
                              onClick={() => setHardDeleteTarget(product)}
                              disabled={actionLoading}
                              className="p-2 rounded-lg transition-colors cursor-pointer text-red-600 hover:bg-red-50 disabled:opacity-50"
                              title="Delete permanently"
                            >
                              <span className="material-icons-outlined text-[19px]">
                                delete_forever
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-primary/10 flex items-center justify-between text-sm text-text-muted bg-background-light/50">
          <span>
            Showing {products.length} of {total} products
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={params.page === 1}
              onClick={() =>
                setParams({ ...params, page: (params.page || 1) - 1 })
              }
              className="px-3.5 py-1.5 border border-primary/20 rounded-xl hover:bg-primary/5 disabled:opacity-50 text-xs font-bold transition-all cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={(params.page || 1) * (params.limit || 15) >= total}
              onClick={() =>
                setParams({ ...params, page: (params.page || 1) + 1 })
              }
              className="px-3.5 py-1.5 border border-primary/20 rounded-xl hover:bg-primary/5 disabled:opacity-50 text-xs font-bold transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImportInventoryModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchProducts}
        onNavigateToInactive={() => {
          setActiveTab("INACTIVE");
          setParams((prev) => ({ ...prev, page: 1 }));
        }}
      />

      <ExportInventoryModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default AdminProductList;
