import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  compactOnMobile?: boolean;
  imageClassName?: string;
  showSubtitle?: boolean;
  titleClassName?: string;
};

export function BrandMark({
  className,
  compact = false,
  compactOnMobile = false,
  imageClassName,
  showSubtitle = true,
  titleClassName,
}: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/brand/sobra-ai-admin-icon.png"
        alt=""
        width={56}
        height={56}
        className={cn(
          "size-14 shrink-0 rounded-2xl object-cover shadow-[0_10px_30px_rgb(15_23_42/0.22)] dark:shadow-[0_10px_30px_rgb(0_0_0/0.38)]",
          imageClassName,
        )}
      />
      {!compact && (
        <div className={cn("min-w-0 leading-tight", compactOnMobile && "hidden sm:block")}>
          <p className={cn("text-xl font-bold tracking-tight text-slate-950 dark:text-white", titleClassName)}>
            SobraAi
          </p>
          {showSubtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Painel administrativo
            </p>
          )}
        </div>
      )}
    </div>
  );
}
