<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Fixora — Permanent Project Instructions

> **Read this file completely before changing any code.**
> This is the single source of truth for conventions, scope, and the frontend/backend
> responsibility boundary. The detailed plan and progress checklist live in
> [`IMPLEMENTATION_ROADMAP.md`](./IMPLEMENTATION_ROADMAP.md).

---

## 1. Project Identity

| Item | Value |
| --- | --- |
| Official name | **Fixora** |
| Tagline | **Your Home, Our Responsibility.** |
| Type | Full-stack, role-based smart device & home appliance repair service booking platform |
| Assignment | Assignment 9 — Category 006 |
| Source of truth | The Assignment 9 PDF. This file summarizes it; the PDF wins on requirements. |

**Branding rules**

- Use **Fixora** everywhere: logo, navbar, sidebar, dashboards, page titles,
  metadata, README, footer, documentation.
- Never use **RepairNest**.
- The original assignment PDF says "FixMate". That is the old name only. Do **not**
  put "FixMate" in UI, metadata, README, or new documentation.
- Do not rename existing folders, files, variables, database collections, or API
  routes just to rebrand. Branding is UI/documentation text only.

**Visual identity:** a wrench/tool mark inside a rounded square, the wordmark
"Fixora", deep teal primary with a warm amber accent (see §9).

---

## 2. What Fixora Does

Fixora connects customers with verified repair technicians for smartphones,
laptops/PCs, ACs, refrigerators, TVs, washing machines, and electrical work.

**Core flow**

1. A user registers as **customer** or **technician** (never admin).
2. A technician publishes a service → it stays `pending` until an admin approves it.
3. Customers browse approved + available services, then send a repair request.
4. The technician moves the job through `requested → accepted → in-progress → completed`
   (or rejects / the customer cancels while still `requested`).
5. When the job is `completed` and `unpaid`, the customer pays through Stripe.
6. The admin moderates services, manages users, and monitors bookings and revenue.

### Roles

| Role | Can do |
| --- | --- |
| **Customer** | Browse services, request a repair, cancel only while `requested`, track status, pay after completion, view payment history |
| **Technician** | Add/manage own services, accept/reject requests, advance job status, set final amount on completion |
| **Admin** | Approve/reject services, change user roles, read all bookings, view all transactions. Created manually only. |

---

## 3. Required Routes (from the assignment)

| Page | Route | Access |
| --- | --- | --- |
| Home | `/` | Public |
| Browse Services | `/services` | Public |
| Service Details | `/services/[id]` | Public; request form only for logged-in customers |
| How It Works / About | `/about` | Public |
| Sign Up / Sign In | `/sign-up`, `/sign-in` | Public; logged-in users go to their dashboard |
| Payment Success / Cancel | `/payment/success`, `/payment/cancel` | Customer |
| Customer Dashboard | `/dashboard/customer`, `/dashboard/customer/bookings`, `/dashboard/customer/payments` | Customer |
| Technician Dashboard | `/dashboard/technician`, `/dashboard/technician/add-service`, `/dashboard/technician/my-services`, `/dashboard/technician/requests` | Technician |
| Admin Dashboard | `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/services`, `/dashboard/admin/bookings`, `/dashboard/admin/transactions` | Admin |
| Update Profile | `/dashboard/profile` | Any logged-in user |
| Not Found | unknown route | Public |

Access rules:

- Logged-out user opens a dashboard route → redirect to `/sign-in`.
- Logged-in user opens another role's dashboard → redirect to their own dashboard or
  show a Forbidden message.
- After sign-in, return the user to the page they originally requested, otherwise to
  their role dashboard.
- Server-side authorization is the only real security. Frontend checks are UX only.

---

## 4. Technology Stack

### Installed today (do not replace without a clear reason)

