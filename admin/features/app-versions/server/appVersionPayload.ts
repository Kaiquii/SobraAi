import "server-only";

import type { AppVersionPayload } from "@/features/app-versions/types/appVersion";
import {
  APP_VERSION_LIMITS,
  isValidPlayStoreUrl,
} from "@/features/app-versions/utils/appVersionValidation";

type ParseResult =
  | { data: AppVersionPayload; error?: never }
  | { data?: never; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseAppVersionPayload(
  value: unknown,
  expectedVersionCode?: number,
): ParseResult {
  if (!isRecord(value)) return { error: "O corpo da requisição é inválido." };

  const latestVersionName =
    typeof value.latest_version_name === "string"
      ? value.latest_version_name.trim()
      : "";
  const playStoreUrl =
    typeof value.play_store_url === "string"
      ? value.play_store_url.trim()
      : "";
  const message = typeof value.message === "string" ? value.message.trim() : "";
  const latestVersionCode = Number(value.latest_version_code);
  const minRequiredVersionCode = Number(value.min_required_version_code);

  if (!latestVersionName) return { error: "Informe o nome da versão." };
  if (latestVersionName.length > APP_VERSION_LIMITS.versionName) {
    return {
      error: `Use no máximo ${APP_VERSION_LIMITS.versionName} caracteres no nome da versão.`,
    };
  }
  if (!Number.isInteger(latestVersionCode) || latestVersionCode <= 0) {
    return { error: "O código da versão deve ser um inteiro maior que zero." };
  }
  if (
    expectedVersionCode !== undefined &&
    latestVersionCode !== expectedVersionCode
  ) {
    return { error: "O código da versão não pode ser alterado." };
  }
  if (!Number.isInteger(minRequiredVersionCode) || minRequiredVersionCode < 0) {
    return { error: "O código mínimo deve ser um inteiro maior ou igual a zero." };
  }
  if (minRequiredVersionCode > latestVersionCode) {
    return { error: "O código mínimo não pode superar o código da versão." };
  }
  if (!playStoreUrl || !isValidPlayStoreUrl(playStoreUrl)) {
    return { error: "Informe uma URL HTTPS válida da Play Store." };
  }
  if (message.length > APP_VERSION_LIMITS.message) {
    return {
      error: `Use no máximo ${APP_VERSION_LIMITS.message} caracteres na mensagem.`,
    };
  }
  if (typeof value.force_update !== "boolean") {
    return { error: "Informe se a atualização será obrigatória." };
  }

  return {
    data: {
      force_update: value.force_update,
      latest_version_code: latestVersionCode,
      latest_version_name: latestVersionName,
      message,
      min_required_version_code: minRequiredVersionCode,
      play_store_url: playStoreUrl,
    },
  };
}
