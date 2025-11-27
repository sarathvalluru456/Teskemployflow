import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  isManager: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const cached = sessionStorage.getItem("auth_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          sessionStorage.setItem("auth_user", JSON.stringify(data.user));
        } else {
          setUser(null);
          sessionStorage.removeItem("auth_user");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        sessionStorage.removeItem("auth_user");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback((user: User): Promise<void> => {
    return new Promise((resolve) => {
      setUser(user);
      sessionStorage.setItem("auth_user", JSON.stringify(user));
      requestAnimationFrame(() => {
        resolve();
      });
    });
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setUser(null);
    sessionStorage.removeItem("auth_user");
  }, []);

  const isManager = user?.role === "manager";
  const isEmployee = user?.role === "employee";

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isManager, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
