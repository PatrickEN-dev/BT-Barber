# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **pnpm** (see `pnpm-lock.yaml`). UI strings are in **Portuguese (pt-BR)**.

```bash
pnpm install                # installs deps; postinstall runs `prisma generate`
pnpm dev                    # next dev on :3000
pnpm build                  # next build
pnpm start                  # next start
pnpm lint                   # next lint (eslint-config-next)

# Prisma / DB
pnpm prisma migrate dev               # create/apply a migration locally
pnpm prisma generate                  # regenerate the client (also runs via `prepare` script)
pnpm prisma db seed                   # runs prisma/seed.ts (10 shops + 60 services)
npx ts-node prisma/seed-barbers.ts    # seeds 3 barbers per shop, idempotent (skips shops that already have barbers)
pnpm prisma studio                    # GUI for the DB
```

There are no automated tests in this repo — `pnpm lint` and a manual run of `pnpm dev` are the verification steps.

## Architecture

**Stack:** Next.js 14 App Router (RSC) + TypeScript (strict) + Tailwind + shadcn/ui (Radix) + Prisma 6 + PostgreSQL + NextAuth (Google) + Zustand + react-hook-form/Zod + sonner.

**Path alias:** `@/*` → repo root, so imports look like `@/app/_lib/auth`, `@/app/_components/ui/button`. shadcn `components.json` aliases components to `@/app/_components` and utils to `@/app/_lib/utils`.

### App Router layout conventions

Everything lives under `app/`. The codebase uses two folder conventions to keep route segments separate from co-located code:

- **Route groups** in parentheses, e.g. `app/(home)/` — URL is `/`, but groups its own `_components` and `_actions`.
- **Private folders** prefixed with `_` (Next ignores them in routing) used to co-locate code with the route or globally:
  - `app/_actions/` — global server actions (`"use server"`) for `barberShop`, `barbers`, `booking`.
  - `app/_components/` — shared components, including `ui/` (shadcn primitives) and `errors/`.
  - `app/_lib/` — `prisma.ts` (singleton `db` client cached on `global` in dev), `auth.ts` (NextAuth `authOptions`), `utils.ts` (`cn` helper).
  - `app/_providers/` — `auth.tsx` (SessionProvider) and `loading.tsx` (LoadingContext + `useLoading`).
  - `app/_hooks/`, `app/_utils/`, `app/_types/` — cross-cutting helpers and global type declarations (see `_types/_globals/*.d.ts`).
  - Routes also nest their own `_components`, `_actions`, `_hooks`, `_helpers` (e.g. `app/barbershop/[id]/_components/_BookingMenu/_hooks/`). Prefer co-locating new code at the deepest scope where it's used, and only promote it upward when reused.

Each route segment provides `loading.tsx` and `error.tsx`.

### Data layer

- `prisma/schema.prisma` defines `User`, `Barbershop`, `Service`, `Booking`, `BookingService`, `BarbershopOwner`, `Barber`. **Hard delete only** — `deletedAt` columns were removed (the column existed but no query honored it; foot-gun). Use `db.X.delete(...)` and trust `onDelete` cascades.
- **Booking is normalized**: `Booking` has `(userId, barbershopId, barberId, date)`, **without `serviceId`**. The services for a booking live in `BookingService` (junction table, `1 Booking → N services`). One physical reservation = one `Booking` row + N `BookingService` rows. Cancelling a `Booking` cascades into its services.
- **Two unique constraints on `Booking`** prevent double-booking by constraint (not by client check):
  - `@@unique([barberId, date])` — same barber can't be booked twice at the same instant.
  - `@@unique([userId, date])` — same client can't be in two places at once (different barbers, same time). Also covers the unique index that `(userId, date)` lookups would have used anyway.
  Both raise `P2002`. `saveBooking` catches `Prisma.PrismaClientKnownRequestError` with code `P2002` and rethrows `BookingSlotTakenError` (defined in `_actions/_errors.ts`, not in the action file — `"use server"` files cannot export classes).
