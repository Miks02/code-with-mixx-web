# CodeWithMixx Web

CodeWithMixx is a platform for managing private IT tutoring: subjects, students, individual classes, project work, payments and inquiries. It replaces manual record keeping (messages, spreadsheets, notes) with a single system that has a public website for prospective students and an administrative dashboard for the instructor.

This repository contains the web client. The backend is available at [code-with-mixx-api](https://github.com/Miks02/code-with-mixx-api).

## Purpose

- Present the tutoring services, pricing, subjects and the project itself on a public, search engine friendly website.
- Accept inquiries from visitors and forward them to the instructor.
- Give the instructor one place to manage subjects, students, class and project reservations, payments and analytics.
- Serve as a real world reference project for the technologies that are taught: from the database to the user interface.

## Technology Stack

- Angular 22 (standalone components, signals, Signal Forms)
- TypeScript
- Tailwind CSS v4
- TanStack Query
- Angular SSR with Express
- ApexCharts
- Vitest, ESLint (angular-eslint), Prettier

## Application Areas

The client consists of three areas that share one codebase:

| Area            | Path       | Access               | Rendering                       |
| --------------- | ---------- | -------------------- | ------------------------------- |
| Public site     | `/`        | Everyone             | Prerendered at build time (SSR) |
| Authentication  | `/auth/*`  | Guests only          | Client side                     |
| Admin dashboard | `/admin/*` | Authenticated admins | Client side                     |

**Public site:** home page (services, process, pricing, contact form), subject catalog, project overview, privacy policy and terms of service.

**Authentication:** login, forgot password, password reset and account activation through an invitation link.

**Admin dashboard:** analytics, subjects, students, class reservations, project reservations, payments and account settings including active session management.

## Architecture

### Project structure

```
src/app/
  core/       App wide singletons: guards, interceptors, services, models, utilities
  features/   Domain features (analytics, auth, classes, inquiries, payments,
              projects, reservations, settings, site, students, subjects)
  layouts/    Shell components for the site, auth and dashboard areas
  shared/     Reusable presentational components and pipes
```

Each feature contains its own components, pages, models, services, form factories and utilities, with admin only UI placed in an `admin/` subfolder. Features that are consumed by other features expose a public API through an `index.ts`
barrel. Module boundaries are enforced by ESLint: `core` and `shared` cannot import from features or layoport each other through their barrels.

The public site is organized by page. Each page component only composes its sections, which live next to it as separate components.

### Rendering

The application uses Angular SSR with an Express server. Render modes are configured per route:

- The public site is prerendered at build time, so search engines receive complete HTML without executing JavaScript.
- The admin and auth areas are rendered on the client only, since they depend on the user's session, which is not available on the server.

Public components are written to be SSR safe: browser only work (DOM access, third party libraries, eventrNextRender`, and the initial markup is deterministic to keep hydration consistent.

### State and data

- Application state is held in Angular signals (`signal`, `computed`). There is no NgRx or `BehaviorSubject` based store.
- Server state is fetched and cached with TanStack Query on top of `HttpClient` REST calls.
- Forms are built with the Signal Forms API. Form construction is extracted into factory functions, and cthe backend validation rules.

### Authentication

- The backend issues JWT access and refresh tokens as HttpOnly cookies. The client never reads or stores tokens.
- An HTTP interceptor sends credentials with every request. On a `401` response it rotates the tokens and rotation fails, the session is closed and the user is redirected to the login page.
- The session is resolved once at startup. Route access is controlled by synchronous functional guards (`authGuard`, `adminGuard`, `guestGuard`).

### Error handling

Every error from the backend arrives as an RFC 9457 ProblemDetails response with an `errorCode` extension (for example `Subject.AlreadyExists`). A dedicated interceptor normalizes all HTTP errors into this shape and displays generic messages
for general errors. Components handle only the domain specific codes they expect, using a per feature err

## Testing

Unit tests run on Vitest through Angular's unit test builder and cover guards, interceptors, core services and components.

## Code Conventions

- Path aliases (`@core`, `@features`, `@layouts`, `@shared`, `@environments`) instead of deep relative imports.
- `type` declarations instead of `interface`.
- Prettier formatting with a print width of 100 and single quotes.
- All user facing text is in Serbian.
