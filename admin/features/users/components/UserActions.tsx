import { Crown, ShieldCheck, ShieldMinus, Trash2 } from "lucide-react";

import type { AdminUser, AdminUserAction } from "@/features/users/types/user";
import { cn } from "@/lib/utils";

type UserActionsProps = {
  compact?: boolean;
  disabled?: boolean;
  onAction: (action: AdminUserAction, user: AdminUser) => void;
  user: AdminUser;
};

const baseClassName =
  "inline-flex shrink-0 items-center justify-center rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900";

export function UserActions({
  compact = false,
  disabled = false,
  onAction,
  user,
}: UserActionsProps) {
  if (user.role === "admin") {
    return (
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Conta protegida
      </span>
    );
  }

  const isPremium = user.role === "premium";
  const premiumLabel = isPremium ? "Remover Premium" : "Promover para Premium";

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-1.5"
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={cn(
          baseClassName,
          compact ? "size-9" : "min-h-10 px-3 text-sm font-semibold",
          isPremium
            ? "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 focus-visible:ring-rose-500 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900"
            : "border-violet-200 bg-violet-100 text-violet-700 hover:bg-violet-200 focus-visible:ring-violet-500 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300 dark:hover:bg-violet-900",
        )}
        aria-label={`${premiumLabel}: ${user.name}`}
        title={premiumLabel}
        disabled={disabled}
        onClick={() => onAction(isPremium ? "revoke-premium" : "promote-premium", user)}
      >
        <Crown className="size-4" aria-hidden="true" />
        {!compact && <span className="ml-1.5">{premiumLabel}</span>}
      </button>

      <button
        type="button"
        className={cn(
          baseClassName,
          compact ? "size-9" : "size-10",
          user.access_blocked
            ? "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
            : "border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200 focus-visible:ring-amber-500 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900",
        )}
        aria-label={`${user.access_blocked ? "Liberar" : "Revogar"} acesso de ${user.name}`}
        title={user.access_blocked ? "Liberar acesso" : "Revogar acesso"}
        disabled={disabled}
        onClick={() => onAction(user.access_blocked ? "restore" : "revoke", user)}
      >
        {user.access_blocked ? (
          <ShieldCheck className="size-4" aria-hidden="true" />
        ) : (
          <ShieldMinus className="size-4" aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        className={cn(
          baseClassName,
          compact ? "size-9" : "size-10",
          "border-slate-200 bg-slate-100 text-slate-600 hover:border-red-200 hover:bg-red-100 hover:text-red-700 focus-visible:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-300",
        )}
        aria-label={`Excluir ${user.name}`}
        title="Excluir usuário"
        disabled={disabled}
        onClick={() => onAction("delete", user)}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
