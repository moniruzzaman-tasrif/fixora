# Fixora — Implementation Roadmap

**Project:** Fixora — Smart Device & Home Appliance Repair Service Platform
**Tagline:** Your Home, Our Responsibility.
**Assignment:** Assignment 9 — Category 006
**Last updated:** 17 November 2026 (aligned with `AGENTS.md` §4 and the current repo)
**Current phase:** Phase 1 complete — Step 2 is **not approved yet**

> Read [`AGENTS.md`](./AGENTS.md) first. It is the highest-priority project
> instruction and the source of truth for the stack, design system, database, API
> contract, and the frontend/backend boundary. This file is the **plan and progress
> tracker**.
>
> **Alignment rule:** if anything in this roadmap appears to conflict with
> `AGENTS.md` or the installed repository, follow `AGENTS.md` and report the conflict
> instead of guessing. No packages may be installed and no implementation step may
> start without the owner's explicit **"Start Step N"**.

---

## How to Use This File

1. The owner says **"Start Step N"**.
2. The AI implements only that step, then updates the checkbox for that step.
3. The owner tests the result and says **"Start Step N+1"**.
4. Steps 12–14 and the whole of §5 ("Backend Scope") are documentation/owner work;
   the AI must not implement backend features.

Legend: **AI** = frontend/documentation work for the AI agent ·
**OWNER** = backend/integration work reserved for the project owner.

---

## 1. Codebase Audit (actual results, 17 Nov 2026)

The repository is a **fresh `create-next-app` project with shadcn initialized**.
One commit exists (`Initial commit from Create Next App`). TypeScript passes.
No application features, APIs, auth, database, or environment files exist yet.

### A. Already implemented

| Item | Evidence |
| --- | --- |
| Next.js 16.4.6 App Router + React 19.3 + TypeScript strict | `package.json`, `tsconfig.json` |
| Tailwind CSS v4 via `@tailwindcss/turbopack` | `package.json`, `next.config.ts`, `globals.css` |
| shadcn UI initialized (style `base-nova`, Base UI primitives, `cn` util) | `components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts` |
| `Button` component | `src/components/ui/button.tsx` |
| Icons (`lucide-react`, `react-icons`) | `package.json` |
| Toast library (`sonner`) installed, not mounted | `package.json` |
| `next-themes` installed, unused | `package.json` |
| Geist Sans / Geist Mono loaded | `src/app/layout.tsx` |
| Root layout, global CSS, starter home page | `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` |
| ESLint 9 + Next config, React Compiler + cache components flags | `eslint.config.mjs`, `next.config.ts` |
| Git repo, package named `fixora` | `.git`, `package.json` |

### B. Partially implemented

| Item | What exists | What is missing / broken |
| --- | --- | --- |
| Branding | `package.json` name is `fixora` | Default metadata ("Create Next App"), default favicon, default README, no logo |
| Design tokens | Neutral shadcn tokens, dark variants | No Fixora teal/amber palette, no brand/status tokens, radius untuned |
| Typography | Geist fonts loaded | `--font-sans: var(--font-sans)` is a circular reference; heading scale undefined |
| Layout shell | Root layout only | No public navbar/footer, no auth layout, no dashboard shell |
| UI kit | Only `Button` | No card, input, label, textarea, select, badge, dialog, alert-dialog, sheet, table, skeleton, avatar, separator, dropdown, switch |
| Dependencies | `better-auth`, `next-themes`, `sonner` installed | None are configured/mounted; `pdf-parse` is unused |
| Documentation | Default README | No project README, no AGENTS rules (now fixed), no roadmap (now fixed) |

### C. Missing (all application features)

- Public pages: home, services listing, service details, about.
- Auth UI: sign-up, sign-in, role selection, password rules.
- Dashboards: customer (3 routes), technician (4), admin (5), shared profile.
- Payment pages: `/payment/success`, `/payment/cancel`.
- App states: `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`.
- All shared components: navbar, footer, sidebar, topbar, cards, tables, badges,
  modals, stat cards, charts, empty states, skeletons.
- Dummy data + shared types + constants/format/validation helpers.
- README, environment documentation, deployment configuration.
- Owner-side backend: Express, MongoDB, BetterAuth, JWT, APIs, ImgBB, Stripe, seed.

### D. Needs verification (do not assume)

- `shadcn add` compatibility with the `base-nova` (Base UI) style and Tailwind v4 —
  verify in Step 2 before generating many components.
- Behaviour of `cacheComponents: true` once real API data is introduced.
- Visual/functional state of the app at 360px width (no pages exist yet).

### E. Known issues to resolve later

1. **Circular font token** in `globals.css` (`--font-sans: var(--font-sans)`).
   Fix in Step 2 by mapping to `var(--font-geist-sans)`.
2. Only `Button` exists in the UI kit — Step 2 adds the rest.
3. `<Toaster />` is not mounted — Step 2 adds it to the root layout.
4. Default metadata/favicon/README — Steps 2 and 22.
5. Dashboard routes will be publicly reachable until the owner adds real route
   protection. That is expected; the AI must not fake auth guards.

### F. Verified technology baseline (aligned with AGENTS.md §4)

**Installed and to be preserved**

| Area | Actual setup |
| --- | --- |
| Framework | Next.js `16.4.6`, App Router, `cacheComponents: true`, `partialPrefetching: true`, React Compiler on |
| Runtime | Node.js `24.13.0`, npm `11.6.2` |
| Language | TypeScript 5, `strict: true`, path alias `@/*` → `src/*` |
| UI | React `19.3.0` |
| Styling | Tailwind CSS `4.3.3` via `@tailwindcss/turbopack` (CSS-first; **no** `tailwind.config.js`) |
| Components | shadcn CLI `4.23.0`, style **base-nova**, **Base UI** (`@base-ui/react`) — not Radix |
| Class merging | `cn` package (`src/lib/utils.ts`), not `clsx` + `tailwind-merge` |
| Icons | `lucide-react` (primary), `react-icons` (sparingly) |
| Notifications | `sonner` installed; not mounted yet |
| Theming | `next-themes` installed; no provider/toggle yet |
| Auth client | `better-auth` installed; **unconfigured (owner)** |
| Lint | ESLint 9 + `eslint-config-next` |

**Owner-implemented stack (never built by the AI)**

Express.js, MongoDB, BetterAuth MongoDB adapter, JWT, ImgBB, Stripe Checkout,
Stripe webhook, Vercel (frontend), Node hosting (backend).

**Explicit non-goals for the frontend**

- Do not introduce HeroUI, DaisyUI, Radix, Chakra, MUI, styled-components, or a
  second design system.
- Do not add a chart library (`recharts`, etc.); charts are CSS/SVG.
- Do not add a form library (`react-hook-form`, `zod`, etc.); validation helpers only.
- Do not add a date library; use the built-in `Intl` formatters.
- Do not switch to JavaScript, Pages Router, or Tailwind v3.
- Do not create `middleware.ts`; the owner uses Next.js 16 `proxy.ts`.
- Do not edit generated files under `src/components/ui/` (except a genuine bug,
  reported first).

**Next.js 16 platform rules to respect (AGENTS.md §16)**

- Follow the global `PageProps<...>` / `LayoutProps<...>` helpers already used in
  `src/app/layout.tsx`.
- With `cacheComponents: true`, unhandled uncached server data blocks prerendering.
  Dummy data is static, so this matters when the owner integrates real APIs.
- React Compiler is on: follow the Rules of React; no manual memo hacks.
- Tailwind v4 is CSS-first: all tokens go in `globals.css` via `@theme`.
- Base UI components may expose different props than Radix; inspect generated code.
- `cn` is imported from `@/lib/utils`, which re-exports the `cn` package.

---

## 2. Progress Checklist (22 steps)

