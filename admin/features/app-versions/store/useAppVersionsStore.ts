"use client";

import { create } from "zustand";

import { appVersionsApi } from "@/features/app-versions/api/appVersionsApi";
import type {
  AndroidAppVersion,
  AppVersionHistoryFilters,
  AppVersionPayload,
} from "@/features/app-versions/types/appVersion";
import { clearSessionIfUnauthorized } from "@/features/auth/utils/handleProtectedApiError";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiErrors";
import {
  APP_VERSIONS_PAGE_LIMIT,
  DEFAULT_PAGE,
  type Pagination,
} from "@/lib/pagination";

type AppVersionsState = {
  actionError: string | null;
  activeVersion: AndroidAppVersion | null;
  changeHistoryFilters: (filters: AppVersionHistoryFilters) => void;
  changeHistoryLimit: (limit: number) => void;
  changeHistoryPage: (page: number) => void;
  clearFeedback: () => void;
  createVersion: (payload: AppVersionPayload) => Promise<boolean>;
  error: string | null;
  hasLoaded: boolean;
  hasLoadedHistory: boolean;
  historyFilters: AppVersionHistoryFilters;
  historyLimit: number;
  historyPage: number;
  historyPagination: Pagination | null;
  historyError: string | null;
  isLoading: boolean;
  isLoadingHistory: boolean;
  isSubmitting: boolean;
  lastUpdatedAt: string | null;
  loadActiveVersion: () => Promise<void>;
  loadVersions: (
    page?: number,
    limit?: number,
    filters?: AppVersionHistoryFilters,
  ) => Promise<void>;
  successMessage: string | null;
  total: number;
  updateVersion: (
    versionCode: number,
    payload: AppVersionPayload,
  ) => Promise<boolean>;
  versions: AndroidAppVersion[];
};

function sortVersions(versions: AndroidAppVersion[]) {
  return [...versions].sort(
    (first, second) =>
      second.latest_version_code - first.latest_version_code,
  );
}

function getActionErrorMessage(error: unknown) {
  const status = getApiErrorStatus(error);

  if (status === 400) {
    return getApiErrorMessage(error, "Revise os campos informados.");
  }
  if (status === 403) return "Esta operação exige permissão administrativa.";
  if (status === 404) return "A versão informada não existe mais.";
  if (status === 409) {
    return "Já existe uma versão Android com este código.";
  }
  if (status === 429) return "Muitas tentativas. Aguarde e tente novamente.";

  return getApiErrorMessage(
    error,
    "Não foi possível salvar a versão do aplicativo.",
  );
}

