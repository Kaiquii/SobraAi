"use client";

import {
  Crown,
  ShieldCheck,
  Smartphone,
  UserCheck,
  UserRoundCog,
  UserX,
  UsersRound,
} from "lucide-react";
import { useEffect } from "react";

import { Alert } from "@/components/ui/Alert";
import { MetricCard } from "@/components/ui/MetricCard";
import { ActiveAppVersionSummary } from "@/features/app-versions/components/ActiveAppVersionSummary";
import { useAppVersionsStore } from "@/features/app-versions/store/useAppVersionsStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { QuickAccessCard } from "@/features/home/components/QuickAccessCard";
import { useUsersStore } from "@/features/users/store/useUsersStore";

export function HomeView() {
  const user = useAuthStore((state) => state.user);
  const activeVersion = useAppVersionsStore((state) => state.activeVersion);
  const appVersionError = useAppVersionsStore((state) => state.error);
  const hasLoadedAppVersion = useAppVersionsStore((state) => state.hasLoaded);
  const isLoadingAppVersion = useAppVersionsStore((state) => state.isLoading);
  const loadActiveVersion = useAppVersionsStore((state) => state.loadActiveVersion);
  const hasLoadedUsers = useUsersStore((state) => state.hasLoadedMetrics);
  const isLoadingUsers = useUsersStore((state) => state.isLoadingMetrics);
  const loadUserMetrics = useUsersStore((state) => state.loadUserMetrics);
  const userMetrics = useUsersStore((state) => state.metrics);
  const usersError = useUsersStore((state) => state.error);
  const firstName = user?.name.trim().split(/\s+/)[0] ?? "administrador";
  useEffect(() => {
    void Promise.all([loadUserMetrics(), loadActiveVersion()]);
  }, [loadActiveVersion, loadUserMetrics]);

  function refreshData() {
    void Promise.all([loadUserMetrics(), loadActiveVersion()]);
  }

  return (
    <section
      aria-labelledby="home-title"
      className="space-y-3"
    >
      <div className="flex min-h-10 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 sm:flex sm:items-baseline sm:gap-3">
          <h1
            id="home-title"
            className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white"
          >
            Olá, {firstName}!
          </h1>
          <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400 sm:mt-0">
            Visão geral · Resumo operacional do SobraAi
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-3 lg:grid-cols-5"
        aria-label="Indicadores de usuários"
      >
        <MetricCard
          className="col-span-2 lg:col-span-1"
          description="Contas cadastradas"
          icon={UsersRound}
          isLoading={!hasLoadedUsers || isLoadingUsers}
          label="Usuários"
          tone="blue"
          value={userMetrics?.total ?? "—"}
        />
        <MetricCard
          description="Acesso liberado"
          icon={UserCheck}
          isLoading={!hasLoadedUsers || isLoadingUsers}
          label="Ativos"
          tone="emerald"
          value={userMetrics?.active ?? "—"}
        />
        <MetricCard
          description="Acesso revogado"
          icon={UserX}
          isLoading={!hasLoadedUsers || isLoadingUsers}
          label="Bloqueados"
          tone="amber"
          value={userMetrics?.blocked ?? "—"}
        />
        <MetricCard
          description="Contas administrativas"
          icon={UserRoundCog}
          isLoading={!hasLoadedUsers || isLoadingUsers}
          label="Administradores"
          tone="violet"
          value={userMetrics?.admins ?? "—"}
        />
        <MetricCard
          description="Contas com perfil Premium"
          icon={Crown}
          isLoading={!hasLoadedUsers || isLoadingUsers}
          label="Premium"
          tone="amber"
          value={userMetrics?.premium ?? "—"}
        />
      </div>

      {usersError && (
        <Alert tone="error">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{usersError}</span>
            <button
              type="button"
              className="rounded-lg font-bold underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              onClick={refreshData}
            >
              Tentar novamente
            </button>
          </div>
        </Alert>
      )}

      <ActiveAppVersionSummary
        error={appVersionError}
        isLoading={!hasLoadedAppVersion || isLoadingAppVersion}
        onRetry={refreshData}
        version={activeVersion}
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Acesso rápido
          </h2>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <QuickAccessCard
          eyebrow="Contas e permissões"
          href="/usuarios"
          icon={UsersRound}
          label="Gestão de usuários"
          description="Consulte contas e administre bloqueios e liberações de acesso."
          status="Disponível"
          tone="blue"
        />
        <QuickAccessCard
          eyebrow="Aplicativo Android"
          href="/versoes-aplicativo"
          icon={Smartphone}
          label="Versões do aplicativo"
          description="Gerencie atualizações, versões mínimas e avisos do aplicativo Android."
          status="Disponível"
          tone="violet"
        />
      </div>
    </section>
  );
}