- `Booking.barberId` is **NOT NULL** — the booking flow always picks a barber. There are no legacy `null` rows after the normalization migration.
- `Barber` ↔ `Service` is M:N via the implicit `_BarberServices` join table — a barber only does the services they're connected to. The booking flow filters services by the selected barber's offerings; do not assume all services are bookable with all barbers.
- **FK onDelete behavior** is explicit on every relation we created/edited:
  - `Booking.user` → `Cascade` (user deleted → bookings gone)
  - `Booking.barber` → `Cascade` (barber leaves shop → their bookings gone)
  - `Booking.barbershop` → `Restrict` (can't delete a shop with bookings)
  - `Service.barbershop` → `Cascade`, `Barber.barbershop` → `Cascade`
  - `BookingService.booking` → `Cascade`, `BookingService.service` → `Restrict` (can't delete a service that's on an active booking)
  - `Barbershop.owner` → `SetNull`
- **Indexes**: every FK we query has an index — `Booking(barbershopId, date)`, plus single-column indexes on `Service.barbershopId`, `Barber.barbershopId`, `Account.userId`, `Session.userId`, `Barbershop.ownerId`, and `BookingService.serviceId`. The unique constraints `(barberId, date)` and `(userId, date)` on `Booking` double as indexes for the lookups Prisma actually does. Postgres does not auto-index FKs; declare them in the schema.
- The Postgres datasource expects both `DATABASE_URL` and `DIRECT_URL` (Supabase pooler pattern).
- Always import the Prisma client from `@/app/_lib/prisma` (`import { db } from ...`). Do **not** instantiate `new PrismaClient()` directly — the file caches a single instance on `globalThis` to avoid connection storms in dev.
- Mutations live in server actions (`"use server"` at top of the file). After writes, call `revalidatePath("/")` and `revalidatePath("/bookings")` so the home and bookings pages refresh — see `app/_actions/booking.ts` and `app/barbershop/[id]/_actions/saveBooking.ts` for the pattern. **Server-action files can only export async functions** — non-function exports (classes, types-as-values, etc.) belong in sibling non-`"use server"` files (see `_actions/_errors.ts`).
- Seeds: `prisma/seed.ts` creates 10 `Barbershop` + 60 `Service` (6 per shop). `prisma/seed-barbers.ts` is a **separate idempotent script** that adds 3 `Barber` per shop with random rating + 3–5 connected services; it skips shops that already have barbers, so it's safe to re-run. Neither seed creates users, owners, or bookings.

### Auth model

NextAuth with `PrismaAdapter` and Google provider, configured in `app/_lib/auth.ts`. The session callback injects `user.id` onto `session.user`. The `Session.user` type is augmented in `app/_types/_globals/next-auth.d.ts`, so call sites use `session.user.id` directly (no `as any` cast).

There are **two layers** of route protection — pick the right one for the situation:

1. **`protectRoute()`** in `app/_utils/protectRoute.ts` — for **server components**: calls `getServerSession` and `redirect("/")` if no session. Used by `app/bookings/page.tsx`.
2. **`useAuthGuard` hook + `AuthGuard` wrapper** in `app/_hooks/useAuthGuard.ts` and `app/_components/AuthGuard.tsx` — for **client components**: returns `{ isAuthenticated, isLoading, checkAuthAndRedirect, redirectToLogin }` and shows a sonner toast on denied access. Use `checkAuthAndRedirect()` inside event handlers (see `BookingMenu.handleBookingSubmit`); use `<AuthGuard>` to gate an entire client subtree. There's also `app/_utils/authUtils.ts` with `withAuthCheck` / `validateUserSession` helpers for the same purpose.

Don't add yet another auth-check pattern — extend one of the above.

**Why there's no `middleware.ts`:** an earlier version had `withAuth` middleware protecting `/bookings/:path*`, but `withAuth` requires the **JWT** session strategy to decode the cookie. This app uses `PrismaAdapter` which defaults to **database** sessions (the cookie holds an opaque UUID, not a signed JWT), so the middleware always saw `token=null`, redirected to signin, and broke any in-app navigation to `/bookings` (e.g. the toast's "Visualizar reserva" link). `protectRoute()` server-side already covers `/bookings` and works correctly with database sessions, so the middleware was removed. **Don't reintroduce it without first switching to `session: { strategy: "jwt" }` in `authOptions`** — the two pieces are coupled.

### State management

Zustand stores are declared inline in the file that consumes them (no central `stores/` directory). The booking screen is the densest:

- `useStore` (sheet open/close), `useSelectedServices`, `useSelectedBarberStore` — all in `app/barbershop/[id]/_components/_ServiceComponent/model.ts`. Composed by the `useBarbershopServices()` hook.
- `useDateStore`, `useHourStore` — in `app/barbershop/[id]/_components/_hooks/useDate.ts`. **These are the canonical date/hour stores.**
- `dayBookingsStore` — in `app/barbershop/[id]/_components/_BookingMenu/_hooks/bookingMenuHook.ts`. Holds the bookings already on the calendar so `TimeListComponent` can grey out taken slots. **Per-barber filtered**: when a barber is selected, only bookings for that barber count as conflicts (see `getDayBookings`).

