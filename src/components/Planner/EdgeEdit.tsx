import React, { useMemo } from "react";
import { Group, Line, Circle } from "react-konva";
import Konva from "konva";

import { Point } from "./types";
import { removeCustomCursor, setPointerCursor } from "./domUtils";
import { useTouchDevice } from "@/hooks/useTouchDevice";

interface EdgeEditProps {
  pointA: Point;
  pointB: Point;
  onClick?: (points: [Point, Point], wallIndex: number) => void;
  onDoubleClick?: (clickPosition: Point, points: [Point, Point]) => void;
  onMouseEnter?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseLeave?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  wallIndex: number;
  edit: boolean;
  disabled: boolean;
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
  const { pointA, pointB, onClick, onDoubleClick, onMouseEnter, onMouseLeave, wallIndex, edit, disabled } = props;
  const [state, setState] = React.useState<'default' | 'hover' >('default');
  const isTouchDevice = useTouchDevice();
  
  // Use larger size for touch devices
  const size = isTouchDevice ? 24 : 16;
  const points = useMemo(() => getRectanglePoints(pointA, pointB, size), [pointA, pointB, size]);
  
  // State for handling double-click/double-tap detection for both mouse and touch
  const [lastClickTime, setLastClickTime] = React.useState(0);
  const [lastClickPosition, setLastClickPosition] = React.useState<Point | null>(null);
  const [clickTimeoutId, setClickTimeoutId] = React.useState<NodeJS.Timeout | null>(null);
  
  const DOUBLE_CLICK_DELAY = 200; // milliseconds
  const DOUBLE_CLICK_DISTANCE = 20; // pixels
  
  const {handleMouseEnter, handleMouseLeave, handleClick, handleTouchStart } = useMemo(() => ({
    handleMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
      onMouseEnter?.(e);
      if (edit || disabled) return;
      setState('hover');
      setPointerCursor(e)
    },
    handleMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
      onMouseLeave?.(e);
      setState('default');
      removeCustomCursor(e);
    },
    handleClick: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (disabled) return;
      
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos || !stage) return;
      
      const scale = stage.scale();
      const clickPos: Point = [pos.x / scale.x, pos.y / scale.y];
      const currentTime = Date.now();
      
      // Check if this is a double-click/double-tap
      if (lastClickTime && 
          currentTime - lastClickTime < DOUBLE_CLICK_DELAY &&
          lastClickPosition &&
          Math.abs(clickPos[0] - lastClickPosition[0]) < DOUBLE_CLICK_DISTANCE && 
          Math.abs(clickPos[1] - lastClickPosition[1]) < DOUBLE_CLICK_DISTANCE) {
        // This is a double-click/double-tap
        
        // Clear the single-click timeout if it exists
        if (clickTimeoutId) {
          clearTimeout(clickTimeoutId);
          setClickTimeoutId(null);
        }
        
        setLastClickTime(0);
        setLastClickPosition(null);
        onDoubleClick?.(clickPos, [pointA, pointB]);
      } else {
        // This is a single click - set up timeout for delayed handling
        setLastClickTime(currentTime);
        setLastClickPosition(clickPos);
        
        // Clear any existing timeout
        if (clickTimeoutId) {
          clearTimeout(clickTimeoutId);
        }
        
        // Set timeout to handle single click after double-click delay
        const timeoutId = setTimeout(() => {
          if (!edit) {
            onClick?.([pointA, pointB], wallIndex);
          }
          setClickTimeoutId(null);
        }, DOUBLE_CLICK_DELAY);
        
        setClickTimeoutId(timeoutId);
      }
    },
    handleTouchStart: (e: Konva.KonvaEventObject<TouchEvent>) => {
      // For touch devices, prevent default and let handleClick (onTap) handle it
      e.evt.preventDefault();
    }
  }), [onMouseEnter, edit, disabled, onMouseLeave, onClick, onDoubleClick, pointA, pointB, wallIndex, lastClickTime, lastClickPosition, clickTimeoutId]);

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
        onTouchStart={handleTouchStart}
        onTap={handleClick}
        id={props.id}
      />
      {edit && <Circle x={pointB[0]} y={pointB[1]} radius={2} fill="black" strokeWidth={2} stroke='black'  />}
    </Group>
  );
};

export default EdgeEdit;