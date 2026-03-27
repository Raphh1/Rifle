import { useEffect, useState, type ReactNode } from "react";
import type { AxiosError } from "axios";
import type { User } from "../types/api";
import { api } from "../api/axiosClient";
import { AuthContext, type AuthContextType } from "./AuthContextValue";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as AxiosError<{ error?: string }>;
  return apiError.response?.data?.error || (error instanceof Error ? error.message : fallback);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      try {
        const response = await api.get<User>("/users/me");
        if (isMounted) {
          setUser(response.data);
        }
      } catch (err) {
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common.Authorization;

        if (isMounted) {
          setUser(null);
          setError(getApiErrorMessage(err, "Session invalide"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login: AuthContextType["login"] = async (email, password) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
      const { user: userData, token: accessToken } = response.data;

      setUser(userData);
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } catch (err) {
      const message = getApiErrorMessage(err, "Connexion impossible");
      setError(message);
      throw new Error(message);
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
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } catch (err) {
      const message = getApiErrorMessage(err, "Inscription impossible");
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout: AuthContextType["logout"] = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common.Authorization;
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
