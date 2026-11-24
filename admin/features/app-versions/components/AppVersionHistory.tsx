import { AlertTriangle, CheckCircle2, Pencil, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { AppVersionsToolbar } from "@/features/app-versions/components/AppVersionsToolbar";
import type {
  AndroidAppVersion,
  AppVersionPolicyFilter,
} from "@/features/app-versions/types/appVersion";
import { formatAppVersionDate } from "@/features/app-versions/utils/appVersionFormatters";
import type { Pagination } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type AppVersionHistoryProps = {
  activeVersionCode: number | null;
  isLoading: boolean;
  onEdit: (version: AndroidAppVersion) => void;
  onPageChange: (page: number) => void;
  onPolicyChange: (value: AppVersionPolicyFilter) => void;
  onSearchChange: (value: string) => void;
  onView: (version: AndroidAppVersion) => void;
  pagination: Pagination | null;
  policy: AppVersionPolicyFilter;
  search: string;
  total: number;
  versions: AndroidAppVersion[];
};

function VersionPolicy({ version }: { version: AndroidAppVersion }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
        version.force_update
          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      )}
    >
      {version.force_update ? (
        <AlertTriangle className="size-3" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="size-3" aria-hidden="true" />
      )}
      {version.force_update ? "Obrigatória" : "Opcional"}
    </span>
  );
}

function EditButton({
  onEdit,
  version,
}: {
  onEdit: (version: AndroidAppVersion) => void;
  version: AndroidAppVersion;
}) {
  return (
    <Button
      variant="compactIcon"
      aria-label={`Editar versão ${version.latest_version_name}`}
      title="Editar versão"
      onClick={() => onEdit(version)}
    >
      <Pencil className="size-4" aria-hidden="true" />
    </Button>
  );
}

