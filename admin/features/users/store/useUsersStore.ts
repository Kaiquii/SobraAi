"use client";

import { create } from "zustand";

import { clearSessionIfUnauthorized } from "@/features/auth/utils/handleProtectedApiError";
import { usersApi } from "@/features/users/api/usersApi";
import type {
  AdminUser,
  AdminUserAction,
  AdminUserActionResponse,
  UserMetrics,
  UsersListFilters,
} from "@/features/users/types/user";
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
  changeFilters: (filters: UsersListFilters) => void;
  changeLimit: (limit: number) => void;
  changePage: (page: number) => void;
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
  ) => Promise<void>;
  metrics: UserMetrics | null;
  page: number;
  pagination: Pagination | null;
  pendingAction: PendingUserAction | null;
  promotePremium: (userId: number) => Promise<boolean>;
  restoreAccess: (userId: number) => Promise<boolean>;
  revokeAccess: (userId: number) => Promise<boolean>;
  revokePremium: (userId: number) => Promise<boolean>;
  successMessage: string | null;
  users: AdminUser[];
};

type ActionResult = {
  successMessage: string;
  user?: AdminUserActionResponse["user"];
};

function normalizeUser(user: AdminUser, avatarCacheKey?: number): AdminUser {
  return {
    ...user,
    avatar_url: avatarCacheKey
      ? appendAssetCacheKey(user.avatar_url, avatarCacheKey)
      : user.avatar_url.trim(),
    email: user.email.trim(),
    name: user.name.trim(),
  };
}

function mergeUpdatedUser(
  currentUser: AdminUser,
  updatedUser: AdminUserActionResponse["user"],
): AdminUser {
  return normalizeUser(
    {
      ...currentUser,
      ...updatedUser,
      avatar_url: updatedUser.avatar_url ?? currentUser.avatar_url,
    },
    updatedUser.avatar_url ? Date.now() : undefined,
  );
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
    operation: () => Promise<ActionResult>,
  ) {
    if (get().pendingAction || get().isLoading) return false;

    set({
      actionError: null,
      error: null,
      pendingAction: { action, userId },
      successMessage: null,
    });

    try {
      const result = await operation();
      const currentState = get();

      if (result.user) {
        const currentUser = currentState.users.find((user) => user.id === userId);

        if (!currentUser) {
          set({
            lastUpdatedAt: new Date().toISOString(),
            pendingAction: null,
            successMessage: result.successMessage,
          });
          return true;
        }

        const updatedUser = mergeUpdatedUser(currentUser, result.user);
        const shouldKeepUser =
          currentState.filters.role === "all" ||
          currentState.filters.role === updatedUser.role;
        const users = shouldKeepUser
          ? currentState.users.map((user) =>
              user.id === userId ? updatedUser : user,
            )
          : currentState.users.filter((user) => user.id !== userId);
        const pagination =
          shouldKeepUser || !currentState.pagination
            ? currentState.pagination
            : (() => {
                const total = Math.max(0, currentState.pagination.total - 1);
                const totalPages = total === 0
                  ? 0
                  : Math.ceil(total / currentState.pagination.limit);

                return {
                  ...currentState.pagination,
                  has_next: currentState.pagination.page < totalPages,
                  has_previous: currentState.pagination.page > 1,
                  total,
                  total_pages: totalPages,
                };
              })();

        set({
          lastUpdatedAt: new Date().toISOString(),
          pagination,
          users,
        });

        if (action === "promote-premium" || action === "revoke-premium") {
          await get().loadUserMetrics();
        }

        set({
          pendingAction: null,
          successMessage: result.successMessage,
        });
        return true;
      }

      const currentPage = currentState.pagination?.page ?? currentState.page;
      const targetPage =
        action === "delete" && currentState.users.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      await Promise.all([
        get().loadUsers(targetPage, currentState.limit, currentState.filters),
        get().loadUserMetrics(),
      ]);

      set({
        lastUpdatedAt: new Date().toISOString(),
        pendingAction: null,
        successMessage: result.successMessage,
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
    ) => {
      const requestId = ++latestListRequest;
      const normalizedFilters = { ...filters, search: filters.search.trim() };

      set({ error: null, filters: normalizedFilters, isLoading: true });

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
        });
        const avatarCacheKey = Date.now();
        const normalizedUsers = response.users.map((user) =>
          normalizeUser(user, avatarCacheKey),
        );

        if (requestId !== latestListRequest) return;

        set({
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
        return {
          successMessage: "Acesso revogado com sucesso.",
        };
      }),

    restoreAccess: (userId) =>
      runAction("restore", userId, async () => {
        await usersApi.restoreAccess(userId);
        return {
          successMessage: "Acesso liberado com sucesso.",
        };
      }),

    promotePremium: (userId) =>
      runAction("promote-premium", userId, async () => {
        const response = await usersApi.promotePremium(userId);
        return { successMessage: response.message, user: response.user };
      }),

    revokePremium: (userId) =>
      runAction("revoke-premium", userId, async () => {
        const response = await usersApi.revokePremium(userId);
        return { successMessage: response.message, user: response.user };
      }),

    deleteUser: (userId) =>
      runAction("delete", userId, async () => {
        const response = await usersApi.deleteUser(userId);
        return {
          successMessage: response.warning
            ? "Usuário excluído, mas a foto de perfil não pôde ser removida."
            : "Usuário excluído permanentemente.",
        };
      }),
  };
});
