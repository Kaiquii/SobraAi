"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Um worker de produção antigo não pode interceptar os assets do HMR.
      void navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations
          .filter((registration) => registration.scope === new URL("/", window.location.href).href)
          .map((registration) => registration.unregister())))
        .catch(() => undefined);
      if ("caches" in window) {
        void window.caches.keys()
          .then((names) => Promise.all(names
            .filter((name) => name.startsWith("sobra-ai-admin-"))
            .map((name) => window.caches.delete(name))))
          .catch(() => undefined);
      }
      return;
    }

    const registerServiceWorker = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker, { once: true });
    return () => window.removeEventListener("load", registerServiceWorker);
  }, []);

  return null;
}
