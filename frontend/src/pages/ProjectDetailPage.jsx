import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createTask,
  deleteTask,
  getProjectDetails,
  listProjectMembers,
  toApiError,
  updateTask
} from "../lib/mockApi.js";
import { TaskFormDialog } from "../components/TaskFormDialog.jsx";
import { TaskStatusBadge } from "../components/TaskStatusBadge.jsx";
import { useAuth } from "../state/AuthContext.jsx";

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" }
];

export function ProjectDetailPage() {
  const { projectId = "" } = useParams();
  const { session } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProject() {
      try {
        setLoading(true);
        const [detail, people] = await Promise.all([
          getProjectDetails(projectId, session?.user?.id),
          listProjectMembers(projectId, session?.user?.id)
        ]);

        if (!active) return;

        setProjectName(detail.name);
        setProjectDescription(detail.description || "");
        setTasks(detail.tasks);
        setMembers(people);
        setError(null);
      } catch (loadError) {
        if (active) setError(toApiError(loadError).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProject();
    return () => {
      active = false;
    };
  }, [projectId, session?.user?.id]);

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (statusFilter !== "all" && task.status !== statusFilter) return false;
        if (assigneeFilter !== "all" && task.assignee_id !== assigneeFilter) return false;
        return true;
      }),
    [assigneeFilter, statusFilter, tasks]
  );

  const metrics = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      done: tasks.filter((task) => task.status === "done").length
    }),
    [tasks]
  );

  async function handleCreateOrUpdateTask(values) {
    try {
      if (editingTask) {
        const updated = await updateTask(
          editingTask.id,
          {
            title: values.title,
            description: values.description,
            status: values.status,
            priority: values.priority,
            assignee_id: values.assignee_id || null,
            due_date: values.due_date
          },
          session?.user?.id
        );
        setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
      } else {
        const created = await createTask(
          projectId,
          {
            title: values.title,
            description: values.description,
            status: values.status,
            priority: values.priority,
            assignee_id: values.assignee_id || null,
            due_date: values.due_date
          },
          session?.user?.id
        );
        setTasks((current) => [created, ...current]);
      }

      setEditingTask(null);
      setError(null);
    } catch (submissionError) {
      throw new Error(toApiError(submissionError).message);
    }
  }

  async function handleStatusChange(task, status) {
    const previousTasks = tasks;
    setTasks((current) => current.map((entry) => (entry.id === task.id ? { ...entry, status } : entry)));

    try {
      const updated = await updateTask(task.id, { status }, session?.user?.id);
      setTasks((current) => current.map((entry) => (entry.id === task.id ? updated : entry)));
    } catch (statusError) {
      setTasks(previousTasks);
      setError(toApiError(statusError).message);
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId, session?.user?.id);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (deleteError) {
      setError(toApiError(deleteError).message);
    }
  }

  function resolveUserName(userId) {
    if (!userId) return "Unassigned";
    return members.find((member) => member.id === userId)?.name || "Unknown user";
  }

  return (
    <div className="stack-lg">
      <Link className="back-link" to="/">
        {"<- Back to projects"}
      </Link>

      {loading ? <section className="panel">Loading project...</section> : null}
      {error ? <div className="error-banner">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="hero-card">
            <div>
              <p className="eyebrow">Project detail</p>
              <h1>{projectName}</h1>
              <p>{projectDescription || "No project description provided."}</p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                setEditingTask(null);
                setDialogOpen(true);
              }}
            >
              New task
            </button>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <span>Total tasks</span>
              <strong>{metrics.total}</strong>
            </article>
            <article className="stat-card">
              <span>To do</span>
              <strong>{metrics.todo}</strong>
            </article>
            <article className="stat-card">
              <span>In progress</span>
              <strong>{metrics.inProgress}</strong>
            </article>
            <article className="stat-card">
              <span>Done</span>
              <strong>{metrics.done}</strong>
            </article>
          </section>

          <section className="panel filter-panel">
            <div className="form-row">
              <label>
                Status
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Assignee
                <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
                  <option value="all">All assignees</option>
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {visibleTasks.length === 0 ? (
            <section className="empty-state">
              <h2>No matching tasks</h2>
              <p>Adjust the filters or create a new task to populate this project.</p>
            </section>
          ) : (
            <section className="task-list">
              {visibleTasks.map((task) => (
                <article key={task.id} className="task-card">
                  <div className="task-card-header">
                    <div>
                      <TaskStatusBadge status={task.status} />
                      <h2>{task.title}</h2>
                    </div>
                    <div className="task-card-actions">
                      <select value={task.status} onChange={(event) => handleStatusChange(task, event.target.value)}>
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        className="ghost-button"
                        onClick={() => {
                          setEditingTask(task);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button className="danger-button" onClick={() => handleDelete(task.id)}>
                        Delete
                      </button>
                    </div>
                  </div>

                  <p>{task.description || "No description added for this task."}</p>

                  <div className="task-meta">
                    <span>Priority: {task.priority}</span>
                    <span>Assignee: {resolveUserName(task.assignee_id)}</span>
                    <span>Due: {task.due_date || "Not set"}</span>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      ) : null}

      <TaskFormDialog
        open={dialogOpen}
        task={editingTask}
        assignees={members}
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
      />
    </div>
  );
}
