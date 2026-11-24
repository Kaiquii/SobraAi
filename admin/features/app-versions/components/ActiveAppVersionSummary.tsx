import {
  AlertTriangle,
  ExternalLink,
  MessageSquareText,
  Smartphone,
} from "lucide-react";

import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import type { AndroidAppVersion } from "@/features/app-versions/types/appVersion";

type ActiveAppVersionSummaryProps = {
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
  version: AndroidAppVersion | null;
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function ActiveAppVersionSummary({
  error,
  isLoading,
  onRetry,
  version,
}: ActiveAppVersionSummaryProps) {
  return (
    <Card className="p-4 shadow-[0_8px_24px_rgb(15_23_42/0.05)] dark:shadow-[0_10px_28px_rgb(0_0_0/0.2)] sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          <Smartphone className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-slate-950 dark:text-white">
            Versão Android ativa
          </h2>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            Configuração entregue atualmente ao aplicativo
          </p>
        </div>
      </div>

      {isLoading && !version ? (
        <div
          className="mt-4 grid animate-pulse grid-cols-2 gap-3 motion-reduce:animate-none sm:grid-cols-4"
          aria-label="Carregando versão Android"
        >
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : error && !version ? (
        <Alert className="mt-4" tone="error">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              className="rounded-lg font-bold underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              onClick={onRetry}
            >
              Tentar novamente
            </button>
          </div>
        </Alert>
      ) : !version ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          Nenhuma versão Android foi cadastrada.
        </p>
      ) : (
        <>
          {error && <Alert className="mt-4" tone="error">{error}</Alert>}
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Versão
              </dt>
              <dd className="mt-1 font-bold text-slate-950 dark:text-white">
                {version.latest_version_name}
                <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  ({version.latest_version_code})
                </span>
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Código mínimo
              </dt>
              <dd className="mt-1 font-bold text-slate-950 dark:text-white">
                {version.min_required_version_code}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Atualização
              </dt>
              <dd
                className={
                  version.force_update
                    ? "mt-1 flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300"
                    : "mt-1 font-bold text-emerald-700 dark:text-emerald-300"
                }
              >
                {version.force_update && (
                  <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                )}
                {version.force_update ? "Obrigatória" : "Opcional"}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Última atualização
              </dt>
              <dd className="mt-1 font-bold text-slate-950 dark:text-white">
                {formatUpdatedAt(version.updated_at)}
              </dd>
            </div>
          </dl>

          <div className="mt-3 flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <MessageSquareText className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-950 dark:text-white">
                Descrição da atualização
              </p>
              <p
                className="mt-1 text-sm leading-5 text-slate-700 dark:text-slate-300"
                title={version.message}
              >
                {version.message || "Nenhuma mensagem configurada."}
              </p>
            </div>
            {version.play_store_url && (
              <a
                href={version.play_store_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-2.5 text-xs font-bold text-violet-700 outline-none hover:bg-violet-100 focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300 dark:hover:bg-violet-950"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Abrir na Play Store</span>
              </a>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
