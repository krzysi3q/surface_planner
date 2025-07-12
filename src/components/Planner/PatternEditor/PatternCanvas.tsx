import React from 'react';
import { Group, Layer, Rect, Stage } from "react-konva";
import Konva from "konva";

import { Tile, TileEventData } from "./Tile";
import { Pattern } from "../types";

import { createPatternCanvas, drawPattern } from "../utils";

interface PatternCanvasProps {
  width: number;
  height: number;
  pattern: Pattern;
  preview?: boolean;
  selectedId?: string | null;
  isDragging?: boolean;
  onStageClick?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onStageMouseMove?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onStageMouseUp?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onTileClick?: (evt: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onTileDown?: (evt: Konva.KonvaEventObject<MouseEvent>, data: TileEventData) => void;
  onTileEnter?: (evt: Konva.KonvaEventObject<MouseEvent>, data: TileEventData) => void;
  onTileLeave?: (evt: Konva.KonvaEventObject<MouseEvent>, data: TileEventData) => void;
}

type StageNodeRef = Required<React.ComponentProps<typeof Stage>>['ref'];

const PatternCanvasComponent = ({ width, height, pattern, selectedId, isDragging, preview, ...events }: PatternCanvasProps, ref: StageNodeRef) => {
  const { onStageClick, onStageMouseMove, onStageMouseUp, onTileClick, onTileDown, onTileEnter, onTileLeave } = events;
  const [background, setBackground] = React.useState<HTMLImageElement | undefined>(() => {
    return createPatternCanvas();
  });

  React.useEffect(() => {
    if (!pattern || !preview) {
      setBackground(createPatternCanvas());
      return;
    }

    const patternCanvas = drawPattern(pattern, { alpha: 0.5, backgroundColor: "transparent" });
    const dataUrl = patternCanvas?.toDataURL("image/webp", 1);
    if (dataUrl) {
      const img = new Image();
      img.onload = () => {
        setBackground(img);
      }
      img.src = dataUrl;
    }
  }, [pattern, preview]);



  return (
  <Stage 
    ref={ref}
    className="w-full border border-solid border-black rounded-2xl overflow-hidden" 
    style={{width, height}} height={height} width={width}
    onClick={onStageClick}
    onMouseMove={onStageMouseMove}
    onMouseUp={onStageMouseUp}>
    <Layer >
      <Rect 
        x={0} y={0}
        listening={false}
        width={width}
        height={height} 
        fillPatternImage={background}
        fillPatternRepeat="repeat"
        fillPatternY={height/2 - pattern.height/2}
        fillPatternX={width/2 - pattern.width/2}
        // fillPatternRotation={Math.PI / 4}
        // fillRule="evenodd"
         /> 
        <Group x={width/2 - pattern.width/2} y={height/2 - pattern.height/2}>
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
                scale={pattern.scale / 100}
                isSelected={selectedId === tile.id}
                isDragging={isDragging}
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
              stroke={"rgba(0,0,0,0.1)"}
              fill="transparent" />
        </Group>
    </Layer>
  </Stage>)
}

export const PatternCanvas = React.forwardRef(PatternCanvasComponent);