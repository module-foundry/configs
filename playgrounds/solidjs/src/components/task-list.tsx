import { For, type JSX } from "solid-js";

import { type Activity } from "@/model/types";

interface TaskListProps {
  activities: Activity[];
}

/**
 * Renders activity items and their current state.
 *
 * @returns The activity list.
 */
const TaskList = (props: TaskListProps): JSX.Element => {
  return (
    <ul>
      <For each={props.activities}>
        {(activity) => (
          <li>
            <span>{activity.label}</span>{" "}
            <small>
              {activity.status === "done" ? "Complete" : "In progress"}
            </small>
          </li>
        )}
      </For>
    </ul>
  );
};

export default TaskList;
