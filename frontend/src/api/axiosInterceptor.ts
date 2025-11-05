import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Setup axios interceptors pour:
 * - Ajouter le token d'accès aux requêtes
 * - Gérer les erreurs 401 (token expiré)
 */
export const setupAxiosInterceptors = (
  getToken: () => string | null,
  refreshTokenFn: () => Promise<string>
) => {
  // Request interceptor: Ajouter le token
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Gérer 401
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Si 401 et pas déjà une tentative de refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Renouveler le token
          const newToken = await refreshTokenFn();

          // Réessayer la requête avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh échoué → déconnecter l'utilisateur
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
