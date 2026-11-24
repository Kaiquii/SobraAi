"use client";

import { Info, TriangleAlert, type LucideIcon } from "lucide-react";
import { useRef, type RefObject } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type ConfirmationModalProps = {
  cancelLabel?: string;
  confirmLabel: string;
  contextDetail?: string;
  contextLabel?: string;
  description: string;
  eyebrow?: string;
  icon?: LucideIcon;
  isConfirming?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  title: string;
  tone?: "danger" | "neutral" | "success" | "warning";
};

const iconTones = {
  danger:
    "bg-red-100 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900",
  neutral:
    "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  success:
    "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
  warning:
    "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
};

const modalAccents = {
  danger: "danger",
  neutral: "neutral",
  success: "success",
  warning: "warning",
} as const;

const confirmationContext = {
  danger: {
    eyebrow: "Ação definitiva",
    label: "Esta operação não pode ser desfeita",
    detail: "Confirme somente se você revisou a conta e os dados envolvidos.",
    style:
      "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/45 dark:text-red-100",
    iconStyle: "text-red-600 dark:text-red-400",
  },
  neutral: {
    eyebrow: "Confirmação",
    label: "Sua confirmação é necessária",
    detail: "Revise as informações antes de continuar com esta ação.",
    style:
      "border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-700 dark:bg-slate-800/55 dark:text-slate-100",
    iconStyle: "text-slate-600 dark:text-slate-300",
  },
  success: {
    eyebrow: "Controle de acesso",
    label: "O acesso será restaurado imediatamente",
    detail: "A conta voltará a utilizar as áreas protegidas do SobraAi.",
    style:
      "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/45 dark:text-emerald-100",
    iconStyle: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    eyebrow: "Controle de acesso",
    label: "A conta permanecerá cadastrada",
    detail: "O acesso poderá ser liberado novamente quando for necessário.",
    style:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/45 dark:text-amber-100",
    iconStyle: "text-amber-600 dark:text-amber-400",
  },
};

export function ConfirmationModal({
  cancelLabel = "Cancelar",
  confirmLabel,
  contextDetail,
  contextLabel,
  description,
  eyebrow,
  icon: Icon = TriangleAlert,
  isConfirming = false,
  isOpen,
  onClose,
  onConfirm,
  returnFocusRef,
  title,
  tone = "danger",
}: ConfirmationModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const context = confirmationContext[tone];

  return (
    <Modal
      accent={modalAccents[tone]}
      isOpen={isOpen}
      title={title}
      description={description}
      eyebrow={eyebrow ?? context.eyebrow}
      className="max-w-136"
      headerIcon={
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ring-inset shadow-sm ${iconTones[tone]}`}
        >
          <Icon className="size-5.5" aria-hidden="true" />
        </span>
      }
      initialFocusRef={cancelButtonRef}
      isDismissDisabled={isConfirming}
      returnFocusRef={returnFocusRef}
      onClose={onClose}
    >
      <div
        className={`mt-5 flex items-start gap-3 rounded-2xl border p-3.5 ${context.style}`}
      >
        <Info className={`mt-0.5 size-4.5 shrink-0 ${context.iconStyle}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-bold">{contextLabel ?? context.label}</p>
          <p className="mt-0.5 text-xs leading-5 opacity-75">
            {contextDetail ?? context.detail}
          </p>
        </div>
      </div>

      <div className="-mx-5 -mb-5 mt-5 flex flex-col-reverse gap-2.5 border-t border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/35 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6">
          <Button
            ref={cancelButtonRef}
            variant="secondary"
            className="sm:min-w-28"
            disabled={isConfirming}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            className="sm:min-w-40"
            variant={
              tone === "danger"
                ? "danger"
                : tone === "warning"
                  ? "warning"
                  : "primary"
            }
            isLoading={isConfirming}
            loadingLabel="Aguarde..."
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </Button>
      </div>
    </Modal>
  );
}
