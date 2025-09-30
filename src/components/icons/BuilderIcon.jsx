import React from 'react';

const BuilderIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15v-2.5A2.5 2.5 0 0 1 11.5 10h1A2.5 2.5 0 0 1 15 12.5V15" />
    <path d="M12 9v1.5" />
    <path d="M8 19h8" />
  </svg>
);

export default BuilderIcon;