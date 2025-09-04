import { Stage, Layer, Line } from "react-konva";
import React, { useMemo, useRef } from "react";
import type { Point, Pattern } from "./types";
import { Download, Hand, PencilRuler, Printer, Redo, Ruler, Save, SplinePointer, SquaresSubtract, SquaresUnite, Trash2, Undo, Upload, Waypoints, ZoomIn, ZoomOut } from 'lucide-react'
import { RightAngle } from "@/components/Icons/RightAngle";
import { v4 as uuid} from 'uuid'

import Konva from "konva";

import { useHistoryState } from "@/hooks/useHistoryState";
import { useTranslation } from "@/hooks/useTranslation";
import { useTouchDevice } from "@/hooks/useTouchDevice";
import { subtractSurfaces, unionSurfaces, isSurfaceIntersecting, saveToLocalStorage, loadFromLocalStorage, getAngles, getSurfaceArea, doSurfacesIntersect, adjustSurfaceForWallChange, toClockwise, areMultipleSurfacesIntersecting, getClosestPointOnLineSegment, insertPointInWall, getPointDistance } from "./utils";
import { removeCustomCursor, setGrabbingCursor } from "./domUtils"
import EdgeEdit from "./EdgeEdit";
import { MoveHandler } from "./MoveHandler";
import { CornerEdit } from "./CornerEdit";
import { WallDimension } from "./components/WallDimension";
import { WallDimensionInput } from "./components/WallDimensionInput";
import { DimensionInfo } from "./components/DimensionInfo";
import { ReducerStateAddSurface, ReducerStateSubtractSurface, usePlannerReducer } from "./usePlannerReducer";
import { AngleMarker } from "./AngleMarker";
import { ToolbarButton } from "../ToolbarButton";
import { classMerge } from "@/utils/classMerge";
import { Surface } from "./Surface";
import { PatternEditor } from "./PatternEditor/PatternEditor";
import { ResizePlanner } from "./ResizePlanner";
import { CursorArrows } from "../CursorArrows";
import { Tooltip } from "../Tooltip";
import { TouchInstructions } from "../TouchInstructions";
import { NotificationProvider, NotificationContainer, useNotification } from "../Notification";
import { PatternDistance } from "./components/PatternDistance";

type TemporarySurface = {
  state: "error" | "valid";
  id: string;
  points: Point[];
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

const validateSurfaceOperation = (currentSurface: Point[][], newSurface: Point[][], operation: ReducerStateAddSurface['mode'] | ReducerStateSubtractSurface['mode']) => {
  if (getSurfaceArea(newSurface) < 10) {
      return false;
  }

  if (operation === 'add-surface' && currentSurface.length > 0 && !doSurfacesIntersect(currentSurface, newSurface)) {
      return false;
  }

  return true;
}

const useDragStage = (setSurface: ReturnType<typeof useHistoryState<{id: string, points: Point[][], pattern: Pattern}>>['set'], enabled = true) => {
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
      const dx = Math.round((startPosRef.current.x - pos.x) / scale.x);
      const dy = Math.round((startPosRef.current.y - pos.y) / scale.y);

      setSurface((current) => ({
        ...current,
        pattern: {
          ...current.pattern,
          x: current.pattern.x - dx,
          y: current.pattern.y - dy,
        },
        points: current.points.map(s => s.map(pt => [pt[0] - dx, pt[1] - dy])),
      }));
      
      stage.position({ x: 0, y: 0 }); // reset position after dragging
    }
  }), [setSurface, enabled])
}

const isRightAngle = (points: [Point, Point, Point]) => { 
  const [a, b, c] = points;
  if (a[0] === b[0] && b[1] === c[1]) return true; 
  if (a[1] === b[1] && b[0] === c[0]) return true;
  return false;
}

const getDefaultSurface = (width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 200;
    const halfSize = size / 2;
    
    // Create a simple square tile pattern
    const tileSize = 100;
    const defaultSquarePattern: Pattern = {
      gapColor: '#333333',
      height: tileSize * 2,
      width: tileSize * 2,
      x: 10,
      y: 10,
      tiles: [
        {
          id: uuid(),
          type: 'square',
          points: [
            [0, 0],
            [tileSize, 0],
            [tileSize, tileSize],
            [0, tileSize]
          ],
          color: '#e0e0e0',
          metadata: {
            angle: 0,
            centerX: tileSize / 2,
            centerY: tileSize / 2
          }
        },
        {
          id: uuid(),
          type: 'square',
          points: [
            [tileSize, 0],
            [tileSize * 2, 0],
            [tileSize * 2, tileSize],
            [tileSize, tileSize]
          ],
          color: '#f0f0f0',
          metadata: {
            angle: 0,
            centerX: tileSize * 1.5,
            centerY: tileSize / 2
          }
        },
        {
          id: uuid(),
          type: 'square',
          points: [
            [0, tileSize],
            [tileSize, tileSize],
            [tileSize, tileSize * 2],
            [0, tileSize * 2]
          ],
          color: '#f0f0f0',
          metadata: {
            angle: 0,
            centerX: tileSize / 2,
            centerY: tileSize * 1.5
          }
        },
        {
          id: uuid(),
          type: 'square',
          points: [
            [tileSize, tileSize],
            [tileSize * 2, tileSize],
            [tileSize * 2, tileSize * 2],
            [tileSize, tileSize * 2]
          ],
          color: '#e0e0e0',
          metadata: {
            angle: 0,
            centerX: tileSize * 1.5,
            centerY: tileSize * 1.5
          }
        }
      ],
      tilesGap: 2,
      scale: 0.2
    };
    
    return {
      id: uuid(),
      points: toClockwise([[
        [centerX + halfSize, centerY + halfSize],
        [centerX - halfSize, centerY + halfSize],
        [centerX - halfSize, centerY - halfSize],
        [centerX + halfSize, centerY - halfSize],
      ]]),
      pattern: defaultSquarePattern
    };
  };


