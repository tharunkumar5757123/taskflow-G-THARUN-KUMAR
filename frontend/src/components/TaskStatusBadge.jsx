const LABELS = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done"
};

export function TaskStatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{LABELS[status]}</span>;
}