Global async loading state lives in the `LoadingProvider` context (`useLoading()`), not Zustand.

**Selection state contracts (mutate through `useBarbershopServices`, not the raw stores):**

- **Services:** call `toggleService(service)` (idempotent: adds if absent, removes if present) or `clearSelectedServices()`. `setSelectedServices` is exposed as an escape hatch but `toggleService` is what cards should use; it dedupes and uses a functional updater so rapid clicks don't drop selections.
- **Barber:** call `selectBarber(barber)` — a wrapper that `setSelectedBarber(barber)` **and** `clearSelectedServices()`, since services are filtered to a barber's offerings and stale selections from a previous barber would otherwise count toward the total. The raw `setSelectedBarber` is exposed but should not be used from UI code; profile-page and step-page handlers all use `selectBarber`.

`selectedBarber` and `selectedServices` are **global** Zustand state — they survive navigation. `BarbershopServices` resets both on `useEffect` only when `selectedBarber.barbershopId !== currentShop.id` (mismatch detection). This is intentional: clicking "Ver perfil" → "Selecionar este barbeiro" navigates `/barbershop/X` → `/barbershop/X/barbers/Y` → `/barbershop/X`, and an unmount-cleanup pattern would wipe the barber the profile button just set (especially under React 18 Strict Mode's mount/unmount/mount cycle).

### Barbershop booking flow shape (two-step)

`app/barbershop/[id]` renders `BarberShopInfos` followed by `BarbershopServices`. `BarbershopServices` is a **gate**: it renders one of two states based on `selectedBarber`.

1. **Barber step** (`selectedBarber == null`) — `BarberSelectStep` shows a list of `BarberCard`s. The first card is "Qualquer barbeiro" (clicking it picks a random barber via `selectBarber`). Each barber card has a "Ver perfil" link to `/barbershop/[id]/barbers/[barberId]` — clicking the link does NOT select the barber (the link `stopPropagation`s the card's click), but the profile page has its own "Selecionar este barbeiro" button that calls `selectBarber` and routes back. **One click anywhere else on a barber card selects** them and advances to the service step.

2. **Service step** (`selectedBarber != null`) — services list filtered to `selectedBarber.services`, "Trocar barbeiro" link in the header (clears barber + services), sticky footer with running total + "Reservar" button. **The `<Sheet>` + `<BookingMenu>` is mounted exactly once**, next to "Reservar" — not per service card. If you find yourself adding a `<Sheet>` inside `ServiceCard.tsx`, you're recreating an earlier bug (N sheets sharing one open-state, N redundant `getDayBookings` calls).

`ServiceCard` is a dumb checkbox: reads `isServiceSelected(service.id)`, calls `toggleService(service)` on change. The "Reservar" button is disabled when `selectedServices.length === 0`.

A booking submit calls `saveBooking` **once** with `serviceIds: string[]` — the action creates one `Booking` row plus N `BookingService` rows in a single Prisma `create` (atomic). Multi-service is **not** N parallel calls anymore (the previous design produced N `Booking` rows that broke `@@unique([barberId, date])`). After success, both `selectedServices` and the date/hour are cleared; `selectedBarber` is **kept** (lets the user immediately make a follow-up booking with the same barber if they want).

If the slot is taken between the calendar render and submit, Postgres returns `P2002` on the unique constraint and the action throws `BookingSlotTakenError` (from `_actions/_errors.ts`). `BookingMenu` catches it and shows a sonner error toast.

### Data loaders for the booking flow

Two server actions, both in `app/barbershop/[id]/_actions/`:

- `findBarbershopWithBarbers(id)` → shop + `Service[]` + `Barbers` (ordered by rating desc, including each barber's `services`). Used by the route's `page.tsx` and exports the `BarbershopWithBarbers` and `BarberWithServices` types that the Zustand store types against.
- `findBarberWithServices(barberId, barbershopId)` (in the nested `barbers/[barberId]/_actions/`) → barber + services + `{ barbershop: { id, name } }`. Used by the profile page; double-keyed lookup so a barber from another shop can't be opened via URL.

The legacy `findUniqueBarberShop` was removed — `findBarbershopWithBarbers` is its replacement and includes the barbers data the new flow needs.

### Decimal serialization across the RSC boundary

`Service.price` is `Prisma.Decimal` — a class instance, not a plain object. Passing it from a Server Component to a Client Component triggers Next 14's `Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.` warning. **Always serialize at the data-loader boundary**, not inside components.

The convention lives in `app/_lib/serializers.ts`:

- `serializeService(service)` → `SerializedService` (`Omit<Service, "price"> & { price: string }`).
- `serializeBookingWithRelations(booking)` → `SerializedBookingWithRelations` (a Booking with `barbershop`, `barber`, and `services: Array<{ ..., service: SerializedService }>` — the M:N junction expanded with serialized prices).

Every server action that returns a `Service` (directly or nested under barbers/bookings) maps the result through one of these. Type aliases derived via `Awaited<ReturnType<typeof X>>` give the rest of the codebase the right shapes without manual annotation. Consumers (Zustand store, `ServiceCard`, `BookingsList`, `BookingDetails`, etc.) type against `SerializedService` rather than Prisma's `Service`.

If you add a new server action that returns rows containing `price`, run them through `serializeService` before returning. Forgetting this won't fail the build — it shows up at runtime as the warning above when the value crosses into a `"use client"` component.

### Booking timeslots

`app/barbershop/[id]/_helpers/hours.ts` (`generateDayTimeList`) hardcodes a **45-minute interval** ending at **21:00**, starting one hour after "now". Two known caveats if you touch this:

- The 45-min/21:00 are global constants — should be per-barbershop config eventually.
- The "start" is always relative to *now*, not to the picked date. So picking a future day still starts the slot list at "1h from current wall-clock time" instead of opening hour. UX bug, not yet fixed.

Slot conflicts are computed per-barber: `getDayBookings(barbershopId, date, barberId)` filters by `barberId` when one is passed. A booking with barber A at 14:00 does NOT block barber B at 14:00 — the calendar correctly shows different availability per barber.

### Images

`next.config.mjs` only whitelists `utfs.io` for `next/image` remote patterns. Add new hosts there before importing remote images.

## Environment

Required env vars (see `.env.example` and `app/_types/_globals/env.d.ts`):

```
DATABASE_URL=          # Postgres connection (pooled, port 6543)
DIRECT_URL=            # Postgres direct connection (port 5432, used by Prisma migrations)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=       # canonical name (no underscore between NEXT and AUTH)
```

**Heads-up on `NEXTAUTH_SECRET`:** NextAuth (and any v4 helper that needs to decode the cookie) reads `process.env.NEXTAUTH_SECRET` by default. An earlier version of this repo used `NEXT_AUTH_SECRET` with an underscore, which made `authOptions.secret = process.env.NEXT_AUTH_SECRET` work but caused middleware/edge helpers to silently fail with `[next-auth][error][NO_SECRET]`. Stick with the canonical name.

The auth route handler (`app/api/auth/[...nextauth]/route.ts`) **throws at import time** if `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is missing — the dev server will fail to start without them.

A Supabase MCP server is configured in `.mcp.json` for this project, so Supabase tools (SQL, migrations, advisors, types) are available when working against the live DB.

**MCP `project_ref` and `.env` `DATABASE_URL` must point to the same Supabase project.** The `project_ref` query param in `.mcp.json` and the project ref baked into `DATABASE_URL`/`DIRECT_URL` are independent — if they drift, the app reads from one DB while the MCP shows another. If `mcp__supabase__list_tables` returns an empty `public` schema, suspect this drift before suspecting that migrations didn't run.

**Supabase IPv4 caveat (sa-east-1):** the legacy direct host `db.<ref>.supabase.co:5432` is IPv6-only on this project, so on an IPv4-only network Prisma fails with `P1001`. Use the pooler hostnames instead:

- `DATABASE_URL` → `aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` (transaction pooler, runtime)
- `DIRECT_URL` → `aws-1-sa-east-1.pooler.supabase.com:5432/postgres` (session pooler, used by `prisma migrate`)

The username for pooler URLs is `postgres.<project_ref>` (not just `postgres`). The Supabase dashboard sometimes only surfaces the transaction pooler — the session pooler is the same host with port `5432`.

## Conventions

- Server actions only — there are no REST handlers under `app/api/` other than NextAuth. New mutations should be `"use server"` files in the nearest `_actions/` folder.
- Dates use `date-fns` with `ptBR` locale for any user-facing formatting.
- Toasts use `sonner` (`import { toast } from "sonner"`); the `<Toaster />` is mounted in the root layout.
- The root layout forces dark mode via `className="... dark"` on `<body>` — design accordingly.
