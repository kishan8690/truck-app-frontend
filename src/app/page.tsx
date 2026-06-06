"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/auth/auth";
import { Role } from "@/types/enums";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role === Role.Admin) {
      router.push("/admin/dashboard");
      return;
    }

    if (user.role === Role.Driver) {
      router.push("/driver/trips");
      return;
    }

    router.push("/auth/login");
  }, [router]);

  return <div>Redirecting...</div>;
}
