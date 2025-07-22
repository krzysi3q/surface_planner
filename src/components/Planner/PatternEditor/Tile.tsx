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
  isTouchDevice?: boolean;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, id: string) => void;
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => void;
  onMouseEnter?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => void;
  onMouseLeave?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => void;
}

export const Tile: React.FC<TileProps> = ({ points, color, type, id, metadata, isSelected, isDragging, scale, isTouchDevice, onClick, onMouseDown, onMouseEnter, onMouseLeave }) => {
  const [state, setState] = useState<'default' | 'hover'>('default');

  const { handleMouseEnter, handleMouseLeave, handleClick, handleMouseDown, handleTouchStart } = useMemo(() => ({
      handleMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isSelected && !isTouchDevice) {
          setPointerCursor(e)
          setState('hover');
        } else if (isSelected && !isTouchDevice) {
          onMouseEnter?.(e, { id, action: 'move', type, isSecondary: false });
        }
      },
      handleMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (state === 'hover' && !isDragging && !isTouchDevice) {
          setState('default');
          removeCustomCursor(e);
        }
        if (isSelected && !isTouchDevice) {
          onMouseLeave?.(e, { id, action: 'move', type, isSecondary: false });
        }
      },
      handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (isSelected && !isTouchDevice) {
          onMouseDown?.(e, { id, action: 'move', type, isSecondary: false });
        }
      },
      handleTouchStart: (e: Konva.KonvaEventObject<TouchEvent>) => {
        // Convert touch to mouse-like behavior for consistency
        e.evt.preventDefault();
        
        // Check if tile is selected
        if (isSelected) {
          // If selected, start drag operation
          onMouseDown?.(e, { id, action: 'move', type, isSecondary: false });
        } else {
          // If not selected, select it first
          onClick?.(e, id);
        }
      },
      handleClick: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        onClick?.(e, id);
      }
    }), [isSelected, isTouchDevice, onMouseEnter, id, type, state, isDragging, onMouseLeave, onMouseDown, onClick]);

    const { circleEvents, rectEvents, secRectEvents } = useMemo(() => ({
      circleEvents: {
        down: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => onMouseDown?.(e, { id, action: 'rotate', type, isSecondary: false }),
        mouseEnter: !isTouchDevice ? (e: Konva.KonvaEventObject<MouseEvent>) => onMouseEnter?.(e, { id, action: 'rotate', type, isSecondary: false}) : undefined,
        mouseLeave: !isTouchDevice ? (e: Konva.KonvaEventObject<MouseEvent>) => onMouseLeave?.(e, { id, action: 'rotate', type, isSecondary: false}) : undefined,
      },
      rectEvents: {
        down: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, direction: 'ns' | 'ew') => onMouseDown?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew' , type, isSecondary: false }),
        mouseEnter: !isTouchDevice ? (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseEnter?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew', type, isSecondary: false}) : undefined,
        mouseLeave: !isTouchDevice ? (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseLeave?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew', type, isSecondary: false}) : undefined,
      },
      secRectEvents: {
        down: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, direction: 'ns' | 'ew') => onMouseDown?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew' , type, isSecondary: true }),
        mouseEnter: !isTouchDevice ? (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseEnter?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew', type, isSecondary: true}) : undefined,
        mouseLeave: !isTouchDevice ? (e: Konva.KonvaEventObject<MouseEvent>, direction: 'ns' | 'ew') => onMouseLeave?.(e, { id, action: direction === 'ns' ? 'resize-ns' : 'resize-ew', type, isSecondary: true}) : undefined,
      },
    }), [onMouseDown, onMouseEnter, onMouseLeave, id, type, isTouchDevice]);

  return (
    <>
      <Line
        points={points.flat()}
        fill={color}
        closed
        strokeWidth={1}
        stroke="black"
        id={id}
        shadowOpacity={0.5}
        onMouseEnter={!isTouchDevice ? handleMouseEnter : undefined}
        onMouseLeave={!isTouchDevice ? handleMouseLeave : undefined}
        onMouseDown={!isTouchDevice ? handleMouseDown : undefined}
        onTouchStart={isTouchDevice ? handleTouchStart : undefined}
        onTap={handleClick}
        onClick={!isTouchDevice ? handleClick : undefined}
        listening={true}
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
          radius={isTouchDevice ? 8 : 5}
          strokeWidth={2}
          stroke='black'
          fill="white"
          onMouseEnter={circleEvents.mouseEnter}
          onMouseDown={!isTouchDevice ? circleEvents.down : undefined}
          onTouchStart={isTouchDevice ? circleEvents.down : undefined}
          onTap={isTouchDevice ? circleEvents.down : undefined}
          onMouseLeave={circleEvents.mouseLeave}
          listening={true}
          name="rotate-handle"
        />
      )}
      {isSelected && (
        <EdgeResize 
          pointA={points[0]} 
          pointB={points[1]} 
          isTouchDevice={isTouchDevice}
          onMouseDown={rectEvents.down} 
          onMouseEnter={rectEvents.mouseEnter} 
          onMouseLeave={rectEvents.mouseLeave} 
        />
      )}
      {isSelected && type === 'rectangle' && (
        <EdgeResize 
          pointA={points[1]} 
          pointB={points[2]} 
          isTouchDevice={isTouchDevice}
          onMouseDown={secRectEvents.down} 
          onMouseEnter={secRectEvents.mouseEnter} 
          onMouseLeave={secRectEvents.mouseLeave} 
        />
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