| Area | Package / tool |
| --- | --- |
| Framework | Next.js `16.4.6` (App Router) |
| Language | TypeScript 5, `strict: true` |
| UI runtime | React `19.3.0` (React Compiler enabled) |
| Styling | Tailwind CSS v4 via `@tailwindcss/turbopack` |
| Components | shadcn CLI `4.x`, style **base-nova**, built on **Base UI** (`@base-ui/react`), not Radix |
| Class merging | `cn` package, re-exported by `src/lib/utils.ts` |
| Icons | `lucide-react` (preferred), `react-icons` (sparingly) |
| Toasts | `sonner` (installed, not mounted yet) |
| Theming | `next-themes` (installed, no provider yet) |
| Auth client | `better-auth` (installed, **not configured** — owner's task) |
| Lint | ESLint 9 + `eslint-config-next` |

### Planned / owner-implemented (do not build these)

Node.js + Express, MongoDB + BetterAuth MongoDB adapter, JWT, ImgBB, Stripe
Checkout + webhook, Vercel (frontend), Node hosting (backend).

### Unused / suspicious dependencies (leave alone for now)

- `pdf-parse` (devDependency) — not needed by the app; do not use it.
- `shadcn` is a runtime dependency; it is a CLI, but do not move or reinstall it
  unless the owner asks.
- `better-auth`, `next-themes` are installed ahead of use.

**No new package may be installed without explicit owner approval.** Prefer existing
packages and small hand-written components.

---

## 5. Responsibility Boundary (strict)

### The AI agent may implement

1. All frontend UI: public site, auth screens, dashboards, profile.
2. Reusable components: buttons, cards, tables, badges, modals, forms, empty states,
   skeletons, charts drawn with CSS/SVG.
3. Responsive layouts (mobile → tablet → desktop).
4. Loading, error, and empty states; `not-found.tsx`, `error.tsx`, `loading.tsx`.
5. Realistic **dummy data**, clearly separated in `src/data/`.
6. Frontend-only interactions: modals, dropdowns, mobile nav, tabs, sidebar toggle,
   client-side filtering/sorting of dummy data, toasts, form validation.
7. Static dashboard statistics and chart layouts.
8. Payment **UI** (Pay Now, success, cancel pages).
9. Documentation: this file, `IMPLEMENTATION_ROADMAP.md`, and any doc the owner
   explicitly requests.
10. Preparing clean seams so the owner can plug APIs in later.

### The AI agent must NOT implement

1. MongoDB connection, schemas, queries, or seed scripts.
2. Express server, backend routes, or any real API.
3. Fetching real data or sending data to a backend.
4. BetterAuth configuration, sign-up/sign-in integration, session handling.
5. JWT generation/verification, `verifyToken` / `requireRole` middleware.
6. Server-side authorization, role checks, or ownership checks.
7. Stripe Checkout/webhook/verification, ImgBB upload.
8. Fake auth, fake API responses, mock servers, or client-side role security.
9. Deployment configuration or production secrets.

**UI with dummy data is fine. Fake security or fake backend behavior is not.**

If a feature needs an API, build the UI and document the exact endpoint the owner
must implement. Never "make the button work" by inventing a backend.

---

## 6. Development Rules

1. Inspect before editing; never assume a feature is missing.
2. Reuse existing components, utilities, tokens, and packages before creating new ones.
3. Never rewrite working code unnecessarily.
4. Do not over-engineer. Beginner-friendly, readable, maintainable first.
5. No unrelated changes, no drive-by refactors, no dependency churn.
6. Keep the UI clean, modern, responsive, and consistent — not flashy.
7. Avoid heavy animation. Small transitions are enough.
8. Keep all service cards equal height/width; use a consistent grid.
9. Every page must work at 360px, 768px, 1024px, and 1440px widths.
10. Never present dummy data as real database data.
11. Never commit secrets. `.env*` is already gitignored.
12. Implement only the step the owner explicitly asked for, then stop.

---

## 7. Current Repository State (audit — 17 Nov 2026)

This is a **fresh Create Next App project with shadcn initialized**. There is no
application functionality yet.

```
D:\PROJECT\fixora
├── AGENTS.md                  ← this file (Next.js managed block + project rules)
├── IMPLEMENTATION_ROADMAP.md  ← plan + progress checklist
├── README.md                  ← still the default Next.js README (to be rewritten later)
├── components.json            ← shadcn config: base-nova, neutral, aliases @/*
├── eslint.config.mjs
├── next.config.ts             ← cacheComponents, partialPrefetching, reactCompiler, turbopack
├── package.json
├── tsconfig.json              ← strict, paths @/* -> src/*
├── public/                    ← only default Next.js SVGs
└── src/
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css        ← Tailwind v4 + shadcn neutral tokens
    │   ├── layout.tsx         ← Geist fonts, default metadata
    │   └── page.tsx           ← default starter page
    ├── components/ui/button.tsx
    └── lib/utils.ts           ← re-exports cn from the "cn" package
```

- Git: branch `master`, single commit (`Initial commit from Create Next App`).
- Typecheck (`npx tsc --noEmit`): clean.
- No `.env` / `.env.local` file exists.
- No backend folder, no API routes, no auth config, no database code.
- `node_modules/next/dist/docs/` is the version-matched Next.js documentation.

**Known issues to fix in later steps (do not fix during Phase 1):**

- `src/app/globals.css` line `--font-sans: var(--font-sans);` is a circular
  reference; the layout defines `--font-geist-sans`. Typography will fall back.
  Fix carefully in Step 2.
- Only `Button` exists; no Card/Input/Badge/Dialog/Table/Sheet/etc.
- `sonner` is installed but no `<Toaster />` is mounted.
- Metadata and README still say "Create Next App".
- The default homepage is still the Next.js starter.

---

## 8. Target Architecture

### Route groups

Use route groups to give each area its own shell without changing URLs:

- `(public)` → Navbar + page + Footer (`/`, `/services`, `/services/[id]`, `/about`,
  `/payment/success`, `/payment/cancel`)
- `(auth)` → centered auth layout, no navbar/footer (`/sign-in`, `/sign-up`)
- `(dashboard)` → sidebar + topbar, no public footer (`/dashboard/**`)

Root `src/app/layout.tsx` keeps `<html>`, `<body>`, fonts, metadata, and the global
`<Toaster />`.

### Planned folder structure

```
src/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Home
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── services/[id]/page.tsx
│   │   └── payment/{success,cancel}/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # DashboardShell
│   │   └── dashboard/
│   │       ├── customer/{page,bookings,payments}
│   │       ├── technician/{page,add-service,my-services,requests}
│   │       ├── admin/{page,users,services,bookings,transactions}
│   │       └── profile/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/            # shadcn primitives (generated; edit sparingly)
│   ├── layout/        # logo, navbar, footer, sidebar, topbar, dashboard-shell
│   ├── shared/        # section-heading, status-badge, stat-card, empty-state,
│   │                  # page-header, data-table, confirm-dialog, loading-skeleton,
│   │                  # user-avatar, mini-chart
│   ├── home/          # hero, featured-services, how-it-works, categories,
│   │                  # why-choose-us, testimonials, cta
│   ├── services/      # service-card, service-grid, service-filters, request-form
│   ├── auth/          # sign-in-form, sign-up-form, role-selector, password-field
│   └── dashboard/     # customer/*, technician/*, admin/*, profile-form
├── data/              # ⚠️ DUMMY DATA ONLY — clearly labelled
├── lib/               # utils.ts, constants.ts, format.ts, validations.ts
└── types/             # index.ts — shared TypeScript types
```

### Naming

- Component files: `kebab-case.tsx`; exported components: `PascalCase`.
- One component per file; named exports (except Next.js page/layout defaults).
- Route files stay `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx` /
  `not-found.tsx` as required by the App Router.
- Imports use the `@/` alias, never deep `../../` chains.
- Types in `src/types/index.ts` mirror the database documents (see §11).

### Server vs client components

- Default to **server components**.
- Add `"use client"` only for interactivity: dropdowns, modals, tabs, forms,
  mobile nav, filters, toasts.
- Keep client components small; keep page files thin and compose sections.

---

## 9. Design System (Fixora)

Apply consistently in Step 2 and reuse everywhere. No page invents its own colors,
heading sizes, or card style.

### Color tokens (light theme)

| Token | Hex | Usage |
| --- | --- | --- |
| Brand / primary | `#0F766E` | Primary buttons, links, active nav, logo |
| Brand hover | `#115E59` | Hover/pressed |
| Brand soft | `#CCFBF1` | Icon chips, selected states, subtle highlights |
| Accent (amber) | `#F59E0B` | Small highlights, ratings, "pay after service" cues |
| Accent soft | `#FEF3C7` | Accent badges/backgrounds |
| Page background | `#F8FAFC` | App/page canvas |
| Surface | `#FFFFFF` | Cards, panels, tables |
| Border | `#E2E8F0` | Cards, dividers, inputs |
| Heading text | `#0F172A` | Headings, strong text |
| Body text | `#334155` | Paragraphs, table cells |
| Muted text | `#64748B` | Helper text, labels, metadata |
| Success | `#16A34A` | Paid, completed, approved |
| Warning | `#D97706` | In progress, pending, unpaid |
| Danger | `#DC2626` | Reject, cancel, delete, errors |
| Info | `#2563EB` | Requested, informational |

Set these as CSS variables in `globals.css` and expose them through `@theme` so
Tailwind classes like `bg-brand`, `text-muted`, and `border-line` work. Keep shadcn's
semantic tokens (`background`, `foreground`, `primary`, `muted`, `border`, etc.)
working; map `--primary` to the brand teal.

Dark mode tokens may stay in the file, but dark mode is **optional** in the
assignment. Do not add a theme toggle unless the owner requests it.

### Status colors (must be identical on every dashboard)

| Status | Text/bg | Meaning |
| --- | --- | --- |
| `requested` | blue `#1D4ED8` / `#EFF6FF` | Waiting for technician |
| `accepted` | indigo `#4338CA` / `#EEF2FF` | Technician accepted |
| `in-progress` | amber `#B45309` / `#FFFBEB` | Work happening |
| `completed` | green `#15803D` / `#F0FDF4` | Work done, maybe unpaid |
| `rejected` | red `#B91C1C` / `#FEF2F2` | Technician rejected |
| `cancelled` | slate `#475569` / `#F1F5F9` | Customer cancelled |
| `pending` (service) | amber | Awaiting admin |
| `approved` | green | Publicly visible |
| `unpaid` | amber outline | Payment due |
| `paid` | green | Settled |

One `<StatusBadge status={...} />` component, one color map in `src/lib/constants.ts`.

### Typography

- Primary font: **Inter** for the entire Fixora frontend.
- Apply Inter consistently to headings, body text, buttons, forms, navigation, dashboards, tables, and other UI elements.
- Use the existing project setup and available packages where possible; do not install any new package without explicit approval.
- Keep typography responsive, clean, and readable.
- Headings: font-semibold/bold, `tracking-tight`, balanced wrapping.
- Body: `text-slate-700`, comfortable line height, max ~70 characters.
- Suggested scale: display `text-4xl md:text-5xl`, h1 `text-3xl md:text-4xl`,
  h2 `text-2xl md:text-3xl`, h3 `text-xl`, body `text-base`, small `text-sm`,
  caption `text-xs`.
- Keep the same heading style on every page/section.

### Layout & spacing

- Container: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`.
- Section padding: `py-14 md:py-20 lg:py-24`; card padding `p-5 md:p-6`.
- 8px spacing rhythm; gap 4/6/8; avoid cramped or random spacing.
- Cards: `rounded-xl border bg-card shadow-sm`; equal heights via flex column +
  `line-clamp` on titles/descriptions; CTA pinned to the card bottom.
- Buttons: use the shared `Button`; extend with site sizes (`h-10`, `h-11`) in Step 2
  instead of hardcoding one-off classes. One primary style across the site.
- Radii: cards `xl`, buttons `lg`, inputs `lg`, badges `full`.
- Borders/shadows subtle; no heavy gradients or glow effects.

### Responsiveness

- Mobile-first. Service grid: 1 column → `sm:2` → `lg:3` → `xl:4`.
- Dashboard: sidebar fixed on `lg+`, slide-over sheet below `lg`.
- Tables: horizontally scrollable wrapper on small screens; where a table is
  unreadable, use stacked cards (`hidden md:table` / `md:hidden` cards).
- Navbar: hamburger + sheet under `md`.
- Never allow horizontal page overflow at 360px.

### Required shared components

`Logo`, `Navbar`, `Footer`, `MobileNav`, `DashboardShell`, `Sidebar`, `Topbar`,
`SectionHeading`, `ServiceCard`, `CategoryCard`, `StatCard`, `StatusBadge`,
`PaymentBadge`, `EmptyState`, `PageHeader`, `DataTable`, `ConfirmDialog`,
`UserAvatar` (initials fallback), `LoadingSkeleton`, `MiniBarChart`,
`ProfileForm`, `PasswordField`, `RoleSelector`.

### Charts

The assignment requires dashboard charts. Do **not** install a chart library unless
the owner asks. Build small, readable CSS/SVG charts (`MiniBarChart`, simple donut)
from dummy data. They are presentational UI only.

---

## 10. Dummy Data Rules

- All dummy data lives in `src/data/`, one file per domain:
  `services.ts`, `bookings.ts`, `payments.ts`, `users.ts`, `categories.ts`,
  `testimonials.ts`, `stats.ts`, `demo-session.ts`.
- Every file starts with a banner comment:
  `// ⚠️ DUMMY DATA for UI development only. Replace with API data.`
- Mirror the real database shape exactly (see §11) so swapping is mechanical.
- Use 24-character hex strings for `_id` values so links and keys behave like
  MongoDB ObjectIds.
- Dates are ISO strings (`"2026-11-10T09:00:00.000Z"`) — JSON-friendly.
- Use one `Service` type, one `Booking` type, etc. from `src/types`.
- Recommended seed content: 3 technicians, 8 users total, 12+ services across all
  7 categories, 6–8 bookings spanning every status, 4 payments, 6 testimonials.
- Prices are **USD** (assignment uses USD). Format with one helper
  (`formatCurrency`) — never hand-write `$` strings in components.
- Images: use local placeholder assets in `public/` (category SVGs) and
  initials-based avatars. Do **not** depend on random external image URLs that can
  break. When the owner integrates ImgBB, only the image URL changes.
- A dashboard page renders a demo user (e.g. `demoUsers.technician`) purely for
  display. Mark it:
  `// TODO(owner): replace with BetterAuth session`.
  Never treat it as authentication or authorization.
- Do not build a fake login/session/role-guard system around dummy data.

---

## 11. Database Reference — 4 Collections

Exactly four application collections. BetterAuth's own auth collections (users,
session, account, verification) are not counted; its **user collection is the
application users collection** — do not create a duplicate.

