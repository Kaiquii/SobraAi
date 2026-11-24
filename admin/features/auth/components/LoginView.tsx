import { MonitorCog, ShieldCheck, UsersRound } from "lucide-react";

import { BrandMark } from "@/components/ui/BrandMark";
import { Card } from "@/components/ui/Card";
import { InfoCard } from "@/components/ui/InfoCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginView() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-4 dark:bg-slate-950 sm:px-6 sm:py-8 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto grid w-full max-w-295 items-center gap-6 lg:h-full lg:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.95fr)]">
        <section className="auth-grid flex flex-col rounded-[28px] border border-slate-200 p-6 shadow-[0_22px_60px_rgb(15_23_42/0.08)] dark:border-slate-700 dark:shadow-[0_22px_60px_rgb(0_0_0/0.3)] sm:p-8 lg:h-[min(760px,calc(100vh-4rem))] lg:p-10">
          <header className="flex items-start justify-between gap-4">
            <BrandMark />
            <ThemeToggle />
          </header>

          <div className="my-auto max-w-2xl py-12 sm:py-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Controle seguro
            </div>
            <h1 className="mt-5 max-w-162.5 text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-[58px]">
              Gerencie o SobraAi com segurança.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              Acompanhe usuários, controle acessos e publique versões do aplicativo
              em um único painel administrativo.
            </p>
          </div>

          <div className="hidden gap-4 sm:grid sm:grid-cols-2">
            <InfoCard
              icon={UsersRound}
              title="Usuários e acessos"
              description="Consulte contas e gerencie permissões com clareza."
              tone="blue"
            />
            <InfoCard
              icon={MonitorCog}
              title="Versões do aplicativo"
              description="Mantenha as atualizações do Android sob controle."
            />
          </div>
        </section>

        <section className="flex items-center justify-center lg:px-1">
          <Card className="w-full max-w-md p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              Área administrativa
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Entrar
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Use seu e-mail e senha de administrador para acessar o painel.
            </p>
            <LoginForm />
          </Card>
        </section>
      </div>
    </main>
  );
}
