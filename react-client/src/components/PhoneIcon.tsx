import React from "react";

const PhoneNumberIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M4 10C4 8.89543 4.89543 8 6 8H18C19.1046 8 20 8.89543 20 10V14C20 15.1046 19.1046 16 18 16H6C4.89543 16 4 15.1046 4 14V10ZM6 6H18C20.2091 6 22 7.79086 22 10V14C22 16.2091 20.2091 18 18 18H6C3.79086 18 2 16.2091 2 14V10C2 7.79086 3.79086 6 6 6ZM8 12C7.44772 12 7 12.4477 7 13C7 13.5523 7.44772 14 8 14H9V12H8ZM15 12H10V14H15V12Z"
      fill="currentColor"
    />
  </svg>
);

export default PhoneNumberIcon;
