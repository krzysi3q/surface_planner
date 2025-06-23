import React, { useEffect } from "react";

import { Pattern } from "../types";
import { drawPattern } from "../utils";

export interface PatternButtonProps {
  pattern: Pattern;
  onClick: (pattern: Pattern) => void;
}

export const PatternButton: React.FC<PatternButtonProps> = ({
  pattern,
  onClick,
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


  const size = Math.min(100, pattern.width, pattern.height);

  return (
    <button
      className="flex items-center justify-center p-1 border border-solid border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={() => onClick(pattern)}
    >
      {background && <div className="w-20 h-20 rounded-md bg-repeat bg-center" style={{ backgroundImage: `url(${background})`, backgroundSize: `${size}%` }} />}
    </button>
  );
};
