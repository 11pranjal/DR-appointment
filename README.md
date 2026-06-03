# MediBook — Doctor Appointment (MERN)

A small, friendly appointment booking system built with the MERN stack (MongoDB, Express, React, Node). It provides:

- User authentication (patients, doctors, admins) with email verification
- Doctor profiles and awareness posts
- Appointment booking for patients 
- Image upload support and simple pagination for lists



**Quick links**
- Server: `server/`
- Client: `client/`
- Postman collection: `postman/MediBook-API.postman_collection.json`

---

## Features

- Register / Login / JWT-based auth
- Email verification for new accounts (prints link in dev when mailer isn't configured)
- Role-based access: `patient`, `doctor`, `admin`
- CRUD for posts (doctors) and appointments (patients + doctors)
- File uploads for images (server stores under `uploads/`)
- Basic pagination on lists (doctors, posts)

---

## Local setup (quick)

Prerequisites: Node.js (16+ recommended), npm, and a MongoDB connection (Atlas URI or local).

1. Install dependencies for server and client:

```bash
# from repository root
cd mern-doctor-booking/server
npm install
cd ../client
npm install
```

2. Copy environment templates and fill values:

```bash
cd mern-doctor-booking/server
copy .env.example .env    # Windows
# or: cp .env.example .env  # macOS / Linux

cd ../client
copy .env.example .env
```

Required server env vars (summary):
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — secret for signing tokens
- `EMAIL_USER`, `EMAIL_PASS` — optional SMTP creds (dev prints links if missing)
- `FRONTEND_URL` — client URL for email links (e.g. http://localhost:5173)

3. Seed demo data (creates test users):

```bash
cd mern-doctor-booking/server
npm run seed
```

4. Run in development (server + client in separate terminals):

Server:
```bash
cd mern-doctor-booking/server
npm run dev
```

Client:
```bash
cd mern-doctor-booking/client
npm run dev
```

Open the frontend at `http://localhost:5173` (default Vite port).

---

## Project structure overview

- `server/` — Express API
	- `src/app.js`, `src/index.js` — server bootstrap
	- `src/routes/*` — route definitions
	- `src/controllers/*` — request handlers and business rules
	- `src/models/*` — Mongoose models (User, Appointment, Post)
	- `src/middleware/*` — auth, uploads, error handling
	- `uploads/` — stored images
- `client/` — React + Vite frontend
	- `src/pages` — route pages (Doctors, Book, PublicDoctorProfile, etc.)
	- `src/components` — shared UI pieces (Navbar, PrivateRoute)
	- `src/context/AuthContext.jsx` — auth state + token handling

---

## Implementation notes (useful details)

- Authentication
	- JWTs are issued at login; the client stores the token in localStorage and sends `Authorization: Bearer <token>` with API requests.
	- `PrivateRoute.jsx` protects pages that require login.

- Booking
	- Appointments are created via `POST /api/appointments` for authenticated patients/doctors and `POST /api/appointments/guest` for unauthenticated guests.
	- The server validates doctor existence and user roles before creating an appointment.

- Doctor profiles and posts
	- Doctors can create awareness posts (with images). Posts are shown on the doctor's public profile with pagination (2 per page by default).
	- The public profile page is `GET /doctors/:id` (data fetched client-side) and `GET /posts/doctor/:id` for posts.

- File uploads
	- The server accepts `image/*` MIME types. Uploaded files are saved in `server/uploads/` and served statically.

---

## API quick reference

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login and receive token
- `GET /api/doctors` — list doctors
- `GET /api/doctors/:id` — doctor profile
- `GET /api/posts/doctor/:id` — posts by doctor
- `POST /api/appointments` — create appointment (auth)
- `POST /api/appointments/guest` — create appointment (guest)

See the Postman collection for full examples: `postman/MediBook-API.postman_collection.json`.

---

## Development tips

- If email sending isn't configured, verification links are printed to the server console when a user registers.
- Seed script provides demo users (patient/doctor/admin) for quick testing.
- Frontend and backend run independently during development — change ports or `FRONTEND_URL` if needed.

---