- [x] **Step 1** — Existing Codebase Analysis & Documentation *(AI; code unchanged)*
- [ ] **Step 2** — UI Design System & Shared Components *(AI)*
- [ ] **Step 3** — Public Layout: Navbar & Footer *(AI)*
- [ ] **Step 4** — Homepage UI *(AI)*
- [ ] **Step 5** — Authentication UI *(AI)*
- [ ] **Step 6** — Services Listing UI *(AI)*
- [ ] **Step 7** — Service Details & Repair Request UI *(AI)*
- [ ] **Step 8** — Customer Dashboard *(AI)*
- [ ] **Step 9** — Technician Dashboard *(AI)*
- [ ] **Step 10** — Admin Dashboard *(AI)*
- [ ] **Step 11** — Shared Profile UI *(AI)*
- [ ] **Step 12** — Frontend ↔ Backend Integration Planning *(AI doc / OWNER approval)*
- [ ] **Step 13** — Backend API Requirements Documentation *(AI doc / OWNER)*
- [ ] **Step 14** — JWT & Role-Based Security Documentation *(AI doc / OWNER)*
- [ ] **Step 15** — Service Management & Approval UI *(AI)*
- [ ] **Step 16** — Booking Status Pipeline UI *(AI)*
- [ ] **Step 17** — Stripe Payment UI *(AI UI / OWNER Stripe)*
- [ ] **Step 18** — Search, Filter & Sort Integration Preparation *(AI UI / OWNER server)*
- [ ] **Step 19** — Loading, Error & Empty States *(AI)*
- [ ] **Step 20** — Dummy / Seed Data Preparation *(AI dummy / OWNER seed)*
- [ ] **Step 21** — Frontend Testing, Security Review & Bug Fixing *(AI)*
- [ ] **Step 22** — Deployment & Final Assignment Checklist *(OWNER-led / AI assists)*

**Backend scope (§5) is tracked separately and belongs to the owner.** It can run
in parallel after Step 7, but integration starts only after Step 12.

---

## 3. Recommended Development Sequence

| Order | Work | Why this order |
| --- | --- | --- |
| 1 | Steps 2–4 | Tokens, shared components, navbar/footer, homepage → proves the visual language |
| 2 | Steps 5–7 | Auth UI, listing, details + request → completes the public journey |
| 3 | Step 8 | Customer dashboard → first dashboard shell, reusable for other roles |
| 4 | Steps 9–10 | Technician and admin dashboards reuse the shell |
| 5 | Step 11 | Profile UI shared by all roles |
| 6 | Steps 15–17 | CRUD, status actions, payment UI complete the interactive flows |
| 7 | Steps 12–14, 18 | Integration contracts and server-side search prep (owner builds APIs in parallel) |
| 8 | Steps 19–21 | States, realistic data, responsive/QA hardening |
| 9 | Step 22 | README, env docs, deployment, submission |

Rationale: build the design system once, then reuse it. Do not start backend
integration before the owner has working endpoints.

---

## 4. Detailed Steps

### Step 1 — Existing Codebase Analysis & Documentation ✅

**Owner:** AI (analysis + docs only)

**Objective:** Understand the repository and the assignment, then produce the two
governing documents without touching application code.

**Done in this step**

- [x] Read the Assignment 9 PDF (Category 006).
- [x] Inspect configuration, dependencies, routes, components, styles, Git state.
- [x] Classify implemented / partial / missing / needs verification.
- [x] Define the target UI/UX structure and folder architecture.
- [x] Identify reusable files: `Button`, `cn`, `globals.css` tokens, Geist fonts,
      `sonner`, `lucide-react`, shadcn config.
- [x] Create `AGENTS.md` with permanent rules and the responsibility boundary.
- [x] Create this roadmap with the audit, 22-step plan, and backend scope.
- [x] Verify baseline: `npx tsc --noEmit` passes.

**Owner-side items not done (intentionally)**

- [ ] Create `.env` / `.env.local`.
- [ ] Scaffold the Express server and MongoDB.
- [ ] Any package installation.

**Expected result:** A shared understanding of the project and a safe plan.

**Stop point:** Wait for owner approval before Step 2.

---

### Step 2 — UI Design System & Shared Components

**Owner:** AI

**Objective:** Turn the neutral starter into a consistent Fixora design system.

**Reuse:** `src/app/globals.css`, `src/lib/utils.ts` (`cn`), `sonner`,
`lucide-react`, Geist fonts, the already-installed shadcn CLI/config. Read
`components.json`; do not change it.

**Files to modify**

- `src/app/globals.css` — brand tokens (`--brand`, `--brand-soft`, `--accent`,
  `--success`, `--warning`, `--danger`, `--info`, page/surface/border/text),
  radius, fix the `--font-sans` circular reference, expose tokens via `@theme`.
- `src/app/layout.tsx` — Fixora metadata (title template, description), `<Toaster />`.

**Files to create**

- `src/components/shared/site-button.tsx` — thin wrapper around the existing
  `Button` that applies the site sizes (`h-10`, `h-11`) and brand styling.
  **Do not edit `src/components/ui/button.tsx`** (AGENTS.md §16). Pages use
  `SiteButton`, so the button style stays consistent.
- `src/types/index.ts` — `User`, `Service`, `Booking`, `Payment`, `Category`,
  status union types.
- `src/lib/constants.ts` — categories, service modes, statuses, status color maps,
  nav links, dashboard nav configs, routes.
- `src/lib/format.ts` — `formatCurrency`, `formatDate`, `formatDateTime`,
  `formatRelativeDate` (built-in `Intl` only).
- `src/lib/validations.ts` — email, password, phone, required, min length, price,
  date-not-past. Plain functions returning error strings.
- `src/components/shared/logo.tsx` — wrench mark + "Fixora" wordmark.
- `src/components/shared/container.tsx`, `section-heading.tsx`,
  `page-header.tsx`, `status-badge.tsx`, `payment-badge.tsx`,
  `empty-state.tsx`, `confirm-dialog.tsx`, `user-avatar.tsx`,
  `loading-skeleton.tsx`.

**UI primitives to generate with the existing shadcn CLI:** card, input, label,
textarea, select, badge, dialog, alert-dialog, dropdown-menu, sheet, table, skeleton,
avatar, separator, switch.

**Dependency guard:** the shadcn CLI is already installed and `@base-ui/react` is
already present. Before generating, confirm the command will not add packages. If it
tries to install anything, **stop and ask the owner**. Do not add tabs, tooltip, or
other primitives we have no planned use for.

**Components:** design tokens, typography rules, `SiteButton` (primary CTAs; use the
raw `Button` only for small icon/ghost actions), and the shared primitives listed
above. No dark-mode toggle (optional in the assignment; not approved).

**Backend/integration notes:** none. This step is pure UI foundation.

**Dummy data:** none yet (types only).

**Expected result:** A documented, reusable visual system; the temporary starter
page still loads but now uses brand colors and typography.

**Testing checklist**

- [ ] `npx tsc --noEmit` and `npm run lint` pass.
- [ ] `npm run dev` shows the starter page with Geist Sans rendering correctly.
- [ ] `SiteButton` and `StatusBadge` render the brand/status colors correctly
      (verify on a temporary local render; do not keep a permanent demo page).
- [ ] `StatusBadge` covers every documented status.
- [ ] Toaster renders (trigger one test toast during development, then remove it).
- [ ] No generated file under `src/components/ui/` was hand-edited.

**Depends on:** Step 1.

---

### Step 3 — Public Layout: Navbar & Footer

**Owner:** AI

**Objective:** Create the public shell used by `/`, `/services`, `/services/[id]`,
`/about`, and payment pages.

**Reuse:** `SiteButton`, `Button`, `Logo`, `UserAvatar`, `DropdownMenu`, `Sheet`,
and `lucide-react` icons.

