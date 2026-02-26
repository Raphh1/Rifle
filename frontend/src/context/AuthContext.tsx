import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/api";
import { api } from "../api/axiosClient";
import { AuthContext, type AuthContextType } from "./AuthContextValue";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);

  const login: AuthContextType["login"] = async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
      const { user: userData, token: accessToken } = response.data;

      setUser(userData);
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register: AuthContextType["register"] = async (name, email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.post<{ token: string; user: User }>("/auth/register", { name, email, password });
      const { user: userData, token: accessToken } = response.data;

      setUser(userData);
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Register failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout: AuthContextType["logout"] = () => {
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