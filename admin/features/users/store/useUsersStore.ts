"use client";

import { create } from "zustand";

import { clearSessionIfUnauthorized } from "@/features/auth/utils/handleProtectedApiError";
import { usersApi } from "@/features/users/api/usersApi";
import type {
  AdminUser,
  AdminUserAction,
  UserMetrics,
  UsersListFilters,
} from "@/features/users/types/user";
import type { UserSort } from "@/features/users/utils/userSort";
import { appendAssetCacheKey } from "@/lib/assetUrl";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiErrors";
import {
  DEFAULT_PAGE,
  USERS_PAGE_LIMIT,
  type Pagination,
} from "@/lib/pagination";

type PendingUserAction = {
  action: AdminUserAction;
  userId: number;
};

type UsersState = {
  actionError: string | null;
  appliedSort: UserSort;
  changeFilters: (filters: UsersListFilters) => void;
  changeLimit: (limit: number) => void;
  changePage: (page: number) => void;
  changeSort: (sort: UserSort) => void;
  clearFeedback: () => void;
  deleteUser: (userId: number) => Promise<boolean>;
  error: string | null;
  filters: UsersListFilters;
  hasLoaded: boolean;
  hasLoadedMetrics: boolean;
  isLoading: boolean;
  isLoadingMetrics: boolean;
  lastUpdatedAt: string | null;
  limit: number;
  loadUserMetrics: () => Promise<void>;
  loadUsers: (
    page?: number,
    limit?: number,
    filters?: UsersListFilters,
    sort?: UserSort,
  ) => Promise<void>;
  metrics: UserMetrics | null;
  page: number;
  pagination: Pagination | null;
  pendingAction: PendingUserAction | null;
  promotePremium: (userId: number) => Promise<boolean>;
  restoreAccess: (userId: number) => Promise<boolean>;
  revokeAccess: (userId: number) => Promise<boolean>;
  revokePremium: (userId: number) => Promise<boolean>;
  sort: UserSort;
  successMessage: string | null;
  users: AdminUser[];
};

function normalizeUser(user: AdminUser, avatarCacheKey: number): AdminUser {
  return {
    ...user,
    avatar_url: appendAssetCacheKey(user.avatar_url, avatarCacheKey),
    email: user.email.trim(),
    name: user.name.trim(),
  };
}

function getActionErrorMessage(error: unknown, action: AdminUserAction) {
  const status = getApiErrorStatus(error);

  if (status === 403) return "Esta operação não é permitida para este usuário.";
  if (status === 404) return "O usuário não existe mais. Atualize a lista.";
  if (status === 409) return "A operação entrou em conflito com o estado atual.";
  if (status === 429) return "Muitas tentativas. Aguarde e tente novamente.";

  const fallback = {
    delete: "Não foi possível excluir o usuário.",
    "promote-premium": "Não foi possível promover o usuário para Premium.",
    restore: "Não foi possível liberar o acesso.",
    revoke: "Não foi possível revogar o acesso.",
    "revoke-premium": "Não foi possível remover o perfil Premium.",
  }[action];

  return getApiErrorMessage(error, fallback);
}

