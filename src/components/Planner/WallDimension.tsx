import React from "react";

import { Text } from "react-konva";
import { Point } from "./types";

interface WallDimensionProps {
  pointA: Point,
  pointB: Point,
  scale: number,
}

export const WallDimension: React.FC<WallDimensionProps> = ({ pointA, pointB, scale }) => {
  const length = Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]) * scale;
  const midX = (pointA[0] + pointB[0]) / 2;
  const midY = (pointA[1] + pointB[1]) / 2;
  const angle = Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]);

  const offset = -20; // Offset to move dimensions outside
  const offsetX = offset * Math.cos(angle + Math.PI / 2);
  const offsetY = offset * Math.sin(angle + Math.PI / 2);
  const text = `${length.toFixed(2)} m`;
  return (
    <Text
      x={midX + offsetX}
      y={midY + offsetY}
      text={text}
      rotation={(angle * 180) / Math.PI}
      fontSize={14}
      fill="black"
      align="center"
      verticalAlign="middle"
      offsetX={((text.length * 7) / 2)} // Center text horizontally
    />
  );
};