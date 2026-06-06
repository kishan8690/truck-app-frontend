import { Role } from "../types/enums";
import { AuthUser } from "@/types/userTypes";

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) return null;

  return {
    token,
    role: Number(role) as Role,
  };
}
