import React from "react";

interface ProfileProps {
  firstName: string;
  lastName: string;
  profilePic: File; // Assuming profilePic is a File object
  interests: string[];
}

const Profile: React.FC<ProfileProps> = ({
  firstName,
  lastName,
  profilePic,
  interests,
}) => (
  <div>
    <img
      src={URL.createObjectURL(profilePic)}
      alt={`${firstName} ${lastName}`}
    />
    <h3>{`${firstName} ${lastName}`}</h3>
    <p>Interests: {interests.join(", ")}</p>
  </div>
);

export default Profile;
