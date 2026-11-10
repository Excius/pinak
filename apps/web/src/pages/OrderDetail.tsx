import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { getOrderById, cancelOrder, getOrderReceiptPdf } from "../api/cart.api";
import type { Order, OrderAddress, OrderItem } from "../api/cart.api";
import { formatPaise } from "../utils/currency";

const statusSteps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHIPPED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};
const statusIcons: Record<string, string> = {
  PENDING: "schedule",
  PROCESSING: "sync",
  SHIPPED: "local_shipping",
  DELIVERED: "check_circle",
  CANCELLED: "cancel",
};

// Charged unit price including GST: the selling price if the item was discounted, else the MRP
const unitPriceWithTax = (item: OrderItem) =>
  item.sellingPrice != null
    ? (item.sellingPriceWithTax ?? item.price)
    : (item.priceWithTax ?? item.price);

const formatAddress = (a: OrderAddress) =>
  [
    a.addressLine1,
    a.addressLine2,
    `${a.city}, ${a.state} - ${a.pincode}`,
  ].filter(Boolean);

const sameAddress = (a: OrderAddress, b: OrderAddress) =>
  a.fullName === b.fullName &&
  a.addressLine1 === b.addressLine1 &&
  (a.addressLine2 ?? "") === (b.addressLine2 ?? "") &&
  a.city === b.city &&
  a.state === b.state &&
  a.pincode === b.pincode &&
  a.phone === b.phone;

