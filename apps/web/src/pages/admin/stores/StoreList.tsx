import React, { useState, useEffect, useCallback } from "react";
import {
  getAdminStores,
  createAdminStore,
  updateAdminStore,
  deleteAdminStore,
  restoreAdminStore,
  type AdminStore,
  type CreateStorePayload,
  type AdminStoreListParams,
} from "../../../api/admin/admin.stores.api";
import { getStoreLocations } from "../../../api/stores.api";

type TabType = "active" | "trash";

interface StoreFormState {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
}

const emptyForm: StoreFormState = {
  name: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  latitude: "",
  longitude: "",
  isActive: true,
};

const AdminStoreList: React.FC = () => {
  const [tab, setTab] = useState<TabType>("active");
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters state
  const [params, setParams] = useState<AdminStoreListParams>({
    page: 1,
    limit: 10,
    search: "",
    city: "",
    state: "",
    isActive: undefined,
  });

  // Dropdowns
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<AdminStore | null>(null);
  const [form, setForm] = useState<StoreFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<AdminStore | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<AdminStore | null>(null);

  // Load cities & states
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await getStoreLocations();
        setAvailableCities(data.cities || []);
        setAvailableStates(data.states || []);
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    };
    void loadLocations();
  }, []);

  // Fetch stores list
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminStores({
        ...params,
        includeDeleted: tab === "trash",
        search: params.search?.trim() || undefined,
        city: params.city || undefined,
        state: params.state || undefined,
      });
      // If trash tab, only keep soft-deleted stores
      const filtered =
        tab === "trash"
          ? (data.items || []).filter((s) => s.isDeleted)
          : (data.items || []).filter((s) => !s.isDeleted);
      setStores(filtered);
      setTotal(data.pagination?.total || filtered.length);
    } catch (err) {
      console.error(`Failed to fetch ${tab} stores`, err);
      setStores([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params, tab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStores();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  // Open Create Modal
  const openCreate = () => {
    setEditingStore(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEdit = (store: AdminStore) => {
    setEditingStore(store);
    setForm({
      name: store.name,
      address: store.address,
      city: store.city,
      state: store.state,
      zipCode: store.zipCode,
      phone: store.phone || "",
      latitude: String(store.latitude),
      longitude: String(store.longitude),
      isActive: store.isActive,
    });
    setFormError(null);
    setShowModal(true);
  };

  // Auto-fill coordinates from current device
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setFormError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setFormError(null);
      },
      (err) => {
        setFormError(`Failed to fetch device GPS: ${err.message}`);
      },
    );
  };

  // Save Store (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!form.name.trim()) return setFormError("Store name is required.");
    if (!form.address.trim())
      return setFormError("Street address is required.");
    if (!form.city.trim()) return setFormError("City is required.");
    if (!form.state.trim()) return setFormError("State is required.");
    if (!form.zipCode.trim())
      return setFormError("Zip / PIN code is required.");

    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return setFormError("Please enter a valid latitude (-90 to 90).");
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return setFormError("Please enter a valid longitude (-180 to 180).");
    }

    setSaving(true);
    try {
      const payload: CreateStorePayload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        phone: form.phone.trim() || null,
        latitude: lat,
        longitude: lng,
        isActive: form.isActive,
      };

      if (editingStore) {
        await updateAdminStore(editingStore.id, payload);
        setFeedback({
          type: "success",
          message: "Store updated successfully.",
        });
      } else {
        await createAdminStore(payload);
        setFeedback({
          type: "success",
          message: "Store created successfully.",
        });
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingStore(null);
      await fetchStores();
    } catch (err: any) {
      console.error("Failed to save store", err);
      const msg =
        err?.response?.data?.message || err?.message || "Failed to save store.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Delete Store
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteAdminStore(deleteTarget.id);
      setFeedback({
        type: "success",
        message: `Store "${deleteTarget.name}" moved to Trash.`,
      });
      setDeleteTarget(null);
      await fetchStores();
    } catch (err: any) {
      console.error("Failed to delete store", err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Failed to delete store.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Restore Store
  const handleRestore = async () => {
    if (!restoreTarget) return;
    setActionLoading(true);
    try {
      await restoreAdminStore(restoreTarget.id);
      setFeedback({
        type: "success",
        message: `Store "${restoreTarget.name}" restored successfully.`,
      });
      setRestoreTarget(null);
      await fetchStores();
    } catch (err: any) {
      console.error("Failed to restore store", err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Failed to restore store.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main-light">
            Store Locations
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Manage your boutique outlets, flagship store addresses, and map
            coordinates.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary-hover shadow-lg hover:shadow-primary/20 transition-all text-sm cursor-pointer self-start sm:self-auto"
        >
          <span className="material-icons-outlined text-sm font-bold">add</span>
          Add Store
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between gap-2 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-lg">
              {feedback.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-text-muted hover:text-white cursor-pointer"
          >
            <span className="material-icons-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-primary/10 gap-6">
        <button
          onClick={() => {
            setTab("active");
            setParams((p) => ({ ...p, page: 1 }));
          }}
          className={`pb-3 text-sm font-bold transition-colors relative cursor-pointer ${
            tab === "active"
              ? "text-primary"
              : "text-text-muted hover:text-text-main-light"
          }`}
        >
          Active Stores
          {tab === "active" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          )}
        </button>
        <button
          onClick={() => {
            setTab("trash");
            setParams((p) => ({ ...p, page: 1 }));
          }}
          className={`pb-3 text-sm font-bold transition-colors relative cursor-pointer ${
            tab === "trash"
              ? "text-primary"
              : "text-text-muted hover:text-text-main-light"
          }`}
        >
          Trash / Deleted
          {tab === "trash" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          )}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <span className="material-icons-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={params.search || ""}
            onChange={(e) =>
              setParams((p) => ({ ...p, search: e.target.value, page: 1 }))
            }
            placeholder="Search stores by name, address, or PIN..."
            className="w-full bg-background-main border border-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-main-light placeholder-text-muted outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* City filter */}
          <select
            value={params.city || ""}
            onChange={(e) =>
              setParams((p) => ({ ...p, city: e.target.value, page: 1 }))
            }
            className="bg-background-main border border-primary/20 rounded-xl px-3 py-2.5 text-sm text-text-main-light outline-none focus:border-primary cursor-pointer"
          >
            <option value="">All Cities</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* State filter */}
          <select
            value={params.state || ""}
            onChange={(e) =>
              setParams((p) => ({ ...p, state: e.target.value, page: 1 }))
            }
            className="bg-background-main border border-primary/20 rounded-xl px-3 py-2.5 text-sm text-text-main-light outline-none focus:border-primary cursor-pointer"
          >
            <option value="">All States</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Status filter (in active tab) */}
          {tab === "active" && (
            <select
              value={
                params.isActive === undefined ? "" : String(params.isActive)
              }
              onChange={(e) => {
                const val = e.target.value;
                setParams((p) => ({
                  ...p,
                  isActive: val === "" ? undefined : val === "true",
                  page: 1,
                }));
              }}
              className="bg-background-main border border-primary/20 rounded-xl px-3 py-2.5 text-sm text-text-main-light outline-none focus:border-primary cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          )}
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-background-main border border-primary/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-primary/10 bg-background-light/50 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3.5 px-6">Store Details</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Coordinates</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    Loading stores...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    <span className="material-icons-outlined text-4xl mb-2 text-primary/30">
                      storefront
                    </span>
                    <p className="font-medium text-text-main-light">
                      No stores found
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {tab === "trash"
                        ? "No soft-deleted stores."
                        : "No active stores match your search."}
                    </p>
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr
                    key={store.id}
                    className="hover:bg-primary/5 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-text-main-light group-hover:text-primary transition-colors">
                        {store.name}
                      </p>
                      {store.phone ? (
                        <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                          <span className="material-icons-outlined text-xs">
                            phone
                          </span>
                          {store.phone}
                        </p>
                      ) : (
                        <p className="text-xs text-text-muted/60 mt-0.5">
                          No phone recorded
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs text-text-main-light">
                        {store.address}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {store.city}, {store.state} —{" "}
                        <span className="font-mono">{store.zipCode}</span>
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-text-muted">
                        <span>
                          {store.latitude.toFixed(4)},{" "}
                          {store.longitude.toFixed(4)}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-hover p-1 rounded hover:bg-primary/10 transition-colors"
                          title="View on Google Maps"
                        >
                          <span className="material-icons-outlined text-xs">
                            open_in_new
                          </span>
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {store.isDeleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Deleted
                        </span>
                      ) : store.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {tab === "trash" ? (
                          <button
                            onClick={() => setRestoreTarget(store)}
                            className="p-1.5 text-text-muted hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Restore Store"
                          >
                            <span className="material-icons-outlined text-lg">
                              restore
                            </span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(store)}
                              className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit Store"
                            >
                              <span className="material-icons-outlined text-lg">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(store)}
                              className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Move to Trash"
                            >
                              <span className="material-icons-outlined text-lg">
                                delete
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > (params.limit || 10) && (
          <div className="p-4 border-t border-primary/10 flex items-center justify-between text-xs text-text-muted">
            <span>
              Showing {stores.length} of {total} stores
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={(params.page || 1) <= 1}
                onClick={() =>
                  setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))
                }
                className="px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Previous
              </button>
              <span>Page {params.page || 1}</span>
              <button
                disabled={stores.length < (params.limit || 10)}
                onClick={() =>
                  setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))
                }
                className="px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Store Modal ──────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-primary/10 mb-6">
              <h2 className="font-display text-xl font-bold text-text-main-light">
                {editingStore ? "Edit Store" : "Add New Store"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-main-light cursor-pointer"
              >
                <span className="material-icons-outlined text-lg">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                <span className="material-icons-outlined text-base">error</span>
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Pinak Flagship Bandra"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="e.g. Shop 12, Ground Floor, Linking Road"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                />
              </div>

              {/* City & State & Zip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    placeholder="e.g. Maharashtra"
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">
                    PIN / Zip *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.zipCode}
                    onChange={(e) =>
                      setForm({ ...form, zipCode: e.target.value })
                    }
                    placeholder="e.g. 400050"
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Contact Phone (Optional)
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                />
              </div>

              {/* Coordinates (Latitude & Longitude) */}
              <div className="space-y-2 pt-2 border-t border-primary/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-muted uppercase">
                    GPS Coordinates *
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-icons-outlined text-xs">
                      my_location
                    </span>
                    Fill Current Device GPS
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-text-muted">
                      Latitude (e.g. 19.0596)
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.latitude}
                      onChange={(e) =>
                        setForm({ ...form, latitude: e.target.value })
                      }
                      placeholder="Latitude"
                      className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-text-muted">
                      Longitude (e.g. 72.8295)
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.longitude}
                      onChange={(e) =>
                        setForm({ ...form, longitude: e.target.value })
                      }
                      placeholder="Longitude"
                      className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-primary/30 text-primary accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-text-main-light">
                    Store is Active and visible to customers
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-6 border-t border-primary/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-primary/20 font-bold text-sm text-text-muted hover:bg-primary/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving
                    ? "Saving..."
                    : editingStore
                      ? "Update Store"
                      : "Create Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Soft Delete Confirmation Modal ─────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-background-light border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <span className="material-icons-outlined text-2xl">delete</span>
            </div>
            <h3 className="font-display font-bold text-lg text-text-main-light">
              Move to Trash?
            </h3>
            <p className="text-sm text-text-muted">
              Are you sure you want to delete store{" "}
              <strong className="text-text-main-light">
                &quot;{deleteTarget.name}&quot;
              </strong>
              ? It will immediately be hidden from customer search results.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-primary/20 font-bold text-sm text-text-muted hover:bg-primary/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Deleting..." : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Restore Confirmation Modal ─────────────────────────────────────── */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setRestoreTarget(null)}
          />
          <div className="relative bg-background-light border border-green-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto">
              <span className="material-icons-outlined text-2xl">restore</span>
            </div>
            <h3 className="font-display font-bold text-lg text-text-main-light">
              Restore Store?
            </h3>
            <p className="text-sm text-text-muted">
              Restore store{" "}
              <strong className="text-text-main-light">
                &quot;{restoreTarget.name}&quot;
              </strong>{" "}
              and make it active again?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRestoreTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-primary/20 font-bold text-sm text-text-muted hover:bg-primary/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleRestore}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Restoring..." : "Restore Store"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoreList;
