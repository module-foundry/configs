import {
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  Show,
  type JSX,
} from "solid-js";

import { createToggle } from "@/lib/create-toggle";

import { type Activity, type UserProfile } from "@/model/types";

import ProfileCard from "@/components/profile-card";
import TaskList from "@/components/task-list";

interface AppProps {
  name: string;
}

const activities: Activity[] = [
  { id: "eslint", status: "done", label: "Review lint rules" },
  { id: "typescript", status: "pending", label: "Run the type checker" },
  { id: "prettier", status: "done", label: "Format the project" },
];
const heading = "SolidJS playground";
const profileVisibilityLabels = {
  hidden: "Show profile",
  visible: "Hide profile",
};

/**
 * Renders the SolidJS playground greeting.
 *
 * @returns The greeting element.
 */
const App = (props: AppProps): JSX.Element => {
  const [showCompleted, setShowCompleted] = createSignal(true);
  const { isOpen, toggle } = createToggle(true);

  const profile = createMemo<UserProfile>(() => ({
    name: props.name,
    role: "Configuration explorer",
  }));
  const visibleActivities = createMemo(() => {
    return showCompleted()
      ? activities
      : activities.filter(({ status }) => status === "pending");
  });

  const handleFilterChange = (): void => {
    setShowCompleted((currentValue) => !currentValue);
  };

  createRenderEffect(() => {
    document.documentElement.lang = "en";
  });
  createEffect(() => {
    document.title = `${props.name}: ${visibleActivities().length}`;
  });

  return (
    <main>
      <h1>{heading}</h1>
      <button onClick={toggle} type={"button"}>
        {isOpen()
          ? profileVisibilityLabels.visible
          : profileVisibilityLabels.hidden}
      </button>
      <Show when={isOpen()}>
        <ProfileCard profile={profile()} />
      </Show>

      <section aria-labelledby={"activity-heading"}>
        <h2 id={"activity-heading"}>Activity</h2>
        <button onClick={handleFilterChange} type={"button"}>
          {showCompleted() ? "Show pending" : "Show all"}
        </button>
        <TaskList activities={visibleActivities()} />
      </section>
    </main>
  );
};

export default App;
