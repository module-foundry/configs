import { type JSX } from "solid-js";

import TaskList from "@/components/task-list";

const renderTaskList = (): JSX.Element => {
  return <TaskList activities={[]} />;
};

export { renderTaskList };
