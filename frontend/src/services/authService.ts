import axios from "axios";
import type {
  AuthData,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  /**
   * POST /auth/register
   * Créer un nouvel utilisateur
   */
  register: async (email: string, password: string, name: string): Promise<AuthData> => {
    const payload: RegisterRequest = { email, password, name };
    const response = await apiClient.post("/auth/register", payload);
    if (!response.data.success) {
      throw new Error(response.data.error || "Registration failed");
    }
    return response.data.data;
  },

  /**
   * POST /auth/login
   * Connecter un utilisateur
   */
  login: async (email: string, password: string): Promise<AuthData> => {
    const payload: LoginRequest = { email, password };
    const response = await apiClient.post("/auth/login", payload);
    if (!response.data.success) {
      throw new Error(response.data.error || "Login failed");
    }
    return response.data.data;
  },

  /**
   * POST /auth/refresh
   * Renouveler le token d'accès
   */
  refreshToken: async (): Promise<string> => {
    const response = await apiClient.post("/auth/refresh");
    if (!response.data.success) {
      throw new Error(response.data.error || "Token refresh failed");
    }
    return response.data.data.accessToken;
  },

  /**
   * GET /auth/me
   * Récupérer l'utilisateur courant
   */
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await apiClient.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch current user");
    }
    return response.data.data;
  },
};
