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
} from "@/utils/token";
import {
  loginService as apiLogin,
  logoutService as apiLogout,
  signupService as apiSignup,
} from "@/services/auth.service";
import api, { apiRequest } from "@/services/api";
import {
  MeResponse,
  LoginUserResponse,
  RegisterUserResponse,
} from "@repo/types";
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
        const userData = await apiRequest<MeResponse>("get", "/me");
        setUser(userData.data);
      }
    } catch (err) {
      console.error("Auth check failed" + err);
      await deleteAccessToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const loginResponse: LoginUserResponse = await apiLogin(email, password);
      if (loginResponse.data?.accessToken && loginResponse.data?.user) {
        await setAccessToken(loginResponse.data.accessToken);
        setUser(loginResponse.data.user);
      } else {
        throw new Error("Invalid login response");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Login failed";
      setError(errorMessage);
      throw err;
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    try {
      setError(null);
      await apiSignup(email, username, password);
      // Signup successful - user will need to verify email or login
    } catch (err: any) {
      const errorMessage = err?.message || "Signup failed";
      setError(errorMessage);
      throw err;
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
