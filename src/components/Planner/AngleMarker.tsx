import React from "react";
import { Arc, Text, Group } from "react-konva";

interface AngleMarkerProps {
  x: number;
  y: number;
  angle: number; // Sweep angle in degrees (can be negative for CCW)
  rotation: number; // Start angle of the sweep in degrees
}

export const AngleMarker: React.FC<AngleMarkerProps> = ({ x, y, angle, rotation }) => {
  const radius = 20; // Radius for the arc line
  const textRadiusOffset = 15; // Offset for text to be slightly inside the arc line
  const textDisplayRadius = radius + textRadiusOffset;

  // Calculate the midpoint angle for the text
  // Angle prop is sweep, rotation is start. Midpoint is start + sweep/2.
  const midAngleDeg = rotation + angle / 2;
  const midAngleRad = midAngleDeg * (Math.PI / 180);

  // Calculate text position
  const textX = textDisplayRadius * Math.cos(midAngleRad);
  const textY = textDisplayRadius * Math.sin(midAngleRad);

  // Display positive value of the angle, rounded.
  // The 'angle' prop is the sweep, its magnitude is what we want to show.
  const displayAngle = Math.abs(Math.round(angle * 10) / 10);

  return (
    <Group x={x} y={y}>
      <Arc
        innerRadius={radius}
        outerRadius={radius}
        rotation={rotation}
        angle={angle} // Konva's angle is the sweep extent
        fill="white"
        stroke="black"
        strokeWidth={1}
      />
      <Text
        x={textX}
        y={textY}
        text={`${displayAngle}°`}
        fontSize={10}
        fill="black"
        align="center"
        verticalAlign="middle"
        offsetX={5} // Manual adjustment to center based on text width
        offsetY={5} // Manual adjustment to center based on text height
      />
    </Group>
  );
};