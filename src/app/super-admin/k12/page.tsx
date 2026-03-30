"use client";

import dynamic from "next/dynamic";

const K12SuperAdminPage = dynamic(
  () => import("@/components/SuperAdmin/K12SuperAdminPage"),
  { ssr: false }
);

export default function K12SuperAdmin() {
  return <K12SuperAdminPage />;
}
