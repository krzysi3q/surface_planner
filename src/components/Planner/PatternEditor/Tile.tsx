import React, { useMemo, useState, useEffect } from "react";
import { Circle, Text, Shape } from "react-konva";
import Konva from "konva";

import { Point, TileType, TileMetadata } from "../types";
import { removeCustomCursor, setPointerCursor } from "../domUtils";
import { WallDimension } from "../components/WallDimension";
import { EdgeResize } from "./EdgeResize";
import { useTextureLibrary } from "./TextureLibraryContext";

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
  texture?: string;
  textureId?: string;
  textureOffsetX?: number;
  textureOffsetY?: number;
  textureScale?: number;
  id: string;
  gapSize?: number;
  gapColor?: string;
  isTouchDevice?: boolean;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, id: string) => void;
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => void;
  onMouseEnter?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => void;
  onMouseLeave?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => void;
}

export const Tile: React.FC<TileProps> = ({ points, color, texture, textureId, textureOffsetX, textureOffsetY, textureScale, type, id, metadata, isSelected, isDragging, scale, isTouchDevice, onClick, onMouseDown, onMouseEnter, onMouseLeave }) => {
  const [state, setState] = useState<'default' | 'hover'>('default');
  const [fillPatternImage, setFillPatternImage] = useState<HTMLImageElement | null>(null);
  const { getTexture } = useTextureLibrary();

  // Load texture image for pattern fill
  useEffect(() => {
    let textureToUse: string | undefined;
    
    // Prioritize texture library reference over direct texture
    if (textureId) {
      const libraryTexture = getTexture(textureId);
      textureToUse = libraryTexture?.base64;
    } else {
      textureToUse = texture;
    }
    
    if (textureToUse) {
      const img = new Image();
      img.onload = () => {
        setFillPatternImage(img);
      };
      img.src = textureToUse;
    } else {
      setFillPatternImage(null);
    }
  }, [texture, textureId, getTexture]);

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
        e.evt.stopPropagation();

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
        // Prevent duplicate events
        if (e.evt.defaultPrevented) return;

        // Handle mouse clicks for desktop
        if (e.evt instanceof MouseEvent && !isTouchDevice) {
          e.evt.preventDefault();
          e.evt.stopPropagation();
          onClick?.(e, id);
          return;
        }

        // Handle touch events for touch devices
        if (e.evt && 'touches' in e.evt && isTouchDevice) {
          e.evt.preventDefault();
          e.evt.stopPropagation();

          // Check if tile is selected
          if (isSelected) {
            // If selected, start drag operation
            onMouseDown?.(e, { id, action: 'move', type, isSecondary: false });
          } else {
            // If not selected, select it first
            onClick?.(e, id);
          }
          return;
        }

        // Fallback for other event types
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

  const sceneFunc = useMemo(() => (context: Konva.Context) => {
    context.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        context.moveTo(point[0], point[1]);
      } else {
        context.lineTo(point[0], point[1]);
      }
    });
    context.closePath();
    
    // Apply texture if available
    if (fillPatternImage) {
      const offsetX = textureOffsetX || 0;
      const offsetY = textureOffsetY || 0;
      const scale = textureScale || 1;
      
      // Get tile's current position to make texture stick to tile
      const tileX = metadata?.centerX || 0;
      const tileY = metadata?.centerY || 0;
      
      const pattern = context.createPattern(fillPatternImage, 'repeat');
      if (pattern) {
        context.save();
        // Apply texture offset relative to tile position (texture moves with tile)
        context.translate(-offsetX + tileX, -offsetY + tileY);
        context.scale(scale, scale);
        context.fillStyle = pattern;
        context.fill();
        context.restore();
      }
    } else {
      // Use solid color fill
      context.fillStyle = color;
      context.fill();
    }
    
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.stroke();
  }, [points, fillPatternImage, textureOffsetX, textureOffsetY, textureScale, color, metadata?.centerX, metadata?.centerY]);

  const hitFunc = useMemo(() => (context: Konva.Context, shape: Konva.Shape) => {
    context.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        context.moveTo(point[0], point[1]);
      } else {
        context.lineTo(point[0], point[1]);
      }
    });
    context.closePath();
    context.fillStrokeShape(shape);
  }, [points]);

  return (
    <>
      <Shape
        sceneFunc={sceneFunc}
        hitFunc={hitFunc}
        fill="rgba(0,0,0,0.01)" // Very subtle fill for hit detection
        stroke="black"
        strokeWidth={1}
        id={id}
        shadowOpacity={0.5}
        perfectDrawEnabled={false}
        listening={true}
        onMouseEnter={!isTouchDevice ? handleMouseEnter : undefined}
        onMouseLeave={!isTouchDevice ? handleMouseLeave : undefined}
        onMouseDown={!isTouchDevice ? handleMouseDown : undefined}
        onTouchStart={isTouchDevice ? handleTouchStart : undefined}
        onClick={handleClick}
        name="tile"
      />
      {isSelected && points.map((point, i) => {
        const nxt = points[(i + 1) % points.length];
        return (
          <WallDimension key={i} pointA={point} pointB={nxt} scale={scale} fraction={3} unit="m" globalScale={100} />
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