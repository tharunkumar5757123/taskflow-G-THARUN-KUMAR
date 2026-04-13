import { useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export function AuthPage() {
  const { isAuthenticated, loginUser, registerUser } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  const destination = useMemo(() => {
    const route = location.state;
    return route?.from || "/";
  }, [location.state]);

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (mode === "register" && !name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await loginUser({ email, password });
      } else {
        await registerUser({ name, email, password });
      }
    } catch (authError) {
      setError(authError?.fields ? Object.values(authError.fields)[0] : authError?.message || "Unable to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <p className="eyebrow">Frontend-only submission</p>
        <h1>TaskFlow keeps projects clear, visible, and moving.</h1>
        <p>
          This implementation uses a browser-backed mock API so the reviewer can log in, create
          projects, edit tasks, and validate the full UI flow without a backend dependency.
        </p>
        <div className="credential-card">
          <strong>Seed credentials</strong>
          <span>Email: test@example.com</span>
          <span>Password: password123</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setName("");
              setEmail("");
              setPassword("");
            }}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p>
            {mode === "login"
              ? "Sign in to continue to your projects."
              : "Start a new workspace in seconds."}
          </p>

          {mode === "register" ? (
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane Doe" />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jane@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password123"
            />
          </label>

          {error ? <div className="error-banner">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </section>
    </div>
  );
}
