"use client";

import {
  ArrowLeft,
  Eye,
  Link2,
  MessageSquareText,
  PackagePlus,
  Smartphone,
} from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { AppUpdatePreview } from "@/features/app-versions/components/AppUpdatePreview";
import type {
  AndroidAppVersion,
  AppVersionPayload,
} from "@/features/app-versions/types/appVersion";
import {
  createVersionDraft,
  APP_VERSION_LIMITS,
  type AppVersionDraft,
  type AppVersionDraftErrors,
  validateVersionDraft,
} from "@/features/app-versions/utils/appVersionValidation";

type AppVersionFormModalProps = {
  actionError: string | null;
  activeVersion: AndroidAppVersion | null;
  initialPayload?: AppVersionPayload | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AppVersionPayload) => void | Promise<void>;
  version: AndroidAppVersion | null;
};

function payloadToDraft(payload: AppVersionPayload): AppVersionDraft {
  return {
    forceUpdate: payload.force_update,
    latestVersionCode: String(payload.latest_version_code),
    latestVersionName: payload.latest_version_name,
    message: payload.message,
    minRequiredVersionCode: String(payload.min_required_version_code),
    playStoreUrl: payload.play_store_url,
  };
}

function suggestNextVersionName(currentVersionName?: string) {
  if (!currentVersionName) return "1.0.0";

  const parts = currentVersionName.split(".");
  if (parts.some((part) => !/^\d+$/.test(part))) return "1.0.0";

  const nextParts = [...parts];
  nextParts[nextParts.length - 1] = String(
    Number(nextParts[nextParts.length - 1]) + 1,
  );
  return nextParts.join(".");
}

