import {
  AlertTriangle,
  ExternalLink,
  MessageSquareText,
  Plus,
  Smartphone,
} from "lucide-react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AndroidAppVersion } from "@/features/app-versions/types/appVersion";
import { formatAppVersionDate } from "@/features/app-versions/utils/appVersionFormatters";

type ActiveVersionPanelProps = {
  error: string | null;
  isLoading: boolean;
  onNewVersion: () => void;
  onRetry: () => void;
  version: AndroidAppVersion | null;
};

export function ActiveVersionPanel({
  error,
  isLoading,
  onNewVersion,
  onRetry,
  version,
}: ActiveVersionPanelProps) {
  if (isLoading && !version) {
    return (
      <Card
        className="h-28 animate-pulse bg-slate-50 motion-reduce:animate-none dark:bg-slate-900"
        aria-label="Carregando versão ativa"
      />
    );
  }

  if (error && !version) {
    return (
      <Alert tone="error">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="secondary" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      </Alert>
    );
  }

  if (!version) {
    return (
      <Card className="flex min-h-40 flex-col items-start justify-between gap-5 border-dashed p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            <Smartphone className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold text-slate-950 dark:text-white">
              Nenhuma versão publicada
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Cadastre a primeira configuração entregue ao aplicativo Android.
            </p>
          </div>
        </div>
        <Button onClick={onNewVersion}>
          <Plus className="size-4" aria-hidden="true" />
          Nova versão
        </Button>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden p-3 sm:px-4 sm:py-3">
      <span
        className="absolute inset-y-0 left-0 w-1 bg-violet-500 dark:bg-violet-400"
        aria-hidden="true"
      />

      {error && <Alert className="mb-3" tone="error">{error}</Alert>}

      <div className="grid gap-3 lg:grid-cols-[minmax(15rem,1.15fr)_minmax(5rem,0.35fr)_minmax(6.5rem,0.45fr)_minmax(16rem,1.4fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            <Smartphone className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
              Versão ativa no Android
            </p>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                {version.latest_version_name}
              </h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Código {version.latest_version_code}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Atualizada em {formatAppVersionDate(version.updated_at)}
            </p>
          </div>
        </div>

        <div className="min-w-0 lg:border-l lg:border-slate-200 lg:pl-3 dark:lg:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Código mínimo
          </p>
          <p className="mt-0.5 text-sm font-bold text-slate-950 dark:text-white">
            {version.min_required_version_code}
          </p>
        </div>

        <div className="min-w-0 lg:border-l lg:border-slate-200 lg:pl-3 dark:lg:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Política
          </p>
          <p
            className={
              version.force_update
                ? "mt-0.5 flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-300"
                : "mt-0.5 text-sm font-bold text-emerald-700 dark:text-emerald-300"
            }
          >
            {version.force_update && (
              <AlertTriangle className="size-4" aria-hidden="true" />
            )}
            {version.force_update ? "Obrigatória" : "Opcional"}
          </p>
        </div>

        <div className="flex min-w-0 items-center gap-2.5 lg:border-l lg:border-slate-200 lg:pl-3 dark:lg:border-slate-800">
          <MessageSquareText
            className="size-4 shrink-0 text-violet-600 dark:text-violet-300"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Mensagem da atualização
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-700 dark:text-slate-300">
              {version.message || "Nenhuma mensagem configurada."}
            </p>
          </div>
          <a
            href={version.play_store_url}
            target="_blank"
            rel="noreferrer"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-violet-700 outline-none hover:bg-violet-100 focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300 dark:hover:bg-violet-950"
            aria-label="Abrir versão na Play Store"
            title="Abrir na Play Store"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>

        <Button className="min-h-9! self-start px-3 lg:self-auto" onClick={onNewVersion}>
          <Plus className="size-4" aria-hidden="true" />
          Nova versão
        </Button>
      </div>
    </Card>
  );
}
