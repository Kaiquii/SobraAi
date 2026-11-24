import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/ui/BrandMark";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_24px_70px_rgb(15_23_42/0.12)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_28px_80px_rgb(0_0_0/0.45)] sm:p-8">
        <BrandMark className="mx-auto w-fit" showSubtitle={false} />
        <span className="mx-auto mt-8 grid size-14 place-items-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          <SearchX className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
          Erro 404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          O endereço informado não existe ou não está disponível neste painel.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white outline-none hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:focus-visible:ring-offset-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar ao painel
        </Link>
      </section>
    </main>
  );
}