**Files to create**

- `src/app/(public)/layout.tsx` — Navbar + `<main>` + Footer.
- `src/components/layout/navbar.tsx` — sticky, active-route highlight, mobile menu,
  logged-out buttons, logged-in avatar dropdown (name, role badge, Dashboard,
  Update Profile, Sign Out items).
- `src/components/layout/mobile-nav.tsx` — hamburger + sheet.
- `src/components/layout/footer.tsx` — logo, tagline, quick links, popular
  categories, contact info, X/social icons, copyright.
- `src/components/layout/nav-links.tsx` (if shared between desktop/mobile).

**Files to move/modify**

- Move `src/app/page.tsx` → `src/app/(public)/page.tsx` (URL stays `/`).

**Components:** Navbar, MobileNav, Footer, nav link item, role badge.

**Backend/integration notes:** Navbar accepts an optional `user` prop. Pass `null`
for now with `// TODO(owner): replace with BetterAuth session`. Build the dropdown
so the owner only changes the data source later. **No auth logic.**

**Dummy data:** a demo user object may be used to visually test the dropdown, but
the default public render is logged out.

**Expected result:** Every public page has a sticky, responsive navbar and a
complete footer.

**Testing checklist**

- [ ] Desktop: logo left, links center, auth buttons right; active link highlighted.
- [ ] Mobile (360px): hamburger opens a sheet; no horizontal scroll.
- [ ] Logged-out state shows Sign In / Sign Up.
- [ ] Logged-in preview shows avatar dropdown with role badge and links.
- [ ] Keyboard: menu opens/closes, focus visible, Escape closes.
- [ ] Footer links target the correct planned routes (`/`, `/services`, `/about`);
      `/about` content arrives in Step 4.
- [ ] Category links use `/services?category=...`.

**Depends on:** Step 2.

---

### Step 4 — Homepage UI

**Owner:** AI

**Objective:** Build a recruiter-ready homepage using realistic dummy data, plus the
required `/about` page (it reuses the same marketing sections).

**Reuse:** Navbar/Footer shell, `SiteButton`, `Card`, `SectionHeading`,
`StatusBadge`, icons.

**Files to create**

- `src/components/home/hero.tsx` — headline, subtitle, search box (submits to
  `/services?search=...`), CTA, illustration/graphic.
- `src/components/home/featured-services.tsx` — 6 latest approved + available
  services from dummy data, sorted by `createdAt`.
- `src/components/home/how-it-works.tsx` — 4 steps (reused on `/about`).
- `src/components/home/popular-categories.tsx` — 7 category cards linking to
  `/services?category=...`.
- `src/components/home/why-choose-us.tsx` — trust points + platform stats.
- `src/components/home/testimonials.tsx` — 6 testimonials.
- `src/components/home/cta.tsx` — "Need a repair?" call to action.
- `src/components/home/category-card.tsx` — icon, category name, short description,
  link to `/services?category=...`.
- `src/components/services/service-card.tsx` (used here and in Step 6).
- `src/app/(public)/about/page.tsx` — story, how it works, trust points, stats, CTA.

**Files to modify**

- `src/app/(public)/page.tsx` — compose sections.

**Components:** ServiceCard (equal height, image, title, category, mode, starting
price, technician, View Details), CategoryCard, stat tiles, testimonial card.

**Backend/integration notes:** Featured services come from `src/data/services.ts`
today; the owner replaces the import with
`GET /api/services?approvalStatus=approved&isAvailable=true&limit=6` later. Keep the
mapping in one place.

**Dummy data:** the 12 approved + available services (from the 15 total), 7
categories, 6 testimonials, platform stats. Service images are local placeholder
graphics; avatars use initials.

**Expected result:** A complete homepage that looks finished and works at all widths.

**Testing checklist**

- [ ] Hero search navigates to `/services?search=<value>`.
- [ ] Exactly 6 featured cards render, equal height, consistent image size.
- [ ] Category cards link to `/services?category=AC` etc.
- [ ] How-it-works has 4 clear steps; testimonials readable.
- [ ] `/about` loads directly and reuses the same sections/styles.
- [ ] No layout shift/overflow at 360/768/1024/1440px.
- [ ] No missing images or broken links.

**Depends on:** Steps 2–3.

---

### Step 5 — Authentication UI

**Owner:** AI (UI only)

**Objective:** Build sign-up and sign-in screens with validation and clear
integration seams. **No real authentication.**

**Reuse:** `SiteButton`, `Input`, `Label`, `Card`, `Logo`, `PasswordField`,
`RoleSelector`, `validations.ts`, sonner.

**Files to create**

- `src/app/(auth)/layout.tsx` — split-screen/centered brand layout.
- `src/app/(auth)/sign-up/page.tsx`.
- `src/app/(auth)/sign-in/page.tsx`.
- `src/components/auth/sign-up-form.tsx` — name, email, password, confirm password,
  role cards (Customer / Technician only).
- `src/components/auth/sign-in-form.tsx` — email, password, remember-me (UI only).
- `src/components/auth/password-field.tsx` — show/hide toggle.
- `src/components/auth/role-selector.tsx` — card-style radios.
- `src/components/auth/auth-aside.tsx` — brand panel with benefits.

**Validation rules (client-side UI)**

- Name required.
- Email required + valid format.
- Password: min 6 chars, at least 1 uppercase, at least 1 lowercase — errors shown
  under the field, submit blocked.
- Role required and limited to customer/technician.
- Sign-in: email + password required.

**Backend/integration notes:** Submit handlers show a `// TODO(owner): call
BetterAuth signUp/signIn` comment and a "not connected yet" toast in development.
Do not store tokens, set cookies, or redirect based on a fake session. Document the
expected redirect map: customer → `/dashboard/customer`, technician →
`/dashboard/technician`, admin → `/dashboard/admin`.

**Dummy data:** none (forms only).

**Expected result:** Professional auth pages that validate correctly and clearly
state they are not connected yet.

**Testing checklist**

- [ ] Invalid password shows all three rule errors and blocks submit.
- [ ] Invalid email blocks submit.
- [ ] Admin is not selectable anywhere.
- [ ] Password visibility toggle works with the keyboard.
- [ ] Mobile layout is usable at 360px.
- [ ] Links between sign-in and sign-up work.
- [ ] No network request is made.

**Depends on:** Step 2.

---

### Step 6 — Services Listing UI

**Owner:** AI

**Objective:** Build `/services` with search, category/mode filters, sort, responsive
grid, and URL-driven state.

**Reuse:** ServiceCard, `Input`, `Select`, `Button`, `Badge`, `Sheet` (mobile
filters), `EmptyState`, `LoadingSkeleton`.

**Files to create**

- `src/app/(public)/services/page.tsx`.
- `src/components/services/service-grid.tsx`.
- `src/components/services/service-filters.tsx` — search, category, service mode,
  sort, clear-all; mobile sheet version.
- `src/components/services/services-toolbar.tsx` — result count + sort.
  Use the shared `EmptyState` for no results; do not create a duplicate empty-state
  component.

**Behavior**

- Read `search`, `category`, `mode`, `sort` from the URL.
- Update the URL with `router.replace` (no full reload) when controls change.
- For the UI demo, filter the dummy list client-side and label it:
  `// TEMP: client-side demo only — final search/filter/sort must run in MongoDB`.
- Sort: newest, price low→high, price high→low.
- Show a friendly empty state with "Clear filters".

**Backend/integration notes:** The owner will implement server-side query params on
`GET /api/services`. Keep the param names stable (`search`, `category`, `mode`,
`sort`) and documented in Step 18.

**Dummy data:** the 12 approved + available services; the 1 pending, 1 rejected, and
1 unavailable service must never appear publicly.

