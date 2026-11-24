import "server-only";

import { NextResponse } from "next/server";

import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiErrors";

export function backendErrorResponse(
  error: unknown,
  fallback = "O serviço está temporariamente indisponível.",
) {
  const backendStatus = getApiErrorStatus(error);
  const status =
    backendStatus && backendStatus >= 400 && backendStatus <= 599
      ? backendStatus
      : 502;
  const message =
    status >= 500 ? fallback : getApiErrorMessage(error, fallback);

  return NextResponse.json(
    { error: message },
    { status },
  );
}