export function AppVersionFormModal({
  actionError,
  activeVersion,
  initialPayload,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
  version,
}: AppVersionFormModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<AppVersionDraft>(() =>
    initialPayload
      ? payloadToDraft(initialPayload)
      : createVersionDraft(version, activeVersion),
  );
  const [errors, setErrors] = useState<AppVersionDraftErrors>({});
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const isEditing = Boolean(version);
  const suggestedVersionName = suggestNextVersionName(
    activeVersion?.latest_version_name,
  );
  const suggestedVersionCode =
    (activeVersion?.latest_version_code ?? 0) + 1;
  const suggestedMinimumCode =
    activeVersion?.min_required_version_code ?? 0;

  function updateDraft<Key extends keyof AppVersionDraft>(
    key: Key,
    value: AppVersionDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key !== "forceUpdate") {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateVersionDraft(draft, activeVersion, isEditing);
    setErrors(validation.errors);
    if (!validation.payload) return;
    void onSubmit(validation.payload);
  }

  return (
    <Modal
      accent="sky"
      className="max-w-3xl!"
      contentClassName={isPreviewVisible ? "sm:!p-4" : "sm:p-5"}
      description={
        isPreviewVisible
          ? "Confira a mensagem e a política antes de voltar ao formulário."
          : isEditing
          ? "Corrija a mensagem e a política da versão selecionada. O código não pode ser alterado."
          : "Defina a próxima versão entregue ao aplicativo Android."
      }
      eyebrow={
        isPreviewVisible
          ? "Prévia no Android"
          : isEditing
            ? "Editar versão"
            : "Nova publicação"
      }
      headerIcon={
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-900">
          {isPreviewVisible || isEditing ? (
            <Smartphone className="size-5" aria-hidden="true" />
          ) : (
            <PackagePlus className="size-5" aria-hidden="true" />
          )}
        </span>
      }
      initialFocusRef={firstInputRef}
      isDismissDisabled={isSubmitting}
      isOpen={isOpen}
      onClose={onClose}
      title={
        isPreviewVisible
          ? `Prévia da versão ${draft.latestVersionName.trim() || "—"}`
          : isEditing
            ? `Versão ${version?.latest_version_name}`
            : "Publicar versão Android"
      }
    >
      {isPreviewVisible ? (
        <div className="mt-3">
          <AppUpdatePreview
            currentVersion={activeVersion}
            draft={draft}
            publishedAt={version?.updated_at}
          />

          <div className="-mx-4 -mb-4 mt-3 flex justify-end border-t border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/35">
            <Button
              autoFocus
              variant="secondary"
              onClick={() => setIsPreviewVisible(false)}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar ao formulário
            </Button>
          </div>
        </div>
      ) : (
      <form className="mt-4" onSubmit={handleSubmit} noValidate>
        {actionError && (
          <Alert className="mb-3" tone="error">
            {actionError}
          </Alert>
        )}

        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                Nome da versão
                <Input
                  ref={firstInputRef}
                  className="mt-1"
                  value={draft.latestVersionName}
                  placeholder={`Ex.: ${suggestedVersionName}`}
                  aria-invalid={Boolean(errors.latestVersionName)}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateDraft("latestVersionName", event.target.value)
                  }
                />
                {errors.latestVersionName && (
                  <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
                    {errors.latestVersionName}
                  </span>
                )}
              </label>

              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                Código da versão
                <Input
                  className="mt-1"
                  type="number"
                  min={1}
                  step={1}
                  value={draft.latestVersionCode}
                  placeholder={`Ex.: ${suggestedVersionCode}`}
                  aria-invalid={Boolean(errors.latestVersionCode)}
                  disabled={isSubmitting || isEditing}
                  onChange={(event) =>
                    updateDraft("latestVersionCode", event.target.value)
                  }
                />
                {errors.latestVersionCode && (
                  <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
                    {errors.latestVersionCode}
                  </span>
                )}
              </label>

              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                Código mínimo
                <Input
                  className="mt-1"
                  type="number"
                  min={0}
                  step={1}
                  value={draft.minRequiredVersionCode}
                  placeholder={`Ex.: ${suggestedMinimumCode}`}
                  aria-invalid={Boolean(errors.minRequiredVersionCode)}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateDraft("minRequiredVersionCode", event.target.value)
                  }
                />
                {errors.minRequiredVersionCode && (
                  <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
                    {errors.minRequiredVersionCode}
                  </span>
                )}
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-[0.85fr_1.15fr]">
              <div className="flex min-h-18 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">
                    Forçar atualização
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Bloqueia versões anteriores.
                  </p>
                </div>
                <Switch
                  checked={draft.forceUpdate}
                  disabled={isSubmitting}
                  label="Forçar atualização do aplicativo"
                  onCheckedChange={(checked) =>
                    updateDraft("forceUpdate", checked)
                  }
                />
              </div>

              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                URL da Play Store
                <Input
                  className="mt-1"
                  type="url"
                  value={draft.playStoreUrl}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  startIcon={<Link2 className="size-4" aria-hidden="true" />}
                  aria-invalid={Boolean(errors.playStoreUrl)}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateDraft("playStoreUrl", event.target.value)
                  }
                />
                {errors.playStoreUrl && (
                  <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
                    {errors.playStoreUrl}
                  </span>
                )}
              </label>
            </div>

            <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
              Mensagem da atualização
              <div className="relative mt-1">
                <MessageSquareText
                  className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <Textarea
                  className="h-24 min-h-24 max-h-24 pl-10"
                  value={draft.message}
                  maxLength={APP_VERSION_LIMITS.message}
                  placeholder="Descreva as melhorias desta versão."
                  aria-invalid={Boolean(errors.message)}
                  disabled={isSubmitting}
                  onChange={(event) => updateDraft("message", event.target.value)}
                />
              </div>
              <span className="mt-1 flex justify-between gap-3 text-xs">
                <span className="font-medium text-red-600 dark:text-red-400">
                  {errors.message}
                </span>
                <span className="ml-auto text-slate-500 dark:text-slate-400">
                  {draft.message.length}/{APP_VERSION_LIMITS.message}
                </span>
              </span>
            </label>
        </div>

        <div className="-mx-5 -mb-5 mt-4 flex flex-col-reverse gap-2.5 border-t border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/35 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            className="sm:mr-auto"
            disabled={isSubmitting}
            onClick={() => setIsPreviewVisible(true)}
          >
            <Eye className="size-4" aria-hidden="true" />
            Ver prévia
          </Button>
          <Button
            variant="secondary"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingLabel="Salvando..."
          >
            {isEditing ? "Salvar alterações" : "Publicar versão"}
          </Button>
        </div>
      </form>
      )}
    </Modal>
  );
}
