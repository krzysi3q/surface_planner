import { Stage, Layer, Line } from "react-konva";
import React, { useMemo, useRef } from "react";
import type { SurfaceType, Point, Pattern } from "./types";
import { Download, Hand, PencilRuler, Redo, Save, SplinePointer, SquaresSubtract, SquaresUnite, Trash2, Undo, Upload, Waypoints, ZoomIn, ZoomOut } from 'lucide-react'
import { RightAngle } from "@/components/Icons/RightAngle";

import Konva from "konva";

import { useHistoryState } from "@/hooks/useHistoryState";
import { useTranslation } from "@/hooks/useTranslation";
import { subtractSurfaces, unionSurfaces, isSurfaceIntersecting, saveToLocalStorage, loadFromLocalStorage, getAngles, getSurfaceArea, doSurfacesIntersect, adjustSurfaceForWallChange } from "./utils";
import { removeCustomCursor, setGrabbingCursor } from "./domUtils"
import EdgeEdit from "./EdgeEdit";
import { MoveHandler } from "./MoveHandler";
import { CornerEdit } from "./CornerEdit";
import { WallDimension } from "./components/WallDimension";
import { WallDimensionInput } from "./components/WallDimensionInput";
import { ReducerStateAddSurface, ReducerStateSubtractSurface, usePlannerReducer } from "./usePlannerReducer";
import { AngleMarker } from "./AngleMarker";
import { ToolbarButton } from "../ToolbarButton";
import { classMerge } from "@/utils/classMerge";
import { Surface } from "./Surface";
import { PatternEditor } from "./PatternEditor/PatternEditor";
import { ResizePlanner } from "./ResizePlanner";
import { CursorArrows } from "../CursorArrows";
import { Tooltip } from "../Tooltip";

type TemporarySurface = SurfaceType & {
  state: "error" | "valid";
  idle: boolean;
};

// Props for Planner
export interface PlannerProps {
  width: number;
  height: number;
}

const defaultPattern: Pattern = {
    gapColor: '#000000',
    height: 100,
    width: 100,
    x: 0,
    y: 0,
    tiles: [],
    tilesGap: 0,
    scale: 0.4,
  }

// Distance threshold for closing polygon by clicking near start point (adjustable)
const CLOSE_POLYGON_THRESHOLD = 50;


const getWallKey = (pointA: Point, pointB: Point) => {
  const [x1, y1] = pointA;
  const [x2, y2] = pointB;
  return `wall-${x1}-${y1}-${x2}-${y2}`;
}

const isSamePoint = (pointA: Point, pointB: Point) => {
  return pointA[0] === pointB[0] && pointA[1] === pointB[1];
}

const validateSurfaceOperation = (currentSurface: Point[], newSurface: Point[], operation: ReducerStateAddSurface['mode'] | ReducerStateSubtractSurface['mode']) => {
  if (getSurfaceArea(newSurface) < 10) {
      return false;
  }

  if (operation === 'add-surface' && currentSurface.length > 0 && !doSurfacesIntersect(currentSurface, newSurface)) {
      return false;
  }

  return true;
}

const useDragStage = (setSurface: ReturnType<typeof useHistoryState<{id: string, points: Point[], pattern: Pattern}>>['set'], enabled = true) => {
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  return useMemo(() => ({
    handleDragStart: (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!enabled) return;
      const stage = e.target.getStage();
      if (!stage) return;
      startPosRef.current = stage.getPointerPosition();
    },

    handleDragEnd: (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!enabled) return;
      const stage = e.target.getStage();
      if (!stage || !startPosRef.current) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      const scale = stage.scale()
      const dx = (startPosRef.current.x - pos.x) / scale.x;
      const dy = (startPosRef.current.y - pos.y) / scale.y;

      setSurface((current) => ({
        ...current,
        pattern: {
          ...current.pattern,
          x: current.pattern.x - dx,
          y: current.pattern.y - dy,
        },
        points: current.points.map(pt => [pt[0] - dx, pt[1] - dy]),
      }));
      
      stage.position({ x: 0, y: 0 }); // reset position after dragging
    }
  }), [setSurface, enabled])
}