### 1. `users` (BetterAuth + additional fields)

`_id`, `name`, `email` (unique, links data across collections), `image`, `role`
(`customer` | `technician` | `admin`, default `customer`), `phone`, `area`, `bio`.

### 2. `services`

`_id`, `title`, `category` (one of: `Smartphone`, `Laptop & PC`, `AC`,
`Refrigerator`, `TV`, `Washing Machine`, `Electrical`), `description`, `image`,
`basePrice` (number, USD), `estimatedDuration` (string, e.g. `"2-3 hours"`),
`serviceMode` (`Home Visit` | `Shop Drop-off`), `serviceArea`, `technicianName`,
`technicianEmail`, `approvalStatus` (`pending` | `approved` | `rejected`, default
`pending`), `isAvailable` (boolean, default `true`), `createdAt` (date).

### 3. `bookings`

`_id`, `serviceId`, `serviceTitle`, `serviceImage`, `category`, `basePrice`,
`technicianName`, `technicianEmail`, `customerName`, `customerEmail`,
`customerPhone`, `address`, `preferredDate`, `problemDescription`, `status`
(`requested` | `accepted` | `rejected` | `in-progress` | `completed` | `cancelled`,
default `requested`), `finalAmount` (number, default = basePrice),
`paymentStatus` (`unpaid` | `paid`, default `unpaid`).

