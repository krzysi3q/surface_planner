import React from 'react';
import { Group, Layer, Rect, Stage } from "react-konva";
import Konva from "konva";

import { Tile, TileEventData } from "./Tile";
import { Pattern } from "../types";
import { useTextureLibrary } from "./TextureLibraryContext";

import { createPatternCanvas, drawPattern } from "../utils";

interface PatternCanvasProps {
  width: number;
  height: number;
  pattern: Pattern;
  preview?: boolean;
  selectedId?: string | null;
  isDragging?: boolean;
  isTouchDevice?: boolean;
  zoom?: number;
  panOffset?: { x: number, y: number };
  onStageClick?: (evt: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onStageMouseMove?: (evt: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onStageMouseUp?: (evt: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onStageTouchStart?: (evt: Konva.KonvaEventObject<TouchEvent>) => void;
  onTileClick?: (evt: Konva.KonvaEventObject<MouseEvent | TouchEvent>, id: string) => void;
  onTileDown?: (evt: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => void;
  onTileEnter?: (evt: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => void;
  onTileLeave?: (evt: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => void;
}

type StageNodeRef = Required<React.ComponentProps<typeof Stage>>['ref'];

const PatternCanvasComponent = ({ width, height, pattern, selectedId, isDragging, preview, isTouchDevice, zoom = 1, panOffset = { x: 0, y: 0 }, ...events }: PatternCanvasProps, ref: StageNodeRef) => {
  const { onStageClick, onStageMouseMove, onStageMouseUp, onStageTouchStart, onTileClick, onTileDown, onTileEnter, onTileLeave } = events;
  const { getTexture } = useTextureLibrary();
  const [background, setBackground] = React.useState<HTMLImageElement | undefined>(() => {
    return createPatternCanvas();
  });

  React.useEffect(() => {
    if (!pattern || !preview) {
      setBackground(createPatternCanvas());
      return;
    }

    const canvasOrPromise = drawPattern(pattern, { alpha: 0.5, backgroundColor: "transparent" }, getTexture);
    
    if (canvasOrPromise instanceof Promise) {
      // Handle async case (when textures are present)
      canvasOrPromise.then((canvas) => {
        const dataUrl = canvas?.toDataURL("image/webp", 1);
        if (dataUrl) {
          const img = new Image();
          img.onload = () => {
            setBackground(img);
          }
          img.src = dataUrl;
        }
      });
    } else {
      // Handle sync case (when no textures are present)
      const dataUrl = canvasOrPromise?.toDataURL("image/webp", 1);
      if (dataUrl) {
        const img = new Image();
        img.onload = () => {
          setBackground(img);
        }
        img.src = dataUrl;
      }
    }
  }, [pattern, preview, getTexture]);


  const rectWidth = width / zoom;
  const rectHeight = height / zoom;

  return (
  <Stage 
    ref={ref}
    className="w-full border border-solid border-black rounded-2xl overflow-hidden" 
    style={{width, height}} 
    height={height} 
    width={width}
    scaleX={zoom}
    scaleY={zoom}
    x={panOffset.x}
    y={panOffset.y}
    onClick={!isTouchDevice ? onStageClick : undefined}
    onMouseMove={!isTouchDevice ? onStageMouseMove : undefined}
    onMouseUp={!isTouchDevice ? onStageMouseUp : undefined}
    onTouchMove={isTouchDevice ? onStageMouseMove : undefined}
    onTouchEnd={isTouchDevice ? onStageMouseUp : undefined}
    onTouchStart={isTouchDevice ? onStageTouchStart : undefined}
    onTap={onStageClick}
    listening={true}>
    <Layer >
      <Rect 
        x={-rectWidth/2} y={-rectHeight/2}
        listening={false}
        width={rectWidth * 2}
        height={rectHeight * 2}
        fillPatternImage={background}
        fillPatternRepeat="repeat"
        fillPatternY={rectHeight - pattern.height / 2}
        fillPatternX={rectWidth - pattern.width / 2}
        // fillPatternRotation={Math.PI / 4}
        // fillRule="evenodd"
         /> 
        <Group x={rectWidth/2 - pattern.width / 2} y={rectHeight/2 - pattern.height / 2}>
          <Rect 
            x={0} y={0}
            width={pattern.width}
            height={pattern.height} 
            listening={false}
            fill="white" />
            {pattern.tiles.map((tile) => (
              <Tile
                key={tile.id}
                id={tile.id}
                type={tile.type}
                points={tile.points}
                metadata={tile.metadata}
                color={tile.color}
                texture={tile.texture}
                textureId={tile.textureId}
                textureOffsetX={tile.textureOffsetX}
                textureOffsetY={tile.textureOffsetY}
                textureScale={tile.textureScale}
                scale={pattern.scale / 100}
                isSelected={selectedId === tile.id}
                isDragging={isDragging}
                isTouchDevice={isTouchDevice}
                onClick={onTileClick}
                gapColor={pattern.gapColor}
                gapSize={pattern.tilesGap}
                onMouseDown={onTileDown}
                onMouseEnter={onTileEnter}
                onMouseLeave={onTileLeave}
              />
            ))}
            <Rect 
              x={0} y={0}
              width={pattern.width}
              height={pattern.height} 
              listening={false}
              dash={[5, 5]}
              strokeWidth={1}
              stroke={"rgba(0,0,0,0.5)"}
              fill="transparent" />
        </Group>
    </Layer>
  </Stage>)
}

export const PatternCanvas = React.forwardRef(PatternCanvasComponent);