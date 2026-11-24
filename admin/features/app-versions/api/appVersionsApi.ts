import type {
  ActiveAppVersionResponse,
  AppVersionActionResponse,
  AppVersionHistoryResponse,
  AppVersionHistoryParams,
  AppVersionPayload,
} from "@/features/app-versions/types/appVersion";
import { apiClient } from "@/lib/api";

export const appVersionsApi = {
  async getActiveVersion() {
    const response = await apiClient.get<ActiveAppVersionResponse>(
      "/admin/app-versions/active",
    );
    return response.data;
  },

  async getHistory(params: AppVersionHistoryParams) {
    const response = await apiClient.get<AppVersionHistoryResponse>(
      "/admin/app-versions",
      { params },
    );
    return response.data;
  },

  async createVersion(payload: AppVersionPayload) {
    const response = await apiClient.post<AppVersionActionResponse>(
      "/admin/app-versions",
      payload,
    );
    return response.data;
  },

  async updateVersion(versionCode: number, payload: AppVersionPayload) {
    const response = await apiClient.patch<AppVersionActionResponse>(
      `/admin/app-versions/${versionCode}`,
      payload,
    );
    return response.data;
  },
};

