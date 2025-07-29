import React, { useEffect, useMemo } from "react";
import { Pattern, Point } from "./types";
import { Group, Shape } from "react-konva";
import { removeCustomCursor, setGrabbingCursor, setGrabCursor, setPointerCursor } from "./domUtils";
import { createPatternCanvas, drawPattern} from "./utils";
import Konva from "konva";

interface SurfaceProps { 
  points: Point[][];
  id: string;
  edit: boolean;
  pattern: Pattern;
  disabled?: boolean;
  onChange?: (pattern: Pattern) => void;
  onClick?: () => void;
}

const patternCanvas = createPatternCanvas();

export const Surface: React.FC<SurfaceProps> = ({ points, id, onClick, pattern, disabled, edit, onChange}) => {
  const { width, height, gapColor, tiles } = pattern;
  const [background, setBackground] = React.useState<HTMLImageElement | undefined>(undefined);
  const lineRef = React.useRef<Konva.Line>(null);

  useEffect(() => {
    if (lineRef.current) {
      const ctx = lineRef.current.toCanvas().getContext('2d')!;
      const pattern = ctx.createPattern(patternCanvas, 'repeat');
      lineRef.current.stroke(pattern as unknown as CanvasGradient);
    }
  }, [])

  useEffect(() => {
    if (tiles.length === 0) return;
    const canvas = drawPattern({width, height, gapColor, tiles})
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
  }, [width, height, gapColor, tiles]);



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
    },
  }), [disabled, edit, onClick]);

  const scale = (pattern?.scale || 1);

  const startPos = React.useRef<{ mouse: {x: number, y: number}, pattern: {x: number, y: number}} | null>(null)
  
  const sceneFunc = useMemo(() => (context: Konva.Context, shape: Konva.Shape) => {
    context.beginPath();
    points.forEach((surface) => {
      surface.forEach((point, i) => {
        if (i === 0) {
          context.moveTo(point[0], point[1]);
        } else {
          context.lineTo(point[0], point[1]);
        }
      });
      context.lineTo(surface[0][0], surface[0][1]);
      context.closePath();
    });
    context.fillStrokeShape(shape);
  }, [points]);

  console.log('Surface rendered', { x: pattern.x, y: pattern.y });

  return (
    <Group>
      <Shape
        key={`band-${id}`}
        id={`band-${id}`}
        sceneFunc={sceneFunc}
        ref={lineRef}
        closed
        strokeWidth={45}
        lineJoin="miter"
      />
      <Shape
        key={`mask-${id}`}
        id={`mask-${id}`}
        sceneFunc={sceneFunc}
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
        onTap={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={(e) => {
          if (disabled || !edit) return;
          setGrabbingCursor(e);
          startPos.current = { mouse: { x: e.evt.clientX, y: e.evt.clientY }, pattern: {x: pattern?.x || 0, y: pattern?.y || 0} };
          e.cancelBubble = true; // Prevent event bubbling
        }}
        onTouchStart={(e: Konva.KonvaEventObject<TouchEvent>) => {
          if( e.evt.touches.length > 1) return; // Ignore multi-touch
          if (disabled || !edit) return;
          const touch = e.evt.touches[0];
          if (touch) {
            startPos.current = { mouse: { x: touch.clientX, y: touch.clientY }, pattern: {x: pattern?.x || 0, y: pattern?.y || 0} };
            e.cancelBubble = true; // Prevent event bubbling
          }
        }}
        onMouseUp={(e) => {
          if (edit) {
            removeCustomCursor(e);
          }
          startPos.current = null;
        }}
        onTouchEnd={() => {
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
        onTouchMove={(e) => {
          if (disabled || !edit || !startPos.current) return;
          const touch = e.evt.touches[0];
          if (touch) {
            const dx = touch.clientX - startPos.current.mouse.x;
            const dy = touch.clientY - startPos.current.mouse.y;
            const newX = startPos.current.pattern.x + dx;
            const newY = startPos.current.pattern.y + dy;
            onChange?.({
              ...pattern,
              x: newX,
              y: newY,
            });
          }
          
        }}
      />
    </Group>
  );
};