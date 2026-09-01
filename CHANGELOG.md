# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
