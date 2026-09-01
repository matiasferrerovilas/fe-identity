import { api } from "@/apis/axios";
import type { AdminUserSummary } from "@/models/AdminUser";

export const getAdminUsers = () =>
  api.get<AdminUserSummary[]>("/admin/users").then((response) => response.data);
