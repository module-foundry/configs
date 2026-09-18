import { type JSX } from "react";

import ProfileCard from "@/components/profile-card";

const profile = {
  heading: "Profile",
  name: "Ada Lovelace",
  role: "Engineer",
};

const Default = (): JSX.Element => {
  return <ProfileCard profile={profile} />;
};

export { Default };
