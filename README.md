# Fixora

Fixora is a role-based repair-service booking platform for customers,
technicians, and administrators.

## Development

Start the frontend:

```bash
npm install
npm run dev
```

Start the Express API separately:

```bash
cd backend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and the API at
`http://localhost:5000`.
Both applications must connect to the same MongoDB deployment and the `fixora`
database. BetterAuth's original `user` collection is the single source of user
records; the Express API accesses that collection for profile and admin-user
operations.

## Required environment variables

Frontend:

- `MONGODB_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `JWT_SECRET`
- `IMGBB_API_KEY`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

Backend:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `IMGBB_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
