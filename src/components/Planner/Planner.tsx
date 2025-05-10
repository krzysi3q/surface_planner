import { Stage, Layer, Line } from "react-konva";
import React, { useRef } from "react";
import type { SurfaceType, Point } from "./types";
import { Hand, Redo, RotateCwSquare, SplinePointer, SquaresSubtract, SquaresUnite, Trash2, Undo } from 'lucide-react'

import Konva from "konva";

import { useHistoryState } from "@/hooks/useHistoryState";
import { subtractSurfaces, unionSurfaces, pointInSurface, isSurfaceIntersecting } from "./utils";
import { removeCustomCursor, setGrabbingCursor } from "./domUtils"
import EdgeEdit from "./EdgeEdit";
import { MoveHandler } from "./MoveHandler";
import { CornerEdit } from "./CornerEdit";
import { WallDimension } from "./WallDimension";
import { usePlannerReducer } from "./usePlannerReducer";
import { AngleMarker } from "./AngleMarker";
import { ToolbarButton } from "./components/ToolbarButton";
import { classMerge } from "@/utils/classMerge";
import { Surface } from "./Surface";

type TemporarySurface = SurfaceType & {
  state: "error" | "valid";
};

// Props for Planner
export interface PlannerProps {
  width: number;
  height: number;
}



const getWallKey = (pointA: Point, pointB: Point) => {
  const [x1, y1] = pointA;
  const [x2, y2] = pointB;
  return `wall-${x1}-${y1}-${x2}-${y2}`;
}

const isSamePoint = (pointA: Point, pointB: Point) => {
  return pointA[0] === pointB[0] && pointA[1] === pointB[1];
}


