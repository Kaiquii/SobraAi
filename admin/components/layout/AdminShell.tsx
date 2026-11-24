"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadSession = useAuthStore((state) => state.loadSession);
  const user = useAuthStore((state) => state.user);
  const usesSingleDesktopViewport =
    pathname === "/home" ||
    pathname === "/usuarios" ||
    pathname === "/versoes-aplicativo";

  useEffect(() => {
    if (isInitialized) {
      if (!user) router.replace("/login");
      return;
    }

    void loadSession().then((authenticated) => {
      if (!authenticated) router.replace("/login");
    });
  }, [isInitialized, loadSession, router, user]);

  useEffect(() => {
    if (!usesSingleDesktopViewport) return;

    document.documentElement.classList.add("admin-desktop-no-scroll");

    return () => {
      document.documentElement.classList.remove("admin-desktop-no-scroll");
    };
  }, [usesSingleDesktopViewport]);

  if (!isInitialized || isLoading || !user) {
    return <PageLoader label="Validando sua sessão..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <a
        href="#conteudo-principal"
        className="sr-only z-70 rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ir para o conteúdo principal
      </a>
      <Header user={user} />
      <Sidebar />
      <main
        id="conteudo-principal"
        tabIndex={-1}
        className={cn(
          "mx-auto w-full px-3 py-5 outline-none sm:py-3 lg:px-0",
          pathname === "/home"
            ? "lg:w-[84%] lg:max-w-[1600px]"
            : "lg:w-[calc(100%-2rem)] lg:max-w-none",
        )}
      >
        {children}
      </main>
    </div>
  );
}
