import { NextResponse } from "next/server";

import type {
  BackendLoginResponse,
  LoginRequest,
} from "@/features/auth/types/auth";
import { backendApi } from "@/lib/server/backendApi";
import { backendErrorResponse } from "@/lib/server/routeError";
import { setSessionToken } from "@/lib/server/session";

export async function POST(request: Request) {
  let payload: LoginRequest;

  try {
    payload = (await request.json()) as LoginRequest;
  } catch {
    return NextResponse.json({ error: "Dados de login inválidos." }, { status: 400 });
  }

  const email = payload.email?.trim();
  const password = payload.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Informe o e-mail e a senha." },
      { status: 400 },
    );
  }

  try {
    const response = await backendApi.post<BackendLoginResponse>("/auth/login", {
      email,
      password,
    });

    if (response.data.user.role !== "admin") {
      return NextResponse.json(
        { error: "Esta conta não possui permissão administrativa." },
        { status: 403 },
      );
    }

    if (response.data.user.access_blocked) {
      return NextResponse.json(
        { error: "O acesso desta conta está bloqueado." },
        { status: 403 },
      );
    }

    await setSessionToken(response.data.token);

    return NextResponse.json({
      message: response.data.message,
      user: response.data.user,
    });
  } catch (error) {
    return backendErrorResponse(error, "Não foi possível entrar. Tente novamente.");
  }
}
