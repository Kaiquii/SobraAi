"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type UserAvatarProps = {
  avatarUrl?: string | null;
  className?: string;
  name: string;
  size?: "compact" | "large" | "small" | "medium" | "xlarge";
};

const sizes = {
  compact: {
    className: "size-8 rounded-lg text-xs",
    imageSize: "32px",
  },
  xlarge: {
    className: "size-18 rounded-2xl text-xl",
    imageSize: "72px",
  },
  large: {
    className: "size-14 rounded-xl text-lg",
    imageSize: "56px",
  },
  small: {
    className: "size-7 rounded-md text-[11px]",
    imageSize: "28px",
  },
  medium: {
    className: "size-10 rounded-lg text-sm",
    imageSize: "40px",
  },
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase("pt-BR"))
    .join("");
}

export function UserAvatar({
  avatarUrl,
  className,
  name,
  size = "small",
}: UserAvatarProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = avatarUrl?.trim();
  const config = sizes[size];
  const shouldShowImage = Boolean(source && failedSource !== source);

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        config.className,
        className,
      )}
    >
      {source && shouldShowImage ? (
        <Image
          src={source}
          alt={`Foto de ${name}`}
          fill
          sizes={config.imageSize}
          className="object-cover"
          onError={() => setFailedSource(source)}
        />
      ) : (
        getInitials(name) || "AD"
      )}
    </span>
  );
}
