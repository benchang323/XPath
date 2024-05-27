import React from "react";

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="img"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14ZM12 4C14.2091 4 16 5.79086 16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4ZM12 16C9.33333 16 4 17.3333 4 20V22H20V20C20 17.3333 14.6667 16 12 16Z"
      fill="currentColor"
    />
  </svg>
);

export default UserIcon;