**Expected result:** A complete browse page whose state survives reload and supports
`/services?category=AC` deep links.

**Testing checklist**

- [ ] Deep link with `?category=AC` opens pre-filtered.
- [ ] Search matches title or category.
- [ ] Mode filter and all three sorts work.
- [ ] Reload keeps filters (URL params).
- [ ] Empty state appears for nonsense searches and clears correctly.
- [ ] Grid is 1/2/3/4 columns at 360/768/1024/1440px.
- [ ] Cards are equal height.

**Depends on:** Steps 2–4.

---

### Step 7 — Service Details & Repair Request UI

**Owner:** AI (request form UI only)

**Objective:** Full service detail page and the role-restricted request form UI.

**Reuse:** a simple inline breadcrumb (no new primitive), `Badge`, `SiteButton`,
`Card`, `Avatar`, `Dialog`, `Textarea`, `Input`, `Label`, `StatusBadge`,
`formatCurrency`, and `notFound()` for missing services.

**Files to create**

- `src/app/(public)/services/[id]/page.tsx` — image, title, category, description,
  starting price, duration, mode, service area, technician summary (name, area, bio,
  avatar), request panel. Call `notFound()` for an unknown, pending, unavailable, or
  rejected service.
- `src/components/services/service-detail.tsx` (if the page gets long).
- `src/components/services/technician-summary.tsx`.
- `src/components/services/request-repair-button.tsx` — role-aware states.
- `src/components/services/request-form.tsx` — modal/section form.

**Request form fields**

- Name + Email: read-only (from the demo session placeholder).
- Phone, Address, Preferred Date (today or future), Problem Description (min 20 chars).
- Client validation + error messages.
- Success state: toast + link to `/dashboard/customer/bookings` (UI only).

**Role behavior (UI only)**

- Logged out: clicking Request Repair navigates to `/sign-in?redirect=/services/[id]`.
- Technician/admin: button disabled with "Only customers can request a repair".
- Customer: opens the form.
- In the current UI phase there is no real session, so the default is logged-out;
  document how the owner wires the real session role in.

**Backend/integration notes:** `POST /api/bookings` (owner). Server must copy service
+ technician data, default `requested`/`unpaid`, reject duplicate active requests, and
block technicians/admins. The form must not pretend to save.

**Dummy data:** services; a demo customer for the form's read-only fields; one
existing active booking to demonstrate the duplicate warning UI.

**Expected result:** A detail page that handles unknown/unapproved services and a
clear, validated request UI with correct role messaging.

**Testing checklist**

- [ ] Unknown id → Not Found page.
- [ ] Pending/unavailable service → Not Found.
- [ ] All required fields validated, date cannot be in the past.
- [ ] Description under 20 chars is blocked.
- [ ] Logged-out click goes to sign-in with a redirect param.
- [ ] Technician/admin see the disabled state + notice.
- [ ] Mobile layout stacks cleanly.

**Depends on:** Steps 2–4, 6.

---

### Step 8 — Customer Dashboard

**Owner:** AI

**Objective:** Customer dashboard shell usage + overview, bookings display, payment
history (read-only data presentation).

**Reuse:** `Table`, `Badge`, `StatusBadge`, `PaymentBadge`, `EmptyState`,
`PageHeader`, `formatCurrency`, `formatDate`.

**Files to create**

- `src/app/(dashboard)/layout.tsx` — shared dashboard shell (sidebar + topbar +
  content). It reads a **display-only demo user** and the current path to preview
  the correct role shell until BetterAuth is wired. No access control here.
- `src/data/demo-session.ts` — `demoUsers.customer/technician/admin` plus a
  `getDemoUserForPath(pathname)` helper marked
  `// DEMO ONLY: replace with the BetterAuth session`. This is presentation data,
  not authentication.
- `src/components/layout/dashboard-shell.tsx`, `sidebar.tsx`, `topbar.tsx`
  — role-aware nav configs from `constants.ts`; mobile sheet; Home link; user block.
  This is the **first time** the dashboard shell is built; Step 2 does not create it.
- `src/app/(dashboard)/dashboard/profile/page.tsx` — **temporary placeholder**
  (`PageHeader` + `EmptyState`) so the sidebar link never 404s; Step 11 replaces it.
- `src/components/shared/stat-card.tsx` — reusable dashboard stat tile.
- `src/components/shared/mini-bar-chart.tsx` — CSS/SVG chart, no chart library.
- `src/components/shared/data-table.tsx` — generic table wrapper with a responsive
  scroll container; reused by all later tables.
- `src/components/dashboard/customer-overview.tsx` — stats: Total Requests, Active
  Jobs, Completed Jobs; recent bookings; a small status bar chart; quick actions.
- `src/app/(dashboard)/dashboard/customer/page.tsx`.
- `src/app/(dashboard)/dashboard/customer/bookings/page.tsx` + bookings table
  (desktop) / cards (mobile), service info, technician, date, amount, status,
  payment badge.
- `src/app/(dashboard)/dashboard/customer/payments/page.tsx` + payments table
  (service, technician, amount, transaction ID, date).

**Backend/integration notes:** Demo customer data only. The booking actions
(cancel/pay) are added in Steps 16–17. API seams: `GET /api/bookings/my` and the
customer payment-history endpoint. **The current API contract in AGENTS.md §12 only
lists admin payments**, so Step 12 must confirm either `GET /api/payments/my` or a
documented alternative with the owner before integration.

**Dummy data:** demo customer + 5 of the 8 bookings across statuses + 3 of the 4
payments. The remaining records belong to other customers/technicians so the admin
views look realistic.

**Expected result:** A responsive customer dashboard with a functional sidebar,
accurate stats derived from dummy bookings, and readable tables.

**Testing checklist**

- [ ] Sidebar highlights the active page; collapses to a sheet under `lg`.
- [ ] Stats equal the dummy data.
- [ ] Tables scroll horizontally on mobile; no clipped actions.
- [ ] Empty state shown when the dummy array is emptied.
- [ ] Topbar shows demo name, role, avatar, Home link.
- [ ] `/dashboard/profile` shows the temporary placeholder (the real page arrives in
      Step 11).
- [ ] No role guard or auth check is faked.

**Depends on:** Steps 2, 4, 6.

---

### Step 9 — Technician Dashboard

**Owner:** AI

**Objective:** Technician overview and the Add Service form UI.

**Reuse:** DashboardShell, StatCard, `Card`, form primitives, `Select`, `Input`,
`Label`, `Textarea`, `Button`, `MiniBarChart`.

**Files to create**

- `src/app/(dashboard)/dashboard/technician/page.tsx` — Total Services, Approved
  Services, Pending Requests, recent activity, monthly jobs chart.
- `src/components/dashboard/technician-overview.tsx`.
- `src/app/(dashboard)/dashboard/technician/add-service/page.tsx`.
- `src/components/dashboard/add-service-form.tsx` — title, category, description,
  base price, estimated duration, service mode, service area, image upload
  **placeholder** (file input styled, no upload).
- `src/app/(dashboard)/dashboard/technician/my-services/page.tsx` — **temporary
  placeholder** (replaced in Step 15) so the sidebar never dead-ends.
- `src/app/(dashboard)/dashboard/technician/requests/page.tsx` — **temporary
  placeholder** (replaced in Step 16) for the same reason.
- Read-only technician name/email from demo data.

**Validation:** title ≥ 5, description ≥ 20, basePrice > 0, duration required, mode
required, area required, image required (UI only).

**Backend/integration notes:** `POST /api/services` (owner) with ImgBB upload and
`approvalStatus: "pending"`. Show "waiting for admin approval" in the success toast.
Do not call ImgBB.

**Dummy data:** demo technician + their services/bookings for stats.

**Expected result:** Technician dashboard and a complete, validated add-service form.

**Testing checklist**

