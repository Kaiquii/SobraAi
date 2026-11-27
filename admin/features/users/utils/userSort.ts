export const USER_SORT_COLUMNS = [
  {
    label: "Usuário / e-mail",
    first: { value: "name_asc", label: "Nome (A–Z)" },
    second: { value: "name_desc", label: "Nome (Z–A)" },
    firstDirection: "ascending",
  },
  {
    label: "Perfil",
    first: { value: "role_asc", label: "Perfil (A–Z)" },
    second: { value: "role_desc", label: "Perfil (Z–A)" },
    firstDirection: "ascending",
  },
  {
    label: "Acesso",
    first: { value: "access_asc", label: "Acesso (ativos primeiro)" },
    second: { value: "access_desc", label: "Acesso (bloqueados primeiro)" },
    firstDirection: "ascending",
  },
  {
    label: "Último uso",
    first: { value: "last_active_desc", label: "Último uso (mais recente)" },
    second: { value: "last_active_asc", label: "Último uso (mais antigo)" },
    firstDirection: "descending",
  },
  {
    label: "Bloqueio",
    first: { value: "blocked_at_desc", label: "Bloqueio (mais recente)" },
    second: { value: "blocked_at_asc", label: "Bloqueio (mais antigo)" },
    firstDirection: "descending",
  },
] as const;

type UserSortColumn = (typeof USER_SORT_COLUMNS)[number];

export type UserSort = "" | UserSortColumn["first" | "second"]["value"];

export const USER_SORT_OPTIONS = [
  { value: "", label: "Ordem padrão" },
  ...USER_SORT_COLUMNS.flatMap(({ first, second }) => [first, second]),
] satisfies { value: UserSort; label: string }[];
