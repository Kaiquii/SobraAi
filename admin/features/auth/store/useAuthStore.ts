"use client";

import { create } from "zustand";

import { authApi } from "@/features/auth/api/authApi";
import type { AuthUser, LoginRequest } from "@/features/auth/types/auth";
import { appendAssetCacheKey } from "@/lib/assetUrl";
import { getApiErrorMessage } from "@/lib/apiErrors";

type AuthState = {
  error: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  user: AuthUser | null;
  clearError: () => void;
  loadSession: () => Promise<boolean>;
  login: (payload: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
};

function normalizeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    avatar_url: appendAssetCacheKey(user.avatar_url, Date.now()),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  error: null,
  isInitialized: false,
  isLoading: false,
  isSubmitting: false,
  user: null,

  clearError: () => set({ error: null }),

  loadSession: async () => {
    set({ error: null, isLoading: true });

    try {
      const response = await authApi.getSession();
      set({
        isInitialized: true,
        isLoading: false,
        user: normalizeAuthUser(response.user),
      });
      return true;
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Sua sessão expirou. Entre novamente."),
        isInitialized: true,
        isLoading: false,
        user: null,
      });
      return false;
    }
  },

  login: async (payload) => {
    set({ error: null, isSubmitting: true });

    try {
      const response = await authApi.login(payload);
      set({
        isInitialized: true,
        isSubmitting: false,
        user: normalizeAuthUser(response.user),
      });
      return true;
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Não foi possível entrar. Tente novamente."),
        isInitialized: true,
        isSubmitting: false,
        user: null,
      });
      return false;
    }
  },

  logout: async () => {
    set({ error: null, isSubmitting: true });

    try {
      await authApi.logout();
    } finally {
      set({ error: null, isInitialized: true, isSubmitting: false, user: null });
    }
  },
}));
