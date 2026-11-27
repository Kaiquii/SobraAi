"use client";

import {
  Crown,
  ShieldCheck,
  ShieldMinus,
  Trash2,
  UserCheck,
  UserRoundCog,
  UserX,
  UsersRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";
import { LoadErrorState } from "@/components/ui/LoadErrorState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { Toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { UserDetailsModal } from "@/features/users/components/UserDetailsModal";
import { UsersList } from "@/features/users/components/UsersList";
import { UsersToolbar } from "@/features/users/components/UsersToolbar";
import { useUsersStore } from "@/features/users/store/useUsersStore";
import type {
  AdminUser,
  AdminUserAction,
} from "@/features/users/types/user";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useResponsivePageLimit } from "@/hooks/useResponsivePageLimit";
import { ADMIN_TABLE_ROW_HEIGHT } from "@/lib/pagination";

type SelectedAction = {
  action: AdminUserAction;
  user: AdminUser;
};

function getConfirmationCopy(selected: SelectedAction) {
  const { action, user } = selected;
  const userName = user.name.trim() || "este usuário";

  if (action === "delete") {
    return {
      confirmLabel: "Excluir permanentemente",
      description: `A conta de ${userName}, os dados financeiros vinculados e as conversas serão removidos. Esta ação é permanente e não pode ser desfeita.`,
      contextDetail: undefined,
      contextLabel: undefined,
      icon: Trash2,
      title: `Excluir ${userName}?`,
      tone: "danger" as const,
    };
  }

  if (action === "revoke") {
    return {
      confirmLabel: "Revogar acesso",
      description: `${userName} não poderá entrar nem acessar rotas protegidas até que o acesso seja liberado novamente.`,
      contextDetail: undefined,
      contextLabel: undefined,
      icon: ShieldMinus,
      title: `Revogar acesso de ${userName}?`,
      tone: "warning" as const,
    };
  }

  if (action === "promote-premium") {
    return {
      confirmLabel: "Promover para Premium",
      contextDetail:
        "O perfil ficará identificado como Premium e terá acesso a recursos exclusivos do SobraAi.",
      contextLabel: "A conta receberá o perfil Premium",
      description: `Promover ${userName} para Premium?`,
      eyebrow: "Gestão de perfil",
      icon: Crown,
      title: `Promover ${userName}?`,
      tone: "success" as const,
    };
  }

  if (action === "revoke-premium") {
    return {
      confirmLabel: "Remover Premium",
      contextDetail:
        "A conta voltará ao perfil comum e continuará com o mesmo status de acesso.",
      contextLabel: "O perfil Premium será removido",
      description: `Remover o perfil Premium de ${userName}?`,
      eyebrow: "Gestão de perfil",
      icon: Crown,
      title: `Remover Premium de ${userName}?`,
      tone: "warning" as const,
    };
  }

  return {
    confirmLabel: "Liberar acesso",
    description: `${userName} poderá entrar e voltar a utilizar as áreas protegidas do SobraAi.`,
    contextDetail: undefined,
    contextLabel: undefined,
    icon: ShieldCheck,
    title: `Liberar acesso de ${userName}?`,
    tone: "success" as const,
  };
}