export const Planner: React.FC<PlannerProps> = ({ width, height }) => {
  const { state: surface, set: setSurface, undo, redo, persist, canUndo, canRedo } = useHistoryState<{id: string, points: Point[]}>({
    id: "some id",
    points: [],
  });
  
  const { state, dispatch } = usePlannerReducer(surface.points);

  const [currentSurface, setCurrentSurface] =
    React.useState<TemporarySurface | null>(null);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.editable && typeof e.target.attrs.id !== "string") {
      dispatch({ type: 'default' });
    }
  }

  const pointsCopy = useRef<Point[] | null>(null)
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const handleDragStart = () => {
    persist();
    pointsCopy.current = [...surface.points];
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.mode === 'edit-wall') {
      const { wallIndex, nextWallIndex } = state;
      const [x1, y1] = surface.points[wallIndex];
      const [x2, y2] = surface.points[nextWallIndex];
      const midX = x1 + (x2 - x1) / 2;
      const midY = y1 + (y2 - y1) / 2;
      e.target.x(midX - e.target.width()/2);
      e.target.y(midY - e.target.height()/2);
    }
    if (state.mode === 'edit-corner') {
      const { wallIndex } = state;
      const [x, y] = surface.points[wallIndex]; 
      e.target.x(x);
      e.target.y(y);
    }
    pointsCopy.current = null;
  }

  const handleWallDragMove = (e: Konva.KonvaEventObject<DragEvent>, dA: Point, dB: Point) => {
    if (state.mode !== 'edit-wall' || pointsCopy.current === null) return;
    const { wallIndex, nextWallIndex } = state;
    const newPoints = [...pointsCopy.current];
    const afterNextIndex = (nextWallIndex + 1) % newPoints.length;
    const prevIndex = wallIndex === 0 ? newPoints.length - 1 : wallIndex - 1;

    const [x0, y0] = newPoints[wallIndex];
    const [x1, y1] = newPoints[nextWallIndex];
    newPoints[wallIndex] = [x0 + dA[0], y0 + dA[1]];
    newPoints[nextWallIndex] = [x1 + dB[0], y1 + dB[1]];
    if (isSamePoint(newPoints[nextWallIndex], newPoints[afterNextIndex]) || isSamePoint(newPoints[wallIndex], newPoints[prevIndex])) {
      // same point, do not update
      return
    };

    if (isSurfaceIntersecting(newPoints)) {
      // surface is intersecting, do not update
      return;
    }
    
    setSurface((current) => ({
        ...current,
        points: newPoints,
    }), true);
  }

  const handleDragCornerMove = (e: Konva.KonvaEventObject<DragEvent>, diff: Point) => {
    if (state.mode !== 'edit-corner' || pointsCopy.current === null) return;
    const { wallIndex } = state;
    const newPoints = [...pointsCopy.current];

    const [x0, y0] = newPoints[wallIndex];
    newPoints[wallIndex] = [x0 + diff[0], y0 + diff[1]];


    if (isSurfaceIntersecting(newPoints)) {
      // surface is intersecting, do not update
      return;
    }

    setSurface((current) => ({
        ...current,
        points: newPoints,
    }));
  }

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // prevent drawing while dragging handlers
    if (state.mode === 'add-surface' || state.mode === 'subtract-surface') {  
      // use currentTarget to reliably get stage
      const stage = e.currentTarget.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      const id = Date.now().toString();
      // start rectangle polygon points (all corners at start)
      const points: [number, number][] = [
        [pos.x, pos.y],
        [pos.x, pos.y],
        [pos.x, pos.y],
        [pos.x, pos.y],
      ];
      const newSurface: TemporarySurface = { id, points, state: "valid" };
      setCurrentSurface(newSurface);
    } else if (state.mode === 'preview') {
      persist()
      setGrabbingCursor(e);
      const pos = e.currentTarget.getStage()?.getPointerPosition();
      if (pos) startPosRef.current = { x: pos.x, y: pos.y };
      pointsCopy.current = [...surface.points];
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.mode === 'add-surface' || state.mode === 'subtract-surface') {
      if (!currentSurface) return;
      const stage = e.currentTarget.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      // update rectangle polygon points based on start and current
      const [x0, y0] = currentSurface.points[0];
      const x1 = pos.x,
        y1 = pos.y;
      const points: Point[] = [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ];

      const someInside = surface.points.length === 0 || points.some((point) =>
        pointInSurface(point, surface.points)
      );

      setCurrentSurface({
        ...currentSurface,
        points,
        state: someInside ? "valid" : "error",
      });
    } else if (state.mode === 'preview') {
      const startPos = startPosRef.current;
      const initialPoints = pointsCopy.current;
      if (!startPos || !initialPoints) return;
      if (!startPos) return;
      const pos = e.currentTarget.getStage()?.getPointerPosition();
      if (!pos) return;
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      const newPoints: Point[] = initialPoints.map((point) => {
        return [point[0] + dx, point[1] + dy];
      });
      setSurface((current) => ({
        ...current,
        points: newPoints,
      }), true);
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.mode === 'add-surface' || state.mode === 'subtract-surface') {
      if (!currentSurface) return;
      // first rectangle: just add
      if (surface.points.length === 0) {
        setSurface({...currentSurface, points: unionSurfaces([], currentSurface.points)[0]});
        setCurrentSurface(null);
        return;
      }
      
      if (currentSurface.state === "error") {
        setCurrentSurface(null);
        return;
      }
      
      if (state.mode === "add-surface") {
        setSurface((current) => ({
          ...current,
          points: unionSurfaces(current.points, currentSurface.points)[0],
        }));
      } else if (state.mode === "subtract-surface") {
        setSurface((current) => ({
          ...current,
          points: subtractSurfaces(current.points, currentSurface.points)[0],
        }));
      }
      
      setCurrentSurface(null);
    } else if (state.mode === 'preview') {
      removeCustomCursor(e);
      startPosRef.current = null;
    }
  };

  const removePoints = (indexes: number[]) => {
    setSurface((current) => ({
      ...current,
      points: current.points.filter((_, i) => !indexes.includes(i)),
    }));
    dispatch({ type: 'default' });
  }

  const getAngles = (points: [Point, Point, Point]) => {
    const [prev, pt, nxt] = points;
    // Calculate angles of vectors pt->prev and pt->nxt from positive x-axis
    const angleRadPtPrev = Math.atan2(prev[1] - pt[1], prev[0] - pt[0]);
    const angleRadPtNxt = Math.atan2(nxt[1] - pt[1], nxt[0] - pt[0]);

    // Calculate interior angle assuming CCW polygon points.
    // This is the angle swept CCW from vector (pt->nxt) to vector (pt->prev).
    let interiorAngleRad = angleRadPtPrev - angleRadPtNxt;
    // Normalize to [0, 2*PI)
    if (interiorAngleRad < 0) {
      interiorAngleRad += 2 * Math.PI;
    }
    
    // This is the magnitude of the interior angle in degrees.
    const interiorAngleMagnitudeDeg = Math.round(((interiorAngleRad * 180) / Math.PI) * 1000) / 1000;
    return {
      angleRadPtPrev,
      angleRadPtNxt,
      interiorAngleMagnitudeDeg,
    }
  }

  const isRightAngle = (points: [Point, Point, Point]) => { 
    const [a, b, c] = points;
    if (a[0] === b[0] && b[1] === c[1]) return true; 
    if (a[1] === b[1] && b[0] === c[0]) return true;
    return false;
  }

  const makeAngleRight = (prevIdx: number, idx: number, nxtIdx: number) => { 
    setSurface((current) => {
      const points = [...current.points];
      const prev = points[prevIdx];
      const curr = points[idx];
      const next = points[nxtIdx];
      if ((prev[0] < next[0] && prev[1] < next[1]) || (prev[0] > next[0] && prev[1] > next[1])) { 
          const { interiorAngleMagnitudeDeg } = getAngles([prev, curr, next]);
          points[idx] = interiorAngleMagnitudeDeg >= 180 ? [prev[0], next[1]] : [next[0], prev[1]];
      } else if ((prev[0] > next[0] && prev[1] < next[1]) || (prev[0] < next[0] && prev[1] > next[1])) {
        const { interiorAngleMagnitudeDeg } = getAngles([prev, curr, next]);
          points[idx] = interiorAngleMagnitudeDeg >= 180 ? [next[0], prev[1]] : [prev[0], next[1]];
      } else if (prev[0] === next[0]) {
          points[idx] = [prev[0], prev[1] + (next[1] - prev[1]) / 2];
      } else if (prev[1] === next[1]) {
          points[idx] = [prev[0] + (next[0] - prev[0]) / 2, prev[1]];
      }

      return {
        ...current,
        points,
      }
    });
  }

  const scale = 0.01; // 100px = 1m
  const deletionDisabled = surface.points.length <= 3;
  
  return (
    <div className="relative">
      <div className="absolute z-10 left-1/2 top-2 -translate-x-1/2 flex items-center bg-gray-100 shadow-md p-1 space-x-2 rounded-lg">
        <ToolbarButton onClick={() => dispatch({type: 'default'})} active={['default', 'edit-corner', 'edit-wall'].includes(state.mode)} icon={<SplinePointer />} />
        <ToolbarButton onClick={() => dispatch({type: 'preview'})} active={state.mode === 'preview'} icon={<Hand />} />
        <ToolbarButton onClick={() => dispatch({type: 'add-surface'})} active={state.mode === 'add-surface'} icon={<SquaresUnite />} />
        <ToolbarButton onClick={() => dispatch({type: 'subtract-surface'})} active={state.mode === 'subtract-surface'} icon={<SquaresSubtract />} />
        <ToolbarButton onClick={undo} disabled={!canUndo} icon={<Undo />} />
        <ToolbarButton onClick={redo} disabled={!canRedo} icon={<Redo />} />
      </div>
      {state.mode === 'edit-corner' && (
        <div className="absolute z-10 left-2 top-5 w-32 bg-gray-100 shadow-md p-1 space-x-2 rounded-lg">
          <ToolbarButton 
            disabled={isRightAngle([surface.points[state.prevWallIndex], surface.points[state.wallIndex], surface.points[state.nextWallIndex]])} 
            onClick={() => makeAngleRight(state.prevWallIndex, state.wallIndex, state.nextWallIndex)} 
            wide
            icon={<RotateCwSquare />} />
          <ToolbarButton variant="danger" disabled={deletionDisabled} onClick={() => removePoints([state.wallIndex])} wide icon={<Trash2 />} />
        </div>
      )}
      {state.mode === 'edit-wall' && (
        <div className="absolute z-10 left-2 top-5 w-32 bg-gray-100 shadow-md p-1 space-x-2 rounded-lg">
          <ToolbarButton variant="danger" disabled={true} onClick={() => removePoints([state.nextWallIndex])} wide icon={<Trash2 />} />
        </div>
      )}
      <Stage
        width={width}
        height={height}
        className={classMerge("bg-white", 
          state.mode === 'preview' && "cursor-grab",
          state.mode === 'add-surface' && "cursor-crosshair",
          state.mode === 'subtract-surface' && "cursor-crosshair",
          state.mode === 'edit-wall' && "default-cursor",
          state.mode === 'edit-corner' && "default-cursor",
          state.mode === 'default' && "default-cursor",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          {surface.points.length > 0 && (
            <Surface id={surface.id} points={surface.points} />
          )}
          {currentSurface && (
            <Line
              points={currentSurface.points.flat()}
              stroke={currentSurface.state === "valid" ? "blue" : "red"}
              dash={[4, 4]}
              closed
            />
          )}
          {surface.points.map((pt, i) => {
            const nxt = surface.points[(i + 1) % surface.points.length];
            const prev = surface.points[(i - 1 + surface.points.length) % surface.points.length];
            const key = getWallKey(pt, nxt);

            const { interiorAngleMagnitudeDeg, angleRadPtNxt } = getAngles([prev, pt, nxt]);
            // For Konva Arc:
            // `rotation` is the start angle of the sweep (in degrees).
            // `angle` is the sweep extent (in degrees). Arc is drawn CW by default for positive `angle`.
            // To draw the interior angle (which is a CCW sweep from pt->nxt to pt->prev for a CCW polygon):
            // Start the Arc sweep at the orientation of vector (pt->nxt).
            // Sweep CCW by `interiorAngleMagnitudeDeg` (by providing a negative angle to Konva).
            const rotationStartDeg = (angleRadPtNxt * 180) / Math.PI;
            const sweepAngleDeg = interiorAngleMagnitudeDeg; 

            // Condition to show the angle marker (e.g., hide for 0, 90, 180, 270 degrees)
            // We use the positive magnitude of the calculated interior angle for this check.
            const isNonRightAngle = interiorAngleMagnitudeDeg % 90 !== 0 && interiorAngleMagnitudeDeg !== 0;

            return (
              <React.Fragment key={key}>
                {state.editable && <EdgeEdit 
                  id={key}
                  wallIndex={i} 
                  pointA={pt} 
                  pointB={nxt} 
                  edit={state.mode === 'edit-wall' && i === state.wallIndex} 
                  onClick={(p, idx) =>  dispatch({type: 'edit-wall', payload: { wallIndex: idx}})}
                />}
                <WallDimension
                  pointA={pt}
                  pointB={nxt}
                  scale={scale}
                />
                {isNonRightAngle && (
                  <AngleMarker x={pt[0]} y={pt[1]} angle={sweepAngleDeg} rotation={rotationStartDeg} />
                )}
              </React.Fragment>
            );
          })}
          {state.editable && surface.points.map((pt, i) => {
            return (
              <CornerEdit
                key={i}
                x={pt[0]}
                y={pt[1]}
                wallIndex={i}
                edit={state.mode === 'edit-corner' && i === state.wallIndex}
                onClick={(idx) => dispatch({ type: 'edit-corner', payload: { wallIndex: idx } })}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragCornerMove}
              />
            )
          })}
          {state.mode === 'edit-wall' && (state.isHorizontal || state.isVertical) ? (
              <MoveHandler 
                pointA={surface.points[state.wallIndex!]}
                pointB={surface.points[state.nextWallIndex!]}
                orientation={state.isHorizontal ? "horizontal" : "vertical"}
                onDragStart={handleDragStart}
                onDragMove={handleWallDragMove}
                onDragEnd={handleDragEnd}
                  />
            ) : null}
        </Layer>
      </Stage>
    </div>
  );
};