export const Planner: React.FC<PlannerProps> = ({ width, height }) => {
  const { t } = useTranslation();
  const { state: surface, set: setSurface, undo, redo, persist, canUndo, canRedo } = useHistoryState<{id: string, points: Point[], pattern: Pattern}>(loadFromLocalStorage('surface') || { id: self.crypto.randomUUID(), points: [], pattern: defaultPattern });
  const [ surfaceEditorOpen, setSurfaceEditorOpen ] = React.useState<boolean>(false);
  const [keepRightAngles, setKeepRightAngles] = React.useState<boolean>(true);
  const stageRef = React.useRef<Konva.Stage>(null);
  const { state, dispatch } = usePlannerReducer(surface.points);
  const { handleDragEnd: handleStageDragEnd, handleDragStart: handleStageDragStart} = useDragStage(setSurface, state.mode === 'preview');

  const [currentSurface, setCurrentSurface] =
    React.useState<TemporarySurface | null>(null);

  // State for wall drawing mode
  const [drawingPoints, setDrawingPoints] = React.useState<Point[]>([]);
  const [currentMousePos, setCurrentMousePos] = React.useState<Point | null>(null);
  const [lastClickTime, setLastClickTime] = React.useState<number>(0);

  // Reset drawing state when mode changes
  React.useEffect(() => {
    if (state.mode !== 'draw-walls') {
      setDrawingPoints([]);
      setCurrentMousePos(null);
    }
  }, [state.mode]);

  // Handle escape key to cancel drawing
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.mode === 'draw-walls' && drawingPoints.length > 0) {
        setDrawingPoints([]);
        setCurrentMousePos(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.mode, drawingPoints.length]);

  // Helper function to calculate distance between two points
  const getDistance = (point1: Point, point2: Point): number => {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Helper function to check if drawing should be completed
  const shouldCompleteDrawing = (currentPos: Point, points: Point[]): boolean => {
    if (points.length < 3) return false;
    return getDistance(currentPos, points[0]) <= CLOSE_POLYGON_THRESHOLD;
  };

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

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
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
      const newSurface: TemporarySurface = { id, points, state: "valid", pattern: surface.pattern, idle: true };
      setCurrentSurface(newSurface);
    } else if (state.mode === 'draw-walls') {
      const stage = e.currentTarget.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      
      const currentTime = Date.now();
      const clickPos: Point = [pos.x, pos.y];
      
      // Check for double-click/tap (within 500ms)
      if (currentTime - lastClickTime < 500 && drawingPoints.length >= 3) {
        // Double-click/tap: complete the polygon
        console.log('Double-click detected, completing drawing');
        completeWallDrawing();
        return;
      }
      
      // Check if clicking near start point to close polygon
      if (drawingPoints.length >= 3 && shouldCompleteDrawing(clickPos, drawingPoints)) {
        console.log('Click near start point, completing drawing');
        completeWallDrawing();
        return;
      }
      
      // Add new point to drawing
      console.log('Adding new point to drawing');
      setDrawingPoints(prev => [...prev, clickPos]);
      setLastClickTime(currentTime);
    } else if (state.mode === 'preview') {
      if (e.evt instanceof MouseEvent) {
        setGrabbingCursor(e as Konva.KonvaEventObject<MouseEvent>);
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
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

      setCurrentSurface({
        ...currentSurface,
        points,
        state: validateSurfaceOperation(surface.points, points, state.mode) ? "valid" : "error",
        idle: false,
      });
    } else if (state.mode === 'draw-walls') {
      const stage = e.currentTarget.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      setCurrentMousePos([pos.x, pos.y]);
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (state.mode === 'add-surface' || state.mode === 'subtract-surface') {
      if (!currentSurface) return;
      // first rectangle: just add
      if (surface.points.length === 0) {
        if (getSurfaceArea(currentSurface.points) < 100) {
          currentSurface.points = [
            currentSurface.points[0],
            [currentSurface.points[0][0] + 100, currentSurface.points[0][1]],
            [currentSurface.points[0][0] + 100, currentSurface.points[0][1] + 100],
            [currentSurface.points[0][0], currentSurface.points[0][1] + 100]
          ]
        }
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
      if (e.evt instanceof MouseEvent) {
        removeCustomCursor(e as Konva.KonvaEventObject<MouseEvent>);
      }
      startPosRef.current = null;
    }
  };

  const completeWallDrawing = () => {
    if (drawingPoints.length < 3) {
      return;
    }
    
    // Check for self-intersections (only if we have more than 4 points to avoid false positives)
    if (drawingPoints.length > 4 && isSurfaceIntersecting(drawingPoints)) {
      // Don't complete drawing if it would create self-intersections
      return;
    }
    
    // If there's an existing surface, merge with it
    if (surface.points.length > 0) {
      try {
        const unionResult = unionSurfaces(surface.points, drawingPoints);
        if (unionResult && unionResult.length > 0 && unionResult[0].length > 0) {
          setSurface((current) => ({
            ...current,
            points: unionResult[0],
          }));
        } else {
          // If union fails, just replace the surface
          setSurface((current) => ({
            ...current,
            points: drawingPoints,
          }));
        }
      } catch (error) {
        console.error('Union operation failed:', error);
        // Fallback: just replace the surface
        setSurface((current) => ({
          ...current,
          points: drawingPoints,
        }));
      }
    } else {
      // No existing surface, create new one
      setSurface({
        id: self.crypto.randomUUID(),
        points: drawingPoints,
        pattern: surface.pattern,
      });
    }
    
    // Reset drawing state
    setDrawingPoints([]);
    setCurrentMousePos(null);
    dispatch({ type: 'default' });
  };

  const removePoints = (indexes: number[]) => {
    setSurface((current) => ({
      ...current,
      points: current.points.filter((_, i) => !indexes.includes(i)),
    }));
    dispatch({ type: 'default' });
  }

  const removeSurface = () => {
    setSurface({ id: self.crypto.randomUUID(), points: [], pattern: defaultPattern });
    dispatch({ type: 'default' });
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

  const [globalScale, setGlobalScale] = React.useState(100);

  const deletionDisabled = surface.points.length <= 3;


  const handleSurfaceEditorSubmit = (pattern: Pattern) => {
    setSurface((current) => ({
      ...current,
      pattern,
    }));
    setSurfaceEditorOpen(false);
  }

  const handleSurfaceChange = (newPattern: Pattern) => {
    setSurface((current) => ({
      ...current,
      pattern: newPattern,
    })); 
  }

  const { movePatternDown, movePatternLeft, movePatternRight, movePatternUp} = useMemo(() => {
    const movePattern = (direction: 'up' | 'down' | 'left' | 'right') => {
      setSurface((current) => {
        const newPattern = { ...current.pattern };
        const moveAmount = 1; // pixels to move
        switch (direction) {
          case 'up':
            newPattern.y -= moveAmount;
            break;
          case 'down':
            newPattern.y += moveAmount;
            break;
          case 'left':
            newPattern.x -= moveAmount;
            break;
          case 'right':
            newPattern.x += moveAmount;
            break;
        }
        return {
          ...current,
          pattern: newPattern,
        };
      });
    }
    return {
      movePatternUp: () => movePattern('up'),
      movePatternDown: () => movePattern('down'),
      movePatternLeft: () => movePattern('left'),
      movePatternRight: () => movePattern('right'),
    }
  }, [setSurface])

  const handleWallDimensionChange = (wallIndex: number, newLength: number) => {
    setSurface((current) => {
      const newPoints = adjustSurfaceForWallChange(
        current.points,
        wallIndex,
        newLength,
        0.01, // scale factor
        keepRightAngles
      );

      // Check if the new surface would be valid
      if (isSurfaceIntersecting(newPoints)) {
        return current; // Don't update if it would create intersections
      }

      return {
        ...current,
        points: newPoints,
      };
    });
  };

  const downloadSurface = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(surface));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `surface-${surface.id}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const uploadSurface = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data && data.points && Array.isArray(data.points) && data.pattern) {
          setSurface({
            id: data.id || Date.now().toString(),
            points: data.points,
            pattern: data.pattern,
          });
        } else {
          console.error("Invalid surface data format");
        }
      } catch (error) {
        console.error("Error parsing surface data:", error);
      }
    };
    reader.readAsText(file);
  };

  const editable = state.editable && (currentSurface === null || currentSurface?.idle);
  
  return (
    <div className="relative">
      {surfaceEditorOpen && (<PatternEditor className="" onClose={() => setSurfaceEditorOpen(false)} onSubmit={handleSurfaceEditorSubmit} value={surface.pattern} />)}
      <div className="absolute z-10 left-1/2 top-2 -translate-x-1/2 flex items-center bg-gray-100 shadow-md p-1 space-x-2 rounded-lg">
        <Tooltip 
          text={t('planner.ui.editMode')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => dispatch({type: 'default'})} active={['default', 'edit-wall', 'edit-corner', 'edit-surface'].includes(state.mode)} icon={<SplinePointer />} />
          } />
        <Tooltip 
          text={t('planner.ui.previewMode')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => dispatch({type: 'preview'})} active={state.mode === 'preview'} icon={<Hand />} />
          } />
        <Tooltip 
          text={t('planner.ui.addSurface')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => dispatch({type: 'add-surface'})} active={state.mode === 'add-surface'} icon={<SquaresUnite />} />
          } />
        <Tooltip 
          text={t('planner.ui.subtractSurface')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => dispatch({type: 'subtract-surface'})} active={state.mode === 'subtract-surface'} icon={<SquaresSubtract />} />
          } />
        <Tooltip 
          text={t('planner.ui.drawWalls')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => dispatch({type: 'draw-walls'})} active={state.mode === 'draw-walls'} icon={<Waypoints />} />
          } />
        <Tooltip 
          text={t('planner.ui.undo')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={undo} disabled={!canUndo} icon={<Undo />} />
          } />
        <Tooltip 
          text={t('planner.ui.redo')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={redo} disabled={!canRedo} icon={<Redo />} />
          } />
        <div className="h-6 w-0 border-l border-solid border-l-black" />
        <Tooltip 
          text={t('planner.ui.saveToBrowser')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => saveToLocalStorage('surface', surface)} icon={<Save />} />
          } />
        <Tooltip 
          text={t('planner.ui.downloadAsFile')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => downloadSurface()} icon={<Download />} />
          } />
        <Tooltip 
          text={t('planner.ui.uploadFile')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => {document.getElementById('upload-surface')?.click()}} icon={<Upload />} />
          } />
        <input
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadSurface(file);
            }
            e.target.value = ''; // Reset file input
          }}
          id="upload-surface"
        />
      </div>
      <div className="absolute z-10 top-16 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-2 md:top-2 bg-gray-100 shadow-md p-1 rounded-lg flex items-center justify-center">
        <Tooltip 
          text={t('planner.ui.zoomIn')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => setGlobalScale(c => c < 300 ? c + 10 : 300)} icon={<ZoomIn />} />
          } />
        <ToolbarButton onClick={() => setGlobalScale(100)} label={`${globalScale}%`} />
        <Tooltip 
          text={t('planner.ui.zoomOut')}
          position="bottom"
          component={ref => 
            <ToolbarButton ref={ref} onClick={() => setGlobalScale(c => c > 0 ? c - 10 : 0)} icon={<ZoomOut />} />
          } />
      </div>
      {state.mode === 'edit-corner' && (
        <div className="absolute z-10 left-2 top-16 md:top-5 w-12 md:w-32 bg-gray-100 shadow-md p-1 rounded-lg">
          <Tooltip 
            text={t('planner.ui.makeRightAngle')}
            position="right"
            component={ref => 
              <ToolbarButton 
                ref={ref}
                disabled={isRightAngle([surface.points[state.prevWallIndex], surface.points[state.wallIndex], surface.points[state.nextWallIndex]])} 
                onClick={() => makeAngleRight(state.prevWallIndex, state.wallIndex, state.nextWallIndex)} 
                wide
                icon={<RightAngle />} />
            } />
          <Tooltip 
            text={t('planner.ui.deleteCorner')}
            position="right"
            component={ref => 
              <ToolbarButton ref={ref} variant="danger" disabled={deletionDisabled} onClick={() => removePoints([state.wallIndex])} wide icon={<Trash2 />} />
            } />
        </div>
      )}
      {state.mode === 'edit-wall' && (
        <div className="absolute z-10 left-2 top-16 md:top-5 w-12 md:w-32 bg-gray-100 shadow-md p-1 rounded-lg">
          <Tooltip 
            text={t('planner.ui.deleteWall')}
            position="right"
            component={ref => 
              <ToolbarButton ref={ref} variant="danger" disabled={true} onClick={() => removePoints([state.nextWallIndex])} wide icon={<Trash2 />} />
            } />
        </div>
      )}
      {state.mode === 'edit-surface' && (
        <>
          <div className="absolute z-10 left-2 top-16 md:top-5 w-12 md:w-32 bg-gray-100 shadow-md p-1 rounded-lg">
            <Tooltip 
              text={t('planner.ui.editPattern')}
              position="right"
              component={ref => 
              <ToolbarButton ref={ref} wide onClick={() => setSurfaceEditorOpen(true)} icon={<PencilRuler />} />
            } />
            
            <CursorArrows 
              onDown={movePatternDown}
              onLeft={movePatternLeft}
              onRight={movePatternRight}
              onUp={movePatternUp}
              disabled={surface.pattern.tiles.length === 0 || surfaceEditorOpen}
              variant="wide"
              className="md:flex hidden"
            />
            <Tooltip 
              text={t('planner.ui.deleteSurface')}
              position="right"
              component={ref => 
                <ToolbarButton ref={ref} variant="danger" onClick={removeSurface} wide icon={<Trash2 />} />
              } />
          </div>
          <CursorArrows 
              onDown={movePatternDown}
              onLeft={movePatternLeft}
              onRight={movePatternRight}
              onUp={movePatternUp}
              disabled={surface.pattern.tiles.length === 0 || surfaceEditorOpen}
              variant="wide"
              className="md:hidden flex absolute z-10 bottom-2 right-2"
            />
        </>
      )}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        className={classMerge("bg-white", 
          state.mode === 'preview' && "cursor-grab",
          state.mode === 'add-surface' && "cursor-crosshair",
          state.mode === 'subtract-surface' && "cursor-crosshair",
          state.mode === 'draw-walls' && "cursor-crosshair",
          state.mode === 'edit-wall' && "default-cursor",
          state.mode === 'edit-corner' && "default-cursor",
          state.mode === 'default' && "default-cursor",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onClick={handleStageClick}
        scale={{ x: globalScale / 100, y: globalScale / 100 }}
        draggable={state.mode === 'preview'}
        onDragEnd={handleStageDragEnd}
        onDragStart={handleStageDragStart}
      >
        <Layer>
          {surface.points.length > 0 && (
            <Surface 
              id={surface.id} 
              points={surface.points} 
              disabled={!editable} 
              pattern={surface.pattern}
              edit={state.mode === 'edit-surface'} 
              onClick={() => dispatch({ type: "edit-surface" })} 
              onChange={handleSurfaceChange}
              />
          )}
          {currentSurface && (
            <Line
              points={currentSurface.points.flat()}
              stroke={currentSurface.state === "valid" ? "black" : "rgba(0, 0, 0, 0.2)"}
              lineCap="round"
              lineJoin="round"
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
                {editable && <EdgeEdit 
                  id={key}
                  wallIndex={i} 
                  pointA={pt} 
                  pointB={nxt} 
                  edit={state.mode === 'edit-wall' && i === state.wallIndex} 
                  onClick={(p, idx) => dispatch({type: 'edit-wall', payload: { wallIndex: idx}})}
                />}
                <WallDimension
                  pointA={pt}
                  pointB={nxt}
                  scale={0.01}
                />
                {isNonRightAngle && (
                  <AngleMarker x={pt[0]} y={pt[1]} angle={sweepAngleDeg} rotation={rotationStartDeg} />
                )}
                {/* <PatternDistance 
                  pointA={pt} 
                  pointB={nxt} 
                  pattern={surface.pattern}
                /> */}
              </React.Fragment>
            );
          })}
          {editable && surface.points.map((pt, i) => {
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
        <Layer>
          {/* Drawing walls visualization */}
          {state.mode === 'draw-walls' && drawingPoints.length > 0 && (
            <>
              {/* Completed segments */}
              {drawingPoints.length > 1 && (
                <Line
                  points={drawingPoints.flat()}
                  stroke="black"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
              {/* Current segment being drawn */}
              {currentMousePos && (
                <>
                  <Line
                    points={[
                      ...drawingPoints[drawingPoints.length - 1],
                      ...currentMousePos
                    ]}
                    stroke="rgba(0, 0, 0, 0.2)"
                    strokeWidth={2}
                    lineCap="round"
                    dash={[4, 4]}
                  />
                  {/* Dimension for current segment */}
                  <WallDimension
                    pointA={drawingPoints[drawingPoints.length - 1]}
                    pointB={currentMousePos}
                    scale={0.01}
                  />
                </>
              )}
              {/* Closing line preview when near start point */}
              {drawingPoints.length >= 3 && currentMousePos && shouldCompleteDrawing(currentMousePos, drawingPoints) && (
                <Line
                  points={[
                    ...currentMousePos,
                    ...drawingPoints[0]
                  ]}
                  stroke="rgba(0, 255, 0, 0.8)"
                  strokeWidth={2}
                  lineCap="round"
                  dash={[4, 4]}
                />
              )}
              {/* Start point indicator */}
              {drawingPoints.length > 0 && (
                <Line
                  points={[0, 0, 0, 0]}
                  x={drawingPoints[0][0]}
                  y={drawingPoints[0][1]}
                  stroke="green"
                  strokeWidth={10}
                  lineCap="round"
                />
              )}
            </>
          )}
        </Layer>
      </Stage>
      {state.mode === 'edit-wall' && (
        <WallDimensionInput
          pointA={surface.points[state.wallIndex]}
          pointB={surface.points[(state.wallIndex + 1) % surface.points.length]}
          scale={0.01}
          key={state.wallIndex}
          globalScale={globalScale}
          stagePosition={stageRef.current?.position() || { x: 0, y: 0 }}
          onDimensionChange={(newLength) => handleWallDimensionChange(state.wallIndex, newLength)}
          keepRightAngles={keepRightAngles}
          onKeepRightAnglesChange={setKeepRightAngles}
        />
      )}
    </div>
  );
};

export const DynamicSizePlanner = () => {
  return <ResizePlanner render={(dimensions) => (
    <Planner width={dimensions.width} height={dimensions.height} />
  )} />
}