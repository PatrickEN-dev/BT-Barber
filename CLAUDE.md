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
npx ts-node prisma/seed-products.ts            # seeds 11 products per shop, idempotent (skips shops that already have products)
npx ts-node prisma/seed-products.ts --reset    # wipes OrderItem + Order + Product first, then re-seeds
pnpm prisma studio                    # GUI for the DB
```

There are no automated tests in this repo — `pnpm lint` and a manual run of `pnpm dev` are the verification steps.

## Architecture

**Stack:** Next.js 14 App Router (RSC) + TypeScript (strict) + Tailwind + shadcn/ui (Radix) + Prisma 6 + PostgreSQL + NextAuth (Google) + Zustand (with `persist` middleware) + react-hook-form/Zod + sonner + next-themes + Sora font.

**Path alias:** `@/*` → repo root, so imports look like `@/app/_lib/auth`, `@/app/_components/ui/button`. shadcn `components.json` aliases components to `@/app/_components` and utils to `@/app/_lib/utils`.

### App Router layout conventions

Everything lives under `app/`. The codebase uses two folder conventions to keep route segments separate from co-located code:

- **Route groups** in parentheses, e.g. `app/(home)/` — URL is `/`, but groups its own `_components` and `_actions`.
- **Private folders** prefixed with `_` (Next ignores them in routing) used to co-locate code with the route or globally:
  - `app/_actions/` — global server actions (`"use server"`): `barberShop`, `booking`, `order`, `product`, `user`. Errors live in `_errors.ts` (a non-`"use server"` file — server-action files cannot export classes).
  - `app/_components/` — shared components, including `ui/` (shadcn primitives), `desktop/` (desktop-only shells like `DesktopTopNav`), `errors/`, `orders/`, and `skeletons/`.
  - `app/_lib/` — `prisma.ts` (singleton `db` client cached on `global` in dev), `auth.ts` (NextAuth `authOptions`), `utils.ts` (`cn` helper), `serializers.ts` (Decimal → string serializers).
  - `app/_providers/` — `auth.tsx` (SessionProvider), `loading.tsx` (LoadingContext + `useLoading`), `theme.tsx` (next-themes wrapper).
  - `app/_stores/` — Zustand stores that need to be shared across multiple routes (currently `cart.ts` for the shop feature).
  - `app/_hooks/`, `app/_utils/`, `app/_types/` — cross-cutting helpers and global type declarations (see `_types/_globals/*.d.ts`).
  - Routes also nest their own `_components`, `_actions`, `_hooks`, `_helpers` (e.g. `app/barbershop/[id]/_components/_BookingMenu/_hooks/`). Prefer co-locating new code at the deepest scope where it's used, and only promote it upward when reused.

Each route segment provides `loading.tsx` and `error.tsx`.

### Data layer

- `prisma/schema.prisma` defines `User`, `Barbershop`, `Service`, `Booking`, `BookingService`, `Barber`, `BarberBlock`, `BarberClientNote`, `Product`, `Order`, `OrderItem`. **Hard delete only** — `deletedAt` columns were removed (the column existed but no query honored it; foot-gun). Use `db.X.delete(...)` and trust `onDelete` cascades.
- **Enums:** `UserRole` (CUSTOMER | OWNER | BARBER), `Theme` (LIGHT | DARK | SYSTEM), `ProductCategory` (DRINK | HAIR_CARE | BEARD_CARE | ACCESSORY | OTHER), `OrderStatus` (PENDING | CONFIRMED | READY | COMPLETED | CANCELLED).
- **Booking is normalized**: `Booking` has `(userId, barbershopId, barberId, date)`, **without `serviceId`**. The services for a booking live in `BookingService` (junction table, `1 Booking → N services`). One physical reservation = one `Booking` row + N `BookingService` rows. Cancelling a `Booking` cascades into its services.
- **Two unique constraints on `Booking`** prevent double-booking by constraint (not by client check):
  - `@@unique([barberId, date])` — same barber can't be booked twice at the same instant.
  - `@@unique([userId, date])` — same client can't be in two places at once (different barbers, same time). Also covers the unique index that `(userId, date)` lookups would have used anyway.
  Both raise `P2002`. `saveBooking` catches `Prisma.PrismaClientKnownRequestError` with code `P2002` and rethrows `BookingSlotTakenError` (defined in `app/barbershop/[id]/_actions/_errors.ts`, not in the action file — `"use server"` files cannot export classes).
- `Booking.barberId` is **NOT NULL** — the booking flow always picks a barber. There are no legacy `null` rows after the normalization migration.
- `Barber` ↔ `Service` is M:N via the implicit `_BarberServices` join table — a barber only does the services they're connected to. The booking flow filters services by the selected barber's offerings; do not assume all services are bookable with all barbers.
- **FK onDelete behavior** is explicit on every relation we created/edited:
  - `Booking.user` → `Cascade`, `Booking.barber` → `Cascade`, `Booking.barbershop` → `Restrict`
  - `Service.barbershop` → `Cascade`, `Barber.barbershop` → `Cascade`
  - `BookingService.booking` → `Cascade`, `BookingService.service` → `Restrict`
  - `Barbershop.owner` → `SetNull`
  - `Product.barbershop` → `Cascade`
  - `Order.user` → `Cascade`, `Order.barbershop` → `Restrict`
  - `OrderItem.order` → `Cascade`, `OrderItem.product` → `Restrict` (preserves order history; deleting a referenced product does soft-delete instead — see `deleteProduct` in `_actions/product.ts`)
- **Indexes**: every FK we query has an index — `Booking(barbershopId, date)`, `Product(barbershopId)`, `Product(barbershopId, active)`, `Product(barbershopId, category)`, `Order(userId)`, `Order(barbershopId, status)`, `Order(barbershopId, createdAt)`, plus single-column indexes on `Service.barbershopId`, `Barber.barbershopId`, `Account.userId`, `Session.userId`, `Barbershop.ownerId`, `BookingService.serviceId`, `OrderItem.orderId`, `OrderItem.productId`. The unique constraints `(barberId, date)` and `(userId, date)` on `Booking` double as indexes for the lookups Prisma actually does. Postgres does not auto-index FKs; declare them in the schema.
- The Postgres datasource expects both `DATABASE_URL` and `DIRECT_URL` (Supabase pooler pattern).
- Always import the Prisma client from `@/app/_lib/prisma` (`import { db } from ...`). Do **not** instantiate `new PrismaClient()` directly — the file caches a single instance on `globalThis` to avoid connection storms in dev.
- Mutations live in server actions (`"use server"` at top of the file). After writes, call `revalidatePath(...)` for affected routes — see `app/_actions/booking.ts`, `app/_actions/order.ts` and `app/_actions/product.ts` for the pattern. **Server-action files can only export async functions** — non-function exports (classes, types-as-values, etc.) belong in sibling non-`"use server"` files (see `app/_actions/_errors.ts`).
- **Seeds:**
  - `prisma/seed.ts` creates 10 `Barbershop` + 60 `Service` (6 per shop).
  - `prisma/seed-barbers.ts` adds 3 `Barber` per shop with random rating + 3–5 connected services. Idempotent (skips shops that already have barbers).
  - `prisma/seed-products.ts` adds 11 `Product` per shop (4 drinks + 4 hair-care + 2 beard-care + 1 accessory) with verified Wikimedia Commons image URLs. Idempotent skip by default; pass `--reset` to wipe `OrderItem` + `Order` + `Product` and re-create. Run only after `seed.ts`.
  - None of the seeds create users, owners, sessions, or bookings.

### Auth model

NextAuth with `PrismaAdapter` and Google provider, configured in `app/_lib/auth.ts`. The session callback fetches `role` and `theme` from `User` and injects them onto `session.user` along with `id`. The `Session.user` type is augmented in `app/_types/_globals/next-auth.d.ts` (`role: UserRole`, `theme: Theme`), so call sites use `session.user.id`/`role`/`theme` directly without casts. `debug: true` is enabled only when `NODE_ENV === "development"`.

Three layers of route protection — pick the right one for the situation:

1. **`protectRoute()` / `requireCustomer()`** in `app/_utils/protectRoute.ts` and `app/_utils/redirectIfOwner.ts` — for **server components**: call `getServerSession` and `redirect("/")` if no session. Used by `app/bookings/page.tsx`, `app/profile/page.tsx`, `app/orders/page.tsx`.
2. **`requireOwner()` / `requireShopAccess(shopId)`** in `app/admin/_utils/requireOwner.ts` — for **owner-only server pages** (admin/`[shopId]`/*): redirects non-owners and returns `{ user, shop }` with the validated shop.
3. **`useAuthGuard()` hook** in `app/_hooks/useAuthGuard.ts` — for **client event handlers** that need auth before proceeding. Returns `{ user, session, isAuthenticated, isLoading, ensureAuth }`. Call `ensureAuth()` inside the handler — if not authenticated, it triggers `signIn("google", { callbackUrl: <current url> })` automatically (no toast, no manual redirect). The user comes back to the same page after Google OAuth completes. Used by `BarbershopServices.openSheetAndVerifyUser` (the "Reservar" button) and `BookingMenu.handleBookingSubmit` (final booking submit) and `CartSheet.handleCheckout` (shop order submit).

Don't add a fourth pattern. The deleted relics from the old design (`app/_components/AuthGuard.tsx`, `app/_utils/authUtils.ts`, `app/_utils/verifyAuthentication.ts`) are gone — don't reintroduce them.

**Why `ensureAuth()` triggers `signIn("google")` directly instead of redirecting to `/`:** the previous flow showed a "Acesso negado" toast and `router.push("/")`, which forced the user to find the login button on the home page. Going straight to Google with `callbackUrl` is one less click and lands them back where they were trying to act. Don't add toast warnings before — `signIn` redirects the page immediately and the toast wouldn't render anyway.

**Why there's no `middleware.ts`:** an earlier version had `withAuth` middleware protecting `/bookings/:path*`, but `withAuth` requires the **JWT** session strategy to decode the cookie. This app uses `PrismaAdapter` which defaults to **database** sessions (the cookie holds an opaque UUID, not a signed JWT), so the middleware always saw `token=null`, redirected to signin, and broke any in-app navigation to `/bookings` (e.g. the toast's "Visualizar reserva" link). `protectRoute()` server-side already covers `/bookings` and works correctly with database sessions, so the middleware was removed. **Don't reintroduce it without first switching to `session: { strategy: "jwt" }` in `authOptions`** — the two pieces are coupled.

### Theme system

`next-themes` drives light/dark, with the user's preference persisted to `User.theme` (enum `LIGHT | DARK | SYSTEM`).

- Provider: `app/_providers/theme.tsx` mounts `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>` in the root layout.
- Sync DB → next-themes: `app/_components/ThemeSync.tsx` is a null-rendering client component mounted under `AuthProvider`. On the first authenticated session it calls `setTheme(session.user.theme.toLowerCase())` once (tracked by `hasSyncedRef` keyed on user id) so subsequent local toggles don't get clobbered.
- Toggle UI: `app/_components/ThemeToggle.tsx` exposes `variant="icon" | "full"`. When the user is logged in, every toggle fires `updateUserTheme(theme)` (server action in `app/_actions/user.ts`) inside `useTransition` so the click stays responsive. Anonymous users still get the local `next-themes` localStorage persistence.
- Tokens: `app/globals.css` defines two complete CSS-variable palettes — light (warm beige/coffee/caramel/cognac) and dark (slate gray/electric blue/cyan). Tokens (`--background`, `--foreground`, `--primary`, `--accent`, etc.) flip with the `.dark` class.
- Body: `body { @apply flex min-h-screen flex-col bg-background ... }` — `flex flex-col` is required so `Footer`'s `mt-auto` sticks the footer to the bottom of short pages.

### Responsive strategy: CSS-driven mobile/desktop split

The app has two UIs, switched at the `lg:` breakpoint (1024px) **purely by CSS** — never by `useWindowSize` / UA detection / dynamic import. Both versions render in the HTML; `hidden lg:block` and `lg:hidden` decide which is visible. This avoids hydration mismatches and keeps RSC streaming clean.

- **Container** (`app/_components/Container.tsx`) is the canonical width-limiting wrapper: `mx-auto px-5 lg:px-8` with `size="default" | "narrow" | "wide" | "full"` (max widths `7xl` / `3xl` / `1500px` / none) and `as` polymorphic prop accepting any HTML5 sectioning element.
- **DesktopTopNav** (`app/_components/desktop/DesktopTopNav.tsx`) is a parameterized horizontal top nav (`hidden lg:block`). Takes `brand` (left), `items: NavItem[]` (centered nav links with active underline), `centerSlot` (optional, e.g. global search), `trailing` (right, theme + user). `NavItem` supports `matchPaths?: string[]` for routes that should highlight the same item (e.g. `/admin/[shopId]/orders` and `/admin/[shopId]/products` both light up "Loja").
- **Customer Header** (`app/_components/Header.tsx`) renders `<DesktopTopNav>` for `lg+` and a compact mobile sticky header (logo + theme + hamburger Sheet) for `<lg`, side by side in JSX.
- **Admin Header** (`app/admin/[shopId]/_components/AdminHeader.tsx`) follows the same pattern: `<DesktopTopNav>` with shop badge as `brand` + 6 nav items + theme/avatar trailing for desktop, plus the mobile sticky-header-with-Sheet for `<lg`.
- **Admin Bottom Nav** (`app/admin/[shopId]/_components/AdminBottomNav.tsx`) is `lg:hidden` — the desktop nav lives in the top bar.
- **Pages** with significantly different desktop layouts have separate components, e.g. `app/(home)/_components/HomeMobile.tsx` and `HomeDesktop.tsx`, both rendered by `app/(home)/page.tsx` with `lg:hidden` / `hidden lg:block`. Pages that just need width constraints wrap content in `<Container>` and use `lg:` modifiers inline.
- **Hero/sticky bars** mirror the same pattern: e.g. `BarberShopInfos` shows mobile info block (`lg:hidden`) and a desktop overlay over the hero (`hidden lg:block` inside an absolutely-positioned Container).

When adding a new page, default to inline `lg:` modifiers (Container + responsive grid). Only split into Mobile/Desktop files when the layouts diverge structurally (e.g. mobile bottom-bar vs desktop sticky sidebar).

### State management

Zustand stores live close to their consumers — no central `stores/` directory unless they cross route boundaries.

- **Booking flow stores** (`app/barbershop/[id]/_components/_ServiceComponent/model.ts`): `useStore` (sheet open/close), `useSelectedServices`, `useSelectedBarberStore`, all composed by the `useBarbershopServices()` hook.
- **Date/hour stores** (`app/barbershop/[id]/_components/_hooks/useDate.ts`): `useDateStore`, `useHourStore`. Canonical.
- **Day bookings store** (`app/barbershop/[id]/_components/_BookingMenu/_hooks/bookingMenuHook.ts`): `dayBookingsStore`. Holds the bookings already on the calendar so `TimeListComponent` can grey out taken slots. **Per-barber filtered**: when a barber is selected, only that barber's bookings count as conflicts (see `getDayBookings`).
- **Cart store** (`app/_stores/cart.ts`, persisted to localStorage as `btbarber-cart`): the single store that crosses route boundaries. `barbershopId` + `items: CartItem[]`. Cart is **per-shop** — adding a product from a different shop sets `pendingShop`/`pendingProduct` and the user must confirm via `<SwitchCartShopDialog>` (the cart wipes on confirm). Mutators: `addItem`, `removeItem`, `setQuantity`, `increment`, `decrement`, `clear`. Selector: `useCartTotals()` returns `{ count, total }`.

Global async loading state lives in the `LoadingProvider` context (`useLoading()`), not Zustand.

**Selection state contracts (mutate through `useBarbershopServices`, not the raw stores):**

- **Services:** call `toggleService(service)` (idempotent: adds if absent, removes if present) or `clearSelectedServices()`. `setSelectedServices` is exposed as an escape hatch but `toggleService` is what cards should use; it dedupes and uses a functional updater so rapid clicks don't drop selections.
- **Barber:** call `selectBarber(barber)` — a wrapper that `setSelectedBarber(barber)` **and** `clearSelectedServices()`, since services are filtered to a barber's offerings and stale selections from a previous barber would otherwise count toward the total. The raw `setSelectedBarber` is exposed but should not be used from UI code; profile-page and step-page handlers all use `selectBarber`.

`selectedBarber` and `selectedServices` are **global** Zustand state — they survive navigation. `BarbershopServices` resets both on `useEffect` only when `selectedBarber.barbershopId !== currentShop.id` (mismatch detection). This is intentional: clicking "Ver perfil" → "Selecionar este barbeiro" navigates `/barbershop/X` → `/barbershop/X/barbers/Y` → `/barbershop/X`, and an unmount-cleanup pattern would wipe the barber the profile button just set (especially under React 18 Strict Mode's mount/unmount/mount cycle).

### Barbershop detail page (Serviços + Loja tabs)

`app/barbershop/[id]` renders `BarberShopInfos` (hero with desktop overlay) followed by `BarbershopTabs`.

`BarbershopTabs` (`app/barbershop/[id]/_components/BarbershopTabs.tsx`) gates on `barbershopData.hasShop`:

- If `false`: renders only `<BarbershopServices>` (no tabs at all).
- If `true`: renders `<Tabs>` with two `<TabsContent forceMount>` panels ("Serviços" and "Loja"). `forceMount` keeps both subtrees alive when switching tabs so the Zustand stores in the booking flow and the cart don't lose state. `<FloatingCartButton>` is mounted once at the page level; it's only visible when the cart has items from this shop.

#### Booking flow (Serviços tab) — two-step

`BarbershopServices` is a **gate**: it renders one of two states based on `selectedBarber`.

1. **Barber step** (`selectedBarber == null`) — `BarberSelectStep` shows a grid of `BarberCard`s (`grid-cols-2 lg:grid-cols-2 xl:grid-cols-3`). The first card is "Qualquer barbeiro" (clicking it picks a random barber via `selectBarber`). Each barber card has a "Ver perfil" link to `/barbershop/[id]/barbers/[barberId]` — clicking the link does NOT select the barber (the link `stopPropagation`s the card's click), but the profile page has its own "Selecionar este barbeiro" button that calls `selectBarber` and routes back. **One click anywhere else on a barber card selects** them and advances to the service step.

2. **Service step** (`selectedBarber != null`) — services list filtered to `selectedBarber.services`, "Trocar barbeiro" link in the header (clears barber + services). Layout differs by viewport:
   - **Desktop (`lg:`)**: 2-col `[1fr_360px]` grid — services list on the left, sticky summary card on the right (`top-24`) with selected services list, total, and "Reservar" button.
   - **Mobile**: services list, then a sticky bottom bar (`sticky bottom-0 lg:hidden`) with total + "Reservar".
   - **The `<Sheet>` + `<BookingMenu>` is mounted exactly once** at the root of `BarbershopServices`, not per service card or per CTA. Both desktop and mobile triggers control the same Sheet via the controlled `open`/`onOpenChange` props on the shared `<Sheet>` parent.

`ServiceCard` (`_ServiceCardComponents/_BarberShopServiceCard/ServiceCard.tsx`) is a `<button role="checkbox" aria-checked={...}>` — click anywhere on the card toggles selection. Selected state shows a filled accent circle with a check icon, accent border + glow, accent gradient overlay, and the price color shifts from `text-primary` to `text-accent`. **Don't put a separate `<Checkbox>` inside the card** — the entire card is the toggle.

A booking submit calls `saveBooking` **once** with `serviceIds: string[]` — the action creates one `Booking` row plus N `BookingService` rows in a single Prisma `create` (atomic). Multi-service is **not** N parallel calls anymore (the previous design produced N `Booking` rows that broke `@@unique([barberId, date])`). After success, both `selectedServices` and the date/hour are cleared; `selectedBarber` is **kept** (lets the user immediately make a follow-up booking with the same barber if they want).

If the slot is taken between the calendar render and submit, Postgres returns `P2002` on the unique constraint and the action throws `BookingSlotTakenError` (from `app/barbershop/[id]/_actions/_errors.ts`). `BookingMenu` catches it and shows a sonner error toast.

#### Shop flow (Loja tab)

`BarbershopShop` (`_ShopComponent/BarbershopShop.tsx`) groups `<ProductCard>`s by category in sections (`grid-cols-2 md:grid-cols-3 xl:grid-cols-4`). Each `ProductCard` adds itself to the cart on click; if it's already there, the card morphs to show inline +/- quantity controls capped at `product.stock`. Out-of-stock products show an "Esgotado" overlay and disable the add button.

`<FloatingCartButton>` (in `_ShopComponent/CartSheet.tsx`) is a fixed-position FAB (`bottom-6 right-6 lg:bottom-8 lg:right-8`) that only renders when the cart has items belonging to the current shop (`cartShopId === shopId && count > 0`). It triggers `<CartSheet>` (slides from right) which renders the items list, an optional `notes` field, total, and a "Reservar pedido" button that calls `createOrder` after `ensureAuth()`.

Switching shops with a non-empty cart shows `<SwitchCartShopDialog>` (an `AlertDialog` triggered by the cart store's `pendingShop` state) — confirm wipes the cart and starts fresh, cancel keeps the existing items.

### Order lifecycle (lojinha)

- `Order.status` flows: `PENDING` → `CONFIRMED` → `READY` → `COMPLETED`, with `CANCELLED` reachable from any state except `COMPLETED`.
- `createOrder` (server action in `app/_actions/order.ts`) runs in a Prisma transaction: validates session, looks up the products, validates stock for each line, calculates `total` from snapshot prices, decrements `Product.stock` line by line, then creates the `Order` + `OrderItems`. Throws `OutOfStockError`, `EmptyCartError`, or `UnauthorizedError` (all in `app/_actions/_errors.ts`).
- `OrderItem.unitPrice` is a **price snapshot** taken at order creation. Don't recompute totals from `Product.price` later — it would lie about historical orders.
- `cancelOrder` restores stock (increments `Product.stock` for each line item) and sets status to `CANCELLED`. Both customers (only their own) and owners (only for their shops) can cancel `PENDING`/`CONFIRMED`. Owners can also cancel `READY` orders.
- `updateOrderStatus` is owner-only and validates ownership via `Barbershop.ownerId === session.user.id`.
- `deleteProduct` is **smart**: if the product has any `OrderItem`s linking to it (preserving order history is mandatory because `OrderItem.product` is `Restrict`), it does soft-delete (`active = false`); otherwise hard-delete.

### Data loaders for the booking & shop flows

- `findBarbershopWithBarbers(id)` (`app/barbershop/[id]/_actions/findBarbershopWithBarbers.ts`) → shop + `Service[]` + `Barbers` (ordered by rating desc, including each barber's `services`). Includes `hasShop` (Prisma's `findUnique` returns all scalar fields by default). Exports the `BarbershopWithBarbers` and `BarberWithServices` types that the Zustand store types against.
- `findBarberWithServices(barberId, barbershopId)` (in the nested `barbers/[barberId]/_actions/`) → barber + services + `{ barbershop: { id, name } }`. Used by the profile page; double-keyed lookup so a barber from another shop can't be opened via URL.
- `findShopProducts(shopId, { includeInactive })` — customer-facing default returns only `active` products; admin passes `includeInactive: true` to manage everything.
- `findUserOrders(userId)` / `findShopOrders(barbershopId)` — both include barbershop + items.product (with serialized prices via `serializeOrderWithRelations`).

The legacy `findUniqueBarberShop` was removed long ago — `findBarbershopWithBarbers` is its replacement.

### Decimal serialization across the RSC boundary

`Service.price`, `Product.price`, `Order.total`, and `OrderItem.unitPrice` are all `Prisma.Decimal` — class instances, not plain objects. Passing them from a Server Component to a Client Component triggers Next 14's `Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.` warning. **Always serialize at the data-loader boundary**, not inside components.

The convention lives in `app/_lib/serializers.ts`:

- `serializeService(service)` → `SerializedService` (`Omit<Service, "price"> & { price: string }`).
- `serializeBookingWithRelations(booking)` → `SerializedBookingWithRelations` (a Booking with `barbershop`, `barber`, and `services: Array<{ ..., service: SerializedService }>` — the M:N junction expanded with serialized prices).
- `serializeProduct(product)` → `SerializedProduct`.
- `serializeOrderWithRelations(order)` → `SerializedOrderWithRelations` with `total: string`, `items: Array<{ unitPrice: string, product: SerializedProduct }>`.

Every server action that returns rows containing decimal columns runs them through one of these. Type aliases derived via `Awaited<ReturnType<typeof X>>` give the rest of the codebase the right shapes without manual annotation. Consumers (Zustand store, cards, lists, etc.) type against the `Serialized*` shapes rather than Prisma's raw types.

If you add a new server action that returns rows with decimal fields, run them through the appropriate serializer before returning. Forgetting this won't fail the build — it shows up at runtime as the warning above when the value crosses into a `"use client"` component.

### Booking timeslots

`app/barbershop/[id]/_helpers/hours.ts` (`generateDayTimeList`) hardcodes a **45-minute interval** ending at **21:00**, starting one hour after "now". Two known caveats if you touch this:

- The 45-min/21:00 are global constants — should be per-barbershop config eventually.
- The "start" is always relative to *now*, not to the picked date. So picking a future day still starts the slot list at "1h from current wall-clock time" instead of opening hour. UX bug, not yet fixed.

Slot conflicts are computed per-barber: `getDayBookings(barbershopId, date, barberId)` filters by `barberId` when one is passed. A booking with barber A at 14:00 does NOT block barber B at 14:00 — the calendar correctly shows different availability per barber.

### Images

`next.config.mjs` whitelists for `next/image` remote patterns:

- `utfs.io` — UploadThing CDN (intended target for owner-uploaded shop/product images in the future).
- `picsum.photos`, `fastly.picsum.photos` — placeholder service (used by older seeds).
- `images.unsplash.com` — generic stock photo source.
- `loremflickr.com` — themed Flickr CC search (used briefly, replaced by Wikimedia for accuracy).
- `upload.wikimedia.org` — current source for seeded product photos. URLs hard-coded in `prisma/seed-products.ts` and verified to return 200.

For **user-generated image URLs** (owner-pasted product/shop images), use `<Image unoptimized>` so Next doesn't try to proxy and require the source domain in the whitelist. This is the convention in `ProductCard`, `CartSheet`, `AdminProductsList`, and `ProductFormDialog`. For seed/demo images and other URLs you control, leave `unoptimized` off and let Next optimize.

Add new hosts to `next.config.mjs` only when they're under your control or part of a deliberate vendor integration.

### Logo + favicon

- `app/_components/Logo.tsx` — single source of truth for the wordmark. Renders an inline SVG `ScissorsIcon` over a `bg-gradient-primary` rounded square + "BT-Barber" wordmark (with the "Barber" half clipped to the same gradient via `bg-clip-text`). Has a `group/logo` so internal hover effects (icon rotation, box glow) work without polluting parent hover state. Sizes: `sm` / `md` / `lg`. Pass `showWordmark={false}` for icon-only.
- `app/icon.svg` — the favicon. Same scissors-on-gradient mark in 32×32. The legacy `app/favicon.ico` was deleted because Next.js prioritizes `favicon.ico` over `icon.svg` and the old PNG-based brand was the wrong one. Don't recreate `favicon.ico`.

### UI primitives & visual conventions

- **Font:** `Sora` (variable + 6 weights), exposed as `--font-sora` and consumed via `font-sans` / `font-display` in `tailwind.config.ts`.
- **Border radius:** base `--radius: 0.75rem`, with extended scale (`xl` = 1rem, `2xl` = 1.25rem, `3xl` = 1.75rem). Cards default to `rounded-2xl`, buttons to `rounded-xl`, product/barbershop cards to `rounded-3xl`.
- **Shadows (multi-layer for natural depth):** `shadow-soft` (1 layer subtle), `shadow-card` (3 layers), `shadow-card-hover` (3 layers amplified), `shadow-floating` (heavier — for floating buttons), `shadow-glow` (ring + accent glow — for focused inputs and logo hover), `shadow-inset-highlight` (subtle 1px top inset). Defined in `tailwind.config.ts`.
- **Animations:** `animate-fade-in`, `animate-slide-up`, `animate-slide-down`, `animate-scale-in`, `animate-shimmer`, `animate-float`, all using easing `cubic-bezier(0.16, 1, 0.3, 1)` (exposed as `ease-smooth` utility). Pages cascade their entry with `style={{ animationDelay: \`${i * 60}ms\` }}` for staggered reveals.
- **Skeletons:** the `<Skeleton>` primitive uses a CSS pseudo-element (`::before`) sliding `translateX(-100% → 100%)` over a muted background (the `shimmer` keyframe drives this). Don't fall back to the default `animate-pulse` — it looks dated next to the rest of the UI.
- **Theme toggle:** reuse `<ThemeToggle>` (icon variant default, `variant="full"` for menu rows). Don't call `useTheme()` directly from a UI component — the toggle handles the DB sync via `updateUserTheme`.
- **Tabs primitive:** `app/_components/ui/tabs.tsx` (Radix) — used in the barbershop detail page. Wrap content in `<TabsContent forceMount className="data-[state=inactive]:hidden">` when child state needs to survive tab switches.
- **Dialog primitive:** `app/_components/ui/dialog.tsx` (Radix). Distinct from the older `alert-dialog.tsx`: use `Dialog` for forms (e.g. `ProductFormDialog`), `AlertDialog` for destructive confirmations (e.g. cancel order, switch cart shop).

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

**Heads-up on `NEXTAUTH_URL` in production:** must be the deployed origin without trailing slash (e.g. `https://bt-barber.vercel.app`). A trailing slash produces `//api/auth/...` URLs which break OAuth callbacks intermittently. Also remember to add the production callback URL (`<NEXTAUTH_URL>/api/auth/callback/google`) to the Google Cloud Console OAuth client — the dev redirect URI staying alone is the most common cause of 500-on-login after deploy.

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
- Toasts use `sonner` (`import { toast } from "sonner"`); the `<Toaster />` is mounted in the root layout. **Don't toast before triggering `signIn("google")`** — the redirect happens before the toast can render.
- The root layout uses `next-themes` with `defaultTheme="dark"` — both light and dark themes are fully supported. Never hardcode dark/light-only colors; always use semantic tokens (`bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, `text-accent`, etc.) so the design flips correctly.
- Prefer `text-muted-foreground` over hardcoded `text-gray-*`. Some legacy admin/barber files still use `text-gray-400` in spots — replacing them is welcome cleanup.
- Animate page entries with `animate-slide-up` / `animate-scale-in` and stagger via `style={{ animationDelay }}`. Be tasteful — multiple competing animations make the UI feel slow.
- For interactive cards (services, products, barbers), prefer making the **whole card** the click target via `role="button"` / `role="checkbox"` + keyboard handlers rather than placing tiny buttons inside. Confirm/destructive actions go through `<AlertDialog>` so the click area itself stays generous.
