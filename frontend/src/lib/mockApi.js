import { readDatabase, writeDatabase } from "./storage.js";

const TEST_USER_ID = "7c1ac1b5-d47f-4bd6-bec9-3df7f88dd100";
const TEST_PROJECT_ID = "9e5efc58-87cb-4ca9-a8d8-c859efb91d93";
const OTHER_USER_ID = "30a084f6-b7ff-428c-8a2a-ec5595b1b9f8";

function uuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function delay(ms = 350) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function buildToken(user) {
  return btoa(`${user.id}:${user.email}:mock-jwt`);
}

function sanitizeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function seedState() {
  const createdAt = "2026-04-10T09:00:00.000Z";

  return {
    users: [
      {
        id: TEST_USER_ID,
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        created_at: createdAt
      },
      {
        id: OTHER_USER_ID,
        name: "Aarav Singh",
        email: "aarav@example.com",
        password: "password123",
        created_at: createdAt
      }
    ],
    projects: [
      {
        id: TEST_PROJECT_ID,
        name: "Greening India Launch",
        description: "Marketing, volunteer coordination, and campaign rollout tasks.",
        owner_id: TEST_USER_ID,
        created_at: createdAt
      }
    ],
    tasks: [
      {
        id: uuid(),
        title: "Draft Earth Day campaign copy",
        description: "Write the first-pass copy for email and social channels.",
        status: "todo",
        priority: "high",
        project_id: TEST_PROJECT_ID,
        assignee_id: TEST_USER_ID,
        creator_id: TEST_USER_ID,
        due_date: "2026-04-18",
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: uuid(),
        title: "Review nursery partner list",
        description: "Validate contact information and onboarding status.",
        status: "in_progress",
        priority: "medium",
        project_id: TEST_PROJECT_ID,
        assignee_id: OTHER_USER_ID,
        creator_id: TEST_USER_ID,
        due_date: "2026-04-20",
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: uuid(),
        title: "Publish volunteer onboarding FAQ",
        description: "Ready for publishing after one final proofread.",
        status: "done",
        priority: "low",
        project_id: TEST_PROJECT_ID,
        assignee_id: TEST_USER_ID,
        creator_id: OTHER_USER_ID,
        due_date: "2026-04-12",
        created_at: createdAt,
        updated_at: createdAt
      }
    ]
  };
}

function ensureDatabase() {
  const existing = readDatabase();
  if (existing) return existing;

  const seeded = seedState();
  writeDatabase(seeded);
  return seeded;
}

function persist(data) {
  writeDatabase(data);
  return data;
}

class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      message: error.message,
      fields: error.fields
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message
    };
  }

  return {
    status: 500,
    message: "Something went wrong. Please try again."
  };
}

function requireUser(userId) {
  if (!userId) throw new ApiError(401, "unauthorized");
}

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function taskVisibleToUser(task, userId) {
  return task.assignee_id === userId || task.creator_id === userId;
}

function projectVisibleToUser(state, project, userId) {
  return (
    project.owner_id === userId ||
    state.tasks.some((task) => task.project_id === project.id && taskVisibleToUser(task, userId))
  );
}

