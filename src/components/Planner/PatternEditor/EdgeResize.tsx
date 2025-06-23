import React, { useMemo } from "react";
import { Line } from "react-konva";
import Konva from "konva";

import { Point } from "../types";

interface EdgeEditProps {
  pointA: Point;
  pointB: Point;
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => void;
  onMouseEnter?: (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => void;
  onMouseLeave?: (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => void;
  name?: string;
}


function getRectanglePoints(
  pointA: Point, 
  pointB: Point, 
  height: number,
  width: number
): number[] {
  const [pointAx, pointAy] = pointA;
  const [pointBx, pointBy] = pointB;

  // Calculate the vector between the points
  const dx = pointBx - pointAx;
  const dy = pointBy - pointAy;

  // Calculate the length of the vector
  const length = Math.sqrt(dx * dx + dy * dy);

  // Normalize the vector
  const unitX = dx / length;
  const unitY = dy / length;

  // Calculate the perpendicular vector
  const perpX = -unitY;
  const perpY = unitX;

  // Calculate the midpoint between pointA and pointB
  const midpointX = (pointAx + pointBx) / 2;
  const midpointY = (pointAy + pointBy) / 2;

  // Calculate half the width of the rectangle along the original line direction
  const halfWidth = width / 2;
  
  // Calculate the four corners of the rectangle
  const cornerA = [
    midpointX - unitX * halfWidth - perpX * (height / 2),
    midpointY - unitY * halfWidth - perpY * (height / 2),
  ];
  const cornerB = [
    midpointX + unitX * halfWidth - perpX * (height / 2),
    midpointY + unitY * halfWidth - perpY * (height / 2),
  ];
  const cornerC = [
    midpointX + unitX * halfWidth + perpX * (height / 2),
    midpointY + unitY * halfWidth + perpY * (height / 2),
  ];
  const cornerD = [
    midpointX - unitX * halfWidth + perpX * (height / 2),
    midpointY - unitY * halfWidth + perpY * (height / 2),
  ];

  // Combine all points into an array (ensure the order creates a proper shape)
  return [
    cornerA[0], cornerA[1],
    cornerB[0], cornerB[1],
    cornerC[0], cornerC[1],
    cornerD[0], cornerD[1],
  ];
}

export const EdgeResize: React.FC<EdgeEditProps> = (props) => {
  const { pointA, pointB, onMouseEnter, onMouseLeave, onMouseDown, name } = props;
  const points = useMemo(() => getRectanglePoints(pointA, pointB, 11, 30), [pointA, pointB]);

  // Determine orientation: horizontal (width > height) or vertical (height > width)
  const isHorizontal = Math.abs(pointB[0] - pointA[0]) > Math.abs(pointB[1] - pointA[1]);

  const { handleMouseEnter, handleMouseLeave, handleMouseDown } = useMemo(() => ({
    handleMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseEnter?.(e, isHorizontal ? 'ns' : 'ew'),
    handleMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseLeave?.(e, isHorizontal ? 'ns' : 'ew'),
    handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown?.(e, isHorizontal ? 'ns' : 'ew')
  }), [onMouseEnter, onMouseLeave, onMouseDown, isHorizontal]);

  const elName = useMemo(() => {
    const prefix = name ? `${name}-resize` : 'resize' 
    return (isHorizontal ? `${prefix}-ns` : `${prefix}-ew`)
  }, [name, isHorizontal]);

  return (
    <Line 
      points={points} // Rectangle coordinates    
      strokeWidth={2}
      stroke="black"
      closed={true} // Close the shape
      fill="white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      name={elName} // Use the name prop for identification
      listening={true} // Ensure the shape is interactive
    />
  );
};