### 4. `payments`

`_id`, `bookingId`, `serviceTitle`, `customerName`, `customerEmail`,
`technicianName`, `technicianEmail`, `amount`, `currency` (`usd`),
`transactionId` (Stripe payment_intent), `stripeSessionId` (unique), `paymentStatus`
(`paid`), `paidAt` (date).

### Relationships

- `users.email` → `services.technicianEmail` (one technician, many services)
- `services._id` → `bookings.serviceId` (one service, many bookings)
- `users.email` → `bookings.customerEmail` (one customer, many bookings)
- `users.email` → `bookings.technicianEmail` (one technician, many jobs)
- `bookings._id` → `payments.bookingId` (at most one payment per completed booking)

### Business rules the frontend must respect

- Only `approvalStatus === "approved" && isAvailable === true` services are public.
- Technician-created services start `pending`. Editing a service resets it to `pending`.
- A customer cannot have two active requests (`requested`, `accepted`, `in-progress`)
  for the same service.
- A technician cannot request their own service. Technicians/admins cannot book at all.
- Customers cancel only while `requested`; a paid booking never shows Pay Now.
- Valid transitions only:
  `requested → accepted | rejected | cancelled`,
  `accepted → in-progress`, `in-progress → completed`,
  `completed + unpaid → paid`.
