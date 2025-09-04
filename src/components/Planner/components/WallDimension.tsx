import React from "react";

import { Text } from "react-konva";
import { Point } from "../types";

interface WallDimensionProps {
  pointA: Point,
  pointB: Point,
  scale: number,
  fraction?: number,
  unit?: string,
  globalScale?: number,
}

export const WallDimension: React.FC<WallDimensionProps> = ({ pointA, pointB, scale, fraction = 2, unit = 'm', globalScale = 100 }) => {
  const length = Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]) * scale;
  const midX = (pointA[0] + pointB[0]) / 2;
  const midY = (pointA[1] + pointB[1]) / 2;
  const angle = Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]);
  let displayAngle = angle;
  
  // Calculate zoom factor for scaling dimensions (non-linear to make it less dramatic)
  const zoomFactor = globalScale / 100;
  const scalingFactor = Math.pow(zoomFactor, 0.3); // Non-linear scaling (cube root-like)
  
  // Scale the offset distance - smaller when zoomed in
  let baseOffset = -17; // Base offset to move dimensions outside
  let offset = baseOffset / scalingFactor;
  
  if (Math.abs(displayAngle) > Math.PI / 2) {
    displayAngle = displayAngle > 0 ? displayAngle - Math.PI : displayAngle + Math.PI;
    baseOffset = -6; // Adjust offset for readability
    offset = baseOffset / scalingFactor;
  }

  const offsetX = offset * Math.cos(angle + Math.PI / 2);
  const offsetY = offset * Math.sin(angle + Math.PI / 2);
  const text = `${length.toFixed(fraction)} ${unit}`;
  
  // Scale font size - smaller when zoomed in
  const baseFontSize = 14;
  const fontSize = baseFontSize / scalingFactor;
  
  // Scale text offset for proper centering
  const textOffset = ((text.length * 7) / 2) / scalingFactor;
  
  return (
    <Text
      x={midX + offsetX}
      y={midY + offsetY}
      text={text}
      listening={false}
      rotation={(displayAngle * 180) / Math.PI}
      fontSize={fontSize}
      fill="black"
      align="center"
      verticalAlign="middle"
      offsetX={textOffset} // Center text horizontally
    />
  );
};