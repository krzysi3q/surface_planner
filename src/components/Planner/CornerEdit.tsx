import React, { useMemo } from "react";
import { Circle } from "react-konva";
import { setPointerCursor, removeCustomCursor, setMoveCursor } from "./domUtils";
import Konva from "konva";
import { Point } from "./types";

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

const radius = 8;

export const CornerEdit: React.FC<CornerEditProps> = ({ x, y, wallIndex, edit, onClick, onDragStart, onDragEnd, onDragMove }) => {
  const [state, setState] = React.useState<'default' | 'hover' >('default');
  const startPosRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragStart?.(e);
    const pos = e.currentTarget.getStage()?.getPointerPosition();
    if (pos) startPosRef.current = { x: pos.x, y: pos.y };
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
      const startPos = startPosRef.current;
      if (!startPos) return;
      const pos = e.currentTarget.getStage()?.getPointerPosition();
      if (!pos) return;
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      onDragMove?.(e, [dx, dy]);
    };
    const handleEdgeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd?.(e);
      startPosRef.current = null;
    };
  
  const {handleMouseEnter, handleMouseLeave, handleClick } = useMemo(() => ({
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
      draggable={edit}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleEdgeDragEnd}
    />
  )
}