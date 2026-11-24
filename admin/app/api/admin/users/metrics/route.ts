import { NextResponse } from "next/server";

import type { UserMetrics } from "@/features/users/types/user";
import { requireAdminSession } from "@/lib/server/adminSession";
import { backendApi } from "@/lib/server/backendApi";
import { backendErrorResponse } from "@/lib/server/routeError";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();

  if (session.response) return session.response;

  try {
    const response = await backendApi.get<UserMetrics>("/admin/users/metrics", {
      headers: { Authorization: `Bearer ${session.token}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return backendErrorResponse(
      error,
      "Não foi possível carregar os indicadores de usuários.",
    );
  }
}
