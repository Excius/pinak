import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { INDIAN_STATE_NAMES, stateCodeFor } from "../../../utils/indianStates";
import {
  getShippingConfig,
  updateShippingConfig,
  getSupplierDetails,
  updateSupplierDetails,
  type SupplierDetailsInput,
} from "../../../api/admin/admin.settings.api";

const inputClass =
  "w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary";
const labelClass = "text-xs font-bold uppercase tracking-wider text-text-muted";

const errorMessage = (err: unknown, fallback: string): string => {
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

const Loading = ({ label }: { label: string }) => (
  <div className="p-8 text-center text-text-muted flex items-center justify-center gap-3">
    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    <span>{label}</span>
  </div>
);

const CardHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => (
  <div className="p-6 border-b border-primary/10 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
      <span className="material-icons-outlined text-2xl">{icon}</span>
    </div>
    <div>
      <h3 className="text-base font-display font-bold text-text-main-light">
        {title}
      </h3>
      <p className="text-xs text-text-muted">{subtitle}</p>
    </div>
  </div>
);

const SaveButton = ({ saving, label }: { saving: boolean; label: string }) => (
  <div className="pt-4 border-t border-primary/10 flex justify-end">
    <button
      type="submit"
      disabled={saving}
      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-background-main font-bold text-sm hover:brightness-110 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer"
    >
      <span className="material-icons-outlined text-base">save</span>
      {saving ? "Saving..." : label}
    </button>
  </div>
);

// ── Shipping ────────────────────────────────────────────────────────────

export function ShippingSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feeRupees, setFeeRupees] = useState("");

  useEffect(() => {
    getShippingConfig()
      .then((cfg) => setFeeRupees(String(cfg.shippingFee / 100)))
      .catch((err) =>
        toast.error(errorMessage(err, "Failed to load shipping settings")),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rupees = Number(feeRupees);
    if (feeRupees.trim() === "" || !Number.isFinite(rupees) || rupees < 0) {
      toast.error("Enter a shipping amount of 0 or more");
      return;
    }
    setSaving(true);
    try {
      // The API stores paise; the admin types rupees.
      const saved = await updateShippingConfig(Math.round(rupees * 100));
      setFeeRupees(String(saved.shippingFee / 100));
      toast.success("Shipping amount updated");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update shipping amount"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading shipping settings..." />;

  return (
    <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
      <CardHeader
        icon="local_shipping"
        title="Shipping Charge"
        subtitle="Flat charge added to every order that contains an item requiring shipping."
      />
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2 max-w-xs">
          <label className={labelClass}>Shipping amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              ₹
            </span>
            <input
              type="number"
              min={0}
              max={10000}
              step="0.01"
              required
              value={feeRupees}
              onChange={(e) => setFeeRupees(e.target.value)}
              className={`${inputClass} pl-8`}
            />
          </div>
          <p className="text-[11px] text-text-muted">
            Applies to the cart, checkout and the order total. Enter 0 for free
            shipping. Orders already placed keep the amount they were charged.
          </p>
        </div>
        <SaveButton saving={saving} label="Save Shipping Amount" />
      </form>
    </div>
  );
}

// ── Supplier ────────────────────────────────────────────────────────────

const emptySupplier: SupplierDetailsInput = {
  companyName: "",
  gstin: "",
  pan: "",
  state: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  pincode: "",
  email: "",
  phone: "",
};

export function SupplierSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SupplierDetailsInput>(emptySupplier);

  useEffect(() => {
    getSupplierDetails()
      .then((s) =>
        setForm({
          companyName: s.companyName,
          gstin: s.gstin,
          pan: s.pan,
          state: s.state,
          addressLine1: s.addressLine1,
          addressLine2: s.addressLine2,
          city: s.city,
          pincode: s.pincode,
          email: s.email,
          phone: s.phone,
        }),
      )
      .catch((err) =>
        toast.error(errorMessage(err, "Failed to load supplier details")),
      )
      .finally(() => setLoading(false));
  }, []);

  const set =
    (key: keyof SupplierDetailsInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const stateCode = stateCodeFor(form.state) ?? "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSupplierDetails(form);
      toast.success("Supplier details updated");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update supplier details"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading supplier details..." />;

  return (
    <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
      <CardHeader
        icon="business"
        title="Supplier Details"
        subtitle="Printed on every tax invoice and receipt. The state decides CGST/SGST vs IGST."
      />
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <label className={labelClass}>Company name</label>
          <input
            required
            value={form.companyName}
            onChange={set("companyName")}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelClass}>GSTIN</label>
            <input
              required
              value={form.gstin}
              onChange={(e) =>
                setForm((p) => ({ ...p, gstin: e.target.value.toUpperCase() }))
              }
              maxLength={15}
              placeholder="27AAACP1234A1Z5"
              className={`${inputClass} font-mono`}
            />
            <p className="text-[11px] text-text-muted">
              Must start with the state code below.
            </p>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>PAN</label>
            <input
              required
              value={form.pan}
              onChange={(e) =>
                setForm((p) => ({ ...p, pan: e.target.value.toUpperCase() }))
              }
              maxLength={10}
              placeholder="AAACP1234A"
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Address line 1</label>
          <input
            required
            value={form.addressLine1}
            onChange={set("addressLine1")}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Address line 2 (optional)</label>
          <input
            value={form.addressLine2}
            onChange={set("addressLine2")}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className={labelClass}>City</label>
            <input
              required
              value={form.city}
              onChange={set("city")}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>State</label>
            <select
              required
              value={form.state}
              onChange={set("state")}
              className={inputClass}
            >
              <option value="" disabled>
                Select state
              </option>
              {INDIAN_STATE_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted">
              State code:{" "}
              <strong className="text-text-main-light">{stateCode}</strong>
            </p>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Pincode</label>
            <input
              required
              value={form.pincode}
              onChange={set("pincode")}
              inputMode="numeric"
              maxLength={6}
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelClass}>Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={set("email")}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Phone</label>
            <input
              required
              value={form.phone}
              onChange={set("phone")}
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>

        <SaveButton saving={saving} label="Save Supplier Details" />
      </form>
    </div>
  );
}
