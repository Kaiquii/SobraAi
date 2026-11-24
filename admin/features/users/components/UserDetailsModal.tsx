import {
  BadgeCheck,
  Clock3,
  Hash,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  UserRoleBadge,
  UserStatusBadge,
} from "@/features/users/components/UserBadges";
import type { AdminUser } from "@/features/users/types/user";
import {
  formatUserBlockedAt,
  formatUserLastActiveAt,
} from "@/features/users/utils/userFormatters";

type UserDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
};

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
}: UserDetailsModalProps) {
  const avatarSource = user.avatar_url?.trim();
  const roleLabel =
    user.role === "admin"
      ? "Administrador"
      : user.role === "premium"
        ? "Premium"
        : "Usuário";
  const accessLabel = user.access_blocked ? "Acesso revogado" : "Acesso liberado";
  const AccessIcon = user.access_blocked ? LockKeyhole : ShieldCheck;

  return (
    <Modal
      accent="sky"
      isOpen={isOpen}
      eyebrow="Consulta de conta"
      title="Detalhes do usuário"
      description="Identidade, função e situação de acesso da conta selecionada."
      className="max-w-xl"
      headerIcon={
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200 shadow-sm dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900">
          <UserRound className="size-5.5" aria-hidden="true" />
        </span>
      }
      onClose={onClose}
    >
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-950/45">
        <div className="relative flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center">
          <span
            className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-sky-500 dark:bg-sky-400"
            aria-hidden="true"
          />
          <UserAvatar
            avatarUrl={avatarSource || undefined}
            className="ring-4 ring-white shadow-[0_10px_24px_rgb(15_23_42/0.16)] dark:ring-slate-900 dark:shadow-[0_12px_28px_rgb(0_0_0/0.38)]"
            name={user.name}
            size="xlarge"
          />

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
              Conta #{user.id}
            </p>
            <h3 className="mt-1 truncate text-xl font-bold text-slate-950 dark:text-white">
              {user.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{user.email}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge isBlocked={user.access_blocked} />
            </div>
          </div>
        </div>

        <dl className="grid border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 sm:divide-x sm:divide-slate-200 dark:sm:divide-slate-800">
          <div className="flex items-start gap-3 border-b border-slate-200 p-3.5 dark:border-slate-800 sm:border-b-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Hash className="size-4" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Identificador
              </dt>
              <dd className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                {user.id}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <BadgeCheck className="size-4" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Perfil da conta
              </dt>
              <dd className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                {roleLabel}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-slate-200 p-3.5 dark:border-slate-800 sm:col-span-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <Clock3 className="size-4" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Último uso
              </dt>
              <dd className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                <time dateTime={user.last_active_at}>
                  {formatUserLastActiveAt(user.last_active_at)}
                </time>
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div
        className={
          user.access_blocked
            ? "mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40"
            : "mt-3 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40"
        }
      >
        <span
          className={
            user.access_blocked
              ? "grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              : "grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
          }
        >
          <AccessIcon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p
            className={
              user.access_blocked
                ? "text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300"
                : "text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300"
            }
          >
            Situação do acesso
          </p>
          <p className="mt-1 text-base font-bold text-slate-950 dark:text-white">
            {accessLabel}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
            {user.access_blocked
              ? `Revogado em ${formatUserBlockedAt(user.access_blocked_at)}.`
              : "Esta conta pode entrar e utilizar as áreas protegidas do painel."}
          </p>
        </div>
      </div>

    </Modal>
  );
}
