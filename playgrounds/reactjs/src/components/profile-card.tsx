import { type JSX } from "react";

import { type UserProfile } from "@/model/types";

interface ProfileCardProps {
  profile: UserProfile;
}

/**
 * Displays a compact user summary.
 *
 * @returns The profile card.
 */
const ProfileCard = ({ profile }: ProfileCardProps): JSX.Element => {
  return (
    <article>
      <h2>{profile.name}</h2>
      <p>{profile.role}</p>
    </article>
  );
};

export default ProfileCard;
