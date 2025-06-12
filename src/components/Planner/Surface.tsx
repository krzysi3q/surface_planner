import React, { useEffect, useMemo } from "react";
import { Pattern, Point } from "./types";
import { Group, Line } from "react-konva";
import { removeCustomCursor, setGrabbingCursor, setGrabCursor, setPointerCursor } from "./domUtils";
import { createPatternCanvas, drawPattern} from "./utils";
import Konva from "konva";

interface SurfaceProps { 
  points: Point[];
  id: string;
  edit: boolean;
  pattern: Pattern;
  disabled?: boolean;
  onChange?: (pattern: Pattern) => void;
  onClick?: () => void;
}

const patternCanvas = createPatternCanvas();


const getOffsetPolygon = (points: Point[], hatchOffset: number) => {
  const pts = points;
  const result: [number, number][] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    // compute normals of adjacent edges
    const [xPrev, yPrev] = pts[(i - 1 + n) % n];
    const [xNext, yNext] = pts[(i + 1) % n];
    // edge vectors
    const vx1 = x - xPrev, vy1 = y - yPrev;
    const vx2 = xNext - x,   vy2 = yNext - y;
    // normals
    const len1 = Math.hypot(vx1, vy1) || 1;
    const len2 = Math.hypot(vx2, vy2) || 1;
    const nx1 = vy1 / len1, ny1 = -vx1 / len1;
    const nx2 = vy2 / len2, ny2 = -vx2 / len2;
    // average normal
    const nx = (nx1 + nx2) / 2;
    const ny = (ny1 + ny2) / 2;
    const norm = Math.hypot(nx, ny) || 1;
    result.push([x + (nx / norm) * hatchOffset, y + (ny / norm) * hatchOffset]);
  }
  return result;
}

const hatchOffset = 25;

export const Surface: React.FC<SurfaceProps> = ({ points, id, onClick, pattern, disabled, edit, onChange}) => {
  // prepare offset polygon for pattern band
  const offsetPolygon = useMemo(() => getOffsetPolygon(points, hatchOffset), [points]);
  const [background, setBackground] = React.useState<HTMLImageElement | undefined>(undefined);
  

  useEffect(() => {
    if (!pattern || pattern.tiles.length === 0) return;
    const canvas = drawPattern(pattern)
    canvas?.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          setBackground(image);
        }
        image.src = url;
      }
    }, 'image/png', 10);
  }, [pattern]);



  const [state, setState] = React.useState<'default' | 'hover' >('default');
  const {handleMouseEnter, handleMouseLeave, handleClick } = useMemo(() => ({
    handleMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (disabled) return;
      if (edit) {
        setGrabCursor(e);
      } else {
        setState('hover');
        setPointerCursor(e)
      }
    },
    handleMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
      setState('default');
      removeCustomCursor(e);
    },
    handleClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (disabled) return;
      setGrabCursor(e);
      onClick?.();
    }
  }), [disabled, edit, onClick]);

  const scale = (pattern?.scale || 1);

  const startPos = React.useRef<{ mouse: {x: number, y: number}, pattern: {x: number, y: number}} | null>(null)
  
  return (
    <Group>
      <Line
        key={`band-${id}`}
        id={`band-${id}`}
        points={offsetPolygon.flat()}
        closed
        fillPatternImage={patternCanvas}
        fillPatternRepeat="repeat"
        fillPatternRotation={Math.PI / 4}
        fillRule="evenodd"
      />
      <Line
        key={`mask-${id}`}
        id={`mask-${id}`}
        points={points.flat()}
        closed
        fill={!background ? 'white' : undefined}
        fillPatternImage={background}
        fillPatternRepeat="repeat"
        fillPatternScaleX={scale}
        fillPatternScaleY={scale}
        fillPatternX={pattern?.x || 0}
        fillPatternY={pattern?.y || 0}
        stroke="black"
        strokeWidth={1}
        shadowColor="black"
        shadowOpacity={0.3}
        shadowBlur={state === 'hover' ? 10 : 0}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={(e) => {
          if (disabled || !edit) return;
          setGrabbingCursor(e);
          startPos.current = { mouse: { x: e.evt.clientX, y: e.evt.clientY }, pattern: {x: pattern?.x || 0, y: pattern?.y || 0} };
          e.cancelBubble = true; // Prevent event bubbling
        }}
        onMouseUp={(e) => {
          if (edit) {
            removeCustomCursor(e);
          }
          startPos.current = null;
        }}
        onMouseMove={(e) => {
          if (disabled || !edit || !startPos.current) return;
          const dx = e.evt.clientX - startPos.current.mouse.x;
          const dy = e.evt.clientY - startPos.current.mouse.y;
          const newX = startPos.current.pattern.x + dx;
          const newY = startPos.current.pattern.y + dy;
          onChange?.({
            ...pattern,
            x: newX,
            y: newY,
          });
          
        }}
      />
    </Group>
  );
};