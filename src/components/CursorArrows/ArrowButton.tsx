import React, { useEffect } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

import { ToolbarButton } from "../ToolbarButton";

const icon = {
    up: <ArrowUp />,
    down: <ArrowDown />,
    left: <ArrowLeft />,
    right: <ArrowRight />,
  }

export interface ArrowButtonProps {
  direction: "up" | "down" | "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const ArrowButton: React.FC<ArrowButtonProps> = ({
  direction,
  onClick,
  disabled = false,
  className = "",
}) => {

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const isKeyPressedRef = React.useRef<boolean>(false);
  const isMouseDownRef = React.useRef<boolean>(false);
  const isTouchDownRef = React.useRef<boolean>(false);
  
  const startRepeating = React.useCallback(() => {
    if (timeoutRef.current || intervalRef.current) return;
    
    // Initial delay before starting to repeat
    timeoutRef.current = setTimeout(() => {
      // Start repeating
      intervalRef.current = setInterval(() => {
        onClick();
      }, 50);
    }, 300); // 300ms initial delay
  }, [onClick]);

  const stopRepeating = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled || isKeyPressedRef.current) return;

      let shouldHandle = false;
      switch (event.key) {
        case "ArrowUp":
          shouldHandle = direction === "up";
          break;
        case "ArrowDown":
          shouldHandle = direction === "down";
          break;
        case "ArrowLeft":
          shouldHandle = direction === "left";
          break;
        case "ArrowRight":
          shouldHandle = direction === "right";
          break;
        default:
          return;
      }

      if (shouldHandle) {
        isKeyPressedRef.current = true;
        event.preventDefault();
        onClick(); // Initial click
        startRepeating();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (disabled) return;

      let shouldHandle = false;
      switch (event.key) {
        case "ArrowUp":
          shouldHandle = direction === "up";
          break;
        case "ArrowDown":
          shouldHandle = direction === "down";
          break;
        case "ArrowLeft":
          shouldHandle = direction === "left";
          break;
        case "ArrowRight":
          shouldHandle = direction === "right";
          break;
        default:
          return;
      }

      if (shouldHandle && isKeyPressedRef.current) {
        isKeyPressedRef.current = false;
        event.preventDefault();
        stopRepeating();
      }
    };

    const handleMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        stopRepeating();
      }
    };

    const handleMouseLeave = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        stopRepeating();
      }
    };

    const handleTouchEnd = () => {
      if (isTouchDownRef.current) {
        isTouchDownRef.current = false;
        stopRepeating();
      }
    };

    const handleTouchCancel = () => {
      if (isTouchDownRef.current) {
        isTouchDownRef.current = false;
        stopRepeating();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchCancel);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchCancel);
      stopRepeating();
    };
  }, [disabled, direction, onClick, startRepeating, stopRepeating]);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled || isTouchDownRef.current) return; // Prevent conflict with touch
    event.preventDefault();
    isMouseDownRef.current = true;
    onClick(); // Initial click
    startRepeating();
  };

  const handleTouchStart = () => {
    if (disabled || isMouseDownRef.current) return; // Prevent conflict with mouse
    // Don't prevent default to avoid passive event listener issues
    isTouchDownRef.current = true;
    onClick(); // Initial click
    startRepeating();
  };

  const handleTouchEndLocal = () => {
    if (isTouchDownRef.current) {
      isTouchDownRef.current = false;
      stopRepeating();
    }
  };

  const handleMouseUpLocal = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      stopRepeating();
    }
  };

  return (
    <ToolbarButton
      variant="default"
      icon={icon[direction]}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUpLocal}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEndLocal}
      disabled={disabled}
      className={className}
      />
  );
};