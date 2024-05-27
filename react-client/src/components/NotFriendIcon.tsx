// icon:friends-off | Tabler Icons https://tablericons.com/ | Csaba Kissi
import * as React from "react";

function IconFriendsOff(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M5 5a2 2 0 002 2m2-2a2 2 0 00-2-2M5 22v-5l-1-1v-4a1 1 0 011-1h4a1 1 0 011 1v4l-1 1v5" />
      <path d="M19 5 A2 2 0 0 1 17 7 A2 2 0 0 1 15 5 A2 2 0 0 1 19 5 z" />
      <path d="M15 22v-4h-2l1.254-3.763m1.036-2.942A.997.997 0 0116 11h2a1 1 0 011 1l1.503 4.508M19 19v3M3 3l18 18" />
    </svg>
  );
}

export default IconFriendsOff;