- The technician sets `finalAmount > 0` when completing; the server enforces all of this.

---

## 12. API Contract (owner implements — frontend integrates later)

Base URL comes from `NEXT_PUBLIC_API_URL`. The AI builds UI against this contract and
documents gaps; it never creates these endpoints.

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/users/profile` | Any authenticated |
| PATCH | `/api/users/profile` | Any authenticated |
| GET | `/api/services` | Public (server-side search/filter/sort) |
| GET | `/api/services/:id` | Public |
| POST | `/api/services` | Technician |
| PATCH | `/api/services/:id` | Technician (owner) |
| DELETE | `/api/services/:id` | Technician (owner) |
| POST | `/api/bookings` | Customer |
| GET | `/api/bookings/my` | Customer |
| GET | `/api/bookings/technician` | Technician |
| PATCH | `/api/bookings/:id/cancel` | Customer (owner, `requested` only) |
| PATCH | `/api/bookings/:id/status` | Technician (owner, valid transitions) |
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id/role` | Admin |
| PATCH | `/api/admin/services/:id/approval` | Admin |
| GET | `/api/admin/bookings` | Admin |
| GET | `/api/admin/payments` | Admin |
| POST | `/api/payments/create-checkout-session` | Customer |
| GET | `/api/payments/verify?session_id=...` | Customer |
| POST | `/api/payments/webhook` | Stripe (optional challenge) |

