import React, { useState, useRef, useEffect } from "react";
import { Point } from "../types";
import { RightAngle } from "@/components/Icons/RightAngle";
import { Tooltip } from "@/components/Tooltip";
import { Lock } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation";
import { classMerge } from "@/utils/classMerge";

interface WallDimensionInputProps {
  pointA: Point;
  pointB: Point;
  scale: number;
  autoFocus?: boolean;
  globalScale: number;
  stagePosition: { x: number; y: number };
  onDimensionChange: (newLength: number) => void;
  disabled?: boolean;
  unit?: string;
  keepRightAngles?: boolean;
  onKeepRightAnglesChange?: (value: boolean) => void;
}

export const WallDimensionInput: React.FC<WallDimensionInputProps> = ({
  pointA,
  pointB,
  scale,
  globalScale,
  stagePosition,
  onDimensionChange,
  disabled = false,
  autoFocus = false,
  unit = 'm',
  keepRightAngles = false,
  onKeepRightAnglesChange
}) => {
  const { t } = useTranslation();
  const currentLength = Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]) * scale;
  const [inputValue, setInputValue] = useState(currentLength.toFixed(2));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(current => {
      if (Number(current) !== currentLength) {
        return currentLength.toFixed(2);
      }
      return current;
    });
  }, [currentLength]);

  const midX = (pointA[0] + pointB[0]) / 2;
  const midY = (pointA[1] + pointB[1]) / 2;
  const angle = Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]);
  
  // Normalize angle to keep text readable (max 90 degrees rotation)
  let displayAngle = angle;
  if (Math.abs(displayAngle) > Math.PI / 2) {
    displayAngle = displayAngle > 0 ? displayAngle - Math.PI : displayAngle + Math.PI;
  }
  
  // Calculate dynamic offset based on wall length and scale to maintain proper distance
  const wallLength = Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]);
  const baseOffset = Math.max(50, Math.min(100, wallLength * 0.15)); // Scale with wall length, clamp between 50-100
  
  // Better scaling that works well across zoom levels
  const scaleRatio = globalScale / 100;
  const scaleAdjustedOffset = baseOffset * Math.pow(scaleRatio, 0.3) / scaleRatio; // Gentler scaling curve
  const offset = -scaleAdjustedOffset;
  
  const offsetX = offset * Math.cos(angle + Math.PI / 2);
  const offsetY = offset * Math.sin(angle + Math.PI / 2);

  // Calculate screen position considering stage transform
  const screenX = (midX + offsetX) * (globalScale / 100) + stagePosition.x;
  const screenY = (midY + offsetY) * (globalScale / 100) + stagePosition.y;

  useEffect(() => {
    if (inputRef.current && autoFocus) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    const newLength = parseFloat(inputValue);
    if (!isNaN(newLength) && newLength > 0) {
      onDimensionChange(newLength);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(currentLength.toFixed(2)); // Reset to original length
    }
  };

  return (
    <>
      <div
        className="absolute z-20 bg-white border border-gray-300 rounded px-2 py-1 shadow-lg flex items-center pointer-events-auto"
        style={{
          left: screenX - 65,
          top: screenY - 15,
          transform: `rotate(${(displayAngle * 180) / Math.PI}deg)`,
          transformOrigin: 'center',
        }}
      >
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          // onBlur={handleBlur}
          disabled={disabled}
          className="w-16 text-sm border-none focus:ring-0 p-0 bg-transparent outline-none text-slate-700"
          step="0.01"
          min="0.01"
        />
        <span className="text-xs text-gray-600 ml-1">{unit}</span>
        {onKeepRightAnglesChange && (
          <Tooltip
          text={t('planner.ui.keepRightAngles')}
          position="top"
          component={ref => (
            <button
            ref={ref}
            className={classMerge('w-6 h-6 ml-2 cursor-pointer relative rounded border border-gray-300 shadow-lg flex items-center justify-center transition-colors pointer-events-auto',
              keepRightAngles ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}
            onClick={() => onKeepRightAnglesChange(!keepRightAngles)}
            >
                <RightAngle />
                {keepRightAngles && <Lock className="size-3 absolute top-0 right-0 text-white stroke-2" />}
              </button>
            )}
            />
          )}
        </div>
    </>
  );
};
