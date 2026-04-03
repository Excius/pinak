import { useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook for handling protected actions that require authentication.
 * 
 * Usage:
 * ```tsx
 * const { requireAuth } = useProtectedAction();
 * 
 * const handlePurchase = () => {
 *   requireAuth(() => {
 *     // This code only runs if user is authenticated
 *     processOrder();
 *   });
 * };
 * ```
 * 
 * If the user is not authenticated, they will be redirected to the login screen.
 * After successful login, they will be returned to the current screen.
 */
export function useProtectedAction() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pendingAction = useRef<(() => void) | null>(null);

    const requireAuth = useCallback(
        (action: () => void, options?: { redirectMessage?: string }) => {
            if (isLoading) {
                // Auth state is still loading, wait and retry
                pendingAction.current = action;
                return;
            }

            if (isAuthenticated) {
                // User is authenticated, proceed with action
                action();
            } else {
                // Store action for after login (optional - can be enhanced)
                pendingAction.current = action;

                // Redirect to login
                router.push("/(auth)");
            }
        },
        [isAuthenticated, isLoading, router]
    );

    const executePendingAction = useCallback(() => {
        if (pendingAction.current && isAuthenticated) {
            pendingAction.current();
            pendingAction.current = null;
        }
    }, [isAuthenticated]);

    return {
        requireAuth,
        executePendingAction,
        isAuthenticated,
        isLoading,
    };
}

/**
 * Alternative: Simple authentication check without action callback
 * Returns a function that redirects to auth if not authenticated
 */
export function useAuthGuard() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    const checkAuth = useCallback((): boolean => {
        if (isLoading) return false;

        if (!isAuthenticated) {
            router.push("/(auth)");
            return false;
        }

        return true;
    }, [isAuthenticated, isLoading, router]);

    return {
        checkAuth,
        isAuthenticated,
        isLoading,
        user,
    };
}
