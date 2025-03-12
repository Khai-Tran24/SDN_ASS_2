"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Define the types for our context
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

// User type
interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
          try {
            const userData = parseToken(token);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error: unknown) {
            // Token might be expired, try to refresh
            console.error("Token parse error:", error);
            const newToken = await refreshToken();
            if (newToken) {
              const userData = parseToken(newToken);
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              logout();
            }
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Parse JWT token to get user data
  const parseToken = (token: string): User => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return {
      _id: payload._id,
      name: payload.name,
      isAdmin: payload.isAdmin,
    };
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/member/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );


      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save tokens
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);

      console.log(localStorage.getItem("accessToken"));

      // Set user data from token
      const userData = parseToken(data.data.accessToken);
      setUser(userData);
      setIsAuthenticated(true);

      // Small delay to ensure state updates are reflected in UI
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  // Refresh token function
  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (!refreshTokenValue) return null;

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/member/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Token refresh failed");
      }

      const newAccessToken = data.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);

      return newAccessToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
