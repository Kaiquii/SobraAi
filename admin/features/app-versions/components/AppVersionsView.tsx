"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { LoadErrorState } from "@/components/ui/LoadErrorState";
import { Toast } from "@/components/ui/Toast";
import { ActiveVersionPanel } from "@/features/app-versions/components/ActiveVersionPanel";
import { AppVersionDetailsModal } from "@/features/app-versions/components/AppVersionDetailsModal";
import { AppVersionFormModal } from "@/features/app-versions/components/AppVersionFormModal";
import { AppVersionHistory } from "@/features/app-versions/components/AppVersionHistory";
import { AppVersionPreviewModal } from "@/features/app-versions/components/AppVersionPreviewModal";
import { useAppVersionsStore } from "@/features/app-versions/store/useAppVersionsStore";
import type {
  AndroidAppVersion,
  AppVersionPayload,
} from "@/features/app-versions/types/appVersion";
import { versionPolicyBecomesMoreRestrictive } from "@/features/app-versions/utils/appVersionValidation";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useResponsivePageLimit } from "@/hooks/useResponsivePageLimit";
import { ADMIN_TABLE_ROW_HEIGHT } from "@/lib/pagination";

type PendingSubmission = {
  payload: AppVersionPayload;
  version: AndroidAppVersion | null;
};

