import React from "react";

import { ArrowButton } from "./ArrowButton";
import { ToolbarButton } from "../ToolbarButton";
import { Circle } from "lucide-react";
import { classMerge } from "@/utils/classMerge";

export interface CursorArrowsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  disabled?: boolean;
  variant?: 'wide' | 'default';
  className?: string;
}

export const CursorArrowsComponent: React.FC<CursorArrowsProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  disabled = false,
  variant = 'default',
  className,
}) => {
  return (
    <div className={classMerge("flex flex-col items-center gap-2", className)}>
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
        {variant === 'wide' && (<ToolbarButton className="pointer-events-none" icon={<Circle />} disabled/>)}
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