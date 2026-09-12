# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run the dev server (`ng serve`)
- `npm run build` — production build (`ng build`)
- `npm run watch` — dev build in watch mode
- `npm test` — run unit tests (Vitest via Angular's native `@angular/build:unit-test` builder, not Karma/Jasmine — spec files use Jasmine-style `describe/it/expect` syntax, which Vitest supports)
- Run a single test file: `npm test -- --include src/app/core/services/auth-service.spec.ts --watch=false`
- No lint script/config exists in the repo (no ESLint). Formatting is via Prettier (`.prettierrc`: 100 print width, single quotes, Angular parser for `.html`).
- No e2e framework is configured.

## Architecture

Angular 22 standalone-component app (no NgModules), using the esbuild/Vite-based `@angular/build:application` builder. Package manager is npm (`package-lock.json`).

### Feature-folder structure (`src/app/`)
- `core/` — app-wide singletons and cross-cutting concerns: `guard/` (functional `CanActivateFn` guards), `services/`, `models/`, `utilities/`.
- `features/<name>/` — domain features, each with its own `components/`, `pages/`, `models/`, and optionally `factories/` (e.g. `features/auth/`, `features/analytics/`).
- `layouts/` — shell components composed into the route tree (`layouts/auth/auth-layout/` for guest-facing routes, `layouts/dashboard/dashboard-layout/` for authenticated routes, plus `header/`, `sidebar/`, `sidebar-link/`).
- `shared/` — generic reusable presentational components (e.g. `shared/button/`), built with signal-based `input()`/`output()` APIs and Tailwind utility classes composed via `computed()`.

### Routing & guards (`src/app/app.routes.ts`)
Two lazy-loaded (`loadComponent`) top-level branches:
- `''` → `AuthLayout`, guarded by `guestGuard`, child `login`.
- `'admin'` → `DashboardLayout`, guarded by `[authGuard, adminGuard]`, child `analytics`.

Guards live in `core/guard/` (`auth-guard.ts`, `guest-guard.ts`, `admin-guard.ts`). They check `AuthService` signals first and fall back to refetching `authService.getMeQuery` before redirecting, so auth state can be resolved lazily on hard navigation/refresh.

### Auth & state management
- **State**: Angular signals (`signal`/`computed`) — no NgRx, no RxJS `BehaviorSubject` services. `AuthService` (`core/services/auth-service.ts`) holds `_userDetails` as a signal and derives `userDetails`, `userRoles`, `isAuthenticated`, `isAdmin` via `computed()`.
- **Server state**: `@tanstack/angular-query-experimental` (`injectQuery`/`injectMutation`) wraps plain REST `HttpClient` calls (bridged to promises via `lastValueFrom`) — despite names like `getMeQuery`, this is REST, not GraphQL/Apollo. `QueryClient` is configured in `app.config.ts` (5 min stale time, no retry on 4xx).
- **Auth transport**: cookie/session-based — both `POST {apiUrl}/auth/login` and `GET {apiUrl}/auth/me` use `withCredentials: true`, no token/localStorage handling.
- **API URL**: from `src/environments/environment.ts` (prod: `https://codewithmixx.com/api`) / `environment.development.ts` (dev: `https://localhost:7181/api`, i.e. a separate local backend expected on that port).

### Forms
Uses Angular's Signal Forms API (`@angular/forms/signals`), not `ReactiveFormsModule`. The established pattern (see `features/auth/factories/auth-factories.ts`) is to extract form construction into a `factories/` module: a `createXForm(request: WritableSignal<T>)` function returns a `form(...)` built with validators (`required`, `email`, `debounce`, etc.), which the component then binds to its template via `[formField]` and submits via `submit(form, async () => {...})`. Validation/UI copy is in Serbian.

### Styling
Tailwind CSS v4 (`@import 'tailwindcss'` in `src/styles.css`, `@tailwindcss/postcss` plugin) — no Angular Material, no SCSS. Per-component `.css` files hold scoped styles alongside Tailwind utility classes used directly in templates.
