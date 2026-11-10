import { useState, useEffect } from "react";
import {
  getOptions,
  createOption,
  updateOption,
  deleteOption,
  createOptionValue,
  updateOptionValue,
  deleteOptionValue,
} from "../../../api/admin/admin.options.api";
import type {
  AdminOption,
  AdminOptionValue,
} from "../../../api/admin/admin.options.api";
import {
  getAllWeightClasses,
  getAllLengthClasses,
  type WeightClass,
  type LengthClass,
} from "../../../api/admin/admin.settings.api";

// ── Form types ──────────────────────────────────────────────────────────

interface OptionFormData {
  name: string;
  sortOrder: number;
}
interface ValueFormData {
  value: string;
  sortOrder: number;
  swatchColorHex: string | null;
  // Optional measurements (kept as text while typing; blank = not set)
  weightGrams: string;
  weightClassId: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  lengthClassId: string;
}

// 6- or 8-digit hex, as the API requires (e.g. #C96C7D or #C98F7280)
const SWATCH_HEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

const getApiErrorMessage = (err: unknown, fallback: string): string => {
  const data = (
    err as {
      response?: {
        data?: { message?: string; errors?: { message?: string }[] };
      };
    }
  )?.response?.data;
  const detail = data?.errors
    ?.map((e) => e.message)
    .filter(Boolean)
    .join(". ");
  return [data?.message, detail].filter(Boolean).join(": ") || fallback;
};

const emptyOptionForm: OptionFormData = { name: "", sortOrder: 0 };
const emptyValueForm: ValueFormData = {
  value: "",
  sortOrder: 0,
  swatchColorHex: null,
  weightGrams: "",
  weightClassId: "",
  dimensionLength: "",
  dimensionWidth: "",
  dimensionHeight: "",
  lengthClassId: "",
};

const numOrNull = (v: string): number | null =>
  v.trim() === "" ? null : Number(v);

// ── Component ───────────────────────────────────────────────────────────

