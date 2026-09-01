import { createFileRoute } from "@tanstack/react-router";
import AdminUsersList from "@/components/users/AdminUsersList";

export const Route = createFileRoute("/_authenticated/users")({
  component: AdminUsersList,
});
