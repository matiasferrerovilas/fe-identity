// Todo usuario tiene un workspace "default" propio (creado automáticamente en el onboarding de
// cada app) — no aporta nada en una vista admin-wide (ni en el listado de usuarios ni en el de
// workspaces), así que se filtra en los dos lugares. Compartido para que no queden dos copias
// de la misma lista pudiendo desincronizarse.
const HIDDEN_WORKSPACE_NAMES = new Set(["default"]);

export function isVisibleWorkspaceName(name: string): boolean {
  return !HIDDEN_WORKSPACE_NAMES.has(name.toLowerCase());
}
