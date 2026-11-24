import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getApiErrorStatus } from "@/lib/apiErrors";

export async function clearSessionIfUnauthorized(error: unknown) {
  const status = getApiErrorStatus(error);

  if (status === 401 || status === 403) {
    await useAuthStore.getState().logout();
  }
}