- [ ] Stats correct against dummy data.
- [ ] Every validation rule blocks submit with an inline message.
- [ ] File input shows the selected filename/preview if a local object URL is used
      (no network call).
- [ ] Success toast explains pending approval.
- [ ] Mobile: two-column form becomes one column.
- [ ] `/dashboard/technician` previews the technician sidebar and role label
      (display only); no access control is added.

**Depends on:** Step 8 (shell).

---

### Step 10 — Admin Dashboard

**Owner:** AI

**Objective:** Admin overview plus read-only management tables.

**Reuse:** DashboardShell, `StatCard`, `MiniBarChart`, `DataTable`, `Select`
(role), `Badge`, `StatusBadge`, `PaymentBadge`, `formatCurrency`, `formatDate`.

**Files to create**

- `src/app/(dashboard)/dashboard/admin/page.tsx` — Total Users, Total Technicians,
  Pending Services, revenue summary, users-by-role chart, bookings chart.
- `src/app/(dashboard)/dashboard/admin/users/page.tsx` — photo/avatar, name, email,
  role, joined date. The role select is interactive and shows a placeholder toast
  (local state only); the owner's API persists it later. The admin's own role select
  is disabled.
- `src/app/(dashboard)/dashboard/admin/services/page.tsx` — all services, approval
  filter (pending first). **Read-only in this step**; approve/reject actions are
  added in Step 15, so they are not duplicated here.
- `src/app/(dashboard)/dashboard/admin/bookings/page.tsx` — read-only all bookings,
  status filter, amount, payment status.
- `src/app/(dashboard)/dashboard/admin/transactions/page.tsx` — payments table +
  total revenue summary.
- `src/components/dashboard/admin-users-table.tsx`,
  `admin-services-table.tsx`, `admin-bookings-table.tsx`,
  `admin-transactions-table.tsx`.

**Backend/integration notes:** Owner endpoints in AGENTS.md §12. Client-side filter
on dummy data is temporary; real filtering/role updates must be server-side.

**Dummy data:** 8 users (4 customers, 3 technicians, 1 admin), all 15 services, all
8 bookings, all 4 payments.

**Expected result:** Admin can review every entity in a consistent, responsive UI.

**Testing checklist**

- [ ] Stats and revenue totals match dummy data.
- [ ] Pending services appear first / are easy to find.
- [ ] Status and approval filters work on dummy data.
- [ ] Admin's own role select is disabled with an explanation.
- [ ] Role changes are local-only and clearly labelled as not yet saved.
- [ ] Transactions total is the sum of payment amounts.
- [ ] Wide tables become scrollable/cards on mobile.
- [ ] `/dashboard/admin` previews the admin sidebar and role label (display only);
      no access control is added.

**Depends on:** Step 8.

---

### Step 11 — Shared Profile UI

**Owner:** AI

**Objective:** One profile page for all roles at `/dashboard/profile`.

**Reuse:** `Card`, `Input`, `Label`, `Textarea`, `Avatar`, `Button`, `validations`.

**Files to create**

- `src/app/(dashboard)/dashboard/profile/page.tsx` — replace the Step 8 placeholder
  with the real profile page.
- `src/components/dashboard/profile-form.tsx` — name, phone, area, bio, photo
  upload placeholder; email and role read-only; save button + success state.

**Validation:** name required, phone optional but format-checked, area optional,
bio ≤ 300 chars.

**Backend/integration notes:** `PATCH /api/users/profile` + ImgBB upload (owner).
The UI must be ready to accept the updated user object; show a toast placeholder.
After real integration, the updated name/photo must appear in the navbar and
dashboard topbar **without logging out** — the owner handles the session refresh.

**Dummy data:** the profile form takes a `user` prop; render `demoUsers.customer` by
default and document that the owner swaps in the BetterAuth session. Email and role
stay read-only. Do not build a role switcher.

**Expected result:** A clean, responsive profile form consistent across roles.

**Testing checklist**

- [ ] Email and role are visibly read-only.
- [ ] Validation errors appear inline.
- [ ] Character counter for bio works (if added).
- [ ] Photo preview works locally without uploading.
- [ ] Save shows a clearly worded placeholder state.

**Depends on:** Step 8.

---

### Step 12 — Frontend ↔ Backend Integration Planning

**Owner:** AI (documentation) + OWNER (approval)

**Objective:** Agree on how dummy data will be replaced by real APIs without
rewriting the UI.

**Deliverables (append to AGENTS.md / this roadmap unless a new doc is approved)**

- [ ] Data-source map: component → dummy file → future endpoint → response shape.
- [ ] Finalize API base URL + environment variable names.
- [ ] **Resolve contract gaps** before integration: customer payment-history endpoint
      (`GET /api/payments/my` or an agreed alternative) is not in AGENTS.md §12 yet.
- [ ] Auth integration points: BetterAuth client, session access, JWT storage
      strategy, redirect behaviour after sign-in.
- [ ] Error envelope contract (message, field errors, status codes).
- [ ] Loading strategy (server component vs client fetch) compatible with
      `cacheComponents: true`.
- [ ] Image source strategy (local placeholders → ImgBB URLs; `next.config`
      `images.remotePatterns` for the ImgBB host). **Any config change requires
      explicit owner approval.**
- [ ] Currency/date consistency between API and UI.
- [ ] Definition of "done" for replacing each dummy import.
- [ ] Confirm no new package is required by the integration plan.

**Backend notes:** Owner confirms endpoint shapes before UI integration starts.

**Dummy data:** unchanged.

**Expected result:** A single, agreed integration contract. No code changes beyond docs.

**Testing checklist:** Contract review with the owner; no contradictions with the
database reference in AGENTS.md §11.

**Depends on:** Steps 7–11 (enough UI to map data).

---

### Step 13 — Backend API Requirements Documentation

**Owner:** AI (documentation) / OWNER (implementation)

**Objective:** A precise endpoint specification the owner can implement.

**Deliverables**

- [ ] Request/response examples for every endpoint in AGENTS.md §12.
- [ ] Validation rules per field (mirroring frontend validation).
- [ ] Authorization matrix (role + ownership) per endpoint.
- [ ] Status codes and error messages the UI expects.
- [ ] Pagination/search/filter/sort query contract for `/api/services`.
- [ ] Which fields are copied at booking creation and must never be trusted later.
- [ ] Stripe session creation request/response contract.
- [ ] Upload endpoint contract (if the owner prefers an ImgBB proxy).

**Backend notes:** This is the owner's build checklist; the AI writes no server code.

**Expected result:** No ambiguity when the owner builds Express routes.

**Testing checklist:** Every UI action in Steps 5–11 maps to an endpoint or an
explicitly owner-only action.

**Depends on:** Step 12.

---

### Step 14 — JWT & Role-Based Security Documentation

**Owner:** AI (documentation) / OWNER (implementation)

**Objective:** Document the security requirements the frontend and backend must meet.

**Deliverables**

- [ ] Middleware matrix (verifyToken / verifyCustomer / verifyTechnician /
      verifyAdmin) per endpoint.
- [ ] 401 vs 403 decision table.
- [ ] Ownership rules: bookings, services, payments, profile, role changes.
- [ ] Token flow: BetterAuth session → JWT issuance → Express verification.
- [ ] Frontend rules: never trust local role state; handle 401 by redirecting to
      sign-in with a return URL; handle 403 with a Forbidden state.
- [ ] Rate/duplicate protections: duplicate active booking, duplicate payment.
- [ ] What the frontend must never send (role, amounts, status, emails).

**Expected result:** A security checklist both sides can verify.

**Testing checklist:** Owner confirms each rule is enforceable server-side.

**Depends on:** Step 13.

---

### Step 15 — Service Management & Approval UI

**Owner:** AI

