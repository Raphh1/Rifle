import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "../types/api";
import { api } from "../api/axiosClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Optionally verify token with /auth/me
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      // Backend returns { token, user } directly
      const response = await api.post<{ token: string; user: User }>("/auth/login", {
        email,
        password,
      });

      const { user: userData, token: accessToken } = response.data;
      
      setUser(userData);
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    setError(null);
    setIsLoading(true);
    try {
      // Backend returns { token, user } directly
      const response = await api.post<{ token: string; user: User }>(
        "/auth/register",
        { name, email, password }
      );

      const { user: userData, token: accessToken } = response.data;

      setUser(userData);
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
