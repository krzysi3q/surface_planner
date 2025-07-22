import React, { useMemo } from "react";
import { Circle } from "react-konva";
import { setPointerCursor, removeCustomCursor, setMoveCursor } from "./domUtils";
import Konva from "konva";
import { Point } from "./types";
import { useTouchDevice } from "@/hooks/useTouchDevice";

interface CornerEditProps {
  x: number;
  y: number;
  wallIndex: number;
  edit: boolean;
  onClick?: (wallIndex: number) => void;
  onDragStart?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>, diff: Point) => void;
}

export const CornerEdit: React.FC<CornerEditProps> = ({ x, y, wallIndex, edit, onClick, onDragStart, onDragEnd, onDragMove }) => {
  const [state, setState] = React.useState<'default' | 'hover' >('default');
  const startPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const isTouchDevice = useTouchDevice();
  
  // Use larger radius for touch devices
  const radius = isTouchDevice ? 12 : 8;

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragStart?.(e);
    const stage = e.currentTarget.getStage();
    const pos = stage?.getPointerPosition();
    if (pos && stage) {
      // Store position in stage coordinates
      const scale = stage.scale();
      startPosRef.current = { x: pos.x / scale.x, y: pos.y / scale.y };
    }
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
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
      onDragMove?.(e, [dx, dy]);
    };
    const handleEdgeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd?.(e);
      startPosRef.current = null;
    };
  
  const {handleMouseEnter, handleMouseLeave, handleClick, handleTouchStart } = useMemo(() => ({
    handleMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
      setState('hover');
      if (edit) {
        setMoveCursor(e);
      } else {
        setPointerCursor(e)
      }
    },
    handleMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
      setState('default');
      removeCustomCursor(e);
    },
    handleClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      setMoveCursor(e);
      onClick?.(wallIndex);
    },
    handleTouchStart: (e: Konva.KonvaEventObject<TouchEvent>) => {
      // For touch devices, treat touch start as click
      e.evt.preventDefault();
      onClick?.(wallIndex);
    }
  }), [edit, onClick, wallIndex]);

  let fillColor = 'transparent';
  if (state === 'hover' && !edit) {
    fillColor = "rgba(0, 0, 0, 0.1)";
  } else if (edit) {
    fillColor = 'white';
  }
  return (
    <Circle
      x={x}
      y={y}
      id={`corner-${wallIndex}`}
      radius={radius}
      fill={fillColor}
      stroke="black"
      strokeWidth={edit ? 2 : 0}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTap={handleClick}
      draggable={edit}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleEdgeDragEnd}
    />
  )
}