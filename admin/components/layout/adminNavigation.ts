import { Smartphone, UsersRound } from "lucide-react";

export const adminNavigation = [
  {
    description: "Contas e permissões de acesso",
    href: "/usuarios",
    icon: UsersRound,
    label: "Usuários",
    available: true,
  },
  {
    description: "Atualizações do aplicativo Android",
    href: "/versoes-aplicativo",
    icon: Smartphone,
    label: "Versões do aplicativo",
    available: true,
  },
] as const;
