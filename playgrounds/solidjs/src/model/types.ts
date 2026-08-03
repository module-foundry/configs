type ActivityStatus = "done" | "pending";

interface Activity {
  id: string;
  label: string;
  status: ActivityStatus;
}

interface UserProfile {
  name: string;
  role: string;
}

export { type Activity, type ActivityStatus, type UserProfile };
