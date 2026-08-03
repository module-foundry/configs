import { type JSX } from "solid-js";

import { type UserProfile } from "@/model/types";

interface ProfileCardProps {
  profile: UserProfile;
}

/**
 * Displays a compact user summary.
 *
 * @returns The profile card.
 */
const ProfileCard = (props: ProfileCardProps): JSX.Element => {
  return (
    <article>
      <h2>{props.profile.name}</h2>
      <p>{props.profile.role}</p>
    </article>
  );
};

export default ProfileCard;
