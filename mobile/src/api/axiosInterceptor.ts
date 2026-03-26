import type { InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { api } from "./axiosClient";

export const apiClient = api;

export const setupAxiosInterceptors = (
  getToken: () => string | null,
  refreshTokenFn: () => Promise<string>
) => {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest?._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshTokenFn();
          await SecureStore.setItemAsync("accessToken", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          await SecureStore.deleteItemAsync("accessToken");
          router.replace("/(auth)/login");
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
