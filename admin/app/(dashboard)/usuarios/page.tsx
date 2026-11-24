import type { Metadata } from "next";

import { UsersView } from "@/features/users/components/UsersView";

export const metadata: Metadata = {
  title: "Usuários",
};

export default function UsersPage() {
  return <UsersView />;
}
