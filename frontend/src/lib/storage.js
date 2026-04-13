export const STORAGE_KEYS = {
  db: "taskflow.mockdb.v1",
  session: "taskflow.session.v1"
};

export function readDatabase() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.db);
    return raw ? JSON.parse(raw) : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.db);
    return null;
  }
}

export function writeDatabase(data) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.db, JSON.stringify(data));
  } catch {
    throw new Error("Unable to save data in this browser. Please enable local storage and try again.");
  }
}

export function readSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.session);
    return null;
  }
}

export function writeSession(session) {
  try {
    if (!session) {
      window.localStorage.removeItem(STORAGE_KEYS.session);
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  } catch {
    throw new Error("Unable to save your session in this browser. Please enable local storage and try again.");
  }
}
