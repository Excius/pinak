import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { z } from "zod";
import {
  getAccessToken,
  setAccessToken,
  deleteAccessToken,
  deleteRefreshToken,
} from "@/utils/token";
import {
  loginService as apiLogin,
  logoutService as apiLogout,
  signupService as apiSignup,
} from "@/services/auth.service";
import { apiRequest } from "@/services/api";

import type { AuthApi } from "@repo/types";
type LoginUserResponse = AuthApi.ResponseTypes["LoginUser"];
type RegisterUserResponse = AuthApi.ResponseTypes["RegisterUser"];
type MeResponse = AuthApi.ResponseTypes["Me"];

import { UserSchema } from "@repo/types";

type User = z.infer<typeof UserSchema>;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // isLoggingIn: boolean;
  // isSigningUp: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth context not found");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [isLoggingIn, setIsLoggingIn] = useState(false);
  // const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // check for existing auth
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const userData = await apiRequest<MeResponse>("get", "/auth/me");
        setUser(userData.data);
      }
    } catch (err) {
      // Silent fail on auth check - just clear tokens and continue
      // This is expected when tokens are expired or invalid
      console.log("Auth check failed, clearing session:", err);
      await deleteAccessToken();
      await deleteRefreshToken();
      setUser(null);
    } finally {
      setIsLoading(false);
      // Clear any stale errors from previous sessions
      setError(null);
    }
  };

  const login = async (email: string, password: string) => {
    // Clear any previous errors immediately
    setError(null);

    try {
      const loginResponse: LoginUserResponse = await apiLogin(email, password);
      if (loginResponse.data?.accessToken && loginResponse.data?.user) {
        // Token storage is handled by loginService, just update user state
        setUser(loginResponse.data.user);
      } else {
        throw new Error("Invalid login response from server");
      }
    } catch (err: any) {
      // Extract meaningful error message
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    // Clear any previous errors immediately
    setError(null);

    try {
      await apiSignup(email, username, password);
      // Signup successful - user will need to verify email or login
    } catch (err: any) {
      // Extract meaningful error message
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Signup failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      await deleteAccessToken();
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
      login,
      signup,
      logout,
      clearError,
    }),
    [user, isLoading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
