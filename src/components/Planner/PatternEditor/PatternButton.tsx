import React, { useEffect } from "react";

import { Pattern } from "../types";
import { drawPattern } from "../utils";
import { classMerge } from "@/utils/classMerge";

export interface PatternButtonProps {
  pattern: Pattern;
  displayScale?: number;
  onClick: (pattern: Pattern) => void;
  className?: string;
}

export const PatternButton: React.FC<PatternButtonProps> = ({
  pattern,
  displayScale = 1,
  onClick,
  className,
}) => {
  const [background, setBackground] = React.useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (!pattern || pattern.tiles.length === 0) return;
    const canvas = drawPattern(pattern);
    canvas?.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setBackground(url);
      }
    });
  }, [pattern]);

  return (
    <button
      className={classMerge("flex items-center justify-center p-1 w-16 h-16 md:w-22 md:h-22 border border-solid border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500", className)}
      onClick={() => onClick(pattern)}
    >
      {background && <div className="w-14 h-14 md:w-20 md:h-20 rounded-md bg-repeat bg-center" style={{ backgroundImage: `url(${background})`, backgroundSize: `${displayScale * 100}%` }} />}
    </button>
  );
};