export async function register(payload) {
  await delay();
  const state = ensureDatabase();
  const fields = {};

  if (!payload.name.trim()) fields.name = "is required";
  if (!payload.email.trim()) fields.email = "is required";
  if (payload.email && !validateEmail(payload.email)) fields.email = "must be valid";
  if (!payload.password.trim()) fields.password = "is required";
  if (payload.password && payload.password.length < 8) fields.password = "must be at least 8 characters";
  if (Object.keys(fields).length > 0) throw new ApiError(400, "validation failed", fields);

  if (state.users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new ApiError(400, "validation failed", { email: "already exists" });
  }

  const user = {
    id: uuid(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    created_at: nowIso()
  };

  persist({ ...state, users: [...state.users, user] });

  const safeUser = sanitizeUser(user);
  return { token: buildToken(safeUser), user: safeUser };
}

export async function login(payload) {
  await delay();
  const state = ensureDatabase();
  const fields = {};

  if (!payload.email.trim()) fields.email = "is required";
  if (!payload.password.trim()) fields.password = "is required";
  if (Object.keys(fields).length > 0) throw new ApiError(400, "validation failed", fields);

  const user = state.users.find(
    (entry) =>
      entry.email.toLowerCase() === payload.email.trim().toLowerCase() &&
      entry.password === payload.password
  );

  if (!user) throw new ApiError(401, "unauthorized");

  const safeUser = sanitizeUser(user);
  return { token: buildToken(safeUser), user: safeUser };
}

export async function getProjects(userId) {
  await delay();
  requireUser(userId);
  const state = ensureDatabase();
  return state.projects.filter((project) => projectVisibleToUser(state, project, userId));
}

export async function createProject(payload, userId) {
  await delay();
  requireUser(userId);

  if (!payload.name.trim()) {
    throw new ApiError(400, "validation failed", { name: "is required" });
  }

  const state = ensureDatabase();
  const project = {
    id: uuid(),
    name: payload.name.trim(),
    description: payload.description?.trim() || "",
    owner_id: userId,
    created_at: nowIso()
  };

  persist({ ...state, projects: [project, ...state.projects] });
  return project;
}

export async function getProjectDetails(projectId, userId) {
  await delay();
  requireUser(userId);
  const state = ensureDatabase();
  const project = state.projects.find((entry) => entry.id === projectId);

  if (!project || !projectVisibleToUser(state, project, userId)) {
    throw new ApiError(404, "not found");
  }

  return {
    ...project,
    tasks: state.tasks.filter((task) => task.project_id === projectId)
  };
}

export async function createTask(projectId, payload, userId) {
  await delay();
  requireUser(userId);
  const state = ensureDatabase();
  const project = state.projects.find((entry) => entry.id === projectId);

  if (!project || !projectVisibleToUser(state, project, userId)) {
    throw new ApiError(404, "not found");
  }

  if (!payload.title.trim()) {
    throw new ApiError(400, "validation failed", { title: "is required" });
  }

  const task = {
    id: uuid(),
    title: payload.title.trim(),
    description: payload.description?.trim() || "",
    status: payload.status ?? "todo",
    priority: payload.priority,
    project_id: projectId,
    assignee_id: payload.assignee_id ?? null,
    creator_id: userId,
    due_date: payload.due_date || "",
    created_at: nowIso(),
    updated_at: nowIso()
  };

  persist({ ...state, tasks: [task, ...state.tasks] });
  return task;
}

export async function updateTask(taskId, payload, userId) {
  await delay(250);
  requireUser(userId);
  const state = ensureDatabase();
  const task = state.tasks.find((entry) => entry.id === taskId);

  if (!task) throw new ApiError(404, "not found");

  const project = state.projects.find((entry) => entry.id === task.project_id);
  if (!project || !projectVisibleToUser(state, project, userId)) {
    throw new ApiError(403, "forbidden");
  }

  if (payload.title !== undefined && !payload.title.trim()) {
    throw new ApiError(400, "validation failed", { title: "is required" });
  }

  const updatedTask = {
    ...task,
    ...payload,
    title: payload.title !== undefined ? payload.title.trim() : task.title,
    description: payload.description !== undefined ? payload.description.trim() : task.description,
    due_date: payload.due_date !== undefined ? payload.due_date : task.due_date,
    updated_at: nowIso()
  };

  persist({
    ...state,
    tasks: state.tasks.map((entry) => (entry.id === taskId ? updatedTask : entry))
  });

  return updatedTask;
}

export async function deleteTask(taskId, userId) {
  await delay(200);
  requireUser(userId);
  const state = ensureDatabase();
  const task = state.tasks.find((entry) => entry.id === taskId);

  if (!task) throw new ApiError(404, "not found");

  const project = state.projects.find((entry) => entry.id === task.project_id);
  const canDelete = project?.owner_id === userId || task.creator_id === userId;
  if (!canDelete) throw new ApiError(403, "forbidden");

  persist({
    ...state,
    tasks: state.tasks.filter((entry) => entry.id !== taskId)
  });
}

export async function listProjectMembers(projectId, userId) {
  await delay(150);
  requireUser(userId);
  const state = ensureDatabase();
  const project = state.projects.find((entry) => entry.id === projectId);

  if (!project || !projectVisibleToUser(state, project, userId)) {
    throw new ApiError(404, "not found");
  }

  const memberIds = new Set([project.owner_id]);
  state.tasks
    .filter((task) => task.project_id === projectId)
    .forEach((task) => {
      memberIds.add(task.creator_id);
      if (task.assignee_id) memberIds.add(task.assignee_id);
    });

  return state.users.filter((user) => memberIds.has(user.id)).map(sanitizeUser);
}
