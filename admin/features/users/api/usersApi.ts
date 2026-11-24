import type {
  AdminUserActionResponse,
  AdminUsersResponse,
  DeleteAdminUserResponse,
  UserMetrics,
  UsersListParams,
} from "@/features/users/types/user";
import { apiClient } from "@/lib/api";

export const usersApi = {
  async getMetrics() {
    const [metricsResponse, premiumUsersResponse] = await Promise.all([
      apiClient.get<Omit<UserMetrics, "premium">>("/admin/users/metrics"),
      apiClient.get<AdminUsersResponse>("/admin/users", {
        params: { limit: 1, page: 1, role: "premium" },
      }),
    ]);

    return {
      ...metricsResponse.data,
      premium:
        premiumUsersResponse.data.pagination?.total ?? premiumUsersResponse.data.total,
    };
  },

  async getUsers(params: UsersListParams) {
    const response = await apiClient.get<AdminUsersResponse>("/admin/users", {
      params,
    });
    return response.data;
  },

  async revokeAccess(userId: number) {
    const response = await apiClient.patch<AdminUserActionResponse>(
      `/admin/users/${userId}/revoke-access`,
    );
    return response.data;
  },

  async restoreAccess(userId: number) {
    const response = await apiClient.patch<AdminUserActionResponse>(
      `/admin/users/${userId}/restore-access`,
    );
    return response.data;
  },

  async promotePremium(userId: number) {
    const response = await apiClient.patch<AdminUserActionResponse>(
      `/admin/users/${userId}/promote-premium`,
    );
    return response.data;
  },

  async revokePremium(userId: number) {
    const response = await apiClient.patch<AdminUserActionResponse>(
      `/admin/users/${userId}/revoke-premium`,
    );
    return response.data;
  },

  async deleteUser(userId: number) {
    const response = await apiClient.delete<DeleteAdminUserResponse>(
      `/admin/users/${userId}`,
    );
    return response.data;
  },
};