export function AppVersionHistory({
  activeVersionCode,
  isLoading,
  onEdit,
  onPageChange,
  onPolicyChange,
  onSearchChange,
  onView,
  pagination,
  policy,
  search,
  total,
  versions,
}: AppVersionHistoryProps) {
  const resultCount = pagination?.total ?? versions.length;
  const hasActiveFilters = Boolean(search || policy !== "all");

  return (
    <Card
      aria-busy={isLoading}
      className="overflow-hidden shadow-[0_8px_24px_rgb(15_23_42/0.05)] dark:shadow-[0_10px_28px_rgb(0_0_0/0.2)] lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
    >
      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-700 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            <Smartphone className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">
              Histórico de versões
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {total} {total === 1 ? "versão registrada" : "versões registradas"}
              {hasActiveFilters
                ? ` · ${resultCount} ${resultCount === 1 ? "resultado" : "resultados"}`
                : ""}
            </p>
          </div>
        </div>

        <AppVersionsToolbar
          policy={policy}
          search={search}
          onPolicyChange={onPolicyChange}
          onSearchChange={onSearchChange}
        />
      </div>

      <div
        data-pagination-capacity
        className="lg:min-h-0 lg:flex-1"
      >
        {isLoading && versions.length === 0 ? (
          <div
            className="h-full space-y-2 p-4 animate-pulse motion-reduce:animate-none"
            aria-label="Carregando histórico de versões"
          >
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-13 rounded-xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : versions.length === 0 ? (
        <div className="grid h-full min-h-44 place-items-center p-6 text-center">
          <div>
            <p className="font-bold text-slate-950 dark:text-white">
              {hasActiveFilters
                ? "Nenhuma versão encontrada"
                : "Nenhuma versão no histórico"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {hasActiveFilters
                ? "Ajuste a busca ou o filtro para ver outros resultados."
                : "As versões publicadas aparecerão aqui."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "hidden overflow-x-auto md:block lg:h-full",
              isLoading && "opacity-60",
            )}
          >
            <table
              className={cn(
                "w-full border-collapse text-left",
                pagination && versions.length === pagination.limit && "lg:h-full",
              )}
            >
              <thead
                data-pagination-header
                className="bg-slate-100/80 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/80 dark:text-slate-400"
              >
                <tr>
                  <th className="px-4 py-2.5">Versão</th>
                  <th className="px-4 py-2.5">Código mínimo</th>
                  <th className="px-4 py-2.5">Política</th>
                  <th className="px-4 py-2.5">Mensagem</th>
                  <th className="px-4 py-2.5">Atualizada em</th>
                  <th className="px-4 py-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {versions.map((version) => {
                  const isActive =
                    version.latest_version_code === activeVersionCode;

                  return (
                    <tr
                      key={version.id}
                      tabIndex={0}
                      aria-label={`Visualizar detalhes da versão ${version.latest_version_name}`}
                      title="Clique duas vezes para visualizar"
                      onDoubleClick={(event) => {
                        if (!(event.target as HTMLElement).closest("button, a")) {
                          onView(version);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && event.target === event.currentTarget) {
                          onView(version);
                        }
                      }}
                      className={cn(
                        "h-12 text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 lg:h-(--admin-table-row-height)",
                        isActive
                          ? "bg-violet-50/70 hover:bg-violet-100/70 dark:bg-violet-950/20 dark:hover:bg-violet-950/35"
                          : "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/55",
                      )}
                    >
                      <td className="px-4 py-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-100 text-xs font-extrabold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            {version.latest_version_code}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-950 dark:text-white">
                                {version.latest_version_name}
                              </span>
                              {isActive && (
                                <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white dark:bg-violet-400 dark:text-slate-950">
                                  Ativa
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        {version.min_required_version_code}
                      </td>
                      <td className="px-4 py-1.5">
                        <VersionPolicy version={version} />
                      </td>
                      <td className="max-w-96 px-4 py-1.5">
                        <p
                          className="truncate text-slate-600 dark:text-slate-400"
                          title={version.message || "Sem mensagem"}
                        >
                          {version.message || "Sem mensagem"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {formatAppVersionDate(version.updated_at)}
                      </td>
                      <td className="px-4 py-1.5 text-right">
                        <EditButton version={version} onEdit={onEdit} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            className={cn(
              "space-y-3 p-3 md:hidden",
              isLoading && "opacity-60",
            )}
          >
            {versions.map((version) => {
              const isActive =
                version.latest_version_code === activeVersionCode;

              return (
                <article
                  key={version.id}
                  tabIndex={0}
                  aria-label={`Visualizar detalhes da versão ${version.latest_version_name}`}
                  title="Toque duas vezes para visualizar"
                  onDoubleClick={(event) => {
                    if (!(event.target as HTMLElement).closest("button, a")) {
                      onView(version);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && event.target === event.currentTarget) {
                      onView(version);
                    }
                  }}
                  className={cn(
                    "rounded-2xl border p-3.5 outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                    isActive
                      ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/25"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-100 text-xs font-extrabold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                      {version.latest_version_code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-950 dark:text-white">
                          Versão {version.latest_version_name}
                        </h3>
                        {isActive && (
                          <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white dark:bg-violet-400 dark:text-slate-950">
                            Ativa
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Mínimo {version.min_required_version_code} · {formatAppVersionDate(version.updated_at)}
                      </p>
                    </div>
                    <EditButton version={version} onEdit={onEdit} />
                  </div>

                  <div className="mt-3">
                    <VersionPolicy version={version} />
                    <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-400">
                      {version.message || "Sem mensagem configurada."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

        </>
        )}
      </div>

      {isLoading && versions.length === 0 ? (
        <div
          aria-hidden="true"
          className="hidden h-13 shrink-0 border-t border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/45 lg:block"
        />
      ) : pagination && versions.length > 0 ? (
        <PaginationControls
          isLoading={isLoading}
          itemLabel={pagination.total === 1 ? "versão" : "versões"}
          itemsOnPage={versions.length}
          pagination={pagination}
          onPageChange={onPageChange}
        />
      ) : null}
    </Card>
  );
}