export const Planner: React.FC<PlannerProps> = ({ width, height }) => {
  const { t } = useTranslation();
  const isTouchDevice = useTouchDevice();
  const { showSuccess, showWarning, showError } = useNotification();
  
  const { state: surface, set: setSurface, undo, redo, persist, canUndo, canRedo } = useHistoryState<{id: string, points: Point[][], pattern: Pattern}>(loadFromLocalStorage('surface') || getDefaultSurface(width, height));
  const defferdSurfacePoints = React.useDeferredValue(surface.points);
  const [ surfaceEditorOpen, setSurfaceEditorOpen ] = React.useState<boolean>(false);
  const [keepRightAngles, setKeepRightAngles] = React.useState<boolean>(true);
  const [showPatternDistance, setShowPatternDistance] = React.useState<boolean>(false);
  const stageRef = React.useRef<Konva.Stage>(null);
  const { state, dispatch } = usePlannerReducer(surface.points);
  const { handleDragEnd: handleStageDragEnd, handleDragStart: handleStageDragStart} = useDragStage(setSurface, state.mode === 'preview');

  const [currentSurface, setCurrentSurface] =
    React.useState<TemporarySurface | null>(null);

  // State for wall drawing mode
  const [drawingPoints, setDrawingPoints] = React.useState<Point[]>([]);
  const [currentMousePos, setCurrentMousePos] = React.useState<Point | null>(null);
  const [isDrawingWall, setIsDrawingWall] = React.useState<boolean>(false);
  const [currentWallStart, setCurrentWallStart] = React.useState<Point | null>(null);

  // Touch-specific state for pinch zoom
  const [initialPinchDistance, setInitialPinchDistance] = React.useState<number | null>(null);
  const [initialScale, setInitialScale] = React.useState<number>(100);
  
  // Print functionality
  const printContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Get bounding box of all content for print fitting
  const getStageContentBoundingBox = React.useCallback(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    
    // Add surface points
    surface.points.forEach(poly => poly.forEach(p => { xs.push(p[0]); ys.push(p[1]); }));
    
    // Add current drawing surface if exists
    if (currentSurface) {
      currentSurface.points.forEach(p => { xs.push(p[0]); ys.push(p[1]); });
    }
    
    // Add drawing points (wall drawing mode)
    drawingPoints.forEach(p => { xs.push(p[0]); ys.push(p[1]); });
    
    // Add current wall being drawn
    if (isDrawingWall && currentWallStart && currentMousePos) {
      xs.push(currentWallStart[0], currentMousePos[0]);
      ys.push(currentWallStart[1], currentMousePos[1]);
    }
    
    if (!xs.length) return null;
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }, [surface.points, currentSurface, drawingPoints, isDrawingWall, currentWallStart, currentMousePos]);

  const handlePrint = React.useCallback(() => {
    const bbox = getStageContentBoundingBox();
    const stage = stageRef.current;
    
    if (!stage || !bbox) {
      // Fallback to regular print if no content
      window.print();
      return;
    }

    // A4 dimensions at 96dpi (portrait mode)
    const pageWidth = 793; // A4 width in pixels
    const pageHeight = 1122; // A4 height in pixels
    const padding = 40; // padding around content
    
    // Calculate scale to fit content on page
    const scaleX = (pageWidth - padding * 2) / bbox.width;
    const scaleY = (pageHeight - padding * 2) / bbox.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    
    // Create or reuse print container
    let container = printContainerRef.current;
    if (!container) {
      container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-10000px';
      container.style.left = '-10000px';
      container.style.zIndex = '-1000';
      document.body.appendChild(container);
      printContainerRef.current = container;
    }
    
    // Clear previous content
    container.innerHTML = '';
    
    // Clone the stage for printing
    const clone = stage.clone();
    clone.width(pageWidth);
    clone.height(pageHeight);
    clone.scale({ x: scale, y: scale });
    
    // Center the content on the page
    const offsetX = (pageWidth - bbox.width * scale) / 2 - bbox.x * scale;
    const offsetY = (pageHeight - bbox.height * scale) / 2 - bbox.y * scale;
    clone.position({ x: offsetX, y: offsetY });
    
    // Add white background for clean printing
    const bgLayer = new Konva.Layer();
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      fill: 'white'
    });
    bgLayer.add(bg);
    clone.add(bgLayer);
    bgLayer.moveToBottom();
    
    // Append to container
    container.appendChild(clone.container());
    
    // Add print styles for clean printing
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      @media print {
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        body > * { display: none !important; }
        #print-container { 
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        @page { 
          margin: 0; 
          size: A4 portrait;
        }
      }
    `;
    container.id = 'print-container';
    document.head.appendChild(printStyle);
    
    // Position container for printing
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '9999';
    
    // Trigger print after DOM update
    setTimeout(() => {
      window.print();
      
      // Cleanup after print
      setTimeout(() => {
        if (container) {
          container.innerHTML = '';
          container.style.position = 'fixed';
          container.style.top = '-10000px';
          container.style.left = '-10000px';
          container.style.zIndex = '-1000';
        }
        if (document.head.contains(printStyle)) {
          document.head.removeChild(printStyle);
        }
      }, 1000);
    }, 100);
  }, [getStageContentBoundingBox]);
  
  // Touch-specific state for pan gestures
  const [initialTouchCenter, setInitialTouchCenter] = React.useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = React.useState<boolean>(false);

  // Handle pinch zoom for touch devices
  const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 2) {
      // Start pinch gesture
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setInitialPinchDistance(distance);
      setInitialScale(globalScale);
      
      // Also set initial center for panning
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setInitialTouchCenter({ x: centerX, y: centerY });
      setIsPanning(true);
    } else if (touches.length === 1) {
      // Single touch - handle as mouse down but prevent duplicate calls
      e.evt.preventDefault();
      handleMouseDown(e);
    }
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 2 && initialPinchDistance !== null && initialTouchCenter !== null) {
      // Handle pinch zoom and pan
      e.evt.preventDefault();
      const touch1 = touches[0];
      const touch2 = touches[1];
      
      // Calculate zoom
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = (currentDistance / initialPinchDistance) * initialScale;
      const clampedScale = Math.max(10, Math.min(300, scale));
      setGlobalScale(Math.round(clampedScale / 10) * 10);

      // Calculate pan if we're panning
      if (isPanning) {
        const currentCenterX = (touch1.clientX + touch2.clientX) / 2;
        const currentCenterY = (touch1.clientY + touch2.clientY) / 2;
        
        const dx = (currentCenterX - initialTouchCenter.x) / (globalScale / 100);
        const dy = (currentCenterY - initialTouchCenter.y) / (globalScale / 100);
        
        // Update surface position
        setSurface((current) => ({
          ...current,
          pattern: {
            ...current.pattern,
            x: current.pattern.x + dx,
            y: current.pattern.y + dy,
          },
          points: current.points.map(s => s.map(pt => [pt[0] + dx, pt[1] + dy])),
        }));
        
        // Update the center for next move calculation
        setInitialTouchCenter({ x: currentCenterX, y: currentCenterY });
      }
    } else if (touches.length === 1) {
      // Single touch - handle as mouse move
      handleMouseMove(e);
    }
  };

  const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length < 2) {
      // End pinch gesture and panning
      setInitialPinchDistance(null);
      setInitialScale(globalScale);
      setInitialTouchCenter(null);
      setIsPanning(false);
    }
    
    if (touches.length === 0) {
      // All touches ended - handle as mouse up
      handleMouseUp(e);
    }
  };

  // Reset drawing state when mode changes
  React.useEffect(() => {
    if (state.mode !== 'draw-walls') {
      setDrawingPoints([]);
      setCurrentMousePos(null);
      setIsDrawingWall(false);
      setCurrentWallStart(null);
    }
  }, [state.mode]);

  // Handle escape key to cancel drawing
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.mode === 'draw-walls') {
        if (isDrawingWall) {
          // Cancel current wall being drawn - return to previous end point
          setIsDrawingWall(false);
          const lastPoint = drawingPoints.length > 0 ? drawingPoints[drawingPoints.length - 1] : null;
          setCurrentWallStart(lastPoint);
          setCurrentMousePos(lastPoint);
        } else if (drawingPoints.length > 0) {
          // Cancel entire drawing session
          setDrawingPoints([]);
          setCurrentMousePos(null);
          setCurrentWallStart(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.mode, drawingPoints.length, isDrawingWall, drawingPoints]);

  // Helper function to calculate distance between two points
  const getDistance = (point1: Point, point2: Point): number => {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Helper function to check if drawing should be completed
  const shouldCompleteDrawing = (currentPos: Point, points: Point[]): boolean => {
    if (points.length < 3) return false;
    const threshold = isTouchDevice ? CLOSE_POLYGON_THRESHOLD * 2 : CLOSE_POLYGON_THRESHOLD;
    return getDistance(currentPos, points[0]) <= threshold;
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.editable && typeof e.target.attrs.id !== "string") {
      dispatch({ type: 'default' });
    }
  }

  const handleStageDoubleClick = () => {
    if (state.mode === 'draw-walls' && drawingPoints.length >= 3) {
      // Double-click to complete the polygon
      console.log('Double-click detected, completing drawing');
      completeWallDrawing();
    }
  }

  const pointsCopy = useRef<Point[][] | null>(null)
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const handleDragStart = () => {
    persist();
    pointsCopy.current = [...surface.points];
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.mode === 'edit-wall') {
      const { wallIndex, nextWallIndex, surfaceIndex } = state;
      const [x1, y1] = surface.points[surfaceIndex][wallIndex];
      const [x2, y2] = surface.points[surfaceIndex][nextWallIndex];
      const midX = x1 + (x2 - x1) / 2;
      const midY = y1 + (y2 - y1) / 2;
      e.target.x(midX - e.target.width()/2);
      e.target.y(midY - e.target.height()/2);
    }
    if (state.mode === 'edit-corner') {
      const { wallIndex, surfaceIndex } = state;
      const [x, y] = surface.points[surfaceIndex][wallIndex]; 
      e.target.x(x);
      e.target.y(y);
    }
    pointsCopy.current = null;
  }

  const handleWallDragMove = (e: Konva.KonvaEventObject<DragEvent>, dA: Point, dB: Point) => {
    if (state.mode !== 'edit-wall' || pointsCopy.current === null) return;
    const { wallIndex, nextWallIndex, surfaceIndex } = state;
    const newSurfacePoints = [...pointsCopy.current[surfaceIndex]];
    const afterNextIndex = (nextWallIndex + 1) % newSurfacePoints.length;
    const prevIndex = wallIndex === 0 ? newSurfacePoints.length - 1 : wallIndex - 1;

    const [x0, y0] = newSurfacePoints[wallIndex];
    const [x1, y1] = newSurfacePoints[nextWallIndex];
    newSurfacePoints[wallIndex] = [x0 + dA[0], y0 + dA[1]];
    newSurfacePoints[nextWallIndex] = [x1 + dB[0], y1 + dB[1]];
    if (isSamePoint(newSurfacePoints[nextWallIndex], newSurfacePoints[afterNextIndex]) || isSamePoint(newSurfacePoints[wallIndex], newSurfacePoints[prevIndex])) {
      // same point, do not update
      return
    };

    
    
    setSurface((current) => {
      const newPoints = [
        ...current.points.slice(0, surfaceIndex),
        newSurfacePoints,
        ...current.points.slice(surfaceIndex + 1),
      ];

      if (areMultipleSurfacesIntersecting(newPoints)) {
        // surface is intersecting, do not update
        return current;
      }
      return{
        ...current,
        points: newPoints,
      };
    }, true);
  }

  const handleDragCornerMove = (e: Konva.KonvaEventObject<DragEvent>, diff: Point) => {
    if (state.mode !== 'edit-corner' || pointsCopy.current === null) return;
    const { wallIndex, surfaceIndex } = state;
    const newSurfacePoints = [...pointsCopy.current[surfaceIndex]];

    const [x0, y0] = newSurfacePoints[wallIndex];
    newSurfacePoints[wallIndex] = [x0 + diff[0], y0 + diff[1]];

    setSurface((current) => {
      const newPoints = [
        ...current.points.slice(0, surfaceIndex),
        newSurfacePoints,
        ...current.points.slice(surfaceIndex + 1),
      ];

      if (areMultipleSurfacesIntersecting(newPoints)) {
        // surface is intersecting, do not update
        return current;
      }

      return {
        ...current,
        points: newPoints,
      } 
    }, true);
  }

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // prevent drawing while dragging handlers
    if (state.mode === 'add-surface' || state.mode === 'subtract-surface') {  
      // use currentTarget to reliably get stage
      const stage = e.currentTarget.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      
      // Adjust for zoom scale
      const scale = globalScale / 100;
      const adjustedPos = {
        x: pos.x / scale,
        y: pos.y / scale
      };
      
      const id = Date.now().toString();
      // start rectangle polygon points (all corners at start)
      const points: [number, number][] = [
        [adjustedPos.x, adjustedPos.y],
        [adjustedPos.x, adjustedPos.y],
        [adjustedPos.x, adjustedPos.y],
        [adjustedPos.x, adjustedPos.y],
      ];
      const newSurface: TemporarySurface = { id, points: points, state: "valid", idle: true };
      setCurrentSurface(newSurface);
    } else if (state.mode === 'draw-walls') {
      const stage = e.currentTarget.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      
      // Adjust for zoom scale
      const scale = globalScale / 100;
      const clickPos: Point = [pos.x / scale, pos.y / scale];
      
      // Check if clicking near start point to close polygon (larger threshold for touch)
      const threshold = isTouchDevice ? CLOSE_POLYGON_THRESHOLD * 2 : CLOSE_POLYGON_THRESHOLD;
      if (drawingPoints.length >= 3 && getDistance(clickPos, drawingPoints[0]) <= threshold) {
        completeWallDrawing();
        return;
      }
      
      // Start drawing a new wall
      if (!isDrawingWall) {
        setIsDrawingWall(true);
        
        // Use the end point of the previous wall as starting point, or click position for first wall
        const startPoint = drawingPoints.length > 0 
          ? drawingPoints[drawingPoints.length - 1] 
          : clickPos;
        
        setCurrentWallStart(startPoint);
        setCurrentMousePos(clickPos);
      }
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
      
      // Adjust for zoom scale
      const scale = globalScale / 100;
      const adjustedPos = {
        x: pos.x / scale,
        y: pos.y / scale
      };
      
      // update rectangle polygon points based on start and current
      const [x0, y0] = currentSurface.points[0];
      const x1 = adjustedPos.x,
        y1 = adjustedPos.y;
      const points: Point[] = [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ];

      setCurrentSurface({
        ...currentSurface,
        points,
        state: validateSurfaceOperation(surface.points, [points], state.mode) ? "valid" : "error",
        idle: false,
      });
    } else if (state.mode === 'draw-walls') {
      const stage = e.currentTarget.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      
      // Adjust for zoom scale
      const scale = globalScale / 100;
      const mousePos: Point = [pos.x / scale, pos.y / scale];
      
      // Always update mouse position for preview
      setCurrentMousePos(mousePos);
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (state.mode === 'add-surface' || state.mode === 'subtract-surface') {
      if (!currentSurface) return;
      // first rectangle: just add
      if (surface.points.length === 0) {
        if (getSurfaceArea([currentSurface.points]) < 100) {
          currentSurface.points = [
            currentSurface.points[0],
            [currentSurface.points[0][0] + 100, currentSurface.points[0][1]],
            [currentSurface.points[0][0] + 100, currentSurface.points[0][1] + 100],
            [currentSurface.points[0][0], currentSurface.points[0][1] + 100]
          ]
        }
        setSurface(c => ({...c, id: uuid(), points: unionSurfaces([], [currentSurface.points])}));
        setCurrentSurface(null);
        return;
      }
      
      if (currentSurface.state === "error") {
        showWarning(t('planner.notifications.invalidOperation') || 'Invalid operation - surface overlaps or is outside bounds');
        setCurrentSurface(null);
        return;
      }
      
      if (state.mode === "add-surface") { 
        setSurface((current) => ({
          ...current,
          points: unionSurfaces(current.points, [currentSurface.points]),
        }));
      } else if (state.mode === "subtract-surface") {
        setSurface((current) => {
          const surfaces = subtractSurfaces(current.points, [currentSurface.points]);
          return {
            ...current,
            points: surfaces
          }
        });
      }
      
      setCurrentSurface(null);
    } else if (state.mode === 'draw-walls') {
      if (isDrawingWall && currentWallStart && currentMousePos) {
        // Complete the current wall
        const wallEndPos = currentMousePos;
        
        // Check if the wall has minimum length
        const minWallLength = 10;
        if (getDistance(currentWallStart, wallEndPos) < minWallLength || isSurfaceIntersecting([...drawingPoints, currentWallStart, wallEndPos])) {
          // Wall too short, cancel it
          setIsDrawingWall(false);
          setCurrentWallStart(drawingPoints.length > 0 ? drawingPoints[drawingPoints.length - 1] : null);
          setCurrentMousePos(drawingPoints.length > 0 ? drawingPoints[drawingPoints.length - 1] : null);
          return;
        }
        
        // Add the wall to drawing points
        if (drawingPoints.length === 0) {
          // First wall - add both start and end points
          setDrawingPoints([currentWallStart, wallEndPos]);
        } else {
          // Subsequent walls - add only the end point (start point is the last point of previous wall)
          setDrawingPoints(prev => [...prev, wallEndPos]);
        }
        
        // Prepare for next wall - the end of this wall becomes the start of the next wall
        setCurrentWallStart(wallEndPos);
        setIsDrawingWall(false);
        setCurrentMousePos(wallEndPos);
      }
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
        if (doSurfacesIntersect(surface.points, [drawingPoints])) {
          const unionResult = unionSurfaces(surface.points, [drawingPoints]);
          if (unionResult && unionResult.length > 0 && unionResult[0].length > 0) {
            setSurface((current) => ({
              ...current,
              points: unionResult,
            }));
          } else {
            // If union fails, just replace the surface
            setSurface((current) => ({
              ...current,
              points: toClockwise([drawingPoints]),
            }));
          }
        } else { 
          showError(t('planner.notifications.shouldConnect') || 'Walls should connect to existing surface');
          return;
        }
      } catch (error) {
        console.error('Union operation failed:', error);
        showError(t('planner.notifications.unionError') || 'Failed to merge surfaces - using fallback');
        // Fallback: just replace the surface
        setSurface((current) => ({
          ...current,
          points: toClockwise([drawingPoints]),
        }));
      }
    } else {
      // No existing surface, create new one
      setSurface({
        id: uuid(),
        points: toClockwise([drawingPoints]),
        pattern: surface.pattern,
      });
    }
    
    // Reset drawing state completely
    setDrawingPoints([]);
    setCurrentMousePos(null);
    setCurrentWallStart(null);
    setIsDrawingWall(false);
    dispatch({ type: 'default' });
  };

  const removePoints = (surfaceIndex: number, indexes: number[]) => {
    setSurface((current) => {
      const points = [...current.points[surfaceIndex]];
      points.splice(indexes[0], 1);
      return {
        ...current,
        points: [
          ...current.points.slice(0, surfaceIndex),
          points,
          ...current.points.slice(surfaceIndex + 1),
        ],
      };
    });
    dispatch({ type: 'default' });
  }

  const removeSurface = () => {
    setSurface({ id: uuid(), points: [], pattern: defaultPattern });
    dispatch({ type: 'default' });
  }
  



  const makeAngleRight = (surfaceIndex: number, prevIdx: number, idx: number, nxtIdx: number) => { 
    setSurface((current) => {
      const points = [...current.points[surfaceIndex]];
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
        points: [
          ...current.points.slice(0, surfaceIndex),
          points,
          ...current.points.slice(surfaceIndex + 1),
        ],
      }
    });
  }

  const [globalScale, setGlobalScale] = React.useState(100);

  const { handleSurfaceEditorSubmit, handleSurfaceClick } = useMemo(() => ({
    handleSurfaceEditorSubmit: (pattern: Pattern) => {
      setSurface((current) => ({
        ...current,
        pattern,
      }));
      setSurfaceEditorOpen(false);
    },
    handleSurfaceClick: () => dispatch({ type: 'edit-surface' })
  }), [dispatch, setSurface]);

  const handleSurfaceChange = useMemo(() => (newPattern: Pattern) => {
    setSurface((current) => ({
      ...current,
      pattern: newPattern,
    }));
  }, [setSurface]);

  const { movePatternDown, movePatternLeft, movePatternRight, movePatternUp} = useMemo(() => {
    const movePattern = (direction: 'up' | 'down' | 'left' | 'right') => {
      setSurface((current) => {
        const moveAmount = 1;
        let { x, y } = current.pattern;
        switch (direction) {
          case 'up': y -= moveAmount; break;
          case 'down': y += moveAmount; break;
          case 'left': x -= moveAmount; break;
          case 'right': x += moveAmount; break;
        }
        return { ...current, pattern: { ...current.pattern, x, y } };
      });
    };
    return {
      movePatternUp: () => movePattern('up'),
      movePatternDown: () => movePattern('down'),
      movePatternLeft: () => movePattern('left'),
      movePatternRight: () => movePattern('right'),
    };
  }, [setSurface]);

  const handleWallDimensionChange = (surfaceIndex: number, wallIndex: number, newLength: number) => {
    setSurface((current) => {
      const newPoints = adjustSurfaceForWallChange(
        current.points[surfaceIndex],
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
        points: [
          ...current.points.slice(0, surfaceIndex),
          newPoints,
          ...current.points.slice(surfaceIndex + 1),
        ],
      };
    });
  };

  const downloadSurface = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(surface));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `surface-${surface.id}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showSuccess(t('planner.notifications.downloadSuccess') || 'Surface downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      showError(t('planner.notifications.downloadError') || 'Failed to download surface');
    }
  }

  const uploadSurface = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data && data.points && Array.isArray(data.points) && data.pattern) {
          setSurface({
            ...data,
            points: Array.isArray(data.points[0][0]) ? data.points : [data.points], // ensure points is an array of arrays
            pattern: data.pattern,
          });
          showSuccess(t('planner.notifications.uploadSuccess') || 'Surface uploaded successfully');
        } else {
          console.error("Invalid surface data format");
          showError(t('planner.notifications.invalidFormat') || 'Invalid surface file format');
        }
      } catch (error) {
        console.error("Error parsing surface data:", error);
        showError(t('planner.notifications.uploadError') || 'Failed to upload surface file');
      }
    };
    reader.readAsText(file);
  };

  // Handler for double-click/double-tap on wall to add new point
  const handleWallDoubleClick = (clickPosition: Point, wallPoints: [Point, Point]) => {
    // Allow adding points in most modes (but not while drawing walls or subtracting surfaces)
    if (state.mode === 'draw-walls' || state.mode === 'subtract-surface') {
      return;
    }

    // Don't allow if no surface exists
    if (surface.points.length === 0) {
      showWarning(t('planner.notifications.noSurfaceExists') || 'Create a surface first before adding corners');
      return;
    }

    // Find which surface this wall belongs to
    let targetSurfaceIndex = -1;
    let targetWallIndex = -1;
    
    for (let i = 0; i < surface.points.length; i++) {
      const surfacePoints = surface.points[i];
      for (let j = 0; j < surfacePoints.length; j++) {
        const currentPoint = surfacePoints[j];
        const nextPoint = surfacePoints[(j + 1) % surfacePoints.length];
        
        // Check if this wall matches the clicked wall (check both directions)
        if ((isSamePoint(currentPoint, wallPoints[0]) && isSamePoint(nextPoint, wallPoints[1])) ||
            (isSamePoint(currentPoint, wallPoints[1]) && isSamePoint(nextPoint, wallPoints[0]))) {
          targetSurfaceIndex = i;
          targetWallIndex = j;
          break;
        }
      }
      if (targetSurfaceIndex !== -1) break;
    }

    if (targetSurfaceIndex === -1) {
      console.warn('Wall not found for double-click');
      return; // Wall not found
    }

    // Calculate the closest point on the wall to where the user clicked
    const closestPoint = getClosestPointOnLineSegment(clickPosition, wallPoints[0], wallPoints[1]);
    
    // Ensure the new point is not too close to existing points
    const minDistance = 20; // Increased minimum distance to make it easier to place points
    const [startPoint, endPoint] = wallPoints;
    const distanceToStart = getPointDistance(closestPoint, startPoint);
    const distanceToEnd = getPointDistance(closestPoint, endPoint);
    
    if (distanceToStart < minDistance || distanceToEnd < minDistance) {
      showWarning(t('planner.notifications.tooCloseToCorner') || 'Too close to existing corner. Try clicking further from the edges.');
      return; // Too close to existing points
    }

    // Check if there are already points very close to this position on the wall
    const surfacePoints = surface.points[targetSurfaceIndex];
    for (let i = 0; i < surfacePoints.length; i++) {
      if (getPointDistance(closestPoint, surfacePoints[i]) < minDistance) {
        showWarning(t('planner.notifications.pointAlreadyExists') || 'A corner already exists near this position.');
        return;
      }
    }

    // Insert the new point into the surface
    persist(); // Save current state for undo
    setSurface(current => ({
      ...current,
      points: insertPointInWall(current.points, targetSurfaceIndex, targetWallIndex, closestPoint)
    }));

    // Automatically select the newly created corner
    // The new corner is inserted at targetWallIndex + 1
    const newCornerIndex = targetWallIndex + 1;
    dispatch({
      type: 'edit-corner',
      payload: {
        wallIndex: newCornerIndex,
        surfaceIndex: targetSurfaceIndex
      }
    });

    showSuccess(t('planner.notifications.pointAdded') || 'New corner added to wall');
  };

  const editable = state.editable && (currentSurface === null || currentSurface?.idle);
  
  return (
    <div className="relative">
      <TouchInstructions />
      {surfaceEditorOpen && (<PatternEditor className="" onClose={() => setSurfaceEditorOpen(false)} onSubmit={handleSurfaceEditorSubmit} value={surface.pattern} />)}
      
      {/* Main toolbar - responsive positioning and sizing */}
      <div className={classMerge(
        "absolute z-10 flex items-center bg-gray-100 shadow-md p-1 gap-2 rounded-lg",
        "left-2 top-2 flex-col w-12", // mobile
        "md:left-1/2 md:top-2 md:-translate-x-1/2 md:flex-row md:w-auto", // desktop 
      )}>
        <Tooltip 
          text={t('planner.ui.editMode')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => dispatch({type: 'default'})} 
              active={['default', 'edit-wall', 'edit-corner', 'edit-surface'].includes(state.mode)} 
              icon={<SplinePointer />}
            />
          } />
        <Tooltip 
          text={t('planner.ui.previewMode')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => dispatch({type: 'preview'})} 
              active={state.mode === 'preview'} 
              icon={<Hand />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        <Tooltip 
          text={t('planner.ui.addSurface')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => dispatch({type: 'add-surface'})} 
              active={state.mode === 'add-surface'} 
              icon={<SquaresUnite />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        <Tooltip 
          text={t('planner.ui.subtractSurface')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => dispatch({type: 'subtract-surface'})} 
              active={state.mode === 'subtract-surface'} 
              icon={<SquaresSubtract />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        <Tooltip 
          text={t('planner.ui.drawWalls')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => dispatch({type: 'draw-walls'})} 
              active={state.mode === 'draw-walls'} 
              icon={<Waypoints />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        <Tooltip 
          text={t('planner.ui.editPattern')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => setSurfaceEditorOpen(true)} 
              disabled={surface.points.length === 0}
              icon={<PencilRuler />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        
        {/* Separator */}
        <div className={classMerge(
          "w-6 h-0 border-t border-solid border-t-black", // mobile
          "md:h-6 md:w-0 md:border-l  md:border-l-black" // desktop
        )} />
        
        <Tooltip 
          text={t('planner.ui.undo')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => { 
                dispatch({ type: 'default' }); 
                undo(); 
              }} 
              disabled={!canUndo} 
              icon={<Undo />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        <Tooltip 
          text={t('planner.ui.redo')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => { 
                dispatch({ type: 'default' }); 
                redo(); 
              }} 
              disabled={!canRedo} 
              icon={<Redo />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        
        <Tooltip 
          text={t('planner.ui.saveToBrowser')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => {
                try {
                  saveToLocalStorage('surface', surface);
                  showSuccess(t('planner.notifications.saveSuccess') || 'Surface saved to browser');
                } catch (error) {
                  console.error('Save failed:', error);
                  showError(t('planner.notifications.saveError') || 'Failed to save surface');
                }
              }} 
              icon={<Save />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        <Tooltip 
          text={t('planner.ui.downloadAsFile')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => downloadSurface()} 
              icon={<Download />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        <Tooltip 
          text={t('planner.ui.uploadFile')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => {document.getElementById('upload-surface')?.click()}} 
              icon={<Upload />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
          } />
        <Tooltip 
          text={t('planner.ui.print')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={handlePrint} 
              icon={<Printer />} 
              className={isTouchDevice ? "w-10 h-10" : ""}
            />
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
      
      {/* Zoom controls - repositioned for touch devices */}
      <div className={classMerge(
        "absolute z-10 bg-gray-100 shadow-md p-1 rounded-lg flex items-center justify-center",
        "top-2 right-2 flex-col", // mobile
      )}>
        <Tooltip 
          text={t('planner.ui.zoomIn')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => setGlobalScale(c => c < 300 ? c + 10 : 300)} 
              icon={<ZoomIn />} 
              className={"w-10 h-10 md:w-auto md:h-auto"}
            />
          } />
        <ToolbarButton 
          onClick={() => setGlobalScale(100)} 
          label={`${globalScale.toFixed(0)}%`} 
          className="w-8 h-10 text-xs md:text-sm"
        />
        <Tooltip 
          text={t('planner.ui.zoomOut')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => setGlobalScale(c => c > 0 ? Math.round((c - 10) * 10)/10 : 0)} 
              icon={<ZoomOut />} 
              className={"w-10 h-10 md:w-auto md:h-auto"}
            />
          } />

        {/* Separator */}
        <div className={classMerge(
          "w-6 h-0 border-t border-solid border-t-black my-2", // mobile
        )} />
        <Tooltip 
          text={showPatternDistance ? (t('planner.ui.hidePatternDistance') || 'Hide Pattern Distance') : (t('planner.ui.showPatternDistance') || 'Show Pattern Distance')}
          position={"bottom"}
          disabled={isTouchDevice}
          component={ref => 
            <ToolbarButton 
              ref={ref} 
              onClick={() => setShowPatternDistance(!showPatternDistance)} 
              icon={<Ruler />} 
              className={classMerge(
                "w-10 h-10 md:w-auto md:h-auto",
                showPatternDistance ? "bg-blue-200" : ""
              )}
            />
          } />
      </div>
      {/* Edit corner toolbar */}
      {state.mode === 'edit-corner' && (
        <div className={classMerge(
            "absolute z-10 bg-gray-100 shadow-md p-1 rounded-lg",
              "left-16 top-2 flex flex-col space-y-1 w-12",
              "md:left-1/2 md:top-16 md:-translate-x-1/2 md:flex-row md:w-auto md:gap-2"
          )}>
          <Tooltip 
            text={t('planner.ui.makeRightAngle')}
            position={isTouchDevice ? "right" : "bottom"}
            disabled={isTouchDevice}
            component={ref => 
              <ToolbarButton 
                ref={ref}
                disabled={isRightAngle([surface.points[state.surfaceIndex][state.prevWallIndex], surface.points[state.surfaceIndex][state.wallIndex], surface.points[state.surfaceIndex][state.nextWallIndex]])} 
                onClick={() => makeAngleRight(state.surfaceIndex,state.prevWallIndex, state.wallIndex, state.nextWallIndex)} 
                wide={!isTouchDevice}
                icon={<RightAngle />}
                className="w-10 h-10 md:w-auto md:h-auto"
              />
            } />
          <Tooltip 
            text={t('planner.ui.deleteCorner')}
            position={isTouchDevice ? "right" : "bottom"}
            disabled={isTouchDevice}
            component={ref => 
              <ToolbarButton 
                ref={ref} 
                variant="danger" 
                disabled={surface.points[state.surfaceIndex].length <= 3} 
                onClick={() => removePoints(state.surfaceIndex, [state.wallIndex])} 
                wide={!isTouchDevice}
                icon={<Trash2 />}
                className="w-10 h-10 md:w-auto md:h-auto"
              />
            } />
        </div>
      )}
      
      {/* Edit wall toolbar */}
      {state.mode === 'edit-wall' && (
        <div className={classMerge(
            "absolute z-10 bg-gray-100 shadow-md p-1 rounded-lg",
              "left-16 top-2 flex flex-col space-y-1 w-12",
              "md:left-1/2 md:top-16 md:-translate-x-1/2 md:flex-row md:w-auto md:gap-2"
          )}>
          <Tooltip 
            text={t('planner.ui.deleteWall')}
            position={isTouchDevice ? "right" : "bottom"}
            disabled={isTouchDevice}
            component={ref => 
              <ToolbarButton 
                ref={ref} 
                variant="danger" 
                disabled={true} 
                onClick={() => removePoints(state.surfaceIndex,[state.nextWallIndex])} 
                wide={!isTouchDevice}
                icon={<Trash2 />}
                className="w-10 h-10 md:w-auto md:h-auto"
              />
            } />
        </div>
      )}
      
      {/* Edit surface toolbar */}
      {state.mode === 'edit-surface' && (
        <>
          <div className={classMerge(
            "absolute z-10 bg-gray-100 shadow-md p-1 rounded-lg",
              "left-16 top-2 flex flex-col space-y-1 w-12",
              "md:left-1/2 md:top-16 md:-translate-x-1/2 md:flex-row md:w-auto md:gap-2"
          )}>
            
            {/* Desktop arrows - hidden on touch or when pattern editor is open */}
            {!isTouchDevice && !surfaceEditorOpen && (
              <CursorArrows 
                onDown={movePatternDown}
                onLeft={movePatternLeft}
                onRight={movePatternRight}
                onUp={movePatternUp}
                disabled={surface.pattern.tiles.length === 0}
                variant="narrow"
                className="md:flex hidden"
              />
            )}
            
            <Tooltip 
              text={t('planner.ui.deleteSurface')}
              position={isTouchDevice ? "right" : "bottom"}
              disabled={isTouchDevice}
              component={ref => 
                <ToolbarButton 
                  ref={ref} 
                  variant="danger" 
                  onClick={removeSurface} 
                  wide={!isTouchDevice}
                  icon={<Trash2 />}
                  className="w-10 h-10 md:w-auto md:h-auto"
                />
              } />
          </div>
          
          {/* Mobile arrows - shown on touch devices when pattern editor is closed */}
          {isTouchDevice && !surfaceEditorOpen && (
            <CursorArrows 
              onDown={movePatternDown}
              onLeft={movePatternLeft}
              onRight={movePatternRight}
              onUp={movePatternUp}
              disabled={surface.pattern.tiles.length === 0}
              variant="wide"
              className="absolute z-10 bottom-4 right-4"
            />
          )}
        </>
      )}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        className={classMerge("bg-white planner-stage", 
          state.mode === 'preview' && "cursor-grab",
          state.mode === 'add-surface' && "cursor-crosshair",
          state.mode === 'subtract-surface' && "cursor-crosshair",
          state.mode === 'draw-walls' && "cursor-crosshair",
          state.mode === 'edit-wall' && "default-cursor",
          state.mode === 'edit-corner' && "default-cursor",
          state.mode === 'default' && "default-cursor",
        )}
        onMouseDown={!isTouchDevice ? handleMouseDown : undefined}
        onMouseMove={!isTouchDevice ? handleMouseMove : undefined}
        onMouseUp={!isTouchDevice ? handleMouseUp : undefined}
        onTouchStart={isTouchDevice ? handleTouchStart : undefined}
        onTouchMove={isTouchDevice ? handleTouchMove : undefined}
        onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
        onClick={handleStageClick}
        onDblClick={!isTouchDevice ? handleStageDoubleClick : undefined}
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
              onClick={handleSurfaceClick} 
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
          {surface.points.map((surfacePlane, surfaceIndex) => {
            return (
              <React.Fragment key={surfaceIndex}>
                {surfacePlane.map((pt, i) => {
                  const nxt = surface.points[surfaceIndex][(i + 1) % surface.points[surfaceIndex].length];
                  const prev = surface.points[surfaceIndex][(i - 1 + surface.points[surfaceIndex].length) % surface.points[surfaceIndex].length];
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
                        edit={state.mode === 'edit-wall' && i === state.wallIndex && surfaceIndex === state.surfaceIndex} 
                        disabled={!editable}
                        onClick={(p, idx) => dispatch({type: 'edit-wall', payload: { wallIndex: idx, surfaceIndex }})}
                        onDoubleClick={handleWallDoubleClick}
                      />}
                      <WallDimension
                        pointA={pt}
                        pointB={nxt}
                        scale={0.01}
                        globalScale={globalScale}
                      />
                      {isNonRightAngle && (
                        <AngleMarker x={pt[0]} y={pt[1]} angle={sweepAngleDeg} rotation={rotationStartDeg} />
                      )}
                      {showPatternDistance && (
                        <PatternDistance 
                          pointA={pt} 
                          pointB={nxt} 
                          pattern={surface.pattern}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            )
          })}
          {editable && surface.points.map((surfacePlane, surfaceIndex) => {
            return (
              <React.Fragment key={surfaceIndex}>
                {surfacePlane.map((pt, i) => (
                  <CornerEdit
                    key={`${surfaceIndex}_${i}`}
                    x={pt[0]}
                    y={pt[1]}
                    wallIndex={i}
                    edit={state.mode === 'edit-corner' && i === state.wallIndex && surfaceIndex === state.surfaceIndex}
                    onClick={(idx) => dispatch({ type: 'edit-corner', payload: { wallIndex: idx, surfaceIndex } })}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragMove={handleDragCornerMove}
                  />
                ))}
              </React.Fragment>
            )
          })}
          {state.mode === 'edit-wall' && (state.isHorizontal || state.isVertical) ? (
              <MoveHandler 
                pointA={surface.points[state.surfaceIndex][state.wallIndex!]}
                pointB={surface.points[state.surfaceIndex][state.nextWallIndex!]}
                orientation={state.isHorizontal ? "horizontal" : "vertical"}
                onDragStart={handleDragStart}
                onDragMove={handleWallDragMove}
                onDragEnd={handleDragEnd}
                  />
            ) : null}
        </Layer>
        <Layer>
          {/* Drawing walls visualization */}
          {state.mode === 'draw-walls' && (
            <>
              {/* Completed walls */}
              {drawingPoints.length > 1 && (
                <Line
                  points={drawingPoints.flat()}
                  stroke="black"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
              
              {/* Current wall being drawn (drag preview) */}
              {isDrawingWall && currentWallStart && currentMousePos && (
                <>
                  <Line
                    points={[
                      ...currentWallStart,
                      ...currentMousePos
                    ]}
                    stroke={isSurfaceIntersecting([...drawingPoints, currentWallStart, currentMousePos]) ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.5)"}
                    strokeWidth={2}
                    lineCap="round"
                    dash={[4, 4]}
                  />
                  {/* Dimension for current wall being drawn */}
                  <WallDimension
                    pointA={currentWallStart}
                    pointB={currentMousePos}
                    scale={0.01}
                    globalScale={globalScale}
                  />
                </>
              )}
              
              {/* Next wall preview (from last point to current mouse) */}
              {!isDrawingWall && drawingPoints.length > 0 && currentMousePos && (
                <>
                  <Line
                    points={[
                      ...drawingPoints[drawingPoints.length - 1],
                      ...currentMousePos
                    ]}
                    stroke={"rgba(0, 0, 0, 0.2)"}
                    strokeWidth={2}
                    lineCap="round"
                    dash={[8, 8]}
                  />
                  {/* Dimension for next wall preview */}
                  <WallDimension
                    pointA={drawingPoints[drawingPoints.length - 1]}
                    pointB={currentMousePos}
                    scale={0.01}
                    globalScale={globalScale}
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
              
              {/* Current drawing start point indicator */}
              {currentWallStart && (
                <Line
                  points={[0, 0, 0, 0]}
                  x={currentWallStart[0]}
                  y={currentWallStart[1]}
                  stroke="blue"
                  strokeWidth={8}
                  lineCap="round"
                />
              )}
            </>
          )}
        </Layer>
      </Stage>
      
      {/* Dimension Information Panel */}
      <DimensionInfo
        surfacePoints={defferdSurfacePoints}
        selectedWall={state.mode === 'edit-wall' ? {
          surfaceIndex: state.surfaceIndex,
          wallIndex: state.wallIndex
        } : undefined}
        selectedCorner={state.mode === 'edit-corner' ? {
          surfaceIndex: state.surfaceIndex,
          wallIndex: state.wallIndex
        } : undefined}
        mode={state.mode}
      />
      
      {state.mode === 'edit-wall' && (
        <WallDimensionInput
          pointA={surface.points[state.surfaceIndex][state.wallIndex]}
          pointB={surface.points[state.surfaceIndex][(state.wallIndex + 1) % surface.points[state.surfaceIndex].length]}
          scale={0.01}
          autoFocus={!isTouchDevice}
          key={state.wallIndex}
          globalScale={globalScale}
          stagePosition={stageRef.current?.position() || { x: 0, y: 0 }}
          onDimensionChange={(newLength) => handleWallDimensionChange(state.surfaceIndex,state.wallIndex, newLength)}
          keepRightAngles={keepRightAngles}
          onKeepRightAnglesChange={setKeepRightAngles}
        />
      )}
    </div>
  );
};

export const DynamicSizePlanner = () => {
  return (
    <NotificationProvider>
      <ResizePlanner render={(dimensions) => (
        <Planner width={dimensions.width} height={dimensions.height} />
      )} />
      <NotificationContainer />
    </NotificationProvider>
  );
}