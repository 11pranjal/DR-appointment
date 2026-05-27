# MediBook (MERN)

Doctor appointment API + React UI — MongoDB Atlas, Express, standard REST CRUD, email verification.

## Why one `.gitignore`?

Only the **root** `.gitignore` is needed. It tells Git to ignore `node_modules/`, `.env`, and build folders for the **whole** repo. Extra copies in `server/` or `client/` were redundant and confusing — they are removed.

## Run

**API** (`mern-doctor-booking/server`):

```bash
npm install
copy .env.example .env
npm run seed
npm run dev
```

**Web** (`mern-doctor-booking/client`):

```bash
npm install
copy .env.example .env
npm run dev
```

## Email verification

1. Register → verification link is **emailed** (if `EMAIL_USER` + `EMAIL_PASS` in `.env`) or **printed in the API terminal** (dev mode).
2. Open link → `/verify-email/:token` → then login works.
3. **Resend:** `POST /api/auth/resend-verification` with `{ "email": "..." }`.

Seed accounts are pre-verified: `patient@medibook.test` / `patient123`, etc.

## Standard REST API (Postman)

| Resource | GET list | GET one | POST | PUT/PATCH | DELETE |
|----------|----------|---------|------|-----------|--------|
| **Auth** | — | `/api/auth/me` | `/register`, `/login` | — | — |
| **Users** | `/api/users` (admin) | `/api/users/:id` | — | `/api/users/:id` | `/api/users/:id` |
| **Doctors** | `/api/doctors` | `/api/doctors/:id` | — | profile via users | — |
| **Appointments** | `/api/appointments` | `/api/appointments/:id` | `/api/appointments` | `/api/appointments/:id` | `/api/appointments/:id` |

Public: `POST /api/appointments/guest`, `POST /api/appointments/track`, `GET /api/auth/verify-email/:token`

Use header: `Authorization: Bearer <token>`

Import: `mern-doctor-booking/postman/MediBook-API.postman_collection.json`
