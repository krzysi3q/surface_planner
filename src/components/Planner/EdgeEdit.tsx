import React, { useMemo } from "react";
import { Group, Line, Circle } from "react-konva";
import Konva from "konva";

import { Point } from "./types";
import { removeCustomCursor, setPointerCursor } from "./domUtils";

interface EdgeEditProps {
  pointA: Point;
  pointB: Point;
  wallIndex: number;
  edit: boolean;
  onClick?: (points: Point[], wallIndex: number) => void;
  onMouseEnter?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseLeave?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  id?: string;
}


function getRectanglePoints(pointA: Point, pointB: Point, size: number): number[] {
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

  // Shift points A and B to be at the center of the shorter edges
  const adjustedPointA = [
    pointAx - perpX * (size / 2),
    pointAy - perpY * (size / 2),
  ];
  const adjustedPointB = [
    pointBx - perpX * (size / 2),
    pointBy - perpY * (size / 2),
  ];

  // Determine the other two vertices of the rectangle
  const pointC = [
    adjustedPointA[0] + perpX * size,
    adjustedPointA[1] + perpY * size,
  ];
  const pointD = [
    adjustedPointB[0] + perpX * size,
    adjustedPointB[1] + perpY * size,
  ];

  // Combine all points into an array
  return [
    adjustedPointA[0], adjustedPointA[1], // Point A
    adjustedPointB[0], adjustedPointB[1], // Point B
    pointD[0], pointD[1], // Point D
    pointC[0], pointC[1], // Point C
  ];
}

const EdgeEdit: React.FC<EdgeEditProps> = (props) => {
  const { pointA, pointB, onClick, onMouseEnter, onMouseLeave, wallIndex, edit } = props;
  const [state, setState] = React.useState<'default' | 'hover' >('default');
  const points = useMemo(() => getRectanglePoints(pointA, pointB, 16), [pointA, pointB]);
  const {handleMouseEnter, handleMouseLeave, handleClick } = useMemo(() => ({
    handleMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
      onMouseEnter?.(e);
      if (edit) return;
      setState('hover');
      setPointerCursor(e)
    },
    handleMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
      onMouseLeave?.(e);
      setState('default');
      removeCustomCursor(e);
    },
    handleClick: () => {
      onClick?.([pointA, pointB], wallIndex);
    }
  }), [onMouseEnter, edit, onMouseLeave, onClick, wallIndex, pointA, pointB]);

  return (
    <Group>
      {edit && <Circle x={pointA[0]} y={pointA[1]} radius={2} fill="black" strokeWidth={2} stroke='black'  />}
      <Line 
        points={points} // Rectangle coordinates    
        strokeWidth={2}
        closed={true} // Close the shape
        fill={ state === 'hover' && !edit ? "rgba(0, 0, 0, 0.1)" : 'transparent' }// Optional fill: ;
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        id={props.id}
      />
      {edit && <Circle x={pointB[0]} y={pointB[1]} radius={2} fill="black" strokeWidth={2} stroke='black'  />}
    </Group>
  );
};

export default EdgeEdit;