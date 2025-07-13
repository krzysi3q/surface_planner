import React from "react";

import { ArrowButton } from "./ArrowButton";

export interface CursorArrowsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  disabled?: boolean;
}

export const CursorArrowsComponent: React.FC<CursorArrowsProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <ArrowButton
        direction="up"
        onClick={onUp}
        disabled={disabled}
        className="cursor-pointer"
      />
      <div className="flex gap-2">
        <ArrowButton
          direction="left"
          onClick={onLeft}
          disabled={disabled}
          className="cursor-pointer"
        />
        <ArrowButton
          direction="right"
          onClick={onRight}
          disabled={disabled}
          className="cursor-pointer"
        />
      </div>
      <ArrowButton
        direction="down"
        onClick={onDown}
        disabled={disabled}
        className="cursor-pointer"
      />
    </div>
  );
}

export const CursorArrows = React.memo(CursorArrowsComponent);