import React from "react";
import { Point } from "./types";
import { Rect } from "react-konva";
import Konva from "konva";
import { setNsResizeCursor, setEwResizeCursor, removeCustomCursor } from "./domUtils";
import { useTouchDevice } from "@/hooks/useTouchDevice";

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
  const currentStageRef = React.useRef<Konva.Stage | null>(null);
  const isTouchDevice = useTouchDevice();

  const midX = (pointA[0] + pointB[0]) / 2;
  const midY = (pointA[1] + pointB[1]) / 2;

  // Use larger dimensions for touch devices
  const rectWidth = orientation === "horizontal" ? (isTouchDevice ? 30 : 20) : (isTouchDevice ? 12 : 8);
  const rectHeight = orientation === "vertical" ? (isTouchDevice ? 30 : 20) : (isTouchDevice ? 12 : 8);

  // handlers for edge dragging
  const handleEdgeDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragStart?.(pointA, pointB, orientation);
    const stage = e.currentTarget.getStage();
    currentStageRef.current = stage;
    const pos = stage?.getPointerPosition();
    if (pos && stage) {
      // Store position in stage coordinates
      const scale = stage.scale();
      startPosRef.current = { x: pos.x / scale.x, y: pos.y / scale.y };
    }
  };
  const handleEdgeDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const startPos = startPosRef.current;
    if (!startPos) return;
    const stage = e.currentTarget.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos || !stage) return;
    
    // Convert current position to stage coordinates
    const scale = stage.scale();
    const currentX = pos.x / scale.x;
    const currentY = pos.y / scale.y;
    const dx = currentX - startPos.x;
    const dy = currentY - startPos.y;
    
    if (orientation === "horizontal") {
      onDragMove?.(e, [0, dy], [0, dy]);
    } else if (orientation === "vertical") {
      onDragMove?.(e, [dx, 0], [dx, 0]);
    }
    
  };
  // Touch handlers 
  const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    onDragStart?.(pointA, pointB, orientation);
    const touch = e.evt.touches[0];
    const stage = e.currentTarget.getStage();
    if (touch && stage) {
      // Convert touch position to stage coordinates
      const scale = stage.scale();
      const stagePos = stage.getPointerPosition();
      if (stagePos) {
        startPosRef.current = { x: stagePos.x / scale.x, y: stagePos.y / scale.y };
      }
    }
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const startPos = startPosRef.current;
    if (!startPos) return;
    const stage = e.currentTarget.getStage();
    const stagePos = stage?.getPointerPosition();
    if (!stagePos || !stage) return;
    
    // Convert current position to stage coordinates
    const scale = stage.scale();
    const currentX = stagePos.x / scale.x;
    const currentY = stagePos.y / scale.y;
    const dx = currentX - startPos.x;
    const dy = currentY - startPos.y;
    
    // Create a mock drag event for compatibility
    const mockDragEvent = e as unknown as Konva.KonvaEventObject<DragEvent>;
    
    if (orientation === "horizontal") {
      onDragMove?.(mockDragEvent, [0, dy], [0, dy]);
    } else if (orientation === "vertical") {
      onDragMove?.(mockDragEvent, [dx, 0], [dx, 0]);
    }
  };

  const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
    console.log("Touch drag ended");
    const mockDragEvent = e as unknown as Konva.KonvaEventObject<DragEvent>;
    onDragEnd?.(mockDragEvent);
    startPosRef.current = null;
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
      dragBoundFunc={(pos: Konva.Vector2d) => {
        // Get stage from ref
        const stage = currentStageRef.current;
        const scale = stage?.scale() || { x: 1, y: 1 };
        
        // Convert stage coordinates to screen coordinates for dragBoundFunc
        const screenMidX = midX * scale.x;
        const screenMidY = midY * scale.y;
        const screenRectWidth = rectWidth * scale.x;
        const screenRectHeight = rectHeight * scale.y;
        
        return orientation === "horizontal"
          ? { x: screenMidX - screenRectWidth / 2, y: pos.y }
          : { x: pos.x, y: screenMidY - screenRectHeight / 2 };
      }}
      onMouseEnter={orientation === 'horizontal' ? setNsResizeCursor : setEwResizeCursor}
      onMouseLeave={removeCustomCursor}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};