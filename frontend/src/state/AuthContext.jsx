import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login, register, toApiError } from "../lib/mockApi.js";
import { readSession, writeSession } from "../lib/storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(readSession());
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      async loginUser(payload) {
        try {
          const nextSession = await login(payload);
          setSession(nextSession);
          writeSession(nextSession);
        } catch (error) {
          throw toApiError(error);
        }
      },
      async registerUser(payload) {
        try {
          const nextSession = await register(payload);
          setSession(nextSession);
          writeSession(nextSession);
        } catch (error) {
          throw toApiError(error);
        }
      },
      logout() {
        setSession(null);
        writeSession(null);
      }
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