**Objective:** Complete technician service CRUD UI and admin approval actions (UI
only, no persistence). This is where the admin approval buttons first appear; the
Step 10 admin services page stays read-only.

**Reuse:** DataTable, Dialog, AlertDialog, `Switch`, `Select`, `StatusBadge`,
`EmptyState`, toasts.

**Files to create/modify**

- `src/app/(dashboard)/dashboard/technician/my-services/page.tsx` — replace the
  Step 9 placeholder with the real table/cards view: image, title, category, price,
  approval badge, availability, actions.
- `src/app/(dashboard)/dashboard/admin/services/page.tsx` — replace the read-only
  table from Step 10 with approval actions (pending first, filter preserved).
- `src/components/dashboard/my-services-table.tsx`.
- `src/components/dashboard/edit-service-dialog.tsx` — pre-filled form; after save,
  show "approval resets to pending" notice.
- `src/components/dashboard/delete-service-dialog.tsx` — confirmation.
- `src/components/dashboard/availability-toggle.tsx` — optimistic local state only.
- `src/components/dashboard/admin-service-actions.tsx` — approve/reject with
  confirmation + toast.

**Backend/integration notes:** `PATCH/DELETE /api/services/:id`,
`PATCH /api/admin/services/:id/approval`. Editing must reset approval server-side.
Toggle availability must hide the service publicly.

**Dummy data:** services for the demo technician + other technicians' services for
admin approval.

**Expected result:** Full CRUD/approval interactions, visually complete, with honest
placeholder feedback.

**Testing checklist**

- [ ] Delete/reject always require confirmation.
- [ ] Edit dialog is pre-filled and validates.
- [ ] Status badges update in local UI state after an action (demo only).
- [ ] Empty state when a technician has no services.
- [ ] Keyboard accessibility for dialogs and toggles.

**Depends on:** Steps 9–10.

---

### Step 16 — Booking Status Pipeline UI

**Owner:** AI

**Objective:** Role-correct booking actions and status transitions in the UI.

**Reuse:** DataTable, `StatusBadge`, `PaymentBadge`, `Dialog`, `AlertDialog`,
`EmptyState`, `formatCurrency`, `formatDate`.

**Files to create/modify**

- `src/app/(dashboard)/dashboard/technician/requests/page.tsx` — replace the Step 9
  placeholder with the technician Manage Requests page.
- `src/components/dashboard/technician-requests-table.tsx` — customer, phone,
  address, date, problem, service, status, filtered actions.
- `src/components/dashboard/request-actions.tsx` — Accept / Reject (`requested`),
  Start Work (`accepted`), Mark Completed (`in-progress`).
- `src/components/dashboard/complete-job-dialog.tsx` — final amount (pre-filled with
  base price, must be > 0).
- Status filter: All / Requested / Accepted / In Progress / Completed.
- `src/components/dashboard/booking-status-flow.tsx` — visual pipeline helper
  (optional but recommended).
- `src/app/(dashboard)/dashboard/customer/bookings/page.tsx` — add the Cancel button
  (only `requested`, with confirmation) and the Pay Now **gating/placement** (only
  `completed` + `unpaid`); a paid booking shows a Paid badge. The working
  `PayNowButton` arrives in Step 17.

**Behavior:** Simulate local state changes with a toast and a `TODO(owner)` comment.
Never persist, never claim success against a real backend.

**Backend/integration notes:** `PATCH /api/bookings/:id/status` and
`PATCH /api/bookings/:id/cancel`; server enforces valid transitions and ownership.
Pay Now is wired in Step 17.

**Dummy data:** bookings covering every status, including one `completed` + `unpaid`
to show Pay Now and one `cancelled` to prove no actions appear.

**Expected result:** Only valid actions appear for each status, with clear
confirmation steps.

**Testing checklist**

- [ ] No action buttons on completed/rejected/cancelled jobs (except payment badge).
- [ ] Cancel only on `requested`; confirmation required.
- [ ] Pay Now only on `completed` + `unpaid`.
- [ ] Final-amount modal blocks 0/negative/empty values.
- [ ] Status filter works and shows counts.
- [ ] Mobile cards show the same information as the table.

**Depends on:** Steps 8–10, 15.

---

### Step 17 — Stripe Payment UI

**Owner:** AI (UI) / OWNER (Stripe integration)

**Objective:** Payment UI around an owner-implemented Stripe Checkout flow.

**Reuse:** `SiteButton`, `Card`, `EmptyState`, `formatCurrency`, sonner.

**Files to create**

- `src/app/(public)/payment/success/page.tsx` — reads `session_id` from search
  params; shows pending verification UI, amount, transaction ID, "Back to My
  Bookings"; **no fake verification**.
- `src/app/(public)/payment/cancel/page.tsx` — friendly message, Try Again button.
- `src/components/payment/payment-success-card.tsx`.
- `src/components/payment/payment-cancel-card.tsx`.
- `src/components/payment/pay-now-button.tsx` — loading/disabled state + a
  `TODO(owner): POST /api/payments/create-checkout-session` handler.

**Backend/integration notes**

- Owner creates the Checkout Session server-side using `finalAmount` from MongoDB.
- The client only receives a Checkout URL and redirects; **no Stripe.js, publishable
  key, or card form is needed** for hosted Checkout.
- Success page must call `GET /api/payments/verify?session_id=...` (owner) and show
  loading/success/error states accordingly.
- Cancel page changes nothing in the database.
- Guarantee the UI never trusts an amount from the client and never saves a payment.
- Test card `4242 4242 4242 4242` (owner testing only).
- Payment pages live under the `(public)` route group (navbar + footer) per
  AGENTS.md §8; access control is still the owner's responsibility.

**Dummy data:** a completed + unpaid booking for the UI state; no fake transaction.

**Expected result:** Pay Now, success, and cancel screens that are visually complete
and ready for the owner's API.

**Testing checklist**

- [ ] Pay Now shows a loading state and does not navigate anywhere fake.
- [ ] Success page handles missing `session_id` gracefully.
- [ ] Cancel page has a working link back to bookings.
- [ ] No card data is collected in the app (Stripe hosted checkout only).
- [ ] Page reload on both routes does not error.

**Depends on:** Step 16.

---

### Step 18 — Search, Filter & Sort Integration Preparation

**Owner:** AI (UI prep) / OWNER (MongoDB implementation)

**Objective:** Ensure the listing UI can switch from demo filtering to server-side
querying without redesign.

**Work**

- [ ] Confirm URL param names: `search`, `category`, `mode`, `sort`, `page`.
- [ ] Move param parsing into a small helper so the owner can reuse it.
- [ ] Add **one** documented data-source seam:
      `getServices(params)` in `src/lib/services-data.ts`. It filters dummy data in
      this phase and becomes the single place the owner swaps for
      `GET /api/services`. This is an intentional addition to the structure in
      AGENTS.md §8 — no other structural changes.
- [ ] Add result-count and active-filter chips.
- [ ] Prepare pagination UI shell (optional challenge) without wiring it.
- [ ] Document the expected server query behaviour and response shape.
- [ ] Remove the temporary client filter once the owner's API is ready (owner-led
      integration step).

**Backend/integration notes:** MongoDB must perform search (title/category), category
filter, mode filter, and sort (price asc/desc, newest). Client-side `.filter()` is
**not** an acceptable final implementation.

**Expected result:** A clean swap point for real server-side search.

**Testing checklist**

- [ ] URL is the single source of truth for filters.
- [ ] Deep links and back/forward navigation work.
- [ ] The swap point is a single function, not scattered imports.
- [ ] No visual regression.

**Depends on:** Step 6; ideally after Step 13.

---

### Step 19 — Loading, Error & Empty States

**Owner:** AI

**Objective:** Complete the assignment's required app-level states.

**Files to create**

