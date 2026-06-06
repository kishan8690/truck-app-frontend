"use client";

import { useRouter } from "next/navigation";

export function useFetchWithAuth() {
  const router = useRouter();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");

    const headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401 || res.status === 403) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/auth/login");
      throw new Error("Session expired. Redirecting to login.");
    }

    return res;
  };

  return fetchWithAuth;
}
