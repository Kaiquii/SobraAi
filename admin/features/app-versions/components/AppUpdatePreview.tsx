import { Download } from "lucide-react";

import type { AndroidAppVersion } from "@/features/app-versions/types/appVersion";
import type { AppVersionDraft } from "@/features/app-versions/utils/appVersionValidation";

type AppUpdatePreviewProps = {
  currentVersion: AndroidAppVersion | null;
  draft: AppVersionDraft;
  publishedAt?: string;
};

function formatPreviewDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function PreviewInfoRow({
  label,
  value,
  valueClassName = "text-slate-950 dark:text-slate-50",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-right font-semibold ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

export function AppUpdatePreview({
  currentVersion,
  draft,
  publishedAt,
}: AppUpdatePreviewProps) {
  const isRequired = draft.forceUpdate;
  const accentClassName = isRequired
    ? "text-[#FF6B6B]"
    : "text-[#1E88E5]";
  const accentBackgroundClassName = isRequired
    ? "bg-[#FF6B6B]"
    : "bg-[#1E88E5]";
  const accentSoftClassName = isRequired
    ? "bg-[#FF6B6B]/14 text-[#FF6B6B]"
    : "bg-[#1E88E5]/14 text-[#1E88E5]";
  const latestVersionName = draft.latestVersionName.trim() || "—";
  const latestVersionCode = draft.latestVersionCode.trim() || "—";
  const installedVersionName = currentVersion?.latest_version_name ?? "—";
  const installedVersionCode = currentVersion?.latest_version_code ?? "—";
  const dateLabel = formatPreviewDate(publishedAt);

  return (
    <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-950/70 sm:p-4">
      <div className="mx-auto max-w-sm rounded-[28px] bg-white px-5 py-4 shadow-[0_22px_60px_rgb(15_23_42/0.2)] dark:bg-slate-950 dark:shadow-[0_24px_70px_rgb(0_0_0/0.6)]">
        <span className={`mx-auto grid size-11 place-items-center rounded-full ${accentSoftClassName}`}>
          <Download className="size-6" aria-hidden="true" />
        </span>
        <h3 className="mt-2 text-center text-lg font-bold text-slate-950 dark:text-white">
          {isRequired
            ? "Atualização obrigatória"
            : "Nova versão disponível"}
        </h3>
        <p className={`mt-1 text-center text-sm font-semibold ${accentClassName}`}>
          v{installedVersionName} → v{latestVersionName}
        </p>

        <div className="mt-4 space-y-2.5">
          <PreviewInfoRow
            label="Tipo"
            value={isRequired ? "Obrigatória" : "Opcional"}
            valueClassName={accentClassName}
          />
          <PreviewInfoRow
            label="Versão atual"
            value={`v${installedVersionName} (${installedVersionCode})`}
          />
          <PreviewInfoRow
            label="Nova versão"
            value={`v${latestVersionName} (${latestVersionCode})`}
          />
          {dateLabel && (
            <PreviewInfoRow label="Publicada em" value={dateLabel} />
          )}

          <div className="rounded-2xl bg-slate-100 px-3 py-2.5 dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              O que mudou
            </p>
            <p className="mt-1 max-h-28 overflow-y-auto whitespace-pre-wrap text-sm leading-5 text-slate-700 dark:text-slate-300">
              {draft.message.trim() ||
                "Atualize o SobraAi para aproveitar as melhorias mais recentes."}
            </p>
          </div>

          {isRequired && (
            <p className={`text-xs font-semibold leading-4 ${accentClassName}`}>
              Para continuar usando o app, atualize para a versão mais recente.
            </p>
          )}
        </div>

        {isRequired ? (
          <div className={`mt-4 rounded-[18px] px-4 py-2 text-center text-sm font-bold text-white dark:text-black ${accentBackgroundClassName}`}>
            Atualizar agora
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-[18px] border border-[#1E88E5] px-3 py-2 text-center text-sm font-bold text-[#1E88E5]">
              Agora não
            </div>
            <div className="rounded-[18px] bg-[#1E88E5] px-3 py-2 text-center text-sm font-bold text-white dark:text-black">
              Atualizar
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
