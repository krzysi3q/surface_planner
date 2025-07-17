import React from "react";

import { Text } from "react-konva";
import { Point } from "../types";

interface WallDimensionProps {
  pointA: Point,
  pointB: Point,
  scale: number,
  fraction?: number,
  unit?: string,
}

export const WallDimension: React.FC<WallDimensionProps> = ({ pointA, pointB, scale, fraction = 2, unit = 'm' }) => {
  const length = Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]) * scale;
  const midX = (pointA[0] + pointB[0]) / 2;
  const midY = (pointA[1] + pointB[1]) / 2;
  const angle = Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]);
  let displayAngle = angle;
  let offset = -17; // Offset to move dimensions outside
  if (Math.abs(displayAngle) > Math.PI / 2) {
    displayAngle = displayAngle > 0 ? displayAngle - Math.PI : displayAngle + Math.PI;
    offset = -6; // Adjust offset for readability
  }

  const offsetX = offset * Math.cos(angle + Math.PI / 2);
  const offsetY = offset * Math.sin(angle + Math.PI / 2);
  const text = `${length.toFixed(fraction)} ${unit}`;
  return (
    <Text
      x={midX + offsetX}
      y={midY + offsetY}
      text={text}
      listening={false}
      rotation={(displayAngle * 180) / Math.PI}
      fontSize={14}
      fill="black"
      align="center"
      verticalAlign="middle"
      offsetX={((text.length * 7) / 2)} // Center text horizontally
    />
  );
};