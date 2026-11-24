import { apiClient } from "@/lib/api";
import type {
  LoginRequest,
  LoginResponse,
  SessionResponse,
} from "@/features/auth/types/auth";

export const authApi = {
  async login(payload: LoginRequest) {
    const response = await apiClient.post<LoginResponse>("/auth/login", payload);
    return response.data;
  },

  async getSession() {
    const response = await apiClient.get<SessionResponse>("/auth/session");
    return response.data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },
};