Error behavior: `401` unauthenticated, `403` wrong role/not owner, `400` validation,
`404` missing, `409` duplicate active request / duplicate payment.

### Environment variables

Frontend `.env.local` (never commit): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`,
`BETTER_AUTH_URL` / BetterAuth secret (owner), optionally `NEXT_PUBLIC_IMGBB_API_KEY`
**only if** the owner chooses client-side uploads.

Backend `.env` (owner): `PORT`, `MONGODB_URI`, `BETTER_AUTH_SECRET`, `JWT_SECRET`,
`CLIENT_URL`, `IMGBB_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

**Never** put MongoDB, JWT, Stripe secret, or ImgBB keys in frontend code. Prefer a
protected upload endpoint over exposing the ImgBB key in the browser.

---

## 13. Authentication, JWT & Authorization (owner)

- BetterAuth + MongoDB adapter lives in the Next.js app; additional user fields:
  `role`, `phone`, `area`, `bio`.
- Public sign-up allows only `customer` or `technician`; anything else becomes
  `customer` server-side. Admin accounts are created manually.
- JWT is issued after auth and verified by Express middleware.
- Reusable middleware: `verifyToken`, `verifyCustomer`, `verifyTechnician`,
  `verifyAdmin` (docs may also call them `requireRole` variants).
