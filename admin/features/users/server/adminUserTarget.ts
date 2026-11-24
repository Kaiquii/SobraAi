import "server-only";

import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/server/adminSession";

type AdminUserTargetResult =
  | { id: number; response?: never; token: string }
  | { id?: never; response: NextResponse; token?: never };

export async function requireAdminUserTarget(
  rawId: string,
): Promise<AdminUserTargetResult> {
  const id = Number(rawId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return {
      response: NextResponse.json(
        { error: "Identificador de usuário inválido." },
        { status: 400 },
      ),
    };
  }

  const session = await requireAdminSession();

  if (session.response) return { response: session.response };

  return { id, token: session.token };
}
