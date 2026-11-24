import "server-only";

import { NextResponse } from "next/server";

import type { BackendProfileResponse } from "@/features/auth/types/auth";
import { getApiErrorStatus } from "@/lib/apiErrors";
import { backendApi } from "@/lib/server/backendApi";
import { backendErrorResponse } from "@/lib/server/routeError";
import {
  clearSessionToken,
  getSessionToken,
} from "@/lib/server/session";

type AdminSessionResult =
  | { response: NextResponse; token?: never }
  | { response?: never; token: string };

export async function requireAdminSession(): Promise<AdminSessionResult> {
  const token = await getSessionToken();

  if (!token) {
    return {
      response: NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 401 },
      ),
    };
  }

  try {
    const response = await backendApi.get<BackendProfileResponse>("/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = response.data.user;

    if (user.role !== "admin" || user.access_blocked) {
      await clearSessionToken();
      return {
        response: NextResponse.json(
          { error: "Esta conta não possui acesso administrativo." },
          { status: 403 },
        ),
      };
    }

    return { token };
  } catch (error) {
    const status = getApiErrorStatus(error);

    if (status === 401 || status === 403) {
      await clearSessionToken();
    }

    return {
      response: backendErrorResponse(error, "Não foi possível validar a sessão."),
    };
  }
}

