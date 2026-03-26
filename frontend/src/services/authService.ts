import type {
  AuthData,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/api";
import { api } from "../api/axiosClient";

export const authService = {
  /**
   * POST /auth/register
   * Créer un nouvel utilisateur
   */
  register: async (email: string, password: string, name: string): Promise<AuthData> => {
    const payload: RegisterRequest = { email, password, name };
    const response = await api.post<{ token: string; user: User }>("/auth/register", payload);
    
    return {
      user: response.data.user,
      accessToken: response.data.token
    };
  },

  /**
   * POST /auth/login
   * Connecter un utilisateur
   */
  login: async (email: string, password: string): Promise<AuthData> => {
    const payload: LoginRequest = { email, password };
    const response = await api.post<{ token: string; user: User }>("/auth/login", payload);
    
    return {
      user: response.data.user,
      accessToken: response.data.token
    };
  },

  /**
   * POST /auth/refresh
   * Renouveler le token d'accès
   */
  refreshToken: async (): Promise<string> => {
    const response = await api.post<{ token: string }>("/auth/refresh");
    return response.data.token;
  },

  /**
   * GET /auth/me
   * Récupérer l'utilisateur courant
   */
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await api.get<User>("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
