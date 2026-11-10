import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as cartService from "@/services/cart.service";
import Toast from "react-native-toast-message";
import { getAccessToken } from "@/utils/token";
import * as couponService from "@/services/coupon.service";
import type { CouponApi } from "@repo/types";
import { formatRupeesFromPaise } from "@/utils/currency";

export type AppliedCoupon = CouponApi.ResponseTypes["ValidateCoupon"]["data"];

export interface CartItem {
  id: string;
  itemType: "PRODUCT_VARIANT" | "COMBO_KIT";
  quantity: number;
  unitPrice: number;
  unitPriceWithTax?: number;
  price?: number;
  priceWithTax?: number;
  sellingPrice?: number | null;
  sellingPriceWithTax?: number | null;
  taxAmount?: number;
  lineTotal: number;
  lineTotalWithTax?: number;
  availableStock: number;
  productVariantId: string | null;
  comboKitId: string | null;
  productVariant?: {
    id: string;
    sku: string;
    price: number;
    priceWithTax?: number;
    sellingPrice?: number | null;
    sellingPriceWithTax?: number | null;
    taxAmount?: number;
    isActive: boolean;
    image?: {
      id: string;
      url: string;
      altText: string | null;
      isPrimary: boolean;
      sortOrder: number;
    } | null;
    optionValues?: Array<{
      optionName: string;
      valueName: string;
    }>;
    product?: {
      id: string;
      name: string;
      slug: string;
      frontImageUrl: string | null;
      brand?: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
      } | null;
    };
  } | null;
  comboKit?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl?: string | null;
    isActive: boolean;
    items?: Array<{
      productVariant?: {
        image?: {
          url: string;
        } | null;
      } | null;
    }>;
  } | null;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  total: number;
  taxTotal?: number;
  shippingFee?: number;
  shippingRequired?: boolean;
  grandTotal?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UseCartReturn {
  cart: Cart | null;
  loading: boolean;
  isAddingToCart: boolean;
  addingItemKey: string | null;
  error: string | null;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (
    productVariantId?: string,
    comboKitId?: string,
    quantity?: number,
  ) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  appliedCoupon: AppliedCoupon | null;
  applyingCoupon: boolean;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

function useCartState(): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addingItemKey, setAddingItemKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const cartRef = useRef<Cart | null>(null);
  const updateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const pendingQuantities = useRef<Record<string, number>>({});
  const updateRequests = useRef<Record<string, number>>({});

  const setCartState = useCallback((nextCart: Cart | null) => {
    cartRef.current = nextCart;
    setCart(nextCart);
  }, []);

  const getErrorMessage = (err: any, fallback: string) => {
    return err?.response?.data?.message || err?.message || fallback;
  };
  const clearAppliedCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    const trimmedCode = code.trim();
    const currentCart = cartRef.current;
    if (!trimmedCode || !currentCart) return false;

    setApplyingCoupon(true);
    try {
      const response = await couponService.validateCoupon(
        trimmedCode,
        currentCart.subtotal,
      );
      setAppliedCoupon(response.data);
      Toast.show({
        type: "success",
        text1: "Coupon applied",
        text2: `${response.data.coupon.code} saved ${formatRupeesFromPaise(response.data.discountAmount)}`,
        position: "bottom",
      });
      return true;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Unable to apply coupon");
      setAppliedCoupon(null);
      Toast.show({
        type: "error",
        text1: "Invalid coupon",
        text2: errorMessage,
        position: "bottom",
      });
      return false;
    } finally {
      setApplyingCoupon(false);
    }
  }, []);
  const isAuthError = (err: any) => {
    const status = err?.status || err?.response?.status;
    return status === 401 || status === 403;
  };

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setCartState(null);
        return;
      }

      const response = await cartService.getCart();
      setCartState(response.data);
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 404) {
        setCartState(null);
        setError(null);
        return;
      }
      if (status === 401 || status === 403) {
        setCartState(null);
        setError(null);
        return;
      }

      const errorMessage = getErrorMessage(err, "Failed to fetch cart");
      setError(errorMessage);
      console.error("Fetch cart error:", err);
    } finally {
      setLoading(false);
    }
  }, [setCartState]);

  const addToCart = useCallback(
    async (
      productVariantId?: string,
      comboKitId?: string,
      quantity: number = 1,
    ) => {
      setIsAddingToCart(true);
      setAddingItemKey(productVariantId ?? comboKitId ?? null);
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          setCartState(null);
          Toast.show({
            type: "info",
            text1: "Login Required",
            text2: "Please login to add items to cart",
            position: "bottom",
          });
          return;
        }

        const response = await cartService.addToCart({
          productVariantId,
          comboKitId,
          quantity,
        });
        clearAppliedCoupon();
        setCartState(response.data);
      } catch (err: any) {
        if (isAuthError(err)) {
          setCartState(null);
          setError(null);
          return;
        }
        const errorMessage = getErrorMessage(err, "Failed to add to cart");
        setError(errorMessage);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
          position: "bottom",
        });
        console.error("Add to cart error:", err);
      } finally {
        setIsAddingToCart(false);
        setAddingItemKey(null);
        setLoading(false);
      }
    },
    [clearAppliedCoupon, setCartState],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      setError(null);
      if (quantity <= 0) return;

      const currentCart = cartRef.current;
      const currentItem = currentCart?.items.find((item) => item.id === itemId);
      if (!currentCart || !currentItem) return;

      setLoading(true);
      pendingQuantities.current[itemId] = quantity;
      const optimisticCart = {
        ...currentCart,
        items: currentCart.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity,
                lineTotal: item.unitPrice * quantity,
                lineTotalWithTax:
                  item.unitPriceWithTax != null
                    ? item.unitPriceWithTax * quantity
                    : item.lineTotalWithTax,
              }
            : item,
        ),
        totalQuantity:
          currentCart.totalQuantity + quantity - currentItem.quantity,
        subtotal:
          currentCart.subtotal +
          (quantity - currentItem.quantity) * currentItem.unitPrice,
        total:
          currentCart.total +
          (quantity - currentItem.quantity) * currentItem.unitPrice,
      };
      setCartState(optimisticCart);

      if (updateTimers.current[itemId])
        clearTimeout(updateTimers.current[itemId]);
      updateTimers.current[itemId] = setTimeout(async () => {
        const requestedQuantity = pendingQuantities.current[itemId];
        const requestVersion = (updateRequests.current[itemId] ?? 0) + 1;
        updateRequests.current[itemId] = requestVersion;

        try {
          const token = await getAccessToken();
          if (!token) return;
          const response = await cartService.updateCartItem(
            itemId,
            requestedQuantity,
          );
          clearAppliedCoupon();
          if (updateRequests.current[itemId] === requestVersion) {
            setCartState(response.data);
          }
        } catch (err: any) {
          if (isAuthError(err)) {
            setCartState(null);
            setError(null);
            return;
          }
          const errorMessage = getErrorMessage(err, "Failed to update cart");
          setError(errorMessage);
          console.error("Update cart error:", err);
          void fetchCart();
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [clearAppliedCoupon, fetchCart, setCartState],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (updateTimers.current[itemId]) {
        clearTimeout(updateTimers.current[itemId]);
        delete updateTimers.current[itemId];
      }
      delete pendingQuantities.current[itemId];
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          setCartState(null);
          return;
        }

        const response = await cartService.removeCartItem(itemId);
        clearAppliedCoupon();
        setCartState(response.data);
      } catch (err: any) {
        if (isAuthError(err)) {
          setCartState(null);
          setError(null);
          return;
        }
        const errorMessage = getErrorMessage(err, "Failed to remove item");
        setError(errorMessage);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
          position: "bottom",
        });
        console.error("Remove item error:", err);
      } finally {
        setLoading(false);
      }
    },
    [clearAppliedCoupon, setCartState],
  );

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setCartState(null);
        return;
      }

      const response = await cartService.clearCart();
      clearAppliedCoupon();
      setCartState(response.data);
    } catch (err: any) {
      if (isAuthError(err)) {
        setCartState(null);
        setError(null);
        return;
      }
      const errorMessage = getErrorMessage(err, "Failed to clear cart");
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "bottom",
      });
      console.error("Clear cart error:", err);
    } finally {
      setLoading(false);
    }
  }, [clearAppliedCoupon, setCartState]);

  useEffect(
    () => () => {
      Object.values(updateTimers.current).forEach(clearTimeout);
    },
    [],
  );

  // Calculate item count
  const itemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return {
    cart,
    loading,
    isAddingToCart,
    addingItemKey,
    error,
    itemCount,
    fetchCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    appliedCoupon,
    applyingCoupon,
    applyCoupon,
    removeCoupon: clearAppliedCoupon,
  };
}

const CartContext = createContext<UseCartReturn | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCartState();
  return createElement(CartContext.Provider, { value: cart }, children);
}

export function useCart(): UseCartReturn {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used within CartProvider");
  return cart;
}
