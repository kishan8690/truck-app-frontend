"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/types/enums";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || !role) {
      // Not logged in
      router.replace("/auth/login");
      return;
    }

    const numericRole = Number(role);

    if (!allowedRoles.includes(numericRole)) {
      // Wrong role → redirect accordingly
      if (numericRole === Role.Admin) {
        router.replace("/admin/trips");
      } else if (numericRole === Role.Driver) {
        router.replace("/driver/trips");
      } else {
        router.replace("/auth/login");
      }
    }
  }, [router, allowedRoles]);

  return <>{children}</>;
}
