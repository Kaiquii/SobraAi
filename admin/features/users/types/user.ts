import type { UserRole } from "@/features/auth/types/auth";
import type { Pagination } from "@/lib/pagination";

export type AdminUser = {
  access_blocked: boolean;
  access_blocked_at: string | null;
  avatar_url: string;
  email: string;
  id: number;
  last_active_at: string;
  name: string;
  role: UserRole;
};

export type AdminUsersResponse = {
  pagination?: Pagination;
  total: number;
  users: AdminUser[];
};

export type UserMetrics = {
  active: number;
  admins: number;
  blocked: number;
  premium: number;
  total: number;
};

export type AdminUserAction =
  | "delete"
  | "promote-premium"
  | "restore"
  | "revoke"
  | "revoke-premium";

export type AdminUserActionResponse = {
  message: string;
  user: Omit<AdminUser, "avatar_url" | "last_active_at"> & {
    avatar_url?: string;
    last_active_at?: string;
  };
};

export type DeleteAdminUserResponse = {
  message: string;
  warning?: string;
};

export type UserRoleFilter = "all" | UserRole;
export type UserStatusFilter = "active" | "all" | "blocked";

export type UsersListFilters = {
  role: UserRoleFilter;
  search: string;
  status: UserStatusFilter;
};

export type UsersListParams = {
  limit: number;
  page: number;
  role?: Exclude<UserRoleFilter, "all">;
  search?: string;
  status?: Exclude<UserStatusFilter, "all">;
};

