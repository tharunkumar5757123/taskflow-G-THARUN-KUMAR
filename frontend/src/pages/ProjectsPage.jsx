import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createProject, getProjects, toApiError } from "../lib/mockApi.js";
import { useAuth } from "../state/AuthContext.jsx";

export function ProjectsPage() {
  const { session } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        setLoading(true);
        const response = await getProjects(session?.user?.id);
        if (active) {
          setProjects(response);
          setError(null);
        }
      } catch (loadError) {
        if (active) setError(toApiError(loadError).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProjects();
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  async function handleCreateProject(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const project = await createProject({ name, description }, session?.user?.id);
      setProjects((current) => [project, ...current]);
      setName("");
      setDescription("");
      setShowForm(false);
    } catch (createError) {
      setError(toApiError(createError).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack-lg">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Projects that stay readable under real-world pressure.</h1>
          <p>
            Track ownership, due dates, and progress across shared work without losing clarity on
            mobile.
          </p>
        </div>
        <button className="primary-button" onClick={() => setShowForm((current) => !current)}>
          {showForm ? "Hide form" : "New project"}
        </button>
      </section>

      {showForm ? (
        <section className="panel">
          <form className="form-grid" onSubmit={handleCreateProject}>
            <div className="form-row">
              <label>
                Project name
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label>
                Description
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional details"
                />
              </label>
            </div>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create project"}
            </button>
          </form>
        </section>
      ) : null}

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <section className="panel">Loading projects...</section> : null}

      {!loading && projects.length === 0 ? (
        <section className="empty-state">
          <h2>No projects yet</h2>
          <p>Create your first project to start assigning tasks and tracking progress.</p>
        </section>
      ) : null}

      <section className="project-grid">
        {projects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
            <div className="project-card-top">
              <span className="capsule">{project.owner_id === session?.user?.id ? "Owner" : "Contributor"}</span>
              <span>{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <h2>{project.name}</h2>
            <p>{project.description || "No description added yet."}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
