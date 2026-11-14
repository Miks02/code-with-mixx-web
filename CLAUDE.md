# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run the dev server (`ng serve`)
- `npm run build` — production build (`ng build`)
- `npm run watch` — dev build in watch mode
- `npm run serve:ssr:code-with-mixx-web` — run the built SSR server (`node dist/code-with-mixx-web/server/server.mjs`, port `PORT` or 4000); requires `npm run build` first. `npm start` also goes through the SSR pipeline in dev, so server-side errors show up in the `ng serve` terminal.
- `npm test` — run unit tests (Vitest via Angular's native `@angular/build:unit-test` builder, not Karma/Jasmine — spec files use Jasmine-style `describe/it/expect` syntax, which Vitest supports)
- Run a single test file: `npm test -- --include src/app/core/services/auth-service.spec.ts --watch=false`
- `npm run lint` — ESLint via angular-eslint (`eslint.config.js`); `npx eslint src --fix` to autofix. Enforces `type` over `interface`, alias imports instead of `../../`, and module boundaries (shared/core must not import features/layouts; other features only via their `index.ts` barrel). Formatting is via Prettier (`.prettierrc`: 100 print width, single quotes, Angular parser for `.html`).
- No e2e framework is configured.

## Architecture

Angular 22 standalone-component app (no NgModules), using the esbuild/Vite-based `@angular/build:application` builder with `@angular/ssr` (`outputMode: 'server'`, Express entry in `src/server.ts`). Package manager is npm (`package-lock.json`).

The app has three areas sharing one codebase: the **public site** (`/`, open to everyone, the part meant to be server-rendered for SEO), the **auth pages** (`/auth/*`, guests only) and the **admin dashboard** (`/admin/*`). See "SSR" below before writing anything that renders on the public site.

### Feature-folder structure (`src/app/`)
- `core/` — app-wide singletons and cross-cutting concerns: `guard/` (functional `CanActivateFn` guards), `interceptors/`, `services/` (`AuthService`, `UserState`, `ToastService`, `DialogService`), `components/` (`dialog/`, `toast/`, mounted dynamically by their services via `ComponentMounter`), `models/`, `utilities/`.
- `features/<name>/` — domain features (`analytics`, `auth`, `classes`, `payments`, `projects`, `reservations`, `settings`, `site`, `students`, `subjects`). Each has some of: `components/`, `pages/`, `models/`, `services/`, `factories/`, `utilities/`, plus an `admin/` subfolder (`admin/components/`, `admin/pages/`) for admin-only UI. Features consumed by other features expose a public API through `index.ts`.
- `features/site/` — the public site. Unlike the domain features it is organized by page: `pages/<page>/` holds the page component, and that page's sections live in `pages/<page>/components/<section>/` (e.g. `pages/home/components/hero/`). A page component only composes its sections.
- `layouts/` — shell components composed into the route tree: `layouts/site/` (`site-layout/` + `navbar/`) for the public site, `layouts/auth/auth-layout/` for guest-only auth routes, `layouts/dashboard/` (`dashboard-layout/`, `header/`, `sidebar/`, `sidebar-link/`) for authenticated routes. Layouts are the smart part (inject `AuthService`/`UserState`); pieces like `Navbar` stay presentational (`isAuthenticated` input, `logout` output).
- `shared/` — generic reusable building blocks: presentational components in `shared/components/` (e.g. `shared/components/button/`), built with signal-based `input()`/`output()` APIs and Tailwind utility classes composed via `computed()`; pipes in `shared/pipes/`.

### Import aliases
Path aliases are defined in `tsconfig.json` `paths`: `@core/*`, `@features/*`, `@layouts/*`, `@shared/*`, `@environments/*`. Convention: use an alias for anything outside the current module (a module = `core`, `shared`, `layouts`, or a single `features/<name>`), and for any import that would need `../../` or deeper; plain relative imports (`./`, `../`) only for nearby files within the same module. Another feature is imported only through its barrel (`@features/reservations`), never its internals.

### Routing & guards (`src/app/app.routes.ts`)
Three lazy-loaded (`loadComponent`) top-level branches:
- `''` → `SiteLayout`, no guard (public): `home` (the empty path redirects to it). New public pages go here.
- `'auth'` → `AuthLayout`, guarded by `guestGuard`: `login`, `forgot-password`, `reset-password` (also `resetPasswordGuardGuard`, requires `token` + `userId` query params), `activate-account`.
- `'admin'` → `DashboardLayout`, guarded by `[authGuard, adminGuard]`: `analytics`, `subjects`, `students`, `projects` and `classes` (each with `create` and `details/:id`), `settings`.

Auth routes live under the `/auth` prefix (`/auth/login`, not `/login`) since the root path belongs to the public site; links and redirects must use the prefixed paths.

Every route sets its browser tab title with `title: pageTitle('...')` (helper in `app.routes.ts`, produces `Page • CodeWithMixx`).

Guards live in `core/guard/` and are synchronous signal checks against `UserState` (`isAuthenticated()`, `isAdmin()`). The session is resolved once at startup by `provideAppInitializer(() => inject(AuthService).checkSession())`, which calls `GET /auth/me` only in the browser and only if a `Session` cookie is present.

### SSR (`@angular/ssr`)
- **Files**: `src/main.server.ts` (server bootstrap), `src/server.ts` (Express: static files from `dist/.../browser`, everything else through `AngularNodeAppEngine`), `app.config.server.ts` (merges `appConfig` with `provideServerRendering(withRoutes(serverRoutes))`), `app.routes.server.ts` (per-route render mode). `app.config.ts` has `provideClientHydration()`.
- **Render modes** (`app.routes.server.ts`): the admin and auth areas must stay `RenderMode.Client` — they depend on the user's session, which the server does not have. Matching is per full path, most specific entry wins (exact segment, then `:param`/`*`, then `**`), and order in the array does not matter. A path without a wildcard matches only that exact URL: `admin` covers `/admin` but not `/admin/analytics`, which falls through to `**`; a whole subtree needs `admin/**` (which also covers `/admin` itself). The entries are `admin/**` and `auth/**` (`RenderMode.Client`) and `**` (`RenderMode.Prerender`), so every public site route is prerendered at build time by default. A public page that needs fresh data per request gets its own `RenderMode.Server` entry; a public route with a `:param` needs `getPrerenderParams` or `RenderMode.Server`.
- **The server never knows the user**: `checkSession()` returns early when not in the browser, so on the server `UserState` is always empty and the page renders as logged out. Public pages must render correctly as a guest; anything auth-dependent (e.g. the navbar's "Prijava" vs. profile buttons) only settles after hydration. Don't put a guard that needs the session on a server-rendered route.
- **Public components must be SSR-safe**: no `window`/`document`/`localStorage`/`navigator` during construction, field initializers or `ngOnInit`. Browser-only work (DOM measuring, third-party libs like Vanta/three.js, listeners) goes in `afterNextRender(...)`, as in `features/site/pages/home/components/hero/hero.ts`. Where the document is needed outside a render callback, `inject(DOCUMENT)` plus `isPlatformBrowser(inject(PLATFORM_ID))` (see `AuthService.checkSession`). Bare `window`/`document` is fine only in code that runs strictly from user events or in client-rendered areas.
- **Hydration**: server and client must produce the same DOM for the initial render — no `Math.random()`/`Date.now()`-dependent markup, no manual DOM manipulation of Angular-rendered nodes.
- **Data on public pages**: fetch through the usual `HttpClient` + TanStack Query pattern, but only from public (anonymous) endpoints — the HttpOnly auth cookies are not forwarded during server rendering.
- **SEO**: each public route needs a meaningful `pageTitle(...)`; page-specific meta tags go through Angular's `Meta` service. `src/index.html` holds the shared head.
- `angular.json` has `security.allowedHosts: []`; the production hostname has to be allowed there (or via the deploy config) for SSR to serve requests on a real domain.

### Auth & state management
- **State**: Angular signals (`signal`/`computed`) — no NgRx, no RxJS `BehaviorSubject` services. `UserState` (`core/services/user-state.ts`) holds `_userDetails` as a signal and derives `userDetails`, `fullName`, `userRoles`, `isAuthenticated`, `isAdmin`, `activeSessions`, ... via `computed()`, plus the `update*` methods that patch it. `AuthService` (`core/services/auth-service.ts`) owns the auth HTTP calls/mutations and writes the result into `UserState`. Services use Angular's `@Service()` decorator.
- **Server state**: `@tanstack/angular-query-experimental` (`injectQuery`/`injectMutation`) wraps plain REST `HttpClient` calls (bridged to promises via `lastValueFrom`) — despite names like `getMeQuery`, this is REST, not GraphQL/Apollo. `QueryClient` is configured in `app.config.ts` (5 min stale time, no retry on 4xx).
- **Auth transport**: the backend sets JWT access/refresh tokens as HttpOnly cookies (plus a readable `Session` cookie); the frontend never touches tokens or localStorage. `authInterceptor` adds `withCredentials: true` to every request; on a 401 it calls `rotateTokens()` and retries once, and if rotation fails `handleSessionExpired()` logs out and redirects to `/auth/login?expired=true`. Requests that must not trigger this (reset password, account activation, rotation itself) set the `SKIP_AUTH_RETRY` `HttpContextToken`.
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
Tailwind CSS v4 (`@import 'tailwindcss'` in `src/styles.css`, `@tailwindcss/postcss` plugin) — no Angular Material, no SCSS. Per-component `.css` files hold scoped styles alongside Tailwind utility classes used directly in templates. Icons come from `@ng-icons` (Font Awesome set, registered per component with `provideIcons`). The palette is emerald (dark `emerald-950/900` surfaces) with amber accents; the font is Outfit (`src/styles.css`).
