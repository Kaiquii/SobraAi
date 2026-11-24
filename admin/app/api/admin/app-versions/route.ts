import { NextResponse } from "next/server";

import type {
  AndroidAppVersion,
  AppVersionActionResponse,
  AppVersionHistoryResponse,
} from "@/features/app-versions/types/appVersion";
import { parseAppVersionPayload } from "@/features/app-versions/server/appVersionPayload";
import { parsePaginationParams } from "@/lib/pagination";
import { requireAdminSession } from "@/lib/server/adminSession";
import { backendApi } from "@/lib/server/backendApi";
import { backendErrorResponse } from "@/lib/server/routeError";

export const dynamic = "force-dynamic";

type BackendActionResponse =
  | AndroidAppVersion
  | AppVersionActionResponse
  | { app_version: AndroidAppVersion };

function getVersion(payload: BackendActionResponse) {
  if ("version" in payload) return payload.version;
  if ("app_version" in payload) return payload.app_version;
  return payload;
}

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (session.response) return session.response;

  const searchParams = new URL(request.url).searchParams;
  const pagination = parsePaginationParams(searchParams);
  if (pagination.error) {
    return NextResponse.json({ error: pagination.error }, { status: 400 });
  }

  const search = searchParams.get("search")?.trim();
  const forceUpdate = searchParams.get("force_update");

  try {
    const response = await backendApi.get<AppVersionHistoryResponse>(
      "/admin/app-version/android/history",
      {
        headers: { Authorization: `Bearer ${session.token}` },
        params: {
          ...pagination.params,
          ...(search ? { search } : {}),
          ...(forceUpdate !== null ? { force_update: forceUpdate } : {}),
        },
      },
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return backendErrorResponse(
      error,
      "Não foi possível carregar o histórico de versões.",
    );
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (session.response) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "O corpo da requisição é inválido." },
      { status: 400 },
    );
  }

  const payload = parseAppVersionPayload(body);
  if (payload.error) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  try {
    const response = await backendApi.post<BackendActionResponse>(
      "/admin/app-version/android",
      payload.data,
      { headers: { Authorization: `Bearer ${session.token}` } },
    );
    return NextResponse.json(
      { version: getVersion(response.data) },
      { status: 201 },
    );
  } catch (error) {
    return backendErrorResponse(
      error,
      "Não foi possível publicar a versão do Android.",
    );
  }
}
