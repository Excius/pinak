import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllProductsAdmin,
  getDeletedProductsAdmin,
  updateProductStatusAdmin,
  softDeleteProductAdmin,
  restoreProductAdmin,
  hardDeleteProductAdmin,
} from "../../../api/admin/admin.products.api";
import type {
  AdminProduct,
  AdminProductListParams,
} from "../../../api/admin/admin.products.api";
import { formatPaise } from "../../../utils/currency";

type TabType = "active" | "trash";

const AdminProductList = () => {
  const [tab, setTab] = useState<TabType>("active");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<AdminProductListParams>({
    page: 1,
    limit: 10,
    search: "",
  });

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
      if (tab === "trash") {
        const { items, total } = await getDeletedProductsAdmin(params);
        setProducts(items);
        setTotal(total);
      } else {
        const { items, total } = await getAllProductsAdmin(params);
        setProducts(items);
        setTotal(total);
      }
    } catch (err) {
      console.error(`Failed to fetch ${tab} products`, err);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [params, tab]);

  const handleTabChange = (newTab: TabType) => {
    if (newTab === tab) return;
    setTab(newTab);
    setFeedback(null);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusToggle = async (product: AdminProduct) => {
    try {
      const updated = await updateProductStatusAdmin(
        product.id,
        !product.isActive,
      );
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, isActive: updated.isActive } : p,
        ),
      );
      setFeedback({
        type: "success",
        message: `Status updated to ${updated.isActive ? "Active" : "Draft"}.`,
      });
    } catch (err: any) {
      console.error("Failed to update status", err);
      const msg = err?.response?.data?.message || "Failed to update status";
      setFeedback({ type: "error", message: msg });
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">
            Products Inventory
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your store catalog, trash, and permanent product deletion.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Product
        </Link>
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

      <div className="bg-background-light rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-primary/10 bg-background-main/30 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => handleTabChange("active")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              tab === "active"
                ? "border-primary text-primary bg-primary/5 rounded-t-xl"
                : "border-transparent text-text-muted hover:text-text-main-light"
            }`}
          >
            <span className="material-icons-outlined text-base">
              inventory_2
            </span>
            <span>Active Catalog</span>
            {tab === "active" && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono">
                {total}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("trash")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              tab === "trash"
                ? "border-red-500 text-red-400 bg-red-500/5 rounded-t-xl"
                : "border-transparent text-text-muted hover:text-text-main-light"
            }`}
          >
            <span className="material-icons-outlined text-base">delete</span>
            <span>Trash / Deleted</span>
            {tab === "trash" && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">
                {total}
              </span>
            )}
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-primary/10 flex flex-wrap gap-4 items-center justify-between bg-background-main/50">
          <div className="relative w-full sm:w-80">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder={
                tab === "active"
                  ? "Search active products..."
                  : "Search deleted products..."
              }
              className="w-full pl-10 pr-4 py-2 bg-background-light border border-primary/20 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text-main-light placeholder:text-text-muted/50"
              value={params.search || ""}
              onChange={handleSearch}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            Total {total} {tab === "active" ? "Active" : "Deleted"} Products
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light/50 border-b border-primary/10 text-xs tracking-widest text-primary/70 uppercase">
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">
                  {tab === "active" ? "Status" : "Deleted Date"}
                </th>
                {tab === "active" && (
                  <th className="px-6 py-4 font-bold">Visibility</th>
                )}
                <th className="px-6 py-4 font-bold">Starting From</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={tab === "active" ? 5 : 4}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span>
                        Loading{" "}
                        {tab === "active" ? "inventory" : "deleted products"}...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={tab === "active" ? 5 : 4}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    {tab === "active"
                      ? "No products found."
                      : "Trash is empty. No deleted products."}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-b border-primary/5 hover:bg-background-light/30 transition-colors ${
                      product.isDeleted ? "bg-red-500/[0.02]" : ""
                    }`}
                  >
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
                          <p className="text-sm font-bold text-text-main-light truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-text-muted font-mono mt-0.5">
                            {product.variants && product.variants.length > 0
                              ? product.variants
                                  .slice(0, 3)
                                  .map((v: any) => v.sku)
                                  .join(", ") +
                                (product.variants.length > 3 ? " ..." : "")
                              : "NO SKU"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tab === "trash" ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-bold w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Deleted
                          </span>
                          <span className="text-[11px] text-text-muted mt-1 font-mono">
                            {formatDeletedDate(product.deletedAt)}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                            product.isActive
                              ? "bg-green-500/10 text-green-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-green-400" : "bg-yellow-400"}`}
                          />
                          {product.isActive ? "Active" : "Draft"}
                        </span>
                      )}
                    </td>
                    {tab === "active" && (
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(product)}
                          disabled={product.isDeleted}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            product.isActive ? "bg-primary" : "bg-gray-700"
                          } ${product.isDeleted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          title={`Toggle ${product.isActive ? "Draft" : "Active"}`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              product.isActive
                                ? "translate-x-5"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-medium text-text-main-light">
                      {product.variants && product.variants.length > 0
                        ? (() => {
                            const minVariant = product.variants.reduce(
                              (prev: any, curr: any) => {
                                const prevEff =
                                  prev.sellingPrice ?? prev.price ?? Infinity;
                                const currEff =
                                  curr.sellingPrice ?? curr.price ?? Infinity;
                                return currEff < prevEff ? curr : prev;
                              },
                              product.variants[0],
                            );
                            const isDiscounted =
                              minVariant.sellingPrice != null;
                            return isDiscounted ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-primary">
                                  {formatPaise(minVariant.sellingPrice)}
                                </span>
                                <span className="text-xs text-text-muted line-through">
                                  {formatPaise(minVariant.price ?? 0)}
                                </span>
                              </div>
                            ) : (
                              <span>{formatPaise(minVariant.price ?? 0)}</span>
                            );
                          })()
                        : "--"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tab === "active" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <span className="material-icons-outlined text-[20px]">
                              edit
                            </span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSoftDeleteTarget(product)}
                            className="p-2 rounded-lg transition-colors text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                            title="Move to Trash"
                          >
                            <span className="material-icons-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestore(product)}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all cursor-pointer disabled:opacity-50"
                            title="Restore to Active Inventory"
                          >
                            <span className="material-icons-outlined text-sm">
                              restore
                            </span>
                            <span>Restore</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setHardDeleteTarget(product)}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                            title="Permanently Delete Forever"
                          >
                            <span className="material-icons-outlined text-sm">
                              delete_forever
                            </span>
                            <span>Delete Forever</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-primary/10 flex items-center justify-between text-sm text-text-muted bg-background-light/50">
          <span>
            Showing {products.length} of {total} items
          </span>
          <div className="flex gap-1">
            <button
              disabled={params.page === 1}
              onClick={() =>
                setParams({ ...params, page: (params.page || 1) - 1 })
              }
              className="px-3 py-1 border border-primary/20 rounded-md hover:bg-primary/5 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <button
              disabled={
                products.length < (params.limit || 10) ||
                (params.page || 1) * (params.limit || 10) >= total
              }
              onClick={() =>
                setParams({ ...params, page: (params.page || 1) + 1 })
              }
              className="px-3 py-1 border border-primary/20 rounded-md hover:bg-primary/5 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductList;
