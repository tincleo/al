import React from "react";

interface Props {
  size?: number;
  fill?: string;
  width?: number;
  height?: number;
}

export const EyeIcon = ({ fill, size, height, width, ...props }: Props) => {
  return (
    <svg
      fill="none"
      height={size || height || 24}
      viewBox="0 0 24 24"
      width={size || width || 24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
        stroke={fill || "currentColor"}
        strokeWidth={1.5}
      />
      <path
        d="M6.94975 7.05025C9.68342 4.31658 14.3166 4.31658 17.0503 7.05025L18.5503 8.55025C20.4771 10.4771 20.4771 13.5229 18.5503 15.4497L17.0503 16.9497C14.3166 19.6834 9.68342 19.6834 6.94975 16.9497L5.44975 15.4497C3.52288 13.5229 3.52288 10.4771 5.44975 8.55025L6.94975 7.05025Z"
        stroke={fill || "currentColor"}
        strokeWidth={1.5}
      />
    </svg>
  );
};
