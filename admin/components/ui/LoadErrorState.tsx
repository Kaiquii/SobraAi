import { CircleAlert, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type LoadErrorStateProps = {
  className?: string;
  description: string;
  isRetrying?: boolean;
  onRetry: () => void;
  title: string;
};

export function LoadErrorState({
  className,
  description,
  isRetrying = false,
  onRetry,
  title,
}: LoadErrorStateProps) {
  return (
    <Card
      role="alert"
      className={cn(
        "grid min-h-56 place-items-center overflow-hidden p-6 text-center shadow-[0_8px_24px_rgb(15_23_42/0.05)] dark:shadow-[0_10px_28px_rgb(0_0_0/0.2)]",
        className,
      )}
    >
      <div className="max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          <CircleAlert className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-base font-bold text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <Button
          variant="secondary"
          className="mt-4 min-h-10"
          isLoading={isRetrying}
          loadingLabel="Tentando novamente..."
          onClick={onRetry}
        >
          <RotateCw className="size-4" aria-hidden="true" />
          Tentar novamente
        </Button>
      </div>
    </Card>
  );
}
