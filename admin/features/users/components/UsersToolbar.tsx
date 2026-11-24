import { Search, ShieldCheck, UserRoundCog, UsersRound, X } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { DropdownSelect } from "@/components/ui/DropdownSelect";
import { Input } from "@/components/ui/Input";
import type {
  UserRoleFilter,
  UserStatusFilter,
} from "@/features/users/types/user";

type UsersToolbarProps = {
  hasActiveFilters: boolean;
  isLoading: boolean;
  itemsOnPage: number;
  onRoleChange: (value: UserRoleFilter) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: UserStatusFilter) => void;
  resultCount: number;
  role: UserRoleFilter;
  search: string;
  status: UserStatusFilter;
};

const roleOptions = [
  { label: "Todos os perfis", value: "all" },
  { label: "Usuários", value: "user" },
  { label: "Premium", value: "premium" },
  { label: "Administradores", value: "admin" },
] as const;

const statusOptions = [
  { label: "Todos os acessos", value: "all" },
  { label: "Ativos", value: "active" },
  { label: "Bloqueados", value: "blocked" },
] as const;

export function UsersToolbar({
  hasActiveFilters,
  isLoading,
  itemsOnPage,
  onRoleChange,
  onSearchChange,
  onStatusChange,
  resultCount,
  role,
  search,
  status,
}: UsersToolbarProps) {
  return (
    <Card className="rounded-xl p-1.5 shadow-[0_6px_20px_rgb(15_23_42/0.04)] dark:shadow-[0_8px_24px_rgb(0_0_0/0.18)]">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <p
          className="flex shrink-0 items-center gap-2 px-1 text-sm font-semibold text-slate-600 dark:text-slate-300"
          aria-busy={isLoading}
          aria-live="polite"
        >
          <UsersRound className="size-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <span>
            <strong className="text-slate-950 dark:text-white">
              {resultCount}
            </strong>{" "}
            {hasActiveFilters
              ? resultCount === 1
                ? "resultado encontrado"
                : "resultados encontrados"
              : resultCount === 1
                ? "usuário cadastrado"
                : "usuários cadastrados"}
            {resultCount > 0 && itemsOnPage < resultCount
              ? ` · ${itemsOnPage} nesta página`
              : ""}
          </span>
        </p>

        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          <div className="min-w-0 flex-1 sm:w-64 sm:flex-none">
          <label htmlFor="user-search" className="sr-only">
            Buscar usuário
          </label>
          <Input
            compact
            id="user-search"
            type="search"
            value={search}
            placeholder="Buscar por nome ou e-mail"
            startIcon={<Search className="size-3.5" aria-hidden="true" />}
            endAdornment={
              search ? (
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-md text-slate-500 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Limpar busca"
                  onClick={() => onSearchChange("")}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null
            }
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

          <DropdownSelect
            ariaLabel="Filtrar por perfil"
            value={role}
            options={roleOptions}
            icon={UserRoundCog}
            className="sm:w-48"
            onChange={onRoleChange}
          />

          <DropdownSelect
            ariaLabel="Filtrar por acesso"
            value={status}
            options={statusOptions}
            icon={ShieldCheck}
            className="sm:w-48"
            onChange={onStatusChange}
          />
        </div>
      </div>
    </Card>
  );
}
