# TaskFlow Frontend

Frontend-only implementation of the TaskFlow take-home assignment. This project delivers the required React experience for authentication, project browsing, task management, filtering, and responsive interaction using a browser-backed mock API that follows the Appendix A contract.

---

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

---

## 2. Architecture Decisions

- I kept the project frontend-only because this submission is for the Frontend Engineer track. Instead of adding an unnecessary backend, I implemented the Appendix A API contract as a mock data layer in `frontend/src/lib/mockApi.ts`.
- The mock API persists state in `localStorage`, which makes the app feel real during review: reviewers can log in, mutate data, refresh, and keep their session without any external services.
- Authentication is managed through a small React context so route protection and navbar state stay straightforward without bringing in heavier state tooling.
- I used plain CSS rather than a component library to keep the submission compact and easier to review in a short take-home setting.
- I intentionally did not add drag-and-drop, dark mode, or real-time updates. The focus was on reliable core flows, visible loading/error states, and clean UX.

---

## 3. Running Locally

Assumption: the reviewer has Docker installed.

```bash
git clone https://github.com/tharunkumar5757123/taskflow-G-THARUN-KUMAR.git
cd taskflow-G-THARUN-KUMAR
cp .env.example .env
docker compose up --build
App URL
http://localhost:3000
Run without Docker
cd frontend
npm install
npm run dev
4. Running Migrations

Not applicable for this frontend-only submission. The app uses the mock API approach permitted in Appendix A instead of PostgreSQL-backed persistence.

5. Test Credentials
Email:    test@example.com
Password: password123
6. API Reference

The UI is implemented against the Appendix A mock API shape. The browser-side mock lives in:

frontend/src/lib/mockApi.ts
Endpoints
POST /auth/register
POST /auth/login
GET /projects
POST /projects
GET /projects/:id
GET /projects/:id/tasks?status=&assignee=
POST /projects/:id/tasks
PATCH /tasks/:id
DELETE /tasks/:id
Error responses
{ "error": "validation failed", "fields": { "email": "is required" } }
{ "error": "unauthorized" }
{ "error": "forbidden" }
{ "error": "not found" }
7. What I'd Do With More Time
Add MSW to expose mock API as real HTTP endpoints
Break UI into smaller reusable components + unit tests
Add dark mode and drag-and-drop task management
Improve accessibility (keyboard navigation + ARIA support)
Project Structure
.
├── docker-compose.yml
├── .env.example
├── README.md
└── frontend
    ├── Dockerfile
    ├── package.json
    ├── index.html
    └── src
        ├── components
        ├── lib
        ├── pages
        └── state
