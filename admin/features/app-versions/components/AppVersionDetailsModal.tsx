import {
  CalendarClock,
  ExternalLink,
  Eye,
  Hash,
  MessageSquareText,
  ShieldAlert,
  Smartphone,
} from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import type { AndroidAppVersion } from "@/features/app-versions/types/appVersion";
import { formatAppVersionDate } from "@/features/app-versions/utils/appVersionFormatters";

type AppVersionDetailsModalProps = {
  isActive: boolean;
  isOpen: boolean;
  onClose: () => void;
  onPreview: () => void;
  version: AndroidAppVersion;
};

export function AppVersionDetailsModal({
  isActive,
  isOpen,
  onClose,
  onPreview,
  version,
}: AppVersionDetailsModalProps) {
  const policyLabel = version.force_update ? "Obrigatória" : "Opcional";

  return (
    <Modal
      accent="sky"
      className="max-w-xl!"
      description="Configuração entregue ao aplicativo Android."
      eyebrow="Consulta de publicação"
      headerIcon={
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-900">
          <Smartphone className="size-5" aria-hidden="true" />
        </span>
      }
      isOpen={isOpen}
      onClose={onClose}
      title={`Versão ${version.latest_version_name}`}
    >
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative flex items-center gap-4 bg-slate-50 p-4 pl-5 dark:bg-slate-950/45">
          <span
            className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-violet-500 dark:bg-violet-400"
            aria-hidden="true"
          />
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-600 text-xl font-extrabold text-white shadow-sm dark:bg-violet-400 dark:text-slate-950">
            {version.latest_version_code}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                SobraAi {version.latest_version_name}
              </h3>
              {isActive && (
                <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white dark:bg-violet-400 dark:text-slate-950">
                  Ativa
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Publicação Android #{version.id}
            </p>
          </div>
        </div>

        <dl className="grid border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3 sm:divide-x sm:divide-slate-200 dark:sm:divide-slate-800">
          <div className="flex items-start gap-2.5 border-b border-slate-200 p-3.5 dark:border-slate-800 sm:border-b-0">
            <Hash className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-300" aria-hidden="true" />
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Código mínimo
              </dt>
              <dd className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                {version.min_required_version_code}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5 border-b border-slate-200 p-3.5 dark:border-slate-800 sm:border-b-0">
            <ShieldAlert
              className={
                version.force_update
                  ? "mt-0.5 size-4 shrink-0 text-[#FF6B6B]"
                  : "mt-0.5 size-4 shrink-0 text-[#1E88E5]"
              }
              aria-hidden="true"
            />
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Política
              </dt>
              <dd
                className={
                  version.force_update
                    ? "mt-1 text-sm font-bold text-[#FF6B6B]"
                    : "mt-1 text-sm font-bold text-[#1E88E5]"
                }
              >
                {policyLabel}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Atualizada em
              </dt>
              <dd className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {formatAppVersionDate(version.updated_at)}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/45">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <MessageSquareText className="size-4 text-violet-600 dark:text-violet-300" aria-hidden="true" />
          Mensagem da atualização
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
          {version.message || "Nenhuma mensagem configurada."}
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Eye className="size-4" aria-hidden="true" />
          Visualização somente para consulta
        </div>
        <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 px-3 text-xs font-bold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto sm:min-w-31"
            onClick={onPreview}
          >
            <Eye className="size-3.5" aria-hidden="true" />
            Ver prévia
          </button>
          <a
            href={version.play_store_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 px-3 text-xs font-bold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto sm:min-w-40"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Abrir na Play Store
          </a>
        </div>
      </div>
    </Modal>
  );
}