const OptionList = () => {
  const [options, setOptions] = useState<AdminOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Option modal
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingOption, setEditingOption] = useState<AdminOption | null>(null);
  const [optionForm, setOptionForm] = useState<OptionFormData>(emptyOptionForm);
  const [saving, setSaving] = useState(false);

  // Value modal
  const [showValueModal, setShowValueModal] = useState(false);
  const [valueParentId, setValueParentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<AdminOptionValue | null>(
    null,
  );
  const [valueForm, setValueForm] = useState<ValueFormData>(emptyValueForm);
  const [savingValue, setSavingValue] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "option" | "value";
    id: string;
    label: string;
  } | null>(null);

  // Last API error, scoped to the modal it belongs to so it is never shown in the wrong place
  const [actionError, setActionError] = useState<{
    scope: "option" | "value" | "delete";
    message: string;
  } | null>(null);

  // Weight / length classes for the optional measurements
  const [weightClasses, setWeightClasses] = useState<WeightClass[]>([]);
  const [lengthClasses, setLengthClasses] = useState<LengthClass[]>([]);

  // Expanded options
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(
    new Set(),
  );

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchOptions = async () => {
    try {
      const data = await getOptions();
      setOptions(data);
    } catch (err) {
      console.error("Failed to fetch options", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);
  useEffect(() => {
    getAllWeightClasses()
      .then(setWeightClasses)
      .catch(() => setWeightClasses([]));
    getAllLengthClasses()
      .then(setLengthClasses)
      .catch(() => setLengthClasses([]));
  }, []);

  // ── Option CRUD ───────────────────────────────────────────────────────

  const openCreateOption = () => {
    setActionError(null);
    setEditingOption(null);
    setOptionForm(emptyOptionForm);
    setShowOptionModal(true);
  };

  const openEditOption = (option: AdminOption) => {
    setActionError(null);
    setEditingOption(option);
    setOptionForm({ name: option.name, sortOrder: option.sortOrder });
    setShowOptionModal(true);
  };

  const handleSaveOption = async () => {
    if (!optionForm.name.trim()) return;
    setSaving(true);
    setActionError(null);
    try {
      if (editingOption) {
        await updateOption(editingOption.id, optionForm);
      } else {
        await createOption(optionForm);
      }
      setShowOptionModal(false);
      await fetchOptions();
    } catch (err) {
      console.error("Failed to save option", err);
      setActionError({
        scope: "option",
        message: getApiErrorMessage(err, "Failed to save option."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOption = async (id: string) => {
    setActionError(null);
    try {
      await deleteOption(id);
      setDeleteConfirm(null);
      await fetchOptions();
    } catch (err) {
      console.error("Failed to delete option", err);
      setActionError({
        scope: "delete",
        message: getApiErrorMessage(err, "Failed to delete option."),
      });
    }
  };

  // ── Value CRUD ────────────────────────────────────────────────────────

  const openCreateValue = (optionId: string) => {
    setActionError(null);
    setValueParentId(optionId);
    setEditingValue(null);
    setValueForm(emptyValueForm);
    setShowValueModal(true);
  };

  const openEditValue = (optionId: string, val: AdminOptionValue) => {
    setActionError(null);
    setValueParentId(optionId);
    setEditingValue(val);
    setValueForm({
      value: val.value,
      sortOrder: val.sortOrder,
      swatchColorHex: val.swatchColorHex ?? null,
      weightGrams: val.weightGrams != null ? String(val.weightGrams) : "",
      weightClassId: val.weightClassId ?? "",
      dimensionLength:
        val.dimensionLength != null ? String(val.dimensionLength) : "",
      dimensionWidth:
        val.dimensionWidth != null ? String(val.dimensionWidth) : "",
      dimensionHeight:
        val.dimensionHeight != null ? String(val.dimensionHeight) : "",
      lengthClassId: val.lengthClassId ?? "",
    });
    setShowValueModal(true);
  };

  const handleSaveValue = async () => {
    if (!valueForm.value.trim() || !valueParentId) return;
    const swatch = valueForm.swatchColorHex?.trim();
    if (swatch && !SWATCH_HEX.test(swatch)) {
      setActionError({
        scope: "value",
        message:
          "Swatch color must be a hex value like #C96C7D (6 or 8 digits).",
      });
      return;
    }
    setSavingValue(true);
    setActionError(null);
    try {
      const payload = {
        value: valueForm.value.trim(),
        sortOrder: valueForm.sortOrder,
        swatchColorHex: valueForm.swatchColorHex?.trim() || null,
        // null clears a measurement so variants stop inheriting it
        weightGrams: numOrNull(valueForm.weightGrams),
        weightClassId: valueForm.weightClassId || null,
        dimensionLength: numOrNull(valueForm.dimensionLength),
        dimensionWidth: numOrNull(valueForm.dimensionWidth),
        dimensionHeight: numOrNull(valueForm.dimensionHeight),
        lengthClassId: valueForm.lengthClassId || null,
      };
      if (editingValue) {
        await updateOptionValue(editingValue.id, payload);
      } else {
        await createOptionValue(valueParentId, payload);
      }
      setShowValueModal(false);
      await fetchOptions();
    } catch (err) {
      console.error("Failed to save option value", err);
      setActionError({
        scope: "value",
        message: getApiErrorMessage(err, "Failed to save option value."),
      });
    } finally {
      setSavingValue(false);
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    setActionError(null);
    try {
      await deleteOptionValue(valueId);
      setDeleteConfirm(null);
      await fetchOptions();
    } catch (err) {
      console.error("Failed to delete option value", err);
      setActionError({
        scope: "delete",
        message: getApiErrorMessage(err, "Failed to delete option value."),
      });
    }
  };

  // ── Toggle expand ─────────────────────────────────────────────────────

  const toggleExpand = (id: string) => {
    setExpandedOptions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-text-muted">Loading options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Option Modal ─────────────────────────────────────────────── */}
      {showOptionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowOptionModal(false)}
          />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-display font-bold text-text-main-light mb-6">
              {editingOption ? "Edit Option" : "New Option"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Option Name *
                </label>
                <input
                  value={optionForm.name}
                  onChange={(e) =>
                    setOptionForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Size, Color, Shade"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={optionForm.sortOrder}
                  onChange={(e) =>
                    setOptionForm((prev) => ({
                      ...prev,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>
              {actionError?.scope === "option" && (
                <div
                  className="mt-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2 text-left"
                  role="alert"
                >
                  <span className="material-icons-outlined text-base">
                    error_outline
                  </span>
                  <span>{actionError.message}</span>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowOptionModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOption}
                  disabled={saving || !optionForm.name.trim()}
                  className="flex-1 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : editingOption ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Value Modal ──────────────────────────────────────────────── */}
      {showValueModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowValueModal(false)}
          />
          <div className="relative bg-background-light border border-primary/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-display font-bold text-text-main-light mb-6">
              {editingValue ? "Edit Option Value" : "Add Option Value"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Value Name *
                </label>
                <input
                  value={valueForm.value}
                  onChange={(e) =>
                    setValueForm((prev) => ({ ...prev, value: e.target.value }))
                  }
                  placeholder="e.g. Rose Nude, 30ml, Small"
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>

              {/* Color Swatch Hex with live picker & preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-muted uppercase">
                    Swatch Color (Hex) — Optional
                  </label>
                  {valueForm.swatchColorHex && (
                    <button
                      type="button"
                      onClick={() =>
                        setValueForm((prev) => ({
                          ...prev,
                          swatchColorHex: null,
                        }))
                      }
                      className="text-[11px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-icons-outlined text-xs">
                        close
                      </span>
                      Clear Color
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Color Picker input */}
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-primary/20 shrink-0 cursor-pointer shadow-sm bg-background-main flex items-center justify-center">
                    <input
                      type="color"
                      value={
                        valueForm.swatchColorHex &&
                        /^#([A-Fa-f0-9]{6})$/.test(valueForm.swatchColorHex)
                          ? valueForm.swatchColorHex
                          : "#C96C7D"
                      }
                      onChange={(e) =>
                        setValueForm((prev) => ({
                          ...prev,
                          swatchColorHex: e.target.value.toUpperCase(),
                        }))
                      }
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 bg-transparent"
                    />
                  </div>

                  {/* Text hex input */}
                  <input
                    type="text"
                    placeholder="#C96C7D"
                    value={valueForm.swatchColorHex || ""}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      if (val && !val.startsWith("#")) val = "#" + val;
                      setValueForm((prev) => ({
                        ...prev,
                        swatchColorHex: val || null,
                      }));
                    }}
                    className="flex-1 bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light font-mono text-sm outline-none focus:border-primary"
                  />

                  {/* Live Preview circle */}
                  <div
                    className="w-11 h-11 rounded-full border border-white/20 shadow-inner flex items-center justify-center shrink-0 transition-all"
                    style={{
                      backgroundColor:
                        valueForm.swatchColorHex || "transparent",
                      borderStyle: valueForm.swatchColorHex
                        ? "solid"
                        : "dashed",
                    }}
                    title={
                      valueForm.swatchColorHex
                        ? `Color: ${valueForm.swatchColorHex}`
                        : "No color selected"
                    }
                  >
                    {!valueForm.swatchColorHex && (
                      <span className="text-[10px] text-text-muted">None</span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-text-muted">
                  Use for colors/shades. Clear for non-color options (e.g. 50ml,
                  Pack of 2).
                </p>
              </div>

              {/* Optional physical measurements: variants using this value inherit them */}
              <div className="space-y-3 p-4 rounded-xl border border-primary/10 bg-background-main/40">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase">
                    Package weight &amp; dimensions — Optional
                  </label>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Shipping measurements of the packed product for this choice
                    (e.g. the 50ml bottle in its box). Variants that use this
                    value inherit them; a variant can still set its own.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Weight"
                    value={valueForm.weightGrams}
                    onChange={(e) =>
                      setValueForm((prev) => ({
                        ...prev,
                        weightGrams: e.target.value,
                      }))
                    }
                    className="bg-background-main border border-primary/20 rounded-xl px-3 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                  />
                  <select
                    value={valueForm.weightClassId}
                    onChange={(e) =>
                      setValueForm((prev) => ({
                        ...prev,
                        weightClassId: e.target.value,
                      }))
                    }
                    className="bg-background-main border border-primary/20 rounded-xl px-3 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                  >
                    <option value="">Weight class</option>
                    {weightClasses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {(
                    [
                      "dimensionLength",
                      "dimensionWidth",
                      "dimensionHeight",
                    ] as const
                  ).map((key, i) => (
                    <input
                      key={key}
                      type="number"
                      min={0}
                      step="any"
                      placeholder={["Length", "Width", "Height"][i]}
                      value={valueForm[key]}
                      onChange={(e) =>
                        setValueForm((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="bg-background-main border border-primary/20 rounded-xl px-3 py-2.5 text-sm text-text-main-light outline-none focus:border-primary min-w-0"
                    />
                  ))}
                  <select
                    value={valueForm.lengthClassId}
                    onChange={(e) =>
                      setValueForm((prev) => ({
                        ...prev,
                        lengthClassId: e.target.value,
                      }))
                    }
                    className="bg-background-main border border-primary/20 rounded-xl px-2 py-2.5 text-sm text-text-main-light outline-none focus:border-primary min-w-0"
                  >
                    <option value="">Unit</option>
                    {lengthClasses.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={valueForm.sortOrder}
                  onChange={(e) =>
                    setValueForm((prev) => ({
                      ...prev,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-3 text-text-main-light outline-none focus:border-primary"
                />
              </div>

              {actionError?.scope === "value" && (
                <div
                  className="mt-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2 text-left"
                  role="alert"
                >
                  <span className="material-icons-outlined text-base">
                    error_outline
                  </span>
                  <span>{actionError.message}</span>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowValueModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveValue}
                  disabled={savingValue || !valueForm.value.trim()}
                  className="flex-1 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingValue ? "Saving..." : editingValue ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ──────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setActionError(null);
              setDeleteConfirm(null);
            }}
          />
          <div className="relative bg-background-light border border-red-500/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <span className="material-icons-outlined text-4xl text-red-500 mb-4">
              warning
            </span>
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">
              Delete{" "}
              {deleteConfirm.type === "option" ? "Option" : "Option Value"}?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              This will permanently remove{" "}
              <strong className="text-text-main-light">
                {deleteConfirm.label}
              </strong>
              {deleteConfirm.type === "option"
                ? ". An option can only be deleted once all of its values have been removed."
                : ". This may affect product variants that use it."}
            </p>
            {actionError?.scope === "delete" && (
              <div
                className="mb-6 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 text-left"
                role="alert"
              >
                <div className="flex items-start gap-2">
                  <span className="material-icons-outlined text-base">
                    error_outline
                  </span>
                  <span>{actionError.message}</span>
                </div>
                {/still has values/i.test(actionError.message) && (
                  <p className="mt-2 text-xs text-red-300">
                    Delete each value under this option first (expand the option
                    and remove its values), then delete the option.
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActionError(null);
                  setDeleteConfirm(null);
                }}
                className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteConfirm.type === "option"
                    ? handleDeleteOption(deleteConfirm.id)
                    : handleDeleteValue(deleteConfirm.id)
                }
                className="flex-1 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">
            Options & Swatches
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage product options (e.g. Shade, Color, Size) and dynamic color
            swatches.
          </p>
        </div>
        <button
          onClick={openCreateOption}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Option
        </button>
      </div>

      {/* ── Options List (Accordion) ─────────────────────────────────── */}
      {options.length === 0 ? (
        <div className="bg-background-light rounded-2xl border border-primary/10 p-12 text-center">
          <span className="material-icons-outlined text-5xl text-text-muted/30 mb-3">
            tune
          </span>
          <p className="text-text-muted text-sm">
            No options yet. Click "New Option" to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((option) => {
            const isExpanded = expandedOptions.has(option.id);
            return (
              <div
                key={option.id}
                className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden transition-all"
              >
                {/* Option row */}
                <div className="flex items-center px-6 py-4 hover:bg-primary/[0.02] transition-colors">
                  <button
                    onClick={() => toggleExpand(option.id)}
                    className="mr-3 text-text-muted hover:text-primary transition-colors cursor-pointer"
                  >
                    <span
                      className={`material-icons-outlined text-lg transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    >
                      chevron_right
                    </span>
                  </button>

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggleExpand(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-text-main-light">
                        {option.name}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {option.values?.length || 0} value
                        {(option.values?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      Sort: {option.sortOrder}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openCreateValue(option.id)}
                      className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5 cursor-pointer"
                      title="Add value"
                    >
                      <span className="material-icons-outlined text-lg">
                        add_circle_outline
                      </span>
                    </button>
                    <button
                      onClick={() => openEditOption(option)}
                      className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5 cursor-pointer"
                      title="Edit option"
                    >
                      <span className="material-icons-outlined text-lg">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: "option",
                          id: option.id,
                          label: option.name,
                        })
                      }
                      className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5 cursor-pointer"
                      title="Delete option"
                    >
                      <span className="material-icons-outlined text-lg">
                        delete
                      </span>
                    </button>
                  </div>
                </div>

                {/* Values (expandable) */}
                {isExpanded && (
                  <div className="border-t border-primary/5 bg-background-main/30">
                    {!option.values || option.values.length === 0 ? (
                      <div className="px-6 py-6 text-center">
                        <p className="text-text-muted text-xs mb-2">
                          No values for this option yet.
                        </p>
                        <button
                          onClick={() => openCreateValue(option.id)}
                          className="text-primary text-xs font-semibold hover:underline cursor-pointer"
                        >
                          + Add first value
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-primary/5">
                        {option.values.map((val) => (
                          <div
                            key={val.id}
                            className="flex items-center px-6 py-3 pl-14 hover:bg-primary/[0.02] transition-colors"
                          >
                            {val.swatchColorHex ? (
                              <div
                                className="w-5 h-5 rounded-full border border-white/20 shadow-sm mr-3 shrink-0"
                                style={{ backgroundColor: val.swatchColorHex }}
                                title={val.swatchColorHex}
                              />
                            ) : (
                              <span className="material-icons-outlined text-text-muted/40 text-sm mr-3">
                                label
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-text-main-light font-medium">
                                  {val.value}
                                </p>
                                {val.swatchColorHex && (
                                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-dark border border-primary/10 text-primary">
                                    {val.swatchColorHex}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-text-muted">
                                Sort: {val.sortOrder}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEditValue(option.id, val)}
                                className="p-1.5 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5 cursor-pointer"
                              >
                                <span className="material-icons-outlined text-base">
                                  edit
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: "value",
                                    id: val.id,
                                    label: val.value,
                                  })
                                }
                                className="p-1.5 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5 cursor-pointer"
                              >
                                <span className="material-icons-outlined text-base">
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OptionList;
