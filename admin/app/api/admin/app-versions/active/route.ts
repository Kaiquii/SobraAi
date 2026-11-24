import { NextResponse } from "next/server";

import type {
  ActiveAppVersionResponse,
  AndroidAppVersion,
} from "@/features/app-versions/types/appVersion";
import { getApiErrorStatus } from "@/lib/apiErrors";
import { requireAdminSession } from "@/lib/server/adminSession";
import { backendApi } from "@/lib/server/backendApi";
import { backendErrorResponse } from "@/lib/server/routeError";

export const dynamic = "force-dynamic";

type BackendAppVersionResponse =
  | AndroidAppVersion
  | ActiveAppVersionResponse
  | { app_version: AndroidAppVersion | null };

function getVersion(payload: BackendAppVersionResponse) {
  if ("version" in payload) return payload.version;
  if ("app_version" in payload) return payload.app_version;
  return payload;
}

export async function GET() {
  const session = await requireAdminSession();

  if (session.response) return session.response;

  try {
    const response = await backendApi.get<BackendAppVersionResponse>("/app-version", {
      params: { platform: "android" },
    });

    return NextResponse.json({ version: getVersion(response.data) });
  } catch (error) {
    if (getApiErrorStatus(error) === 404) {
      return NextResponse.json({ version: null });
    }

    return backendErrorResponse(
      error,
      "Não foi possível carregar a versão ativa do Android.",
    );
  }
}

