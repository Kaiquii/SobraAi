import { NextResponse } from "next/server";

import type {
  AndroidAppVersion,
  AppVersionActionResponse,
} from "@/features/app-versions/types/appVersion";
import { parseAppVersionPayload } from "@/features/app-versions/server/appVersionPayload";
import { requireAdminSession } from "@/lib/server/adminSession";
import { backendApi } from "@/lib/server/backendApi";
import { backendErrorResponse } from "@/lib/server/routeError";

type BackendActionResponse =
  | AndroidAppVersion
  | AppVersionActionResponse
  | { app_version: AndroidAppVersion };

function getVersion(payload: BackendActionResponse) {
  if ("version" in payload) return payload.version;
  if ("app_version" in payload) return payload.app_version;
  return payload;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ versionCode: string }> },
) {
  const session = await requireAdminSession();
  if (session.response) return session.response;

  const { versionCode: rawVersionCode } = await context.params;
  const versionCode = Number(rawVersionCode);
  if (!Number.isInteger(versionCode) || versionCode <= 0) {
    return NextResponse.json(
      { error: "O código da versão é inválido." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "O corpo da requisição é inválido." },
      { status: 400 },
    );
  }

  const payload = parseAppVersionPayload(body, versionCode);
  if (payload.error) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  try {
    const response = await backendApi.patch<BackendActionResponse>(
      `/admin/app-version/android/${versionCode}`,
      payload.data,
      { headers: { Authorization: `Bearer ${session.token}` } },
    );
    return NextResponse.json({ version: getVersion(response.data) });
  } catch (error) {
    return backendErrorResponse(
      error,
      "Não foi possível atualizar a versão do Android.",
    );
  }
}
