import type { Metadata } from "next";

import { AppVersionsView } from "@/features/app-versions/components/AppVersionsView";

export const metadata: Metadata = {
  title: "Versões do aplicativo",
};

export default function AppVersionsPage() {
  return <AppVersionsView />;
}
