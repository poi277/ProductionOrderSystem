"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  checkAuthSession,
  loginAction,
  logoutAction,
} from "./authActions";
import type { LoginActionResult } from "./authActions";
import type { AuthRole, AuthUser } from "./authActions";

type AuthContextValue = {
  user: AuthUser | null;
  username: string | null;
  role: AuthRole | null;
  loading: boolean;
  login: (id: string, password: string) => Promise<LoginActionResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void checkAuthSession()
      .then((result) => {
        if (active) setUser(result.success ? result.data ?? null : null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (id: string, password: string) => {
    try {
      const result = await loginAction(id, password);
      if (result.success) setUser(result.data ?? null);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "로그인에 실패했습니다.",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutAction();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        username: user?.username ?? null,
        role: user?.role ?? null,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다");
  }
  return context;
}