- `401` for missing/invalid token; `403` for wrong role or failed ownership.
- Never trust a role, email, price, final amount, or status sent by the client.
- Ownership checks: customer → own bookings; technician → own services and jobs;
  admin role changes cannot target the admin's own account.
- Frontend route guards are UX only; the server is authoritative.

**AI must not create auth pages that pretend to log in, store fake tokens, or gate
content by a client-side role check.** Auth pages are forms + validation + UI states
with clearly marked integration TODOs.

---

## 14. Frontend Integration Seams

When building UI that will later call APIs:

- Keep data access isolated: pages/components receive typed props; dummy imports are
  easy to replace. Do not scatter `dummyServices` imports deep inside widgets.
- Prepare realistic **loading**, **empty**, and **error** states for each data area
  even while using dummy data (Step 19 hardens them).
- Forms: controlled inputs + a small `src/lib/validations.ts`; no form library.
  Buttons show pending/disabled UI states. Submit handlers contain a clearly marked
  `// TODO(owner): POST to /api/...` and a temporary toast, nothing more.
- Never invent mock fetch layers, JSON servers, or MSW.
- Search/filter/sort UI must read/write URL query params (so the owner can later
  perform them in MongoDB). Filtering dummy data client-side is acceptable for the
  UI demo, but must be labelled as temporary.

---

## 15. UI Content & Copy Guidelines

- Friendly, professional, concise. No lorem ipsum.
- Homepage headline direction: "Broken device? Get it fixed by verified technicians."
- Trust points: verified technicians, transparent pricing, pay after completion,
  tracked job status, service warranty.
- Use realistic Dhaka/Bangladesh areas (Dhanmondi, Mirpur, Uttara, Banani, Gulshan,
  Mohammadpur) and USD prices.
- Categories: Smartphone, Laptop & PC, AC, Refrigerator, TV, Washing Machine,
  Electrical.
- Footer: Fixora logo, tagline, quick links, popular categories, email/phone/address,
  social icons (use the current **X** logo, not the old Twitter bird), copyright.
- Include a small, honest "demo data" cue where content is clearly sample data
  (e.g. a footer note on the UI phase) — never claim fake activity is real.
- Accessibility: semantic landmarks, `aria-label` on icon buttons, visible focus,
  labels tied to inputs, alt text, keyboard-operable menus/modals.

---

## 16. Coding Conventions

- TypeScript everywhere; no `any` (use `unknown` + narrowing when needed).
- Prefer server components; `"use client"` at the smallest possible boundary.
- Named exports for components; default exports only for Next.js files.
- Props typed inline or via a local `type Props = { ... }`.
- Use `cn()` for conditional classes; never string-concatenate class names.
- Tailwind utilities only; no CSS modules or styled-components for new UI.
- Extract repeated markup into `src/components/shared/` after the second use.
- Keep functions small and named clearly (`handleSubmit`, `formatCurrency`).
- Constants (categories, statuses, routes, nav items) live in `src/lib/constants.ts`.
- Dates/currency: one formatter each in `src/lib/format.ts`.
- Comments explain *why*, not *what*. Mark integration points with
  `// TODO(owner): ...` and dummy data with the standard banner.
