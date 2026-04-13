import { useEffect, useState } from "react";

const INITIAL_VALUES = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignee_id: "",
  due_date: ""
};

export function TaskFormDialog({ open, onClose, onSubmit, assignees, task }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    setValues(
      task
        ? {
            title: task.title,
            description: task.description || "",
            status: task.status,
            priority: task.priority,
            assignee_id: task.assignee_id || "",
            due_date: task.due_date || ""
          }
        : INITIAL_VALUES
    );
    setError(null);
    setSubmitting(false);
  }, [open, task]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(values);
      onClose();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to save the task right now."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div className="dialog-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <h2>{task ? "Edit task" : "Create task"}</h2>
            <p>Capture work with ownership, timing, and priority from one place.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close task form">
            x
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={values.title}
              onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
              placeholder="Ex: Prepare launch deck"
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Helpful context for the assignee"
              rows={4}
            />
          </label>

          <div className="form-row">
            <label>
              Status
              <select
                value={values.status}
                onChange={(event) =>
                  setValues((current) => ({ ...current, status: event.target.value }))
                }
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={values.priority}
                onChange={(event) =>
                  setValues((current) => ({ ...current, priority: event.target.value }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Assignee
              <select
                value={values.assignee_id}
                onChange={(event) =>
                  setValues((current) => ({ ...current, assignee_id: event.target.value }))
                }
              >
                <option value="">Unassigned</option>
                {assignees.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Due date
              <input
                type="date"
                value={values.due_date}
                onChange={(event) =>
                  setValues((current) => ({ ...current, due_date: event.target.value }))
                }
              />
            </label>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          <div className="dialog-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Saving..." : task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