function UsersListSkeleton() {
  return (
    <Card
      className="h-full overflow-hidden p-4 shadow-[0_8px_24px_rgb(15_23_42/0.05)] dark:shadow-[0_10px_28px_rgb(0_0_0/0.2)]"
      aria-label="Carregando lista de usuários"
    >
      <div className="space-y-3 animate-pulse motion-reduce:animate-none">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex h-16 items-center gap-3 rounded-xl bg-slate-100 px-3 dark:bg-slate-800"
          >
            <span className="size-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1">
              <div className="h-3.5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-3 w-56 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function UsersView() {
  const currentUser = useAuthStore((state) => state.user);
  const actionError = useUsersStore((state) => state.actionError);
  const appliedSort = useUsersStore((state) => state.appliedSort);
  const changeFilters = useUsersStore((state) => state.changeFilters);
  const changeLimit = useUsersStore((state) => state.changeLimit);
  const changePage = useUsersStore((state) => state.changePage);
  const changeSort = useUsersStore((state) => state.changeSort);
  const clearFeedback = useUsersStore((state) => state.clearFeedback);
  const deleteUser = useUsersStore((state) => state.deleteUser);
  const error = useUsersStore((state) => state.error);
  const filters = useUsersStore((state) => state.filters);
  const hasLoaded = useUsersStore((state) => state.hasLoaded);
  const hasLoadedMetrics = useUsersStore((state) => state.hasLoadedMetrics);
  const isLoading = useUsersStore((state) => state.isLoading);
  const isLoadingMetrics = useUsersStore((state) => state.isLoadingMetrics);
  const limit = useUsersStore((state) => state.limit);
  const loadUserMetrics = useUsersStore((state) => state.loadUserMetrics);
  const loadUsers = useUsersStore((state) => state.loadUsers);
  const metrics = useUsersStore((state) => state.metrics);
  const pendingAction = useUsersStore((state) => state.pendingAction);
  const pagination = useUsersStore((state) => state.pagination);
  const promotePremium = useUsersStore((state) => state.promotePremium);
  const restoreAccess = useUsersStore((state) => state.restoreAccess);
  const revokeAccess = useUsersStore((state) => state.revokeAccess);
  const revokePremium = useUsersStore((state) => state.revokePremium);
  const sort = useUsersStore((state) => state.sort);
  const successMessage = useUsersStore((state) => state.successMessage);
  const users = useUsersStore((state) => state.users);
  const [avatarPreview, setAvatarPreview] = useState<AdminUser | null>(null);
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const debouncedSearch = useDebouncedValue(searchInput);

  useResponsivePageLimit({
    containerRef: sectionRef,
    currentLimit: limit,
    isLayoutReady: hasLoaded && hasLoadedMetrics,
    onLimitChange: changeLimit,
    rowHeight: ADMIN_TABLE_ROW_HEIGHT,
  });

  useEffect(() => {
    void Promise.all([loadUsers(), loadUserMetrics()]);

    return clearFeedback;
  }, [clearFeedback, loadUserMetrics, loadUsers]);

  useEffect(() => {
    const search = debouncedSearch.trim();
    if (search === filters.search) return;
    changeFilters({ ...filters, search });
  }, [changeFilters, debouncedSearch, filters]);

  const confirmation = selectedAction
    ? getConfirmationCopy(selectedAction)
    : null;
  const isInitialLoading = !hasLoaded && isLoading;
  const isMetricsLoading = !hasLoadedMetrics || isLoadingMetrics;
  const hasStaleUsers = Boolean(error && users.length > 0);

  function refreshUsers() {
    clearFeedback();
    void Promise.all([loadUsers(), loadUserMetrics()]);
  }

  async function confirmAction() {
    if (!selectedAction) return;

    const { action, user } = selectedAction;
    const succeeded =
      action === "delete"
        ? await deleteUser(user.id)
        : action === "revoke"
          ? await revokeAccess(user.id)
          : action === "restore"
            ? await restoreAccess(user.id)
            : action === "promote-premium"
              ? await promotePremium(user.id)
              : await revokePremium(user.id);

    if (succeeded) setSelectedAction(null);
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="users-title"
      className="space-y-3 lg:flex lg:h-[calc(100dvh-5rem)] lg:flex-col lg:gap-3 lg:space-y-0"
    >
      <h1 id="users-title" className="sr-only">
        Gestão de usuários
      </h1>

      <div
        className="grid grid-cols-2 gap-3 lg:grid-cols-5"
        aria-label="Indicadores de usuários"
      >
        <MetricCard
          className="col-span-2 lg:col-span-1"
          compact
          description="Contas cadastradas"
          icon={UsersRound}
          isLoading={isMetricsLoading}
          label="Total"
          tone="blue"
          value={metrics?.total ?? "—"}
        />
        <MetricCard
          compact
          description="Acesso liberado"
          icon={UserCheck}
          isLoading={isMetricsLoading}
          label="Ativos"
          tone="emerald"
          value={metrics?.active ?? "—"}
        />
        <MetricCard
          compact
          description="Acesso revogado"
          icon={UserX}
          isLoading={isMetricsLoading}
          label="Bloqueados"
          tone="amber"
          value={metrics?.blocked ?? "—"}
        />
        <MetricCard
          compact
          description="Contas administrativas"
          icon={UserRoundCog}
          isLoading={isMetricsLoading}
          label="Administradores"
          tone="violet"
          value={metrics?.admins ?? "—"}
        />
        <MetricCard
          compact
          description="Contas com perfil Premium"
          icon={Crown}
          isLoading={isMetricsLoading}
          label="Premium"
          tone="amber"
          value={metrics?.premium ?? "—"}
        />
      </div>

      <Toast
        isOpen={Boolean(successMessage)}
        message={successMessage ?? ""}
        tone="success"
        onClose={clearFeedback}
      />

      <Toast
        isOpen={Boolean(actionError)}
        message={actionError ?? ""}
        tone="error"
        onClose={clearFeedback}
      />

      {hasStaleUsers && (
        <Alert tone="error" className="lg:hidden">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <span>{error} Os dados exibidos podem estar desatualizados.</span>
            <Button variant="secondary" onClick={refreshUsers}>
              Tentar novamente
            </Button>
          </div>
        </Alert>
      )}

      <UsersToolbar
        hasActiveFilters={Boolean(
          filters.search || filters.role !== "all" || filters.status !== "all",
        )}
        isLoading={isLoading}
        itemsOnPage={users.length}
        resultCount={pagination?.total ?? users.length}
        search={searchInput}
        role={filters.role}
        sort={sort}
        status={filters.status}
        onSearchChange={setSearchInput}
        onSortChange={changeSort}
        onRoleChange={(role) => changeFilters({ ...filters, role })}
        onStatusChange={(status) => changeFilters({ ...filters, status })}
      />

      <div
        data-pagination-capacity
        className="lg:min-h-0 lg:flex-1"
      >
        {error && users.length === 0 ? (
          <LoadErrorState
            className="h-full"
            title="Não foi possível carregar os usuários"
            description="Verifique sua conexão e tente novamente para acessar a lista."
            isRetrying={isLoading}
            onRetry={refreshUsers}
          />
        ) : isInitialLoading ? (
          <UsersListSkeleton />
        ) : users.length === 0 ? (
          <Card className="grid h-full min-h-56 place-items-center p-6 text-center shadow-[0_8px_24px_rgb(15_23_42/0.05)] dark:shadow-[0_10px_28px_rgb(0_0_0/0.2)]">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <UsersRound className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-bold text-slate-950 dark:text-white">
                {filters.search || filters.role !== "all" || filters.status !== "all"
                  ? "Nenhum usuário encontrado"
                  : "Nenhum usuário cadastrado"}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {filters.search || filters.role !== "all" || filters.status !== "all"
                  ? "Ajuste a busca ou os filtros para ver outros resultados."
                  : "As contas aparecerão aqui quando forem cadastradas."}
              </p>
            </div>
          </Card>
        ) : (
          <UsersList
            appliedSort={appliedSort}
            users={users}
            sort={sort}
            currentUserEmail={currentUser?.email ?? ""}
            fillsPage={users.length === limit}
            isActionPending={Boolean(pendingAction) || isLoading}
            isRefreshing={hasLoaded && isLoading}
            onAction={(action, user) => setSelectedAction({ action, user })}
            onPreviewAvatar={setAvatarPreview}
            onSortChange={changeSort}
            onViewUser={setDetailsUser}
          />
        )}
      </div>

      <div className="contents lg:block lg:h-13 lg:shrink-0">
        {hasStaleUsers ? (
          <Alert tone="error" className="hidden h-full items-center py-1.5 lg:flex">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate" title={error ?? undefined}>
                {error}
              </span>
              <Button variant="secondary" className="h-9 min-h-9 shrink-0" onClick={refreshUsers}>
                Tentar novamente
              </Button>
            </div>
          </Alert>
        ) : isInitialLoading ? (
          <Card
            aria-hidden="true"
            className="hidden h-full animate-pulse rounded-xl bg-slate-200/70 motion-reduce:animate-none dark:bg-slate-800/70 lg:block"
          />
        ) : pagination && users.length > 0 ? (
          <Card className="overflow-hidden rounded-xl p-0 shadow-[0_6px_20px_rgb(15_23_42/0.04)] dark:shadow-[0_8px_24px_rgb(0_0_0/0.18)]">
            <PaginationControls
              className="border-t-0"
              isLoading={isLoading}
              itemLabel={pagination.total === 1 ? "usuário" : "usuários"}
              itemsOnPage={users.length}
              pagination={pagination}
              onPageChange={changePage}
            />
          </Card>
        ) : null}
      </div>

      {confirmation && selectedAction && (
        <ConfirmationModal
          isOpen
          title={confirmation.title}
          description={confirmation.description}
          confirmLabel={confirmation.confirmLabel}
          icon={confirmation.icon}
          tone={confirmation.tone}
          eyebrow={confirmation.eyebrow}
          contextLabel={confirmation.contextLabel}
          contextDetail={confirmation.contextDetail}
          isConfirming={Boolean(pendingAction)}
          onClose={() => setSelectedAction(null)}
          onConfirm={confirmAction}
        />
      )}

      {avatarPreview?.avatar_url && (
        <ImagePreviewModal
          isOpen
          src={avatarPreview.avatar_url}
          alt={`Foto de perfil de ${avatarPreview.name}`}
          title={`Foto de ${avatarPreview.name}`}
          onClose={() => setAvatarPreview(null)}
        />
      )}

      {detailsUser && (
        <UserDetailsModal
          isOpen
          user={detailsUser}
          onClose={() => setDetailsUser(null)}
        />
      )}
    </section>
  );
}
