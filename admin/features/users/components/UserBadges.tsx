import { Crown } from "lucide-react";

import type { UserRole } from "@/features/auth/types/auth";

type UserRoleBadgeProps = {
  role: UserRole;
};

type UserStatusBadgeProps = {
  isBlocked: boolean;
};

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const style =
    role === "admin"
      ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
      : role === "premium"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  const label =
    role === "admin" ? "Administrador" : role === "premium" ? "Premium" : "Usuário";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style}`}
    >
      {role === "premium" && <Crown className="size-3" aria-hidden="true" />}
      {label}
    </span>
  );
}

export function UserStatusBadge({ isBlocked }: UserStatusBadgeProps) {
  return (
    <span
      className={
        isBlocked
          ? "inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-950 dark:text-red-300"
          : "inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      }
    >
      <span
        className={isBlocked ? "size-1.5 rounded-full bg-red-500" : "size-1.5 rounded-full bg-emerald-500"}
        aria-hidden="true"
      />
      {isBlocked ? "Bloqueado" : "Ativo"}
    </span>
  );
}
