# TaskFlow Frontend

Frontend-only implementation of the TaskFlow take-home assignment. This project delivers the required React experience for authentication, project browsing, task management, filtering, and responsive interaction using a browser-backed mock API that follows the Appendix A contract.

## 1. Overview

- Role target: Frontend Engineer
- Stack: React 18, React Router, Vite, CSS, localStorage-backed mock API
- Core features:
  - Login and register flows with client-side validation
  - Persistent auth state across refreshes
  - Protected routes
  - Projects list and project detail screens
  - Task create, edit, delete, filter, and optimistic status changes
  - Responsive layout for mobile and desktop

## 2. Architecture Decisions

- I kept the project frontend-only because this submission is for the Frontend Engineer track. Instead of adding an unnecessary backend, I implemented the Appendix A API contract as a mock data layer in `frontend/src/lib/mockApi.ts`.
- The mock API persists state in `localStorage`, which makes the app feel real during review: reviewers can log in, mutate data, refresh, and keep their session without any external services.
- Authentication is managed through a small React context so route protection and navbar state stay straightforward without bringing in heavier state tooling.
- I used plain CSS rather than a component library to keep the submission compact and easier to review in a short take-home setting.
- I intentionally did not add drag-and-drop, dark mode, or real-time updates. The time went into reliable core flows, visible empty/loading/error states, and a cleaner mobile layout.

## 3. Running Locally

Assumption: the reviewer has Docker installed.

```bash
git clone https://github.com/your-name/taskflow-your-name
cd taskflow-your-name
cp .env.example .env
docker compose up --build
```

App URL:

```text
http://localhost:3000
```

If you want to run it without Docker:

```bash
cd frontend
npm install
npm run dev
```

## 4. Running Migrations

Not applicable for this frontend-only submission. The app uses the mock API approach permitted in Appendix A instead of PostgreSQL-backed persistence.

## 5. Test Credentials

```text
Email:    test@example.com
Password: password123
```

## 6. API Reference

The UI is implemented against the Appendix A mock API shape. The browser-side mock lives in `frontend/src/lib/mockApi.ts`.

Supported endpoints and behavior:

- `POST /auth/register`
- `POST /auth/login`
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `GET /projects/:id/tasks?status=&assignee=`
- `POST /projects/:id/tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

Validation and error responses also mirror the assignment:

```json
{ "error": "validation failed", "fields": { "email": "is required" } }
```

```json
{ "error": "unauthorized" }
```

```json
{ "error": "forbidden" }
```

```json
{ "error": "not found" }
```

## 7. What I'd Do With More Time

- Add MSW so the mock API is exposed at actual HTTP endpoints while keeping the same frontend architecture.
- Split task cards and forms into smaller presentational primitives and add targeted unit tests for auth and optimistic updates.
- Add dark mode and drag-and-drop status management as bonus features.
- Improve accessibility further with keyboard focus trapping in the modal and live region announcements for optimistic updates.

## Project Structure

```text
.
|-- docker-compose.yml
|-- .env.example
|-- README.md
`-- frontend
    |-- Dockerfile
    |-- package.json
    |-- index.html
    |-- src
        |-- components
        |-- lib
        |-- pages
        `-- state
```