- `src/app/loading.tsx` — branded skeleton/spinner.
- `src/app/error.tsx` — client error boundary with reset + home buttons.
- `src/app/global-error.tsx` — minimal full-page fallback.
- `src/app/not-found.tsx` — repair/tools illustration, Back to Home.
- `src/components/shared/empty-state.tsx` (if not already complete).
- `src/components/shared/table-skeleton.tsx`, `card-grid-skeleton.tsx`.
- Route-level `loading.tsx` for services, dashboards (optional, purposeful only).

**States to cover**

- No services found, no bookings, no requests, no payments, no users.
- Loading: skeletons matching final layout (avoid spinners that cause layout shift).
- Error: friendly copy + retry; never expose stack traces.

**Backend/integration notes:** Error boundary copy must make sense when API calls
fail later; prepare an `error` prop message area.

**Expected result:** No dead ends; every data area has polished loading/empty/error UI.

**Testing checklist**

- [ ] `/does-not-exist` shows the custom 404.
- [ ] Throwing a test error shows the error boundary (remove the test after).
- [ ] Empty arrays render the CTA empty state.
- [ ] Skeletons approximate the real layout at mobile and desktop.
- [ ] Reloading any route does not crash.

**Depends on:** Steps 4–11.

---

### Step 20 — Dummy / Seed Data Preparation

**Owner:** AI (dummy data) / OWNER (real seed scripts)

**Objective:** Make the live demo look complete and give the owner a seed blueprint.

**Work**

- [ ] 3 technicians + 4 customers + 1 admin (8 users) with realistic names, areas,
      phones, bios, avatar initials.
- [ ] 15 services covering all 7 categories, mixed prices/durations/modes.
- [ ] 12 approved + available (so the assignment's 12+ requirement is met), 1
      pending, 1 rejected, 1 unavailable.
- [ ] 8 bookings spanning requested, accepted, in-progress, completed+unpaid,
      completed+paid, rejected, cancelled.
- [ ] 4 payments linked to completed bookings.
- [ ] 6 testimonials + platform stats.
- [ ] At least one technician has multiple approved services and bookings in
      different statuses, so the examiner can test every flow.
- [ ] Verify every page shows coherent data (same names/emails across collections).
- [ ] Document the equivalent JSON shape for the owner's seed script (no script
      written by the AI).
- [ ] Add a footer/demo note that data is sample data, and state clearly that it is
      not real database data.

**Expected result:** A complete, consistent demo that an examiner can navigate.

**Testing checklist**

- [ ] Service counts per category are believable.
- [ ] No orphan references (booking → service → technician email all match).
- [ ] Payment amounts equal the booking's finalAmount.
- [ ] No duplicate `_id` values.
- [ ] Every dashboard looks populated but not absurd.

**Depends on:** Steps 4–18.

---

### Step 21 — Frontend Testing, Security Review & Bug Fixing

**Owner:** AI

**Objective:** Verify the frontend is production-quality within its scope.

**Testing**

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- [ ] All routes load on direct reload (no 404/500).
- [ ] Responsive at 360/768/1024/1440px.
- [ ] Keyboard navigation, focus states, contrast, alt text, labels.
- [ ] No horizontal overflow, no broken images, no console errors.
- [ ] All links resolve; no dead buttons without explanation.
- [ ] Forms: every rule, every error message, pending state.
- [ ] Dialogs: focus trap, Escape, cancel path.
- [ ] Empty/loading/error states.
- [ ] Confirm no fake auth, fake tokens, fake payments, or mock APIs exist.
- [ ] Confirm no secrets in the client bundle.

**Security review (frontend scope)**

- [ ] No role check is presented as security.
- [ ] No sensitive key uses `NEXT_PUBLIC_`.
- [ ] External links use `rel="noopener noreferrer"`.
- [ ] User-generated content is rendered as text, never raw HTML.

**Expected result:** A clean, stable frontend with a documented issue list.

**Depends on:** Steps 2–20.

---

### Step 22 — Deployment & Final Assignment Checklist

**Owner:** OWNER (deployment) / AI (README + final UI polish)

**AI deliverables**

- [ ] Rewrite `README.md`: Fixora name, purpose, tagline, key features, live URL
      placeholder, admin/technician/customer test-account placeholders, screenshots,
      **npm packages used**, setup steps, and env var **names** (never values).
- [ ] Final visual consistency pass across public + dashboard.
- [ ] Production build fix list (`npm run build`).
- [ ] Git commit plan: at least 20 meaningful client-side commits and 12
      server-side commits (suggest messages; the owner commits).
- [ ] Confirm no secret appears in the README, client bundle, or Git history.

**Owner deliverables**

- [ ] Deploy frontend (Vercel) and backend.
- [ ] Set production env vars, CORS, BetterAuth trusted origins.
- [ ] Stripe webhook endpoint + signing secret.
- [ ] Seed production data; create admin manually.
- [ ] Test all three roles on the live site.
- [ ] Fill in admin/technician/customer test credentials, live URL, repo links.
- [ ] Verify no error on reload of any route and no redirect loop for logged-in users.

**Expected result:** A submittable assignment with a stable live demo.

**Depends on:** Everything.

---

## 5. Backend Scope — OWNER ONLY

> The AI writes no server code for these items. It may document, review on request,
> or explain concepts. This section exists so both sides know what must exist.

### 5.1 Foundation

- [ ] Express server, folder structure, scripts.
- [ ] Environment variables (`.env`, never committed).
- [ ] MongoDB connection (Atlas/local), CORS with the frontend origin, JSON body
      parsing, centralized error handling, 404 handler.
- [ ] Health check endpoint.

### 5.2 Collections (exactly four)

- [ ] `users` via BetterAuth adapter + additional fields (`role`, `phone`, `area`,
      `bio`); admin inserted manually.
- [ ] `services` (fields per AGENTS.md §11).
- [ ] `bookings` (copied service/technician data, statuses, finalAmount,
      paymentStatus).
- [ ] `payments` (one per paid booking; unique `stripeSessionId`).
- [ ] Indexes: `users.email` unique, `services.technicianEmail`,
      `bookings.customerEmail`, `bookings.technicianEmail`,
      `bookings.serviceId`, `payments.bookingId`, `payments.stripeSessionId` unique.

### 5.3 APIs

- [ ] User profile: `GET/PATCH /api/users/profile`.
- [ ] Services: list (with search/filter/sort), details, create, update, delete.
- [ ] Bookings: create (customer), my bookings, technician bookings, cancel,
      status update.
- [ ] Admin: users list, role change, service approval, all bookings, all payments.
- [ ] Payments: create checkout session, verify session (and optional webhook);
      customer payment history (endpoint to confirm in Step 12).
- [ ] Upload endpoint (ImgBB proxy) if not uploading from the client.

### 5.4 BetterAuth & JWT

- [ ] BetterAuth + MongoDB adapter, additional fields.
- [ ] Customer/technician sign-up only; server forces `customer` for invalid roles.
- [ ] No public admin registration.
- [ ] JWT issued after auth, verified by Express.
- [ ] Frontend session integration and redirect-after-login behaviour.
- [ ] Route protection for `/dashboard/**` (Next.js `proxy.ts`, not `middleware.ts`).

### 5.5 Authorization & business logic

- [ ] `verifyToken`, `verifyCustomer`, `verifyTechnician`, `verifyAdmin`.
- [ ] 401 unauthenticated, 403 wrong role/ownership.
- [ ] Ownership checks for bookings, services, payments.
- [ ] Admin cannot change their own role.
- [ ] Service starts pending; editing resets to pending; only approved+available public.
- [ ] Duplicate active request prevention.
- [ ] Technicians/admins cannot create bookings; technicians cannot book own service.
- [ ] Valid status transitions only; customer cancel only while `requested`.
- [ ] `finalAmount > 0` required on completion.
- [ ] Payment only for `completed` + `unpaid` booking owned by the customer.
- [ ] No duplicate payment (unique session/booking check).
- [ ] Never trust client role, email, price, amount, or status.