export const useAppVersionsStore = create<AppVersionsState>((set, get) => {
  let latestHistoryRequest = 0;

  async function saveVersion(
    operation: () => Promise<{ version: AndroidAppVersion }>,
    successMessage: string,
    resetToFirstPage: boolean,
  ) {
    if (get().isSubmitting) return false;

    set({ actionError: null, isSubmitting: true, successMessage: null });

    try {
      const response = await operation();
      const currentState = get();
      const targetPage = resetToFirstPage
        ? DEFAULT_PAGE
        : currentState.historyPage;
      const activeVersion =
        resetToFirstPage ||
        currentState.activeVersion?.latest_version_code ===
          response.version.latest_version_code
          ? response.version
          : currentState.activeVersion;

      set({
        activeVersion,
        actionError: null,
        error: null,
        hasLoaded: true,
        historyError: null,
        lastUpdatedAt: new Date().toISOString(),
      });

      await get().loadVersions(
        targetPage,
        currentState.historyLimit,
        currentState.historyFilters,
      );
      set({ isSubmitting: false, successMessage });
      return true;
    } catch (error) {
      await clearSessionIfUnauthorized(error);
      set({
        actionError: getActionErrorMessage(error),
        isSubmitting: false,
      });
      return false;
    }
  }

  return {
    actionError: null,
    activeVersion: null,
    error: null,
    hasLoaded: false,
    hasLoadedHistory: false,
    historyFilters: { policy: "all", search: "" },
    historyLimit: APP_VERSIONS_PAGE_LIMIT,
    historyPage: DEFAULT_PAGE,
    historyPagination: null,
    historyError: null,
    isLoading: false,
    isLoadingHistory: false,
    isSubmitting: false,
    lastUpdatedAt: null,
    successMessage: null,
    total: 0,
    versions: [],

    changeHistoryFilters: (filters) => {
      const current = get().historyFilters;
      if (filters.search === current.search && filters.policy === current.policy) {
        return;
      }

      void get().loadVersions(DEFAULT_PAGE, get().historyLimit, filters);
    },

    changeHistoryLimit: (limit) => {
      if (limit === get().historyLimit) return;
      const shouldReload = get().hasLoadedHistory;
      set({ historyLimit: limit, historyPage: DEFAULT_PAGE });
      if (shouldReload) {
        void get().loadVersions(DEFAULT_PAGE, limit, get().historyFilters);
      }
    },

    changeHistoryPage: (page) => {
      const pagination = get().historyPagination;
      if (
        get().isLoadingHistory ||
        page < 1 ||
        page === get().historyPage ||
        (pagination && page > pagination.total_pages)
      ) {
        return;
      }

      void get().loadVersions(page, get().historyLimit, get().historyFilters);
    },

    clearFeedback: () =>
      set({ actionError: null, successMessage: null }),

    createVersion: (payload) =>
      saveVersion(
        () => appVersionsApi.createVersion(payload),
        `Versão ${payload.latest_version_name} publicada com sucesso.`,
        true,
      ),

    loadActiveVersion: async () => {
      if (get().isLoading) return;

      set({ error: null, isLoading: true });

      try {
        const response = await appVersionsApi.getActiveVersion();
        set({
          activeVersion: response.version,
          hasLoaded: true,
          isLoading: false,
          lastUpdatedAt: new Date().toISOString(),
        });
      } catch (error) {
        await clearSessionIfUnauthorized(error);
        set({
          error: getApiErrorMessage(
            error,
            "Não foi possível carregar a versão ativa do Android.",
          ),
          hasLoaded: true,
          isLoading: false,
        });
      }
    },

    loadVersions: async (
      page = get().historyPage,
      limit = get().historyLimit,
      filters = get().historyFilters,
    ) => {
      const requestId = ++latestHistoryRequest;
      const normalizedFilters = { ...filters, search: filters.search.trim() };

      set({
        historyError: null,
        historyFilters: normalizedFilters,
        isLoadingHistory: true,
      });

      try {
        const response = await appVersionsApi.getHistory({
          limit,
          page,
          ...(normalizedFilters.search
            ? { search: normalizedFilters.search }
            : {}),
          ...(normalizedFilters.policy !== "all"
            ? { force_update: normalizedFilters.policy === "required" }
            : {}),
        });
        const versions = sortVersions(response.versions);

        if (requestId !== latestHistoryRequest) return;

        set({
          hasLoadedHistory: true,
          historyLimit: limit,
          historyPage: page,
          historyPagination: response.pagination ?? null,
          historyError: null,
          isLoadingHistory: false,
          lastUpdatedAt: new Date().toISOString(),
          total: Number.isFinite(response.total)
            ? response.total
            : versions.length,
          versions,
        });
      } catch (error) {
        await clearSessionIfUnauthorized(error);
        if (requestId !== latestHistoryRequest) return;
        set({
          hasLoadedHistory: true,
          historyError: getApiErrorMessage(
            error,
            "Não foi possível carregar o histórico de versões.",
          ),
          isLoadingHistory: false,
        });
      }
    },

    updateVersion: (versionCode, payload) =>
      saveVersion(
        () => appVersionsApi.updateVersion(versionCode, payload),
        `Versão ${payload.latest_version_name} atualizada com sucesso.`,
        false,
      ),
  };
});

