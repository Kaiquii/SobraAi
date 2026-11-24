"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const clearError = useAuthStore((state) => state.clearError);
  const error = useAuthStore((state) => state.error);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const login = useAuthStore((state) => state.login);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const authenticated = await login({ email, password });

    if (authenticated) {
      router.replace("/home");
    }
  }

  function handleEmailChange(value: string) {
    if (error) clearError();
    setEmail(value);
  }

  function handlePasswordChange(value: string) {
    if (error) clearError();
    setPassword(value);
  }

  return (
    <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => handleEmailChange(event.target.value)}
          autoComplete="email"
          placeholder="admin@exemplo.com"
          startIcon={<Mail className="size-4" aria-hidden="true" />}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Senha
          </label>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Acesso administrativo
          </span>
        </div>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => handlePasswordChange(event.target.value)}
          autoComplete="current-password"
          placeholder="Sua senha"
          startIcon={<LockKeyhole className="size-4" aria-hidden="true" />}
          endAdornment={
            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg text-slate-500 outline-none hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? (
                <EyeOff className="size-5" aria-hidden="true" />
              ) : (
                <Eye className="size-5" aria-hidden="true" />
              )}
            </button>
          }
          required
          disabled={isSubmitting}
        />
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Button
        type="submit"
        className="h-12 w-full"
        isLoading={isSubmitting}
        loadingLabel="Entrando..."
      >
        Entrar
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>

      <p className="text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
        Acesso reservado a administradores autorizados.
      </p>
    </form>
  );
}
