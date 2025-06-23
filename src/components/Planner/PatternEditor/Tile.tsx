import React, { useMemo, useState } from "react";
import { Circle, Line, Text } from "react-konva";
import Konva from "konva";

import { Point, TileType, TileMetadata } from "../types";
import { removeCustomCursor, setPointerCursor } from "../domUtils";
import { WallDimension } from "../components/WallDimension";
import { EdgeResize } from "./EdgeResize";

export type TileEventData = {
  id: string;
  action: 'rotate' | 'resize-ns' | 'resize-ew' | 'move';
  type: TileType['type'];
  isSecondary: boolean;
} 

interface TileProps {
  points: Point[];
  type: TileType['type'];
  isSelected?: boolean;
  isDragging?: boolean;
  metadata?: TileMetadata;
  scale: number;
  color: string;
  id: string;
  gapSize?: number;
  gapColor?: string;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent>, data: TileEventData) => void;
  onMouseEnter?: (e: Konva.KonvaEventObject<MouseEvent>, data: TileEventData) => void;
  onMouseLeave?: (e: Konva.KonvaEventObject<MouseEvent>, data: TileEventData) => void;
}

export const Tile: React.FC<TileProps> = ({ points, color, type, id, metadata, isSelected, isDragging, scale, onClick, onMouseDown, onMouseEnter, onMouseLeave }) => {
  const [state, setState] = useState<'default' | 'hover'>('default');

  const { handleMouseEnter, handleMouseLeave, handleClick, handleMouseDown } = useMemo(() => ({
      handleMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isSelected) {
          setPointerCursor(e)
          setState('hover');
        } else {
          onMouseEnter?.(e, { id, action: 'move', type, isSecondary: false });
        }
      },
      handleMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (state === 'hover' && !isDragging) {
          setState('default');
          removeCustomCursor(e);
        }
        if (isSelected) {
          onMouseLeave?.(e, { id, action: 'move', type, isSecondary: false });
        }
      },
      handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (isSelected) {
          onMouseDown?.(e, { id, action: 'move', type, isSecondary: false });
        }
      },
      handleClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
        onClick?.(e, id);
      }
    }), [isSelected, onMouseEnter, id, type, state, isDragging, onMouseLeave, onMouseDown, onClick]);

    const { circleEvents, rectEvents, secRectEvents } = useMemo(() => ({
      circleEvents: {
        down: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown?.(e, { id, action: 'rotate', type, isSecondary: false }),
        mouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseEnter?.(e, { id, action: 'rotate', type, isSecondary: false}),
        mouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseLeave?.(e, { id, action: 'rotate', type, isSecondary: false}),
      },
      rectEvents: {
        down: (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseDown?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew' , type, isSecondary: false }),
        mouseEnter: (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseEnter?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew', type, isSecondary: false}),
        mouseLeave: (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseLeave?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew', type, isSecondary: false}),
      },
      secRectEvents: {
        down: (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseDown?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew' , type, isSecondary: true }),
        mouseEnter: (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseEnter?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew', type, isSecondary: true}),
        mouseLeave: (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseLeave?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew', type, isSecondary: true}),
      },
    }), [onMouseDown, onMouseEnter, onMouseLeave, id, type]);

  return (
    <>
      <Line
        points={points.flat()}
        fill={color}
        closed
        strokeWidth={1}
        stroke="black"
        id={id}
        // draggable={isSelected}
        shadowOpacity={0.5}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        name="tile"
      />
      {isSelected && points.map((point, i) => {
        const nxt = points[(i + 1) % points.length];
        return (
          <WallDimension key={i} pointA={point} pointB={nxt} scale={scale} fraction={3} unit="m" />
        )
      })}
      {isSelected && (
        <Circle
          x={points[0][0]}
          y={points[0][1]}
          radius={5}
          strokeWidth={2}
          stroke='black'
          fill="white"
          onMouseEnter={circleEvents.mouseEnter}
          onMouseDown={circleEvents.down}
          onMouseLeave={circleEvents.mouseLeave}
          name="rotate-handle"
        />
      )}
      {isSelected && (
        <EdgeResize pointA={points[0]} pointB={points[1]} onMouseDown={rectEvents.down} onMouseEnter={rectEvents.mouseEnter} onMouseLeave={rectEvents.mouseLeave} />
      )}
      {isSelected && type === 'rectangle' && (
        <EdgeResize pointA={points[1]} pointB={points[2]} onMouseDown={secRectEvents.down} onMouseEnter={secRectEvents.mouseEnter} onMouseLeave={secRectEvents.mouseLeave} />
      )}
      {isSelected && metadata && (
        <Text 
          x={metadata.centerX} 
          y={metadata.centerY} 
          text={`${metadata.angle}°`} 
          // width={metadata.angle.toString().length * 10}
          offsetX={metadata.angle.toString().length * 5}
          offsetY={10}
          fontSize={12}
          align="center" 
          verticalAlign="center" 
          listening={false}
        />)}
    </>
  )
}