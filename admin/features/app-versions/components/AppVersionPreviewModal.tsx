import { ArrowLeft, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AppUpdatePreview } from "@/features/app-versions/components/AppUpdatePreview";
import type { AndroidAppVersion } from "@/features/app-versions/types/appVersion";
import { createVersionDraft } from "@/features/app-versions/utils/appVersionValidation";

type AppVersionPreviewModalProps = {
  activeVersion: AndroidAppVersion | null;
  isOpen: boolean;
  onBack: () => void;
  onClose: () => void;
  version: AndroidAppVersion;
};

export function AppVersionPreviewModal({
  activeVersion,
  isOpen,
  onBack,
  onClose,
  version,
}: AppVersionPreviewModalProps) {
  const draft = createVersionDraft(version, activeVersion);

  return (
    <Modal
      accent="sky"
      className="max-w-3xl!"
      contentClassName="sm:!p-4"
      description="Confira como o aviso será apresentado no aplicativo Android."
      eyebrow="Prévia no Android"
      headerIcon={
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-900">
          <Smartphone className="size-5" aria-hidden="true" />
        </span>
      }
      isOpen={isOpen}
      onClose={onClose}
      title={`Prévia da versão ${version.latest_version_name}`}
    >
      <div className="mt-3">
        <AppUpdatePreview
          currentVersion={activeVersion}
          draft={draft}
          publishedAt={version.updated_at}
        />

        <div className="-mx-4 -mb-4 mt-3 flex justify-end border-t border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/35">
          <Button autoFocus variant="secondary" onClick={onBack}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar aos detalhes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
