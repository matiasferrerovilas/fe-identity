# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-09-01

### Added
- New `/workspaces` view, the reverse of `/users` — same Card+Row/Col accordion pattern, one row
  per workspace, expanding into its member list (name, email, role tag, joined date). Added as
  the second `NavSlider` tab. Calls the new `GET /v1/admin/workspaces` in api-identity.
- "Agregar miembro" button on each workspace row opens an invite modal — same form fields and
  flow as fe-movements' `InviteUserToWorkspace.tsx` (email + role select, `COLLABORATOR`/
  `READ_ONLY`), calling `POST /v1/invitations/{workspaceId}` directly against api-identity
  (fe-movements goes through api-movements' gateway instead — fe-identity talks to api-identity
  directly, that's the point of this app). Required a small api-identity permission fix: the
  existing invite check assumed the caller was already a member of the workspace, which isn't
  true for an admin inviting into a workspace they don't belong to — see api-identity's
  CHANGELOG. Sending an invitation still goes through the existing RabbitMQ
  `InvitationCreatedEvent` publish, so api-movements/api-keep pick it up the same way they
  already do for invitations sent from fe-movements/fe-keep — nothing new needed there.

## [0.3.0] - 2026-09-01

### Added
- `Dockerfile` + `nginx.conf` + `.github/workflows/frontend-ci.yml`, same shape as fe-movements
  (nginx:alpine serving a CI-built `dist/`, SPA fallback routing, immutable caching on hashed
  `assets/`, `no-cache` on `index.html`/`config.js`; CI: lint → build → auto-tag from
  `package.json` version → build & push a `linux/arm64` image to Docker Hub). Two differences:
  no `pnpm test` step (no test infra here yet, unlike fe-movements/fe-keep), and the CSP
  `connect-src` has no `wss:` entry (no WebSocket here) and points at api-identity's LAN
  IP:port placeholder from `config/config.prod.js` instead of a public `*.eva-core.com` domain —
  update both together once the real port mapping exists on the Pi. Verified by actually building
  the image and smoke-testing `/`, `/health`, and SPA-fallback routing locally.

## [0.2.1] - 2026-09-01

### Changed
- `/users` reworked into the same Card+Row/Col "table" pattern fe-movements' movement list uses
  (header `Card` with column labels, one `Card` per row) instead of the original layout, which
  mashed the `userType` tag (PERSONAL/ENTERPRISE) right next to the `userRoles` tags
  (ROLE_ADMIN/...) with no labels — unclear which was which. Every user also has a `DEFAULT`
  workspace created automatically at onboarding — pure noise in an admin-wide listing, so it's
  filtered out (case-insensitive match on `workspaceName`).
- Each row now shows `createdAt` and is clickable — expands accordion-style into a detail panel
  with two sections: **Workspaces** (name, role, joined date, per membership) and **Onboarding**
  (tour-completed status per app — kept as its own section rather than merged into the workspace
  rows, since onboarding is scoped to (user, api), not to any particular workspace). Backend now
  returns `AdminUserSummaryDTO.onboarding` alongside `workspaces` for this.

## [0.2.0] - 2026-09-01

### Added
- `NavHeader` ported from fe-movements — sticky header, `NavSlider` tab bar, avatar + profile
  popover, mobile drawer — trimmed to what fe-identity actually has: no `WorkspaceSelector`
  (not workspace-scoped), no `AppsGrid`/Admin entry (this app already *is* the admin panel), no
  notifications/tour/i18n. Profile popover now only has a working dark/light toggle (with
  `ThemeProvider`/`localStorage` persistence, same as fe-movements) and a disabled "Configuración"
  tile (backend not built yet).
- First real page: `/users`, listing every user in the instance and which workspaces each one
  belongs to (name, type, roles, and a tag per workspace with the member's role there) — calls the
  new `GET /v1/admin/users` in api-identity. Read-only for now; role changes/invites/kicks are
  separate roadmap items. Added as the first `NavSlider` tab.

## [0.1.0] - 2026-09-01

### Added
- Initial scaffold, following the same conventions as fe-movements/fe-keep: pnpm, axios (with a
  Keycloak-token-refresh interceptor), antd, `@react-keycloak/web` against the already-registered
  `fe-identity` Keycloak client (realm `m2`), and file-based TanStack Router.
- Whole app is admin-only: a single `_authenticated` pathless layout route guards every real route
  with `ROLE_ADMIN` (instead of per-route guards like the other frontends, since here *every*
  route needs it) and redirects to `/forbidden` on failure.
- 403 (`Forbidden`) and 404 (`NotFound`) pages, plus the usual `ErrorBoundary`/`QueryLoadingBoundary`
  scaffolding.
- No i18n, no WebSocket, no dark-mode toggle yet — deliberately left out until actually needed;
  this round only covers the shell (auth, routing, error pages). Concrete admin features
  (user/workspace listing, role changes, invites) are tracked separately in the M2 Suite Roadmap.
