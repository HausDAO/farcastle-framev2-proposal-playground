"use client";

import dynamic from "next/dynamic";

const ClientProviders = dynamic(
  () => import("~/components/providers/ClientProviders"),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