- Do not edit `src/components/ui/*` generated files unless a genuine bug requires it.
- Keep files under ~200 lines where practical; split sections into components.
- Run `npx tsc --noEmit` and `npm run lint` after each step.

### Next.js 16 specifics (read the bundled docs first)

- `middleware.ts` is deprecated → use **`proxy.ts`** (owner's route protection).
- Next generates global `PageProps<...>` / `LayoutProps<...>` helpers; follow the
  pattern already used in `src/app/layout.tsx` (`LayoutProps<"/">`).
- `cacheComponents: true` and `partialPrefetching: true` are enabled. Uncached data
  in a server component must be handled with `<Suspense>` / `"use cache"` per the
  bundled docs. Our dummy data is static, so this mostly matters during integration.
- React Compiler is on: follow the Rules of React, avoid manual memo hacks.
- Tailwind v4 is CSS-first: tokens live in `globals.css` (`@theme`), there is no
  `tailwind.config.js`.
- shadcn style is **base-nova** on **Base UI**. Generated components may use
  `@base-ui/react` APIs, not Radix. Inspect before writing.
- `cn` comes from the `cn` package (`src/lib/utils.ts`), not clsx/tailwind-merge.

---

## 17. Development Protocol

The owner controls progress. Follow exactly:

1. Wait for an explicit **"Start Step N"** instruction.
2. Confirm the step, its objective, and which files will be created/modified.
3. Implement **only** that step. Do not start future steps.
4. Reuse existing code; never rebuild a working feature.
5. Verify: `npx tsc --noEmit`, `npm run lint`, and a visual check of the affected
   routes at mobile and desktop widths.
6. Report: files changed, what works, how to test, known limitations/backend needs.
7. Update the checklist in `IMPLEMENTATION_ROADMAP.md` for that step only.
8. Stop and wait for the next instruction.

Rules:

- Do not skip steps or reorder without owner approval.
- Do not commit to Git unless asked; suggest a commit message instead.
- Do not install packages, change config, or touch backend scope without permission.
- If a step needs an API the owner hasn't built, build the UI + states and document
  the dependency.
- If something in the existing code is broken, report it before fixing.

---

## 18. Instructions for Future AI Sessions

Before writing code:

1. Read this file and `IMPLEMENTATION_ROADMAP.md`.
2. Read the relevant bundled Next.js docs under `node_modules/next/dist/docs/`.
3. Inspect the current files for the area you will touch (do not assume).
4. Check which step is currently approved; never jump ahead.
5. Confirm the frontend-only boundary. If the task requires backend work, stop and
   explain that it belongs to the owner, then offer the UI/documentation portion.
6. Reuse the design tokens and shared components; do not invent a parallel style.
7. Keep dummy data isolated and honest.
8. Finish with verification, a short beginner-friendly explanation, and a checklist
   update. Then stop.

If the owner asks for backend help explicitly, that is a scope change: document it
clearly, keep it separate from frontend steps, and never silently mix the two.

---

## 19. Definition of Done (per frontend step)

- The requested pages/components exist and match the assignment requirements.
- TypeScript passes, ESLint passes, no console errors on the touched routes.
- Responsive at 360 / 768 / 1024 / 1440 px.
- Loading, empty, and error states exist where data is displayed.
- Colors, typography, spacing, badges, and buttons match the design system.
- Dummy data is separated, typed, and clearly labelled.
- Backend dependencies are documented, not faked.
- `IMPLEMENTATION_ROADMAP.md` checklist is updated for that step only.
- The owner receives: changed files, how to test, and what is still pending.