export const useUsersStore = create<UsersState>((set, get) => {
  let latestListRequest = 0;

  async function runAction(
    action: AdminUserAction,
    userId: number,
    operation: () => Promise<string>,
  ) {
    if (get().pendingAction || get().isLoading) return false;

    set({
      actionError: null,
      error: null,
      pendingAction: { action, userId },
      successMessage: null,
    });

    try {
      const successMessage = await operation();
      await Promise.all([get().loadUsers(), get().loadUserMetrics()]);

      set({
        lastUpdatedAt: new Date().toISOString(),
        pendingAction: null,
        successMessage,
      });
      return true;
    } catch (error) {
      await clearSessionIfUnauthorized(error);
      set({
        actionError: getActionErrorMessage(error, action),
        pendingAction: null,
      });
      return false;
    }
  }

  return {
    actionError: null,
    appliedSort: "",
    error: null,
    filters: { role: "all", search: "", status: "all" },
    hasLoaded: false,
    hasLoadedMetrics: false,
    isLoading: false,
    isLoadingMetrics: false,
    lastUpdatedAt: null,
    limit: USERS_PAGE_LIMIT,
    metrics: null,
    page: DEFAULT_PAGE,
    pagination: null,
    pendingAction: null,
    sort: "",
    successMessage: null,
    users: [],

    clearFeedback: () => set({ actionError: null, successMessage: null }),

    changeFilters: (filters) => {
      const current = get().filters;
      if (
        filters.search === current.search &&
        filters.role === current.role &&
        filters.status === current.status
      ) {
        return;
      }

      void get().loadUsers(DEFAULT_PAGE, get().limit, filters);
    },

    changeLimit: (limit) => {
      if (limit === get().limit) return;
      const shouldReload = get().hasLoaded;
      set({ limit, page: DEFAULT_PAGE });
      if (shouldReload) {
        void get().loadUsers(DEFAULT_PAGE, limit, get().filters);
      }
    },

    changePage: (page) => {
      const pagination = get().pagination;
      if (
        get().isLoading ||
        page < 1 ||
        page === get().page ||
        (pagination && page > pagination.total_pages)
      ) {
        return;
      }

      void get().loadUsers(page, get().limit, get().filters);
    },

    changeSort: (sort) => {
      const current = get();
      if (sort === current.sort || current.pendingAction) return;

      void current.loadUsers(DEFAULT_PAGE, current.limit, current.filters, sort);
    },

    loadUserMetrics: async () => {
      if (get().isLoadingMetrics) return;

      set({ error: null, isLoadingMetrics: true });

      try {
        const metrics = await usersApi.getMetrics();

        set({
          hasLoadedMetrics: true,
          isLoadingMetrics: false,
          lastUpdatedAt: new Date().toISOString(),
          metrics,
        });
      } catch (error) {
        await clearSessionIfUnauthorized(error);
        set({
          error: getApiErrorMessage(
            error,
            "Não foi possível carregar os indicadores de usuários.",
          ),
          hasLoadedMetrics: true,
          isLoadingMetrics: false,
        });
      }
    },

    loadUsers: async (
      page = get().page,
      limit = get().limit,
      filters = get().filters,
      sort = get().sort,
    ) => {
      const requestId = ++latestListRequest;
      const normalizedFilters = { ...filters, search: filters.search.trim() };

      set({ error: null, filters: normalizedFilters, isLoading: true, page, sort });

      try {
        const response = await usersApi.getUsers({
          limit,
          page,
          ...(normalizedFilters.search
            ? { search: normalizedFilters.search }
            : {}),
          ...(normalizedFilters.role !== "all"
            ? { role: normalizedFilters.role }
            : {}),
          ...(normalizedFilters.status !== "all"
            ? { status: normalizedFilters.status }
            : {}),
          ...(sort ? { sort } : {}),
        });

        if (requestId !== latestListRequest) return;

        const lastPage = Math.max(DEFAULT_PAGE, response.pagination?.total_pages ?? page);
        if (page > lastPage) {
          await get().loadUsers(lastPage, limit, normalizedFilters, sort);
          return;
        }

        const avatarCacheKey = Date.now();
        const normalizedUsers = response.users.map((user) =>
          normalizeUser(user, avatarCacheKey),
        );

        set({
          appliedSort: sort,
          hasLoaded: true,
          isLoading: false,
          lastUpdatedAt: new Date().toISOString(),
          limit,
          page,
          pagination: response.pagination ?? null,
          users: normalizedUsers,
        });
      } catch (error) {
        await clearSessionIfUnauthorized(error);
        if (requestId !== latestListRequest) return;
        set({
          error: getApiErrorMessage(
            error,
            "Não foi possível carregar os usuários.",
          ),
          hasLoaded: true,
          isLoading: false,
        });
      }
    },

    revokeAccess: (userId) =>
      runAction("revoke", userId, async () => {
        await usersApi.revokeAccess(userId);
        return "Acesso revogado com sucesso.";
      }),

    restoreAccess: (userId) =>
      runAction("restore", userId, async () => {
        await usersApi.restoreAccess(userId);
        return "Acesso liberado com sucesso.";
      }),

    promotePremium: (userId) =>
      runAction("promote-premium", userId, async () => {
        const response = await usersApi.promotePremium(userId);
        return response.message;
      }),

    revokePremium: (userId) =>
      runAction("revoke-premium", userId, async () => {
        const response = await usersApi.revokePremium(userId);
        return response.message;
      }),

    deleteUser: (userId) =>
      runAction("delete", userId, async () => {
        const response = await usersApi.deleteUser(userId);
        return response.warning
          ? "Usuário excluído, mas a foto de perfil não pôde ser removida."
          : "Usuário excluído permanentemente.";
      }),
  };
});
