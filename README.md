# Fixora

**Your Home, Our Responsibility.**

Fixora is a role-based home appliance and smart-device repair booking platform.
Customers request repairs, technicians manage services and jobs, and admins
moderate listings and review platform activity.

## Key features

- BetterAuth sessions with customer, technician, and admin roles.
- Browse approved, available services with search, filters, sorting, and details.
- Server-validated repair requests and technician-managed booking status changes.
- Role-specific dashboards, profile updates, and service moderation.
- Hosted Stripe Checkout for completed, unpaid bookings.

## Live deployment

- Web app: https://fixora-eosin.vercel.app/
- API: https://fixora-server.vercel.app/

Test accounts are listed in the assignment submission form. Passwords are not
committed to this repository.

## Technology

- Frontend: Next.js, React, TypeScript, Tailwind CSS, BetterAuth, Lucide, Sonner.
- API: Express, MongoDB, CORS, and dotenv.
- Payments: Stripe Checkout in test mode.

## Repositories

- This repository contains the Next.js frontend and BetterAuth configuration.
- The Express API is the separate `fixora-server` repository. The frontend does
  not use a local `backend/` directory.
- Both applications connect to the existing `fixora` MongoDB database. BetterAuth
  users remain in the existing `user` collection; services, bookings, and payments
  use the existing server collections.

## Local development

Run the frontend from this repository:

```powershell
npm install
npm run dev
```

In a second terminal, run the API from the sibling `fixora-server` repository:

```powershell
Set-Location ..\fixora-server
npm install
node index.js
```

The local frontend is `http://localhost:3000`; the API listens on port `5000` by
default.

## Environment

Use the existing ignored `.env` file in each repository for local values; this
setup does not require creating `.env.local`. Next.js will also load that file if
it already exists. Do not commit credentials or expose secrets through
`NEXT_PUBLIC_*` variables.

Frontend (`fixora/.env`):

- `MONGODB_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_API_URL` (for example, `http://localhost:5000`)
- `IMGBB_API_KEY` (server-side upload route)
- `STRIPE_SECRET_KEY` (server-only)
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (optional provider configuration)

API (`fixora-server/.env`):

- `MONGODB_URL` or `MONGODB_URI`
- `BETTER_AUTH_URL` (the frontend origin; `AUTH_URL` is also accepted)
- `CLIENT_URL` (for example, `http://localhost:3000`)
- `PORT` (optional; defaults to `5000`)
- `STRIPE_SECRET_KEY` (Stripe test-mode key)
- `STRIPE_WEBHOOK_SECRET` (when testing Stripe webhooks)

## Verification

Run the frontend checks from this repository:

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

Run the API unit tests from `fixora-server`:

```powershell
npm test
```

The live deployment URL is listed above. No Git remotes are configured in this
checkout, so the client/server repository URLs are unavailable here. Share
passwords through the submission form rather than committing them.
