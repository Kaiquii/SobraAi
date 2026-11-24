import type { Metadata } from "next";

import { LoginView } from "@/features/auth/components/LoginView";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return <LoginView />;
}
