import { type JSX } from "react";

import TaskList from "@/components/task-list";

export const metadata = { title: "Activity" };

const Page = (): JSX.Element => {
  return <TaskList activities={[]} />;
};

export default Page;