### 5.6 Media & payments

- [ ] ImgBB integration for service and profile images; store URLs.
- [ ] Stripe test mode; server computes `unit_amount` from `finalAmount`.
- [ ] Success URL, cancel URL, metadata (`bookingId`, `customerEmail`).
- [ ] Verify on success page (minimum) or webhook (challenge), then insert payment and
      set booking `paymentStatus: "paid"` idempotently.
- [ ] Cancel flow leaves the database unchanged.

### 5.7 Seed & deployment

- [ ] Seed: 2+ technicians, 12+ approved services, bookings in different statuses,
      customers, manual admin.
- [ ] Deploy backend and frontend; production env vars; CORS; trusted origins.
- [ ] Stripe webhook (if implemented) configured on the deployed URL.
- [ ] 12+ meaningful server commits, 20+ meaningful client commits.

### 5.8 Open contract questions (resolve with the owner in Step 12)

- [ ] Customer payment history: AGENTS.md §12 lists only admin payments. Confirm
      `GET /api/payments/my` or an agreed alternative before real data integration.
- [ ] Frontend auth/session flow: confirm whether the BetterAuth session or a JWT is
      used by the Next.js UI, and how the Express API receives the token.
- [ ] Image upload: confirm a protected upload endpoint (preferred) versus a
      client-side ImgBB key.
- [ ] Whether the Stripe webhook challenge is attempted; the success-page
      verification is the required minimum.
- [ ] Exact JSON response shape for list endpoints (`data` array vs `{ data, total }`)
      before wiring the UI.

No new endpoint is assumed to exist. The owner must confirm each item.

---

## 6. Assignment Challenges — Ownership Map

| Challenge | Requirement | AI part | Owner part |
| --- | --- | --- | --- |
| 1. Server-side search/filter/sort | MongoDB query, URL persistence | Filter UI, URL params, loading/empty states, swap point | Query implementation, API response |
| 2. JWT & role middleware | 401/403, ownership | Document UI expectations; handle 401/403 states | Tokens + middleware + ownership checks |
| 3. Status pipeline & payment gate | Server-enforced transitions | Show only valid actions; final-amount modal; Pay Now gating | Enforce transitions, ownership, payment eligibility |
| 4. Stripe webhook (optional) | Idempotent payment recording | Success/cancel UI | Webhook, signature verification, idempotency |

### Optional Enhancements (only after all 22 steps)

These are **not required** for the core assignment. Do not start them without an
explicit owner request and never before Steps 1–22 are complete.

| Enhancement | AI part | Owner part |
| --- | --- | --- |
| Pro Technician plan | Plan badge/UI, upgrade prompt | `plan` field, Stripe subscription, limits |
| Rating & review | Star/review UI on paid bookings + service cards | Store rating/review, compute averages |
| Job timeline tracker | Visual step tracker from status history | `statusHistory` array, append on transitions |
| Server-side pagination | Pagination UI + URL `page` param | MongoDB `.skip()` / `.limit()` |
| PDF invoice + dark mode | Invoice/dark-mode UI polish | Invoice data endpoint; theme is optional |

---

## 7. Dummy Data Blueprint

| File | Contents |
| --- | --- |
| `src/data/categories.ts` | 7 categories: name, slug, icon key, short description, tint |
| `src/data/users.ts` | 3 technicians, 4 customers, 1 admin; 24-char hex ids; names, emails, phones, areas, bios. The Joined date column uses BetterAuth's built-in `createdAt`; it is not a custom field. |
| `src/data/services.ts` | 15 services: 12 approved+available, 1 pending, 1 rejected, 1 unavailable; all 7 categories |
| `src/data/bookings.ts` | 8 bookings covering all 6 statuses; linked service/technician/customer emails |
| `src/data/payments.ts` | 4 payments linked to completed bookings; Stripe-like ids |
| `src/data/testimonials.ts` | 6 realistic testimonials |
| `src/data/stats.ts` | Platform stats (technicians, jobs, satisfaction) |
| `src/data/demo-session.ts` | Demo customer/technician/admin for display only |

Consistency rules: every booking's service/technician data matches its service;
payment amount equals booking `finalAmount`; `_id`s are unique 24-char hex;
dates are ISO strings; prices are USD. Every file starts with the standard banner
`// ⚠️ DUMMY DATA for UI development only. Replace with API data.` Images are local
placeholders and avatars are initials-based; no external image dependency.

---

## 8. UI/UX Page Map

```
Public
  /                         Navbar + Hero + Featured + How It Works + Categories
                            + Why Choose Us + Testimonials + CTA + Footer
  /services                 Filters + sort + responsive grid + empty state
  /services/[id]            Detail + technician + request panel/modal
  /about                    Story, how it works, trust, stats, CTA
  /payment/success          Verification/success UI
  /payment/cancel           Cancelled UI

Auth
  /sign-in                  Split layout, form, validation
  /sign-up                  Split layout, role cards, password rules

Dashboard (sidebar + topbar, no public footer)
  /dashboard/customer            Stats, recent bookings, status chart, quick actions
  /dashboard/customer/bookings   Table/cards, cancel + pay rules
  /dashboard/customer/payments   Payment history
  /dashboard/technician          Stats, recent requests, jobs chart
  /dashboard/technician/add-service
  /dashboard/technician/my-services
  /dashboard/technician/requests
  /dashboard/admin              Stats, revenue, charts
  /dashboard/admin/users
  /dashboard/admin/services
  /dashboard/admin/bookings
  /dashboard/admin/transactions
  /dashboard/profile            Shared profile form
```

---

## 9. Quality Gates (apply to every step)

- [ ] TypeScript clean.
- [ ] ESLint clean.
- [ ] No console errors/warnings on touched routes.
- [ ] Responsive at 360 / 768 / 1024 / 1440 px.
- [ ] Loading, empty, and error states present where data appears.
- [ ] Design tokens and shared components reused.
- [ ] Dummy data labelled and isolated.
- [ ] Backend dependencies written down, never faked.
- [ ] Roadmap checklist updated for this step only.
- [ ] Stop and wait for approval.

---

## 10. Current Project Progress

| Area | Status | Notes |
| --- | --- | --- |
| Project audit | ✅ Complete | Repository inspected 17 Nov 2026 |
| Documentation | ✅ Complete | `AGENTS.md` + this roadmap |
| Frontend foundation | ⏳ Not started | Step 2 |
| Public website | ⏳ Not started | Steps 3–4 |
| Authentication UI | ⏳ Not started | Step 5 |
| Customer dashboard | ⏳ Not started | Step 8 |
| Technician dashboard | ⏳ Not started | Step 9 |
| Admin dashboard | ⏳ Not started | Step 10 |
| Profile UI | ⏳ Not started | Step 11 |
| Dummy data | ⏳ Not started | Step 20 (incremental from Step 4) |
| Backend foundation | 👤 Owner | Not started |
| MongoDB | 👤 Owner | Not started |
| BetterAuth | 👤 Owner | Package installed, unused |
| JWT security | 👤 Owner | Not started |
| APIs | 👤 Owner | Not started |
| Stripe | 👤 Owner | Not started |
| ImgBB | 👤 Owner | Not started |
| Seed data | 👤 Owner | Blueprint in §7 |
| Deployment | 👤 Owner | Not started |
| README | ⏳ Not started | AI rewrite in Step 22; still the default Next.js README |
| Optional enhancements | ⏸ Not approved | Not required; see §6 |

**Next action:** Step 2 is the next candidate step, but it is **not approved yet**.
The owner must say **"Start Step 2"**. Do not begin any implementation automatically.
