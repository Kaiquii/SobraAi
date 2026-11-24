import { NextResponse } from "next/server";

import type { BackendProfileResponse } from "@/features/auth/types/auth";
import { getApiErrorStatus } from "@/lib/apiErrors";
import { backendApi } from "@/lib/server/backendApi";
import { backendErrorResponse } from "@/lib/server/routeError";
import { clearSessionToken, getSessionToken } from "@/lib/server/session";

export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });
  }

  try {
    const response = await backendApi.get<BackendProfileResponse>("/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (
      response.data.user.role !== "admin" ||
      response.data.user.access_blocked
    ) {
      await clearSessionToken();
      return NextResponse.json(
        { error: "Esta conta não possui acesso administrativo." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      user: {
        ...response.data.user,
        access_blocked: response.data.user.access_blocked ?? false,
      },
    });
  } catch (error) {
    const status = getApiErrorStatus(error);

    if (status === 401 || status === 403) {
      await clearSessionToken();
    }

    return backendErrorResponse(error, "Não foi possível validar a sessão.");
  }
}
