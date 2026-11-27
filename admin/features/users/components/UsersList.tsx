import { ArrowDown, ArrowDownUp, ArrowUp, Camera, Clock3, Eye, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { UserActions } from "@/features/users/components/UserActions";
import {
  UserRoleBadge,
  UserStatusBadge,
} from "@/features/users/components/UserBadges";
import type {
  AdminUser,
  AdminUserAction,
} from "@/features/users/types/user";
import {
  formatUserBlockedAt,
  formatUserLastActiveAt,
} from "@/features/users/utils/userFormatters";
import { USER_SORT_COLUMNS, type UserSort } from "@/features/users/utils/userSort";
import { cn } from "@/lib/utils";

type UsersListProps = {
  appliedSort: UserSort;
  currentUserEmail: string;
  fillsPage?: boolean;
  isActionPending: boolean;
  isRefreshing?: boolean;
  onAction: (action: AdminUserAction, user: AdminUser) => void;
  onPreviewAvatar: (user: AdminUser) => void;
  onSortChange: (sort: UserSort) => void;
  onViewUser: (user: AdminUser) => void;
  sort: UserSort;
  users: AdminUser[];
};

function AvatarControl({
  compact = false,
  onPreview,
  user,
}: {
  compact?: boolean;
  onPreview: (user: AdminUser) => void;
  user: AdminUser;
}) {
  const avatarSource = user.avatar_url.trim();

  if (!avatarSource) {
    return <UserAvatar name={user.name} size={compact ? "compact" : "medium"} />;
  }

  return (
    <button
      type="button"
      className="group relative shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400"
      aria-label={`Visualizar foto de ${user.name}`}
      title="Visualizar foto"
      onClick={() => onPreview(user)}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <UserAvatar
        avatarUrl={avatarSource}
        name={user.name}
        size={compact ? "compact" : "medium"}
      />
      <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-slate-950/55 text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
        <Camera className="size-4" aria-hidden="true" />
      </span>
    </button>
  );
}

export function UsersList({
  appliedSort,
  currentUserEmail,
  fillsPage = false,
  isActionPending,
  isRefreshing = false,
  onAction,
  onPreviewAvatar,
  onSortChange,
  onViewUser,
  sort,
  users,
}: UsersListProps) {
  return (
    <>
      <Card
        aria-busy={isRefreshing}
        className="hidden h-full overflow-hidden rounded-xl shadow-[0_6px_20px_rgb(15_23_42/0.04)] dark:shadow-[0_8px_24px_rgb(0_0_0/0.18)] lg:block"
      >
        <div
          className={cn(
            "overflow-x-auto transition-opacity duration-150 motion-reduce:transition-none",
            fillsPage && "lg:h-full",
            isRefreshing && "opacity-60",
          )}
        >
          <table
            className={cn(
              "w-full border-collapse max-xl:table-fixed",
              fillsPage && "lg:h-full",
            )}
          >
            <colgroup>
              <col className="max-xl:w-1/4" />
              <col className="max-xl:w-[15%]" />
              <col className="max-xl:w-[11%]" />
              <col className="max-xl:w-[18%]" />
              <col className="max-xl:w-[14%]" />
              <col className="max-xl:w-[17%]" />
            </colgroup>
            <thead
              data-pagination-header
              className="bg-slate-100 dark:bg-slate-800"
            >
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {USER_SORT_COLUMNS.map(({ label, first, second, firstDirection }) => {
                  const secondDirection = firstDirection === "ascending" ? "descending" : "ascending";
                  const direction = appliedSort === first.value
                    ? firstDirection
                    : appliedSort === second.value ? secondDirection : undefined;
                  const SortIcon = direction === "ascending" ? ArrowUp
                    : direction === "descending" ? ArrowDown : ArrowDownUp;
                  const nextOption = sort === first.value ? second : first;

                  return (
                    <th
                      key={label}
                      scope="col"
                      aria-sort={direction}
                      className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
                    >
                      <button
                        type="button"
                        title={`Ordenar por ${nextOption.label}`}
                        aria-label={`${label}. Ordenar por ${nextOption.label}`}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-sm uppercase outline-none hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:text-white",
                          direction
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-500 dark:text-slate-400",
                        )}
                        onClick={() => onSortChange(nextOption.value)}
                      >
                        {label}
                        <SortIcon className="size-3 shrink-0" aria-hidden="true" />
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user) => (
                <tr
                  key={user.id}
                  tabIndex={0}
                  className="h-12 cursor-default bg-white outline-none hover:bg-slate-50 focus-visible:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 dark:bg-slate-900 dark:hover:bg-slate-800/55 dark:focus-visible:bg-emerald-950/50 lg:h-(--admin-table-row-height)"
                  aria-label={`Visualizar detalhes de ${user.name}`}
                  onDoubleClick={(event) => {
                    if (!(event.target as HTMLElement).closest("button")) {
                      onViewUser(user);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && event.target === event.currentTarget) {
                      onViewUser(user);
                    }
                  }}
                >
                  <td className="px-4 py-1.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <AvatarControl compact user={user} onPreview={onPreviewAvatar} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[13px] font-bold leading-tight text-slate-950 dark:text-white">
                            {user.name}
                          </p>
                          {user.email === currentUserEmail && (
                            <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-1.5">
                    <UserRoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-1.5">
                    <UserStatusBadge isBlocked={user.access_blocked} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <time dateTime={user.last_active_at}>
                      {formatUserLastActiveAt(user.last_active_at)}
                    </time>
                  </td>
                  <td className="px-4 py-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    {user.access_blocked
                      ? formatUserBlockedAt(user.access_blocked_at)
                      : "—"}
                  </td>
                  <td className="px-4 py-1.5 text-right">
                    <div className="flex justify-end">
                      <UserActions
                        compact
                        user={user}
                        disabled={isActionPending}
                        onAction={onAction}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div
        aria-busy={isRefreshing}
        className={cn(
          "grid gap-3 transition-opacity duration-150 motion-reduce:transition-none lg:hidden",
          isRefreshing && "opacity-60",
        )}
      >
        {users.map((user) => (
          <Card
            key={user.id}
            className={cn(
              "overflow-hidden border-l-4 p-3 shadow-[0_6px_18px_rgb(15_23_42/0.05)] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:shadow-[0_8px_22px_rgb(0_0_0/0.2)]",
              user.access_blocked
                ? "border-l-red-500"
                : "border-l-emerald-500",
            )}
            tabIndex={0}
            aria-label={`Visualizar detalhes de ${user.name}`}
            onDoubleClick={(event) => {
              if (!(event.target as HTMLElement).closest("button")) {
                onViewUser(user);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.target === event.currentTarget) {
                onViewUser(user);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <AvatarControl user={user} onPreview={onPreviewAvatar} />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                    {user.name}
                  </h2>
                  {user.email === currentUserEmail && (
                    <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Você
                    </span>
                  )}
                </div>
                <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <UserRoleBadge role={user.role} />
                  <UserStatusBadge isBlocked={user.access_blocked} />
                </div>
              </div>
              <button
                type="button"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label={`Visualizar detalhes de ${user.name}`}
                title="Visualizar usuário"
                onClick={() => onViewUser(user)}
              >
                <Eye className="size-4" aria-hidden="true" />
              </button>
            </div>

            {user.access_blocked && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Bloqueado em {formatUserBlockedAt(user.access_blocked_at)}
              </p>
            )}

            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              <span>
                Último uso: {formatUserLastActiveAt(user.last_active_at)}
              </span>
            </p>

            <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
              {user.role === "admin" ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Conta administrativa protegida
                </div>
              ) : (
                <UserActions
                  user={user}
                  disabled={isActionPending}
                  onAction={onAction}
                />
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
