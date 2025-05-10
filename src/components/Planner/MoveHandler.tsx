import React from "react";
import { Point } from "./types";
import { Rect } from "react-konva";
import Konva from "konva";
import { setNsResizeCursor, setEwResizeCursor, removeCustomCursor } from "./domUtils";

interface MoveHandlerProps {
  pointA: Point;
  pointB: Point;
  orientation: "horizontal" | "vertical";
  onDragMove?: (evt: Konva.KonvaEventObject<DragEvent>, diffA: Point, diffB: Point) => void;
  onDragStart?: (pointA: Point, pointB: Point, orientation: MoveHandlerProps['orientation']) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

export const MoveHandler: React.FC<MoveHandlerProps> = ({ pointA, pointB, onDragMove, onDragStart, onDragEnd, orientation }) => {
  // refs for edge dragging
  const startPosRef = React.useRef<{ x: number; y: number } | null>(null);

  const midX = (pointA[0] + pointB[0]) / 2;
  const midY = (pointA[1] + pointB[1]) / 2;

  const rectWidth = orientation === "horizontal" ? 20 : 8;
  const rectHeight = orientation === "vertical" ? 20 : 8;

  // handlers for edge dragging
  const handleEdgeDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragStart?.(pointA, pointB, orientation);
    const pos = e.currentTarget.getStage()?.getPointerPosition();
    if (pos) startPosRef.current = { x: pos.x, y: pos.y };
  };
  const handleEdgeDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const startPos = startPosRef.current;
    if (!startPos) return;
    const pos = e.currentTarget.getStage()?.getPointerPosition();
    if (!pos) return;
    const dx = pos.x - startPos.x;
    const dy = pos.y - startPos.y;
    
    if (orientation === "horizontal") {
      onDragMove?.(e, [0, dy], [0, dy]);
    } else if (orientation === "vertical") {
      onDragMove?.(e, [dx, 0], [dx, 0]);
    }
    
  };
  const handleEdgeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    console.log("Drag ended");
    onDragEnd?.(e);
    startPosRef.current = null;
  };
  

  return (
    <Rect
      x={midX - rectWidth / 2}
      y={midY - rectHeight / 2}
      width={rectWidth}
      height={rectHeight}
      fill="white"
      stroke="black"
      strokeWidth={2}
      draggable
      onDragStart={handleEdgeDragStart}
      onDragMove={handleEdgeDragMove}
      onDragEnd={handleEdgeDragEnd}
      dragBoundFunc={(pos: Konva.Vector2d) =>
        orientation === "horizontal"
          ? { x: midX - rectWidth / 2, y: pos.y }
          : { x: pos.x, y: midY - rectHeight / 2 }
      }
      onMouseEnter={orientation === 'horizontal' ? setNsResizeCursor : setEwResizeCursor}
      onMouseLeave={removeCustomCursor}
    />
  );
};