const AddressBlock: React.FC<{
  title: string;
  icon: string;
  address: OrderAddress;
}> = ({ title, icon, address }) => (
  <div className="flex gap-3">
    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
      <span className="material-icons-outlined text-primary text-lg">
        {icon}
      </span>
    </div>
    <div className="min-w-0 text-sm">
      <p className="text-[11px] font-bold uppercase tracking-widest text-primary/70 mb-1">
        {title}
      </p>
      <p className="font-semibold text-text-main-light">{address.fullName}</p>
      {formatAddress(address).map((line) => (
        <p key={line} className="text-text-muted">
          {line}
        </p>
      ))}
      <p className="text-text-muted mt-1">Phone: {address.phone}</p>
    </div>
  </div>
);

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [error, setError] = useState("");
  const [receiptBusy, setReceiptBusy] = useState<"view" | "download" | null>(
    null,
  );

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (!orderId) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(orderId);
      setOrder(updated);
      setShowCancelConfirm(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  // The receipt endpoint needs the login token, so it is fetched as a file and opened locally.
  const handleReceipt = async (mode: "view" | "download") => {
    if (!orderId || receiptBusy) return;
    setReceiptBusy(mode);
    // Open the tab right away (inside the click) so popup blockers allow it.
    const viewTab = mode === "view" ? window.open("", "_blank") : null;
    try {
      const blob = await getOrderReceiptPdf(orderId);
      const url = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      if (mode === "view") {
        if (viewTab) viewTab.location.href = url;
        else window.location.assign(url);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = `Receipt-${order?.invoiceNumber?.replace(/\//g, "-") ?? orderId.slice(-8).toUpperCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      viewTab?.close();
      toast.error("Could not load the receipt. Please try again.");
    } finally {
      setReceiptBusy(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const canCancel = order && ["PENDING", "PROCESSING"].includes(order.status);
  const currentStepIdx = order ? statusSteps.indexOf(order.status) : -1;

  if (loading)
    return (
      <Layout>
        <div className="min-h-screen bg-background-light flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-sm text-text-muted">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );

  if (error || !order)
    return (
      <Layout>
        <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50">
              <span className="material-icons-outlined text-3xl text-red-400">
                error
              </span>
            </div>
            <p className="text-text-muted">{error || "Order not found"}</p>
            <button
              onClick={() => navigate("/orders")}
              className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-screen bg-background-light">
        {/* Header */}
        <div className="bg-surface-dark border-b border-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-4 cursor-pointer"
            >
              <span className="material-icons-outlined text-lg">
                arrow_back
              </span>
              <span className="text-sm font-medium">All Orders</span>
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-text-main-light">
                  Order #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-xs text-text-muted mt-1">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border self-start ${statusColors[order.status]}`}
              >
                <span className="material-icons-outlined text-sm">
                  {statusIcons[order.status]}
                </span>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Progress Tracker (if not cancelled) */}
          {order.status !== "CANCELLED" && (
            <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5 sm:p-6">
              <h3 className="font-display font-bold text-text-main-light mb-5 text-sm sm:text-base">
                Order Progress
              </h3>
              <div className="flex items-center justify-between relative">
                {statusSteps.map((step, i) => {
                  const isComplete = i <= currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isComplete
                              ? "bg-primary border-primary text-black"
                              : "border-primary/20 text-text-muted/40 bg-surface-dark"
                          } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                        >
                          <span className="material-icons-outlined text-sm sm:text-base">
                            {statusIcons[step]}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-2 ${isComplete ? "text-primary" : "text-text-muted/40"}`}
                        >
                          {step}
                        </span>
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-colors ${i < currentStepIdx ? "bg-primary" : "bg-primary/10"}`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5 sm:p-6">
            <h3 className="font-display font-bold text-text-main-light mb-4 text-sm sm:text-base">
              Items Ordered{" "}
              <span className="text-xs font-normal text-text-muted">
                (prices include tax)
              </span>
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-background-light border border-primary/5"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-surface-dark border border-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    <span className="material-icons-outlined text-text-muted">
                      inventory_2
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-main-light truncate">
                      {item.productName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-text-muted">
                          Qty: {item.quantity} ×{" "}
                          {formatPaise(unitPriceWithTax(item))}
                        </span>
                        {item.sellingPrice != null && (
                          <span className="text-xs text-text-muted line-through">
                            {formatPaise(
                              item.priceWithTax ?? item.basePrice ?? item.price,
                            )}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {formatPaise(unitPriceWithTax(item) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {(order.shippingAddress || order.billingAddress) && (
            <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5 sm:p-6">
              <h3 className="font-display font-bold text-text-main-light mb-4 text-sm sm:text-base">
                Delivery Address
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                {order.shippingAddress && (
                  <AddressBlock
                    title="Shipping Address"
                    icon="local_shipping"
                    address={order.shippingAddress}
                  />
                )}
                {order.billingAddress &&
                  !(
                    order.shippingAddress &&
                    sameAddress(order.shippingAddress, order.billingAddress)
                  ) && (
                    <AddressBlock
                      title="Billing Address"
                      icon="receipt_long"
                      address={order.billingAddress}
                    />
                  )}
              </div>
              {order.shippingAddress &&
                order.billingAddress &&
                sameAddress(order.shippingAddress, order.billingAddress) && (
                  <p className="text-xs text-text-muted mt-4">
                    Billing address is the same as the shipping address.
                  </p>
                )}
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5 sm:p-6">
            <h3 className="font-display font-bold text-text-main-light mb-4 text-sm sm:text-base">
              Payment Summary
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-text-main-light">
                  {formatPaise(order.subtotalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Tax</span>
                <span className="text-text-main-light">
                  {formatPaise(order.taxAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Shipping</span>
                <span className="text-text-main-light">
                  {formatPaise(order.shippingAmount)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Coupon Discount</span>
                  <span>-{formatPaise(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-primary/10 pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold text-text-main-light">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPaise(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-text-muted">Payment Status</span>
                <span
                  className={`font-bold text-xs uppercase tracking-wider ${order.paymentStatus === "COMPLETED" ? "text-green-400" : order.paymentStatus === "FAILED" ? "text-red-400" : "text-yellow-400"}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Receipt */}
          {order.paymentStatus === "COMPLETED" && (
            <div className="bg-surface-dark rounded-2xl border border-primary/10 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-text-main-light text-sm sm:text-base">
                    Receipt
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    {order.invoiceNumber
                      ? `Tax invoice ${order.invoiceNumber}`
                      : "Tax invoice for this order"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReceipt("view")}
                    disabled={receiptBusy !== null}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-primary/30 text-primary font-bold text-sm hover:bg-primary/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-outlined text-lg">
                      {receiptBusy === "view"
                        ? "hourglass_empty"
                        : "visibility"}
                    </span>
                    View Receipt
                  </button>
                  <button
                    onClick={() => handleReceipt("download")}
                    disabled={receiptBusy !== null}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary-hover transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-outlined text-lg">
                      {receiptBusy === "download"
                        ? "hourglass_empty"
                        : "download"}
                    </span>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Order */}
          {canCancel && (
            <div className="bg-surface-dark rounded-2xl border border-red-500/10 p-5 sm:p-6">
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full py-3 px-4 rounded-xl border border-red-800/50 text-red-400 hover:bg-red-900/20 transition-all font-semibold text-sm cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="material-icons-outlined text-lg">
                    cancel
                  </span>
                  Cancel This Order
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-400 font-medium">
                    Are you sure you want to cancel this order? This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl bg-surface-elevated text-text-muted border border-primary/10 font-medium text-sm hover:text-text-main-light transition-all cursor-pointer"
                    >
                      Keep Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;
