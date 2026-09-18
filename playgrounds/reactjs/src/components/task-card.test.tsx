import { type JSX } from "react";

import TaskList from "@/components/task-list";

const renderTaskList = (): JSX.Element => {
  return <TaskList activities={[]} />;
};

export { renderTaskList };
