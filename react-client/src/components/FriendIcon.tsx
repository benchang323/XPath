// icon:friends | Tabler Icons https://tablericons.com/ | Csaba Kissi
import * as React from "react";

function IconFriends(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M9 5 A2 2 0 0 1 7 7 A2 2 0 0 1 5 5 A2 2 0 0 1 9 5 z" />
      <path d="M5 22v-5l-1-1v-4a1 1 0 011-1h4a1 1 0 011 1v4l-1 1v5" />
      <path d="M19 5 A2 2 0 0 1 17 7 A2 2 0 0 1 15 5 A2 2 0 0 1 19 5 z" />
      <path d="M15 22v-4h-2l2-6a1 1 0 011-1h2a1 1 0 011 1l2 6h-2v4" />
    </svg>
  );
}

export default IconFriends;
