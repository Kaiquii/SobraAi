import type {
  AndroidAppVersion,
  AppVersionPayload,
} from "@/features/app-versions/types/appVersion";

export type AppVersionDraft = {
  forceUpdate: boolean;
  latestVersionCode: string;
  latestVersionName: string;
  message: string;
  minRequiredVersionCode: string;
  playStoreUrl: string;
};

export type AppVersionDraftErrors = Partial<
  Record<Exclude<keyof AppVersionDraft, "forceUpdate">, string>
>;

export const APP_VERSION_LIMITS = {
  message: 500,
  versionName: 30,
} as const;

export function createVersionDraft(
  version: AndroidAppVersion | null,
  activeVersion: AndroidAppVersion | null,
): AppVersionDraft {
  if (version) {
    return {
      forceUpdate: version.force_update,
      latestVersionCode: String(version.latest_version_code),
      latestVersionName: version.latest_version_name,
      message: version.message,
      minRequiredVersionCode: String(version.min_required_version_code),
      playStoreUrl: version.play_store_url,
    };
  }

  return {
    forceUpdate: false,
    latestVersionCode: "",
    latestVersionName: "",
    message: "",
    minRequiredVersionCode: "",
    playStoreUrl: activeVersion?.play_store_url ?? "",
  };
}

export function isValidPlayStoreUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "play.google.com" &&
      url.pathname.startsWith("/store/apps/")
    );
  } catch {
    return false;
  }
}

export function validateVersionDraft(
  draft: AppVersionDraft,
  activeVersion: AndroidAppVersion | null,
  isEditing: boolean,
) {
  const errors: AppVersionDraftErrors = {};
  const latestVersionName = draft.latestVersionName.trim();
  const latestVersionCode = Number(draft.latestVersionCode);
  const minRequiredVersionCode = Number(draft.minRequiredVersionCode);
  const playStoreUrl = draft.playStoreUrl.trim();

  if (!latestVersionName) {
    errors.latestVersionName = "Informe o nome exibido da versão.";
  } else if (latestVersionName.length > APP_VERSION_LIMITS.versionName) {
    errors.latestVersionName = `Use no máximo ${APP_VERSION_LIMITS.versionName} caracteres.`;
  }

  if (!Number.isInteger(latestVersionCode) || latestVersionCode <= 0) {
    errors.latestVersionCode = "Informe um código inteiro maior que zero.";
  } else if (
    !isEditing &&
    activeVersion &&
    latestVersionCode <= activeVersion.latest_version_code
  ) {
    errors.latestVersionCode = `O novo código deve ser maior que ${activeVersion.latest_version_code}.`;
  }

  if (!Number.isInteger(minRequiredVersionCode) || minRequiredVersionCode < 0) {
    errors.minRequiredVersionCode =
      "Informe um código inteiro maior ou igual a zero.";
  } else if (
    Number.isInteger(latestVersionCode) &&
    minRequiredVersionCode > latestVersionCode
  ) {
    errors.minRequiredVersionCode =
      "O código mínimo não pode superar o código da versão.";
  }

  if (!playStoreUrl || !isValidPlayStoreUrl(playStoreUrl)) {
    errors.playStoreUrl = "Informe uma URL HTTPS válida da Play Store.";
  }

  if (draft.message.trim().length > APP_VERSION_LIMITS.message) {
    errors.message = `Use no máximo ${APP_VERSION_LIMITS.message} caracteres.`;
  }

  const payload: AppVersionPayload | null =
    Object.keys(errors).length === 0
      ? {
          force_update: draft.forceUpdate,
          latest_version_code: latestVersionCode,
          latest_version_name: latestVersionName,
          message: draft.message.trim(),
          min_required_version_code: minRequiredVersionCode,
          play_store_url: playStoreUrl,
        }
      : null;

  return { errors, payload };
}

export function versionPolicyBecomesMoreRestrictive(
  payload: AppVersionPayload,
  referenceVersion: AndroidAppVersion | null,
) {
  if (!referenceVersion) {
    return payload.force_update || payload.min_required_version_code > 0;
  }

  return (
    (!referenceVersion.force_update && payload.force_update) ||
    payload.min_required_version_code >
      referenceVersion.min_required_version_code
  );
}
