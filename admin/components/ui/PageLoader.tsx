import { LoaderCircle } from "lucide-react";

type PageLoaderProps = {
  label?: string;
};

export function PageLoader({ label = "Carregando..." }: PageLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <LoaderCircle className="size-5 animate-spin text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}
