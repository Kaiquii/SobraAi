import type { Pagination } from "@/lib/pagination";

export type AndroidAppVersion = {
  created_at: string;
  force_update: boolean;
  id: number;
  latest_version_code: number;
  latest_version_name: string;
  message: string;
  min_required_version_code: number;
  platform: "android";
  play_store_url: string;
  updated_at: string;
};

export type ActiveAppVersionResponse = {
  version: AndroidAppVersion | null;
};

export type AppVersionPayload = {
  force_update: boolean;
  latest_version_code: number;
  latest_version_name: string;
  message: string;
  min_required_version_code: number;
  play_store_url: string;
};

export type AppVersionHistoryResponse = {
  pagination?: Pagination;
  total: number;
  versions: AndroidAppVersion[];
};

export type AppVersionActionResponse = {
  version: AndroidAppVersion;
};

export type AppVersionPolicyFilter = "all" | "optional" | "required";

export type AppVersionHistoryFilters = {
  policy: AppVersionPolicyFilter;
  search: string;
};

export type AppVersionHistoryParams = {
  force_update?: boolean;
  limit: number;
  page: number;
  search?: string;
};
