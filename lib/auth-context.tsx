"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialToken: string | null;
}

export function AuthProvider({ children, initialToken }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(initialToken);

  useEffect(() => {
    const checkCookie = () => {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const trimmed = cookie.trim();
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex === -1) continue;
        
        const name = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        
        if (name === "AUTH_TOKEN" && value) {
          if (value !== token) {
            setToken(value);
          }
          return;
        }
      }
      // No AUTH_TOKEN cookie found
      if (token !== null && token !== initialToken) {
        setToken(null);
      }
    };

    // Check periodically for cookie changes (login/logout from other tabs)
    const interval = setInterval(checkCookie, 1000);
    return () => clearInterval(interval);
  }, [token, initialToken]);

  const logout = useCallback(() => {
    document.cookie = "AUTH_TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    setToken(null);
    window.location.href = "/";
  }, []);

  const refreshAuth = useCallback(() => {
    // Force a page refresh to get fresh server-side token
    window.location.reload();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
