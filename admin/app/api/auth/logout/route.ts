import { NextResponse } from "next/server";

import { clearSessionToken } from "@/lib/server/session";

export async function POST() {
  await clearSessionToken();

  return NextResponse.json({ message: "Sessão encerrada com sucesso." });
}
