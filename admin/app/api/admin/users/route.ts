import { NextResponse } from "next/server";

import type { AdminUsersResponse } from "@/features/users/types/user";
import { parsePaginationParams } from "@/lib/pagination";
import { requireAdminSession } from "@/lib/server/adminSession";
import { backendApi } from "@/lib/server/backendApi";
import { backendErrorResponse } from "@/lib/server/routeError";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireAdminSession();

  if (session.response) return session.response;

  const searchParams = new URL(request.url).searchParams;
  const pagination = parsePaginationParams(searchParams);
  if (pagination.error) {
    return NextResponse.json({ error: pagination.error }, { status: 400 });
  }

  const search = searchParams.get("search")?.trim();
  const role = searchParams.get("role");
  const sort = searchParams.get("sort");
  const status = searchParams.get("status");

  try {
    const response = await backendApi.get<AdminUsersResponse>("/admin/users", {
      headers: { Authorization: `Bearer ${session.token}` },
      params: {
        ...pagination.params,
        ...(search ? { search } : {}),
        ...(role ? { role } : {}),
        ...(sort ? { sort } : {}),
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return backendErrorResponse(error, "Não foi possível carregar os usuários.");
  }
}
