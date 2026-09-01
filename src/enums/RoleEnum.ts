// Único rol relevante acá: fe-identity es admin-only, a diferencia de fe-movements/fe-keep
// que también manejan FAMILY/GUEST para acceso a workspaces.
export const RoleEnum = {
  ADMIN: "ADMIN",
} as const;

export type RoleEnum = (typeof RoleEnum)[keyof typeof RoleEnum];
