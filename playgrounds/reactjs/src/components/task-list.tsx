import { type JSX } from "react";

import { type Activity } from "@/model/types";

interface TaskListProps {
  activities: readonly Activity[];
}

/**
 * Renders activity items and their current state.
 *
 * @returns The activity list.
 */
const TaskList = ({ activities }: TaskListProps): JSX.Element => {
  return (
    <ul>
      {activities.map(({ id, label, status }) => (
        <li key={id}>
          <span>{label}</span>{" "}
          <small>{status === "done" ? "Complete" : "In progress"}</small>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
