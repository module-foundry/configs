import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";

import { useToggle } from "@/hooks/use-toggle";

import { type Activity, type UserProfile } from "@/model/types";

import ProfileCard from "@/components/profile-card";
import TaskList from "@/components/task-list";

interface AppProps {
  name: string;
}

const activities: readonly Activity[] = [
  { id: "eslint", status: "done", label: "Review lint rules" },
  { id: "typescript", status: "pending", label: "Run the type checker" },
  { id: "prettier", status: "done", label: "Format the project" },
];
const heading = "ReactJS playground";
const profileVisibilityLabels = {
  hidden: "Show profile",
  visible: "Hide profile",
};

/**
 * Renders the ReactJS playground greeting.
 *
 * @returns The greeting element.
 */
const App = ({ name }: AppProps): JSX.Element => {
  const mainRef = useRef<HTMLElement>(null);

  const [showCompleted, setShowCompleted] = useState(true);
  const { isOpen, toggle } = useToggle(true);

  const profile: UserProfile = {
    name,
    heading,
    role: "Configuration explorer",
  };

  const visibleActivities = useMemo(
    () =>
      showCompleted
        ? activities
        : activities.filter(({ status }) => status === "pending"),
    [showCompleted],
  );

  const handleFilterChange = (): void => {
    setShowCompleted((currentValue) => !currentValue);
  };

  useEffect(() => {
    document.title = `${name} activity`;
  }, [name]);

  useLayoutEffect(() => {
    mainRef.current?.setAttribute("data-ready", "true");
  }, []);

  return (
    <main ref={mainRef}>
      <h1>ReactJS playground</h1>
      <button onClick={toggle} type={"button"}>
        {isOpen
          ? profileVisibilityLabels.visible
          : profileVisibilityLabels.hidden}
      </button>
      {isOpen ? <ProfileCard profile={profile} /> : null}

      <section aria-labelledby={"activity-heading"}>
        <h2 id={"activity-heading"}>Activity</h2>
        <button onClick={handleFilterChange} type={"button"}>
          {showCompleted ? "Show pending" : "Show all"}
        </button>
        <TaskList activities={visibleActivities} />
      </section>
    </main>
  );
};

export default App;
