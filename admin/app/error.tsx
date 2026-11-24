"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  return (
    <main className="grid min-h-[calc(100dvh-5.5rem)] place-items-center px-4 py-8">
      <section
        role="alert"
        className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-6 text-center shadow-[0_22px_60px_rgb(15_23_42/0.12)] dark:border-red-900 dark:bg-slate-900 dark:shadow-[0_24px_70px_rgb(0_0_0/0.4)] sm:p-8"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
          Não foi possível exibir esta página
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          O painel encontrou uma falha inesperada. Tente carregar o conteúdo novamente.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
            Referência: {error.digest}
          </p>
        )}
        <Button className="mt-6" onClick={unstable_retry}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Tentar novamente
        </Button>
      </section>
    </main>
  );
}
