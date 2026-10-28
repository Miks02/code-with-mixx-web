# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run the dev server (`ng serve`)
- `npm run build` — production build (`ng build`)
- `npm run watch` — dev build in watch mode
- `npm test` — run unit tests (Vitest via Angular's native `@angular/build:unit-test` builder, not Karma/Jasmine — spec files use Jasmine-style `describe/it/expect` syntax, which Vitest supports)
- Run a single test file: `npm test -- --include src/app/core/services/auth-service.spec.ts --watch=false`
- `npm run lint` — ESLint via angular-eslint (`eslint.config.js`); `npx eslint src --fix` to autofix. Enforces `type` over `interface`, alias imports instead of `../../`, and module boundaries (shared/core must not import features/layouts; other features only via their `index.ts` barrel). Formatting is via Prettier (`.prettierrc`: 100 print width, single quotes, Angular parser for `.html`).
- No e2e framework is configured.

## Architecture

Angular 22 standalone-component app (no NgModules), using the esbuild/Vite-based `@angular/build:application` builder. Package manager is npm (`package-lock.json`).

### Feature-folder structure (`src/app/`)
- `core/` — app-wide singletons and cross-cutting concerns: `guard/` (functional `CanActivateFn` guards), `interceptors/`, `services/` (`AuthService`, `ToastService`, `DialogService`), `components/` (`dialog/`, `toast/`, mounted dynamically by their services via `ComponentMounter`), `models/`, `utilities/`.
- `features/<name>/` — domain features (`analytics`, `auth`, `payments`, `projects`, `reservations`, `students`, `subjects`). Each has some of: `components/`, `pages/`, `models/`, `services/`, `factories/`, `utilities/`, plus an `admin/` subfolder (`admin/components/`, `admin/pages/`) for admin-only UI. Features consumed by other features expose a public API through `index.ts`.
- `layouts/` — shell components composed into the route tree (`layouts/auth/auth-layout/` for guest-facing routes, `layouts/dashboard/dashboard-layout/` for authenticated routes, plus `header/`, `sidebar/`, `sidebar-link/`).
- `shared/` — generic reusable building blocks: presentational components in `shared/components/` (e.g. `shared/components/button/`), built with signal-based `input()`/`output()` APIs and Tailwind utility classes composed via `computed()`; pipes in `shared/pipes/`.

### Import aliases
Path aliases are defined in `tsconfig.json` `paths`: `@core/*`, `@features/*`, `@layouts/*`, `@shared/*`, `@environments/*`. Convention: use an alias for anything outside the current module (a module = `core`, `shared`, `layouts`, or a single `features/<name>`), and for any import that would need `../../` or deeper; plain relative imports (`./`, `../`) only for nearby files within the same module. Another feature is imported only through its barrel (`@features/reservations`), never its internals.

### Routing & guards (`src/app/app.routes.ts`)
Two lazy-loaded (`loadComponent`) top-level branches:
- `''` → `AuthLayout`, guarded by `guestGuard`: `login`, `forgot-password`, `reset-password` (also `resetPasswordGuardGuard`, requires `token` + `userId` query params), `activate-account`.
- `'admin'` → `DashboardLayout`, guarded by `[authGuard, adminGuard]`: `analytics`, `subjects`, `students`, `projects`, `projects/create`, `projects/details/:id`.

Every route sets its browser tab title with `title: pageTitle('...')` (helper in `app.routes.ts`, produces `Page • CodeWithMixx`).

Guards live in `core/guard/` and are synchronous signal checks against `AuthService` (`isAuthenticated()`, `isAdmin()`). The session is resolved once at startup by `provideAppInitializer(() => inject(AuthService).checkSession())`, which calls `GET /auth/me` only if a `Session` cookie is present.

### Auth & state management
- **State**: Angular signals (`signal`/`computed`) — no NgRx, no RxJS `BehaviorSubject` services. `AuthService` (`core/services/auth-service.ts`) holds `_userDetails` as a signal and derives `userDetails`, `userRoles`, `isAuthenticated`, `isAdmin` via `computed()`.
- **Server state**: `@tanstack/angular-query-experimental` (`injectQuery`/`injectMutation`) wraps plain REST `HttpClient` calls (bridged to promises via `lastValueFrom`) — despite names like `getMeQuery`, this is REST, not GraphQL/Apollo. `QueryClient` is configured in `app.config.ts` (5 min stale time, no retry on 4xx).
- **Auth transport**: the backend sets JWT access/refresh tokens as HttpOnly cookies (plus a readable `Session` cookie); the frontend never touches tokens or localStorage. `authInterceptor` adds `withCredentials: true` to every request; on a 401 it calls `rotateTokens()` and retries once, and if rotation fails `handleSessionExpired()` logs out and redirects to `/login?expired=true`. Requests that must not trigger this (reset password, account activation, rotation itself) set the `SKIP_AUTH_RETRY` `HttpContextToken`.
- **Interceptor order** (`app.config.ts`): `[timeZoneInterceptor, httpErrorInterceptor, authInterceptor]` — `httpErrorInterceptor` sits outside `authInterceptor`, so it only sees the final error after any token rotation.
- **API URL**: from `src/environments/environment.ts` (prod: `https://codewithmixx.com/api`) / `environment.development.ts` (dev: `https://localhost:7181/api`, i.e. a separate local backend expected on that port; the sibling repo is `../code-with-mixx-api`, ASP.NET Core).

### Error handling
- The backend always returns RFC 9457 ProblemDetails with an `errorCode` extension: domain errors carry their own code (e.g. `Subject.AlreadyExists`), everything else gets a `General.*` code (`General.NotFound`, `General.InternalServerError`, ...). FluentValidation failures are 400 with an `errors` dictionary.
- `httpErrorInterceptor` (`core/interceptors/`) normalizes every `HttpErrorResponse` into a `ProblemDetails` (`core/models/problem-details.ts`) and rethrows that, so callers never see `HttpErrorResponse`. Non-ProblemDetails responses become `Network.Unavailable` (status 0) or `Http.Unexpected`.
- The interceptor toasts generic errors from `GLOBAL_ERROR_MESSAGES` (`core/utilities/http-error-messages.ts`). It deliberately skips 401 (handled by `authInterceptor`) and validation 400s (the form's job).
- Components handle **only the domain codes they expect** and never show a generic fallback toast (that would double up with the interceptor). Each feature keeps its messages in `features/<x>/utilities/<x>-error-messages.ts`: an `X_ERROR_MESSAGES: Record<string, string>` map plus `getXErrorMessage(err: unknown): string | undefined`, used as `const message = getXErrorMessage(err); if (message) this.toastService.showError(message);`. Codes bound to a form field (returned as `{ kind: 'server', ... }` from `submit`) or shown as info toasts are checked explicitly before that call. When adding a mutation, look up which codes its backend handler (and the domain methods it calls) can return and add them to the feature's map.
- Typing: `core/models/tanstack-query.d.ts` registers `ProblemDetails` as TanStack's `defaultError`, so `onError: (err) => ...` and `mutation.error()` are already `ProblemDetails`. In `try/catch` the error is `unknown`; use `getErrorCode(err)` / `isProblemDetails(err)` from `core/utilities/problem-details-helpers.ts`, never `any` or `as ProblemDetails`.

### Forms
Uses Angular's Signal Forms API (`@angular/forms/signals`), not `ReactiveFormsModule`. The established pattern (see `features/auth/factories/auth-factories.ts`) is to extract form construction into a `factories/` module: a `createXForm(request: WritableSignal<T>)` function returns a `form(...)` built with validators (`required`, `email`, `debounce`, etc.), which the component then binds to its template via `[formField]` and submits via `submit(form, async () => {...})`. Frontend validators mirror the backend's FluentValidation rules; keep them in sync when either side changes.

### UI copy
All user-facing text is in Serbian and uses informal "ti" address (`Unesi`, `Osveži`, `Da li sigurno želiš...`), never formal "Vi" (`Unesite`, `Da li ste sigurni...`). The app is meant to feel personal, instructor-to-student. Prefer gender-neutral phrasing.

### Styling
Tailwind CSS v4 (`@import 'tailwindcss'` in `src/styles.css`, `@tailwindcss/postcss` plugin) — no Angular Material, no SCSS. Per-component `.css` files hold scoped styles alongside Tailwind utility classes used directly in templates.
