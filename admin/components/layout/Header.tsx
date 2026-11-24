"use client";

import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { AuthUser } from "@/features/auth/types/auth";
import { adminNavigation } from "@/components/layout/adminNavigation";
import { useAdminLayoutStore } from "@/store/useAdminLayoutStore";

type HeaderProps = {
  user: AuthUser;
};

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const logout = useAuthStore((state) => state.logout);
  const isSidebarOpen = useAdminLayoutStore((state) => state.isSidebarOpen);
  const openSidebar = useAdminLayoutStore((state) => state.openSidebar);
  const avatarSource = user.avatar_url?.trim();
  const currentPageLabel =
    pathname === "/home"
      ? "Visão geral"
      : adminNavigation.find((item) => pathname.startsWith(item.href))?.label;

  const closeAvatarModal = useCallback(() => setIsAvatarModalOpen(false), []);
  const openAvatarModal = useCallback(() => {
    setIsUserMenuOpen(false);
    setIsAvatarModalOpen(true);
  }, []);
  const closeLogoutModal = useCallback(() => setIsLogoutModalOpen(false), []);
  const openLogoutModal = useCallback(() => {
    setIsUserMenuOpen(false);
    setIsLogoutModalOpen(true);
  }, []);

  useEffect(() => {
    if (!isUserMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuContainerRef.current?.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsUserMenuOpen(false);
      userButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

  async function handleLogout() {
    await logout();
    setIsLogoutModalOpen(false);
    router.replace("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex h-14 w-full items-center gap-2 px-4">
          <Button
            id="admin-sidebar-trigger"
            variant="compactIcon"
            aria-controls="admin-sidebar"
            aria-expanded={isSidebarOpen}
            aria-label="Abrir menu de navegação"
            title="Abrir menu"
            onClick={openSidebar}
          >
            <Menu className="size-4.5" aria-hidden="true" />
          </Button>

          <Link
            href="/home"
            aria-label="Ir para a página inicial"
            title="Início"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-slate-950"
          >
            <BrandMark
              className="min-w-0 gap-2"
              compactOnMobile
              imageClassName="!size-7 !rounded-md !shadow-none"
              showSubtitle={false}
              titleClassName="!text-base"
            />
          </Link>

          {currentPageLabel && (
            <div className="flex min-w-0 items-center gap-1.5" aria-label={`Página atual: ${currentPageLabel}`}>
              <ChevronRight
                className="size-3.5 shrink-0 text-slate-400 dark:text-slate-600"
                aria-hidden="true"
              />
              <span className="truncate text-sm font-bold text-slate-700 dark:text-slate-200 sm:text-base">
                {currentPageLabel}
              </span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle compact />

            <div ref={menuContainerRef} className="relative">
              <div className="flex h-9 max-w-57.5 items-center rounded-lg border border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                {avatarSource ? (
                  <button
                    type="button"
                    className="m-0.5 shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400"
                    aria-label={`Visualizar foto de ${user.name}`}
                    title="Visualizar foto"
                    onClick={openAvatarModal}
                  >
                    <UserAvatar avatarUrl={avatarSource} name={user.name} />
                  </button>
                ) : (
                  <UserAvatar className="ml-1" name={user.name} />
                )}

                <button
                  ref={userButtonRef}
                  type="button"
                  className="flex h-full min-w-0 items-center gap-2 rounded-r-lg px-1.5 text-left outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-slate-800 dark:focus-visible:ring-emerald-400 sm:pr-2"
                  aria-controls={isUserMenuOpen ? "admin-user-popover" : undefined}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="dialog"
                  aria-label={`Abrir menu de ${user.name}`}
                  onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
                >
                  <span className="hidden min-w-0 flex-1 sm:block">
                    <span className="block truncate text-sm font-semibold">
                      {user.name}
                    </span>
                  </span>
                  <ChevronDown
                    className="size-3.5 shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                </button>
              </div>

              {isUserMenuOpen && (
                <div
                  id="admin-user-popover"
                  role="dialog"
                  aria-label="Informações e ações da conta"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(280px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgb(15_23_42/0.16)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_16px_40px_rgb(0_0_0/0.45)]"
                >
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    {avatarSource ? (
                      <button
                        type="button"
                        className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400"
                        aria-label={`Visualizar foto de ${user.name}`}
                        title="Visualizar foto"
                        onClick={openAvatarModal}
                      >
                        <UserAvatar avatarUrl={avatarSource} name={user.name} size="medium" />
                      </button>
                    ) : (
                      <UserAvatar name={user.name} size="medium" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                        {user.name}
                      </p>
                      <p className="mt-1 break-all text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                    Sessão administrativa ativa
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-700 hover:bg-red-50 active:bg-red-100 dark:text-red-300 dark:hover:bg-red-950 dark:active:bg-red-900"
                    onClick={openLogoutModal}
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Sair
                  </Button>
                </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {avatarSource && (
        <ImagePreviewModal
          src={avatarSource}
          alt={`Foto de perfil de ${user.name}`}
          title={`Foto de ${user.name}`}
          isOpen={isAvatarModalOpen}
          onClose={closeAvatarModal}
        />
      )}

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        title="Sair do painel?"
        description="Sua sessão administrativa será encerrada e será necessário entrar novamente para acessar o painel."
        confirmLabel="Sair"
        icon={LogOut}
        tone="danger"
        isConfirming={isSubmitting}
        returnFocusRef={userButtonRef}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}