export function AppVersionsView() {
  const actionError = useAppVersionsStore((state) => state.actionError);
  const activeVersionError = useAppVersionsStore((state) => state.error);
  const activeVersion = useAppVersionsStore((state) => state.activeVersion);
  const changeHistoryFilters = useAppVersionsStore(
    (state) => state.changeHistoryFilters,
  );
  const changeHistoryLimit = useAppVersionsStore(
    (state) => state.changeHistoryLimit,
  );
  const changeHistoryPage = useAppVersionsStore(
    (state) => state.changeHistoryPage,
  );
  const clearFeedback = useAppVersionsStore((state) => state.clearFeedback);
  const createVersion = useAppVersionsStore((state) => state.createVersion);
  const hasLoadedActiveVersion = useAppVersionsStore((state) => state.hasLoaded);
  const hasLoadedHistory = useAppVersionsStore(
    (state) => state.hasLoadedHistory,
  );
  const historyError = useAppVersionsStore((state) => state.historyError);
  const historyFilters = useAppVersionsStore((state) => state.historyFilters);
  const historyLimit = useAppVersionsStore((state) => state.historyLimit);
  const historyPagination = useAppVersionsStore(
    (state) => state.historyPagination,
  );
  const isLoadingHistory = useAppVersionsStore(
    (state) => state.isLoadingHistory,
  );
  const isLoadingActiveVersion = useAppVersionsStore((state) => state.isLoading);
  const isSubmitting = useAppVersionsStore((state) => state.isSubmitting);
  const loadActiveVersion = useAppVersionsStore((state) => state.loadActiveVersion);
  const loadVersions = useAppVersionsStore((state) => state.loadVersions);
  const successMessage = useAppVersionsStore((state) => state.successMessage);
  const total = useAppVersionsStore((state) => state.total);
  const updateVersion = useAppVersionsStore((state) => state.updateVersion);
  const versions = useAppVersionsStore((state) => state.versions);
  const [editingVersion, setEditingVersion] =
    useState<AndroidAppVersion | null>(null);
  const [viewingVersion, setViewingVersion] =
    useState<AndroidAppVersion | null>(null);
  const [previewingVersion, setPreviewingVersion] =
    useState<AndroidAppVersion | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] =
    useState<PendingSubmission | null>(null);
  const [resumedPayload, setResumedPayload] =
    useState<AppVersionPayload | null>(null);
  const [searchInput, setSearchInput] = useState(historyFilters.search);
  const sectionRef = useRef<HTMLElement>(null);
  const debouncedSearch = useDebouncedValue(searchInput);

  useResponsivePageLimit({
    containerRef: sectionRef,
    currentLimit: historyLimit,
    isLayoutReady: hasLoadedActiveVersion && hasLoadedHistory,
    onLimitChange: changeHistoryLimit,
    rowHeight: ADMIN_TABLE_ROW_HEIGHT,
  });

  useEffect(() => {
    void Promise.all([loadActiveVersion(), loadVersions()]);
    return clearFeedback;
  }, [clearFeedback, loadActiveVersion, loadVersions]);

  useEffect(() => {
    const search = debouncedSearch.trim();
    if (search === historyFilters.search) return;
    changeHistoryFilters({ ...historyFilters, search });
  }, [changeHistoryFilters, debouncedSearch, historyFilters]);

  function openCreateForm() {
    clearFeedback();
    setEditingVersion(null);
    setResumedPayload(null);
    setIsFormOpen(true);
  }

  function openEditForm(version: AndroidAppVersion) {
    clearFeedback();
    setEditingVersion(version);
    setResumedPayload(null);
    setIsFormOpen(true);
  }

  function openVersionDetails(version: AndroidAppVersion) {
    clearFeedback();
    setViewingVersion(version);
  }

  function openVersionPreview(version: AndroidAppVersion) {
    setViewingVersion(null);
    setPreviewingVersion(version);
  }

  function returnToVersionDetails() {
    if (!previewingVersion) return;
    setViewingVersion(previewingVersion);
    setPreviewingVersion(null);
  }

  function closeForm() {
    if (isSubmitting) return;
    clearFeedback();
    setIsFormOpen(false);
    setEditingVersion(null);
    setResumedPayload(null);
  }

  async function persistVersion(submission: PendingSubmission) {
    return submission.version
      ? updateVersion(
          submission.version.latest_version_code,
          submission.payload,
        )
      : createVersion(submission.payload);
  }

  async function handleFormSubmit(payload: AppVersionPayload) {
    const isEffectiveConfiguration =
      !editingVersion ||
      editingVersion.latest_version_code ===
        activeVersion?.latest_version_code;
    const referenceVersion = editingVersion ?? activeVersion;
    const needsRiskConfirmation =
      isEffectiveConfiguration &&
      versionPolicyBecomesMoreRestrictive(payload, referenceVersion);
    const submission = { payload, version: editingVersion };

    if (needsRiskConfirmation) {
      setPendingSubmission(submission);
      setIsFormOpen(false);
      return;
    }

    const succeeded = await persistVersion(submission);
    if (succeeded) {
      setIsFormOpen(false);
      setEditingVersion(null);
      setResumedPayload(null);
    }
  }

  function cancelRiskConfirmation() {
    if (!pendingSubmission || isSubmitting) return;
    setEditingVersion(pendingSubmission.version);
    setResumedPayload(pendingSubmission.payload);
    setPendingSubmission(null);
    setIsFormOpen(true);
  }

  async function confirmRiskSubmission() {
    if (!pendingSubmission) return;
    const submission = pendingSubmission;
    const succeeded = await persistVersion(submission);

    if (succeeded) {
      setPendingSubmission(null);
      setEditingVersion(null);
      setResumedPayload(null);
      return;
    }

    setEditingVersion(submission.version);
    setResumedPayload(submission.payload);
    setPendingSubmission(null);
    setIsFormOpen(true);
  }

  const isActiveVersionLoading =
    !hasLoadedActiveVersion && isLoadingActiveVersion;
  const riskDescription = pendingSubmission
    ? pendingSubmission.payload.force_update
      ? "A atualização obrigatória impedirá o uso de versões anteriores até que o aplicativo seja atualizado."
      : `Instalações abaixo do código ${pendingSubmission.payload.min_required_version_code} precisarão atualizar antes de continuar.`
    : "Revise a política de atualização antes de continuar.";

  return (
    <section
      ref={sectionRef}
      aria-labelledby="app-versions-title"
      className="space-y-3 lg:flex lg:h-[calc(100dvh-5rem)] lg:flex-col lg:gap-3 lg:space-y-0"
    >
      <h1 id="app-versions-title" className="sr-only">
        Gestão de versões do aplicativo Android
      </h1>

      <ActiveVersionPanel
        error={activeVersionError}
        isLoading={isActiveVersionLoading}
        onNewVersion={openCreateForm}
        onRetry={() => void loadActiveVersion()}
        version={activeVersion}
      />

      {historyError && versions.length > 0 && (
        <Alert tone="error">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <span>
              {historyError} Os dados exibidos podem estar desatualizados.
            </span>
            <Button variant="secondary" onClick={() => void loadVersions()}>
              Tentar novamente
            </Button>
          </div>
        </Alert>
      )}

      {historyError && versions.length === 0 ? (
        <LoadErrorState
          className="lg:min-h-0 lg:flex-1"
          title="Não foi possível carregar o histórico"
          description="Verifique sua conexão e tente novamente para acessar as versões."
          isRetrying={isLoadingHistory}
          onRetry={() => void loadVersions()}
        />
      ) : (
        <AppVersionHistory
          activeVersionCode={activeVersion?.latest_version_code ?? null}
          isLoading={isLoadingHistory}
          pagination={historyPagination}
          onEdit={openEditForm}
          onPageChange={changeHistoryPage}
          onPolicyChange={(policy) =>
            changeHistoryFilters({ ...historyFilters, policy })
          }
          onSearchChange={setSearchInput}
          onView={openVersionDetails}
          policy={historyFilters.policy}
          search={searchInput}
          total={total}
          versions={versions}
        />
      )}

      {viewingVersion && (
        <AppVersionDetailsModal
          isActive={
            viewingVersion.latest_version_code ===
            activeVersion?.latest_version_code
          }
          isOpen
          onClose={() => setViewingVersion(null)}
          onPreview={() => openVersionPreview(viewingVersion)}
          version={viewingVersion}
        />
      )}

      {previewingVersion && (
        <AppVersionPreviewModal
          activeVersion={activeVersion}
          isOpen
          onBack={returnToVersionDetails}
          onClose={() => setPreviewingVersion(null)}
          version={previewingVersion}
        />
      )}

      {isFormOpen && (
        <AppVersionFormModal
          actionError={actionError}
          activeVersion={activeVersion}
          initialPayload={resumedPayload}
          isOpen
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
          version={editingVersion}
        />
      )}

      <ConfirmationModal
        isOpen={Boolean(pendingSubmission)}
        title="Aplicar política mais restritiva?"
        description={riskDescription}
        confirmLabel="Aplicar configuração"
        contextLabel="Versões antigas podem perder o acesso"
        contextDetail="Confirme somente depois de revisar o código mínimo e a obrigatoriedade da atualização."
        eyebrow="Política de atualização"
        icon={AlertTriangle}
        tone="warning"
        isConfirming={isSubmitting}
        onClose={cancelRiskConfirmation}
        onConfirm={confirmRiskSubmission}
      />

      <Toast
        isOpen={Boolean(successMessage)}
        message={successMessage ?? ""}
        tone="success"
        onClose={clearFeedback}
      />

      <Toast
        isOpen={Boolean(actionError) && !isFormOpen}
        message={actionError ?? ""}
        tone="error"
        onClose={clearFeedback}
      />
    </section>
  );
}
