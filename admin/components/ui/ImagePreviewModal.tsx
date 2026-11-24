"use client";

import Image from "next/image";

import { Modal } from "@/components/ui/Modal";

type ImagePreviewModalProps = {
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  src: string;
  title: string;
};

export function ImagePreviewModal({
  alt,
  isOpen,
  onClose,
  src,
  title,
}: ImagePreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      className="max-w-xl"
      onClose={onClose}
    >
      <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) calc(100vw - 2rem), 544px"
          className="object-contain"
        />
      </div>
    </Modal>
  );
}
