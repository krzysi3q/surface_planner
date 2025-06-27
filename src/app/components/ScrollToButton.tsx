'use client';

import React from "react";

export interface ScrollToButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  targetId: string;
}

export const ScrollToButton: React.FC<React.PropsWithChildren<ScrollToButtonProps>> = ({ targetId, children, ...props }) => {
  const handleClick = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
};