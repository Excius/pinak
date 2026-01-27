import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, deleteAccessToken } from "@/utils/token";
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
// interface User : MeRespons {
//   id: String;
//   email: String;
//   username: String;
//   role: "Admin"
// }
type User = MeResponse["data"];

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
      console.error("Auth check failed");
      await deleteAccessToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const loginResponse: LoginUserResponse = await apiLogin(email, password);
  };

  const signup = async (email: string, password: string, username: string) => {
    const signUpResponse: RegisterUserResponse = await apiSignup(
      email,
      username,
      password,
    );
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    signup,
    logout,
    clearError,
  };
  return <AuthContext.Provider value={value}> {children}</AuthContext.Provider>;
};
