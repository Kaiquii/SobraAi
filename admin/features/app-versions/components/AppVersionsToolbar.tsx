import { Search, ShieldCheck, X } from "lucide-react";

import { DropdownSelect } from "@/components/ui/DropdownSelect";
import { Input } from "@/components/ui/Input";
import type { AppVersionPolicyFilter } from "@/features/app-versions/types/appVersion";

type AppVersionsToolbarProps = {
  onPolicyChange: (value: AppVersionPolicyFilter) => void;
  onSearchChange: (value: string) => void;
  policy: AppVersionPolicyFilter;
  search: string;
};

const policyOptions = [
  { label: "Todas as políticas", value: "all" },
  { label: "Opcionais", value: "optional" },
  { label: "Obrigatórias", value: "required" },
] as const;

export function AppVersionsToolbar({
  onPolicyChange,
  onSearchChange,
  policy,
  search,
}: AppVersionsToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
      <div className="min-w-0 flex-1 sm:w-80 sm:flex-none">
        <label htmlFor="version-search" className="sr-only">
          Buscar versão
        </label>
        <Input
          compact
          id="version-search"
          type="search"
          value={search}
          placeholder="Buscar versão, código ou mensagem"
          startIcon={<Search className="size-3.5" aria-hidden="true" />}
          endAdornment={
            search ? (
              <button
                type="button"
                className="grid size-7 place-items-center rounded-md text-slate-500 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-slate-400 dark:hover:bg-slate-800"
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
        ariaLabel="Filtrar por política de atualização"
        value={policy}
        options={policyOptions}
        icon={ShieldCheck}
        className="sm:w-48"
        onChange={onPolicyChange}
      />
    </div>
  );
}
