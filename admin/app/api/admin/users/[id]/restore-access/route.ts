import { NextResponse } from "next/server";

import { requireAdminUserTarget } from "@/features/users/server/adminUserTarget";
import type { AdminUserActionResponse } from "@/features/users/types/user";
import { backendApi } from "@/lib/server/backendApi";
import { backendErrorResponse } from "@/lib/server/routeError";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const target = await requireAdminUserTarget(rawId);

  if (target.response) return target.response;

  try {
    const response = await backendApi.patch<AdminUserActionResponse>(
      `/admin/users/${target.id}/restore-access`,
      undefined,
      { headers: { Authorization: `Bearer ${target.token}` } },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return backendErrorResponse(error, "Não foi possível liberar o acesso.");
  }
}
