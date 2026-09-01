import { createFileRoute } from "@tanstack/react-router";
import AdminWorkspacesList from "@/components/workspaces/AdminWorkspacesList";

export const Route = createFileRoute("/_authenticated/workspaces")({
  component: AdminWorkspacesList,
});
