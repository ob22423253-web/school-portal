# School Portal (MERN)

A small school portal where admins manage users and courses, lecturers enter results, students view their own marks, and parents check on their child. Built as a final-year project.

## Tech stack

- **MongoDB Atlas** – data store
- **Express.js** – REST API (CommonJS)
- **React (Vite)** – frontend with React Router
- **Node.js** – runtime
- **Tailwind CSS** – styling
- **JWT + bcrypt** – auth
- **express-validator** – request validation

## Repo layout

```
school-portal/
├── backend/
│   ├── config/          db connection
│   ├── controllers/     thin HTTP handlers
│   ├── middleware/      auth, role guard, validate, error handler
│   ├── models/          User, Course, Result (Mongoose)
│   ├── routes/          /api/* route wiring
│   ├── services/        business logic + DB calls (controllers call these)
│   ├── utils/           token helpers
│   ├── seed.js          loads sample data
│   └── server.js        Express entry
└── frontend/
    └── src/
        ├── api/         axios + per-entity api clients
        ├── components/  Navbar, Sidebar, Modal, Loader, ProtectedRoute, RoleRoute, …
        ├── context/     AuthContext, AlertContext
        ├── pages/       Login, Register, Dashboard, Courses, Results, Users, Profile, …
        └── routes/      AppRoutes
```

## Features

- Four roles: **admin**, **lecturer**, **student**, **parent**
- JWT auth with access + refresh tokens, password hashing with bcrypt
- Role-guarded routes both on the API (`roles()` middleware) and the UI (`RoleRoute` + role-aware sidebar)
- Full CRUD for **Courses** and **Results**, plus admin CRUD for **Users**
- Pagination, search and filters on list endpoints
- Auto-computed letter grades (A–F) from numeric scores
- Parent–student linking so a parent only sees their child's results
- Tailwind UI: responsive layout, modals, toasts, inline form errors

## Local setup

You need Node 18+ and a MongoDB Atlas connection string.

### 1. Backend

```bash
cd backend
cp .env.example .env   # then fill the values
npm install
npm run seed           # loads the sample admin, lecturers, students, courses, results
npm start              # starts on PORT (default 5000)
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:5000
npm install
npm run dev            # opens on http://localhost:5173
```

## Environment variables

### `backend/.env`

| Key                  | Description                                    |
| -------------------- | ---------------------------------------------- |
| `PORT`               | Port the API listens on (e.g. `5000`)          |
| `NODE_ENV`           | `development` or `production`                  |
| `MONGO_URI`          | MongoDB Atlas connection string                |
| `JWT_SECRET`         | Signing secret for the access token            |
| `JWT_REFRESH_SECRET` | Signing secret for the refresh token           |
| `CLIENT_URL`         | Allowed CORS origin (e.g. the deployed UI URL) |

### `frontend/.env`

| Key            | Description                                  |
| -------------- | -------------------------------------------- |
| `VITE_API_URL` | Base URL of the API (no `/api` suffix)       |

## Sample logins (after seed)

| Role     | Email               | Password       |
| -------- | ------------------- | -------------- |
| Admin    | admin@school.gm     | `Admin123!`    |
| Lecturer | fatou@school.gm     | `Lecturer123!` |
| Student  | awa@school.gm       | `Student123!`  |
| Parent   | parent@school.gm    | `Parent123!`   |

The parent account is linked to the student **Binta Bah**.

## API endpoints

All endpoints live under `/api`. JSON in, JSON out.

### Auth

| Method | Path                | Who                      | What                                |
| ------ | ------------------- | ------------------------ | ----------------------------------- |
| POST   | `/api/auth/register`| public                   | Create a student account            |
| POST   | `/api/auth/login`   | public                   | Email + password → tokens           |
| POST   | `/api/auth/refresh` | public (with token)      | New access token from refresh token |
| GET    | `/api/auth/me`      | any authed user          | Current user                        |

### Users

| Method | Path                  | Who               | What                            |
| ------ | --------------------- | ----------------- | ------------------------------- |
| GET    | `/api/users/profile`  | any authed user   | Own profile                     |
| GET    | `/api/users`          | admin             | List users (page, limit, q, role) |
| POST   | `/api/users`          | admin             | Create user (any role)          |
| GET    | `/api/users/:id`      | admin             | Single user                     |
| PUT    | `/api/users/:id`      | admin             | Update user                     |
| DELETE | `/api/users/:id`      | admin             | Delete user                     |

### Courses

| Method | Path                | Who                                | What            |
| ------ | ------------------- | ---------------------------------- | --------------- |
| GET    | `/api/courses`      | admin, lecturer, student, parent  | List + search   |
| GET    | `/api/courses/:id`  | admin, lecturer, student, parent  | One course      |
| POST   | `/api/courses`      | admin                              | Create course   |
| PUT    | `/api/courses/:id`  | admin                              | Update course   |
| DELETE | `/api/courses/:id`  | admin                              | Delete course   |

### Results

| Method | Path                | Who                                | What                                       |
| ------ | ------------------- | ---------------------------------- | ------------------------------------------ |
| GET    | `/api/results`      | admin, lecturer, student, parent  | List (scoped by role automatically)        |
| GET    | `/api/results/:id`  | admin, lecturer, student, parent  | One result (scoped)                        |
| POST   | `/api/results`      | admin, lecturer                    | Add a result (lecturer only for own course)|
| PUT    | `/api/results/:id`  | admin, lecturer                    | Update a result                            |
| DELETE | `/api/results/:id`  | admin, lecturer                    | Delete a result                            |

### Health

`GET /health` – status + uptime + DB state (used by Render).

## Deployment

- **Backend** – deploy `backend/` to Render as a Node service. Set the env vars above. Start command: `npm start`.
- **Frontend** – deploy `frontend/` to Netlify. Build: `npm run build`, publish dir: `dist`. `netlify.toml` already includes the SPA redirect.

Live URLs (fill in after deploy):

- API: `https://<your-render-app>.onrender.com`
- UI: `https://<your-netlify-site>.netlify.app`

## Author

**Ousman Bah** — matric 22423253 — ob22423253@utg.edu.gm
