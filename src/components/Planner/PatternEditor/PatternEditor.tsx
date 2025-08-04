import React, { useMemo, useState } from "react";
import { useTranslation } from '@/hooks/useTranslation';
import { useTouchDevice } from '@/hooks/useTouchDevice';
import { classMerge } from "@/utils/classMerge";
import { v4 as uuid} from 'uuid'

import { ToolbarButton } from "../../ToolbarButton";
import { CircleCheck, Copy, Diamond, Eye, EyeOff, Hexagon, RectangleHorizontal, RectangleVertical, RotateCcw, RulerDimensionLine, Square, Trash2, Triangle, X, ZoomIn, ZoomOut, RotateCcw as ResetZoom } from "lucide-react";

import { Pattern, Point, TileType } from "../types"
import { getBoundingBox, rotateShape, moveTo, getAngles, getCircumscribedCircle } from "../utils"
import { setNoneCursor, setMoveCursor, setEwResizeCursor, setNsResizeCursor, removeCustomCursor } from "../domUtils"


import { TileEventData } from "./Tile";
import { PatternCanvas } from "./PatternCanvas"
import Konva from "konva";
import { ResizePlanner } from "../ResizePlanner";
import { PatternButton } from "./PatternButton";

import readyPatternsJson from "./ready_patterns.json"
import { CursorArrows } from "@/components/CursorArrows";
import { Tooltip } from "@/components/Tooltip";

type ReadyPattern = {
  displayScale: number;
  pattern: Pattern;
}

const READY_TO_USE_PATTERNS: ReadyPattern[] = readyPatternsJson as ReadyPattern[];

interface PatternEditorProps {
  className?: string;
  onClose?: () => void;
  value?: Pattern;
  onSubmit?: (pattern: Pattern) => void;
}

const getEquilateralTrianglePoints = (sideLength: number): Point[] => {
  const height = Math.sqrt(3) / 2 * sideLength;
  return [
    [0, 0],
    [sideLength, 0],
    [sideLength / 2, height]
  ];
}

const getSquarePoints = (sideLength: number): Point[] => {
  return [
    [0, 0],
    [sideLength, 0],
    [sideLength, sideLength],
    [0, sideLength]
  ];
}

export const PatternEditor: React.FC<PatternEditorProps> = ({className, value, onClose, onSubmit}) => {
  const { t } = useTranslation();
  const isTouchDevice = useTouchDevice();

  const [pattern, setPattern] = useState<Pattern>(value || {
    tiles: [],
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    tilesGap: 0,
    scale: 0.2,
    gapColor: "#000000"
  });

  const [edited, setEdited] = useState<string | null>(null)
  const [zoom, setZoom] = useState<number>(1)
  const [panOffset, setPanOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const addTriangle = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const trianglePoints = getEquilateralTrianglePoints(100);
      const points = moveTo(trianglePoints, items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: uuid(),
        points: points,
        color: "#d6d6d6",
        type: "triangle",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (prev.tiles.length === 0) {
        const { width, height } = getBoundingBox(trianglePoints);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }

      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const addRectangleVertical = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const points = moveTo([
        [0, 0],
        [50, 0],
        [50, 200],
        [0, 200]
      ], items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: uuid(),
        type: "rectangle",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const addRectangleHorizontal = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const points = moveTo([
        [0, 0],
        [200, 0],
        [200, 50],
        [0, 50]
      ], items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: uuid(),
        type: "rectangle",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const addSquare = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      
      const points = moveTo(getSquarePoints(100), items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: uuid(),
        type: "square",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const addDiamond = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const points = moveTo([
        [50, 0],
        [75, 43.3],
        [50, 86.6],
        [25, 43.3]
      ], items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: uuid(),
        type: "diamond",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    })
  };

  const addHexagon = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const points = moveTo([
        [50, 0],
        [100, 25],
        [100, 81],
        [50, 106],
        [0, 81],
        [0, 25]
      ], items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: uuid(),
        type: "hexagon",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const getPosition = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    const position = stage?.getPointerPosition()
    return position || null;
  }

  const [activeData, setActiveData] = useState<{ tile: TileType, action: TileEventData['action'], isSecondary: boolean } | null>(null)
  const [rotateCursor, setRotateCursor] = useState<boolean>(false)
  const cursorRef = React.useRef<SVGSVGElement>(null);
  const initialPosition = React.useRef<{ x: number, y: number } | null>(null);
  const lastTouchDistance = React.useRef<number | null>(null);
  const lastTouchCenter = React.useRef<{ x: number, y: number } | null>(null);
  const isPanning = React.useRef<boolean>(false);
  const lastPanPosition = React.useRef<{ x: number, y: number } | null>(null);
  const panStartTime = React.useRef<number>(0);
  const panVelocity = React.useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return null;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchCenter = (touches: TouchList) => {
    if (touches.length < 2) return null;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const onBackgroundClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Only deselect if not panning (to avoid deselecting during touch pan gestures)
    if(e.target === e.currentTarget && !isPanning.current) { 
      setEdited(null);
    }
  }

  const onTileClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, id: string) => {
    if (e.evt instanceof MouseEvent && !isTouchDevice) {
      setMoveCursor(e as Konva.KonvaEventObject<MouseEvent>);
    }
    setEdited(id);
    const tileIndex = pattern.tiles.findIndex(tile => tile.id === id)
    setPattern(prev => {
      const tiles = [...prev.tiles];
      if (tileIndex > -1) {
        const tile = tiles[tileIndex];
        tiles.splice(tileIndex, 1);
        tiles.push(tile);
      }
      return {
        ...prev,
        tiles,
      }
    })
  }

  const onTileDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => {
    const tile = pattern.tiles.find(t => t.id === data.id);
    const position = getPosition(e) 
    if (!tile || !position) return;
    initialPosition.current = position;
    setActiveData({ tile, action: data.action, isSecondary: data.isSecondary });
  }

  const onTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length === 2) {
      // Start pinch gesture
      const distance = getTouchDistance(e.evt.touches);
      const center = getTouchCenter(e.evt.touches);
      lastTouchDistance.current = distance;
      lastTouchCenter.current = center;
      isPanning.current = false; // Disable panning during pinch
      e.evt.preventDefault();
    } else if (e.evt.touches.length === 1 && !activeData) {
      // Start single-finger panning (only if not interacting with tiles)
      const touch = e.evt.touches[0];
      const stage = e.target.getStage();
      if (stage) {
        const stageRect = stage.container().getBoundingClientRect();
        lastPanPosition.current = {
          x: touch.clientX - stageRect.left,
          y: touch.clientY - stageRect.top
        };
        isPanning.current = true;
        panStartTime.current = Date.now();
        panVelocity.current = { x: 0, y: 0 };
      }
    }
  };

  const onMouseUp = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    setActiveData(null);
    setRotateCursor(false);
    
    // Reset pinch gesture tracking
    if (e.evt instanceof TouchEvent) {
      lastTouchDistance.current = null;
      lastTouchCenter.current = null;
      isPanning.current = false;
      lastPanPosition.current = null;
      panStartTime.current = 0;
      panVelocity.current = { x: 0, y: 0 };
    }
    
    if (e.evt instanceof MouseEvent && !isTouchDevice) {
      removeCustomCursor(e as Konva.KonvaEventObject<MouseEvent>);
    }
  }
  const onTileEnter = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => {
    if (!activeData && data.action === "rotate" && !isTouchDevice) {
      setRotateCursor(true);
      if (e.evt instanceof MouseEvent) {
        setNoneCursor(e as Konva.KonvaEventObject<MouseEvent>);
        setTimeout(() => {
          if (cursorRef.current && e.evt instanceof MouseEvent) {
            cursorRef.current.style = `left: ${e.evt.x}px; top: ${e.evt.y}px;`;
          }
        }, 10);
      }
    }

    if (!activeData && data.action === "resize-ns" && !isTouchDevice) {
      setRotateCursor(false);
      if (e.evt instanceof MouseEvent) {
        setNsResizeCursor(e as Konva.KonvaEventObject<MouseEvent>);
      }
    }
    if (!activeData && data.action === "resize-ew" && !isTouchDevice) {
      setRotateCursor(false);
      if (e.evt instanceof MouseEvent) {
        setEwResizeCursor(e as Konva.KonvaEventObject<MouseEvent>);
      }
    }
    if (!activeData && data.action === "move" && !isTouchDevice) {
      setRotateCursor(false);
      if (e.evt instanceof MouseEvent) {
        setMoveCursor(e as Konva.KonvaEventObject<MouseEvent>);
      }
    }
  }
  const onTileLeave = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, data: TileEventData) => {
    if (!activeData && data.action === "rotate" && !isTouchDevice) {
      setRotateCursor(false);
      if (e.evt instanceof MouseEvent) {
        removeCustomCursor(e as Konva.KonvaEventObject<MouseEvent>);
      }
    }
    if (!activeData && (data.action === "resize-ns" || data.action === "resize-ew") && !isTouchDevice) {
      setRotateCursor(false);
      if (e.evt instanceof MouseEvent) {
        removeCustomCursor(e as Konva.KonvaEventObject<MouseEvent>);
      }
    }

    if (!activeData && data.action === "move" && !isTouchDevice) {
      setRotateCursor(false);
      if (e.evt instanceof MouseEvent) {
        removeCustomCursor(e as Konva.KonvaEventObject<MouseEvent>);
      }
    }
  }
  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (rotateCursor && cursorRef.current && e.evt instanceof MouseEvent && !isTouchDevice) {
      cursorRef.current.style = `left: ${e.evt.x}px; top: ${e.evt.y}px;`;
    }

    // Handle single-finger touch panning
    if (e.evt instanceof TouchEvent && e.evt.touches.length === 1 && isPanning.current && lastPanPosition.current && !activeData) {
      const touch = e.evt.touches[0];
      const stage = e.target.getStage();
      if (stage) {
        const stageRect = stage.container().getBoundingClientRect();
        const currentX = touch.clientX - stageRect.left;
        const currentY = touch.clientY - stageRect.top;
        
        // Calculate pan delta
        const deltaX = currentX - lastPanPosition.current.x;
        const deltaY = currentY - lastPanPosition.current.y;
        
        // Track velocity for smoother experience
        const currentTime = Date.now();
        const timeDelta = Math.max(currentTime - panStartTime.current, 1);
        panVelocity.current = {
          x: deltaX / timeDelta * 1000, // pixels per second
          y: deltaY / timeDelta * 1000
        };
        
        // Update pan offset with constraints
        const canvasWidth = stage.width() || 0;
        const canvasHeight = stage.height() || 0;
        
        setPanOffset(prev => {
          const newOffset = {
            x: prev.x + deltaX,
            y: prev.y + deltaY
          };
          return constrainPanOffset(newOffset, canvasWidth, canvasHeight);
        });
        
        // Update last position and time
        lastPanPosition.current = { x: currentX, y: currentY };
        panStartTime.current = currentTime;
      }
      e.evt.preventDefault();
      return;
    }

    // Handle pinch zoom for touch devices
    if (e.evt instanceof TouchEvent && e.evt.touches.length === 2 && lastTouchDistance.current && lastTouchCenter.current) {
      // Disable panning during pinch
      isPanning.current = false;
      lastPanPosition.current = null;
      
      const currentDistance = getTouchDistance(e.evt.touches);
      const currentCenter = getTouchCenter(e.evt.touches);
      
      if (currentDistance && currentCenter) {
        // Calculate zoom change
        const zoomChange = currentDistance / lastTouchDistance.current;
        const newZoom = Math.min(Math.max(zoom * zoomChange, 0.5), 3); // Limit zoom between 0.5x and 3x
        
        // Calculate pan offset to zoom towards pinch center
        const stage = e.target.getStage();
        if (stage) {
          const stageRect = stage.container().getBoundingClientRect();
          const centerX = currentCenter.x - stageRect.left;
          const centerY = currentCenter.y - stageRect.top;
          
          // Update zoom and pan
          setZoom(newZoom);
          
          // Pan to keep the pinch center in the same position
          const zoomRatio = newZoom / zoom;
          const newPanX = panOffset.x + (centerX - panOffset.x) * (1 - zoomRatio);
          const newPanY = panOffset.y + (centerY - panOffset.y) * (1 - zoomRatio);
          setPanOffset({ x: newPanX, y: newPanY });
        }
        
        lastTouchDistance.current = currentDistance;
        lastTouchCenter.current = currentCenter;
      }
      e.evt.preventDefault();
      return;
    }
    
    const position = getPosition(e) 
    if (position && activeData && activeData.action === 'rotate' && initialPosition.current) {
      const tile = activeData.tile;
      const canvasWidth = e.target.getStage()?.width() || 0;
      const canvasHeight = e.target.getStage()?.height() || 0;
      const centerX = tile.metadata.centerX + (canvasWidth/2 - pattern.width/2);
      const centerY = tile.metadata.centerY + (canvasHeight/2 - pattern.height/2);
      const { interiorAngleMagnitudeDeg } = getAngles([[position.x, position.y],  [centerX, centerY], [initialPosition.current.x, initialPosition.current.y]])
      const rotationAngle = Math.round(interiorAngleMagnitudeDeg)
      const angle = (tile.metadata.angle + rotationAngle) % 360;
      const newTile = {
        ...tile,
        points: rotateShape(tile.points, rotationAngle, [tile.metadata.centerX, tile.metadata.centerY]),
        metadata: {
          ...tile.metadata,
          angle,
        }
      }
      setPattern(prev => ({
        ...prev,
        tiles: prev.tiles.map(t => t.id === tile.id ? newTile : t)
      }))
    }

    // --- Resize shapes ---
    if (position && activeData && (activeData.action === 'resize-ns' || activeData.action === 'resize-ew') && initialPosition.current) {
      const tile = activeData.tile;
      const center = [tile.metadata.centerX, tile.metadata.centerY];
      const newTile = {
          ...tile,
          points: [] as Point[],
        };
      
      setPattern(prev => {
        const patternScale = prev.scale * 1000;
        
        if (activeData.tile.type === 'rectangle') {
          // For rectangles, use direct mouse movement distance with reduced sensitivity
          const sensitivity = isTouchDevice ? 0.5 : 0.25; // Increased sensitivity for touch
          const dx = (position.x - initialPosition.current!.x) * sensitivity;
          const dy = (position.y - initialPosition.current!.y) * sensitivity;
          
          if (activeData.action === 'resize-ew') {
            // Horizontal resize - move left and right edges by dx/2 each
            const newPoints = tile.points.map<Point>(point => [
              point[0] < center[0] ? 
                Math.round((point[0] - dx/2) * patternScale) / patternScale : 
                Math.round((point[0] + dx/2) * patternScale) / patternScale,
              point[1]
            ]);
            newTile.points = newPoints;
          } else if (activeData.action === 'resize-ns') {
            // Vertical resize - move top and bottom edges by dy/2 each
            const newPoints = tile.points.map<Point>(point => [
              point[0],
              point[1] < center[1] ? 
                Math.round((point[1] + dy/2) * patternScale) / patternScale : 
                Math.round((point[1] - dy/2) * patternScale) / patternScale
            ]);
            newTile.points = newPoints;
          }
        } else {
          // For other shapes (triangle, pentagon, etc.), use proportional scaling based on distance from center
          let scale = 1;
          
          if (activeData.action === 'resize-ew') {
            // Use horizontal movement for uniform scaling with reduced sensitivity
            const sensitivity = isTouchDevice ? 0.5 : 0.25; // Increased sensitivity for touch
            const initialDist = initialPosition.current!.x - center[0];
            const mouseMovement = (position.x - initialPosition.current!.x) * sensitivity;
            const currentDist = initialDist + mouseMovement;
            if (initialDist !== 0) {
              scale = currentDist / initialDist;
            }
          } else if (activeData.action === 'resize-ns') {
            // Use vertical movement for uniform scaling with reduced sensitivity
            const sensitivity = isTouchDevice ? 0.5 : 0.25; // Increased sensitivity for touch
            const initialDist = initialPosition.current!.y - center[1];
            const mouseMovement = (position.y - initialPosition.current!.y) * sensitivity;
            const currentDist = initialDist + mouseMovement;
            if (initialDist !== 0) {
              scale = currentDist / initialDist;
            }
          }
          
          // Apply uniform scaling from center
          const newPoints = tile.points.map<Point>(point => [
            Math.round((center[0] + (point[0] - center[0]) * scale) * patternScale) / patternScale,
            Math.round((center[1] + (point[1] - center[1]) * scale) * patternScale) / patternScale
          ]);
          newTile.points = newPoints;
        }

        return {
          ...prev,
          tiles: prev.tiles.map(t => t.id === tile.id ? newTile : t)
      }});
    }

    if (position && activeData && activeData.action === 'move' && initialPosition.current) {
      const tile = activeData.tile;
      let dx = position.x - initialPosition.current.x;
      let dy = position.y - initialPosition.current.y;
      const movedPoints = tile.points.map<Point>(point => [point[0] + dx, point[1] + dy]);
      // --- Snapping logic (edge-to-edge) ---
      const SNAP_THRESHOLD = isTouchDevice ? 8 : 4; // Increased threshold for touch devices
      let snapDx = 0;
      let snapDy = 0;
      // Get bounding box for moved tile
      const movedXs = movedPoints.map(p => p[0]);
      const movedYs = movedPoints.map(p => p[1]);
      const movedBox = {
        minX: Math.min(...movedXs),
        maxX: Math.max(...movedXs),
        minY: Math.min(...movedYs),
        maxY: Math.max(...movedYs),
      };
      // Snap to other tile edges
      const otherTiles = pattern.tiles.filter(t => t.id !== tile.id);
      for (const t of otherTiles) {
        const xs = t.points.map(p => p[0]);
        const ys = t.points.map(p => p[1]);
        const box = {
          minX: Math.min(...xs),
          maxX: Math.max(...xs),
          minY: Math.min(...ys),
          maxY: Math.max(...ys),
        };
        // Check all edge pairs (left, right, top, bottom)
        const edgePairs = [
          { movedEdge: movedBox.minX, otherEdge: box.maxX, axis: 'x', sign: 1 }, // left to right
          { movedEdge: movedBox.maxX, otherEdge: box.minX, axis: 'x', sign: 1 }, // right to left
          { movedEdge: movedBox.minX, otherEdge: box.minX, axis: 'x', sign: 1 }, // left to left
          { movedEdge: movedBox.maxX, otherEdge: box.maxX, axis: 'x', sign: 1 }, // right to right
          { movedEdge: movedBox.minY, otherEdge: box.maxY, axis: 'y', sign: 1 }, // top to bottom
          { movedEdge: movedBox.maxY, otherEdge: box.minY, axis: 'y', sign: 1 }, // bottom to top
          { movedEdge: movedBox.minY, otherEdge: box.minY, axis: 'y', sign: 1 }, // top to top
          { movedEdge: movedBox.maxY, otherEdge: box.maxY, axis: 'y', sign: 1 }, // bottom to bottom
        ];
        for (const pair of edgePairs) {
          const diff = pair.otherEdge - pair.movedEdge;
          if (Math.abs(diff) <= SNAP_THRESHOLD) {
            if (pair.axis === 'x') snapDx = diff;
            if (pair.axis === 'y') snapDy = diff;
            break;
          }
        }
        if (snapDx !== 0 || snapDy !== 0) break;
      }
      // Snap to pattern edges (canvas edges)
      if (snapDx === 0 && snapDy === 0) {
        const patternEdges = [
          { axis: 'x', value: 0, edge: movedBox.minX },
          { axis: 'x', value: pattern.width, edge: movedBox.maxX },
          { axis: 'y', value: 0, edge: movedBox.minY },
          { axis: 'y', value: pattern.height, edge: movedBox.maxY },
        ];
        for (const edge of patternEdges) {
          const diff = edge.value - edge.edge;
          if (Math.abs(diff) <= SNAP_THRESHOLD) {
            if (edge.axis === 'x') snapDx = diff;
            if (edge.axis === 'y') snapDy = diff;
            break;
          }
        }
      }
      dx += snapDx;
      dy += snapDy;
      const newPoints = tile.points.map<Point>(point => [
        point[0] + dx,
        point[1] + dy
      ]);
      const newTile = {
        ...tile,
        points: newPoints,
        metadata: {
          ...tile.metadata,
          centerX: tile.metadata.centerX + dx,
          centerY: tile.metadata.centerY + dy
        }
      };
      setPattern(prev => ({
        ...prev,
        tiles: prev.tiles.map(t => t.id === tile.id ? newTile : t)
      }));
    }
  }

  const removeTile = () => {
    if (edited) {
      setPattern(prev => {
        const tiles = prev.tiles.filter(t => edited !== t.id)
        if (tiles.length > 0) {
          return{
            ...prev,
            tiles,
          }
        } else {
          return {
            ...prev,
            tiles: [],
          }
        }
      })
      setEdited(null);
    }
  }

  const duplicateTile = () => {
    if (edited) {
      const tile = pattern.tiles.find(t => t.id === edited);
      if (tile) {
        const newTile = {
          ...tile,
          id: uuid(),
          points: tile.points.map<Point>(point => [
            point[0] + 10,
            point[1] + 10
          ]),
          metadata: {
            ...tile.metadata,
            centerX: tile.metadata.centerX + 10,
            centerY: tile.metadata.centerY + 10
          }
        }
        setPattern(prev => ({
          ...prev,
          tiles: [...prev.tiles, newTile]
        }))
        setEdited(newTile.id);
      }
    }
  }
  const {moveTileDown, moveTileLeft, moveTileRight, moveTileUp} = useMemo(() => {
    const moveTile = (direction: 'up' | 'down' | 'left' | 'right') => {
      if (edited) {
        setPattern(prev => {
          const tile = prev.tiles.find(t => t.id === edited);
          if (!tile) return prev;
          const moveAmount = 1; // px
          let dx = 0;
          let dy = 0;
          switch (direction) {
            case 'up':
              dy = -moveAmount;
              break;
            case 'down':
              dy = moveAmount;
              break;
            case 'left':
              dx = -moveAmount;
              break;
            case 'right':
              dx = moveAmount;
              break;
          }
          const newPoints = tile.points.map<Point>(point => [
            point[0] + dx,
            point[1] + dy
          ]);
          const newTile = {
            ...tile,
            points: newPoints,
            metadata: {
              ...tile.metadata,
              centerX: tile.metadata.centerX + dx,
              centerY: tile.metadata.centerY + dy
            }
          };
          return {
            ...prev,
            tiles: prev.tiles.map(t => t.id === tile.id ? newTile : t)
          };
        });
      }
    }

    return {
      moveTileUp: () => moveTile('up'),
      moveTileDown: () => moveTile('down'),
      moveTileLeft: () => moveTile('left'),
      moveTileRight: () => moveTile('right'),
    }
  }, [edited])

  const resetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const constrainPanOffset = (offset: { x: number, y: number }, canvasWidth: number, canvasHeight: number) => {
    // Allow some extra panning beyond the canvas boundaries for better UX
    const maxPanX = canvasWidth * 0.5;
    const maxPanY = canvasHeight * 0.5;
    const minPanX = -canvasWidth * 0.5;
    const minPanY = -canvasHeight * 0.5;
    
    return {
      x: Math.max(minPanX, Math.min(maxPanX, offset.x)),
      y: Math.max(minPanY, Math.min(maxPanY, offset.y))
    };
  };
  

  const [preview, setPreview] = useState<boolean>(() => pattern.tiles.length > 0);

  return (
    <div className="bg-black/25 absolute top-0 left-0 w-full h-full z-20 p-0 md:p-4">
      <div className={classMerge("bg-gray-100 shadow-md rounded-none md:rounded-lg flex flex-col flex-nowrap gap-4 p-2 md:p-4 w-full h-full relative", className)}>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-black">{t('planner.patternEditor.title')}</h1>
          <Tooltip 
            text={t('planner.patternEditor.close')}
            position="bottom"
            component={ref => 
              <ToolbarButton ref={ref} onClick={onClose} icon={<X />} />
            } />
        </div>
        <div className="">
          <h2 className="text-lg font-bold text-black">{t('planner.patternEditor.patterns')}</h2>
          <div className="flex flex-wrap gap-2">
            {READY_TO_USE_PATTERNS.map((readyPattern, i) => (
              <PatternButton 
                key={i}
                pattern={readyPattern.pattern}
                displayScale={readyPattern.displayScale}
                onClick={(p) => {
                  setPattern({...p, tiles: p.tiles.map(t => ({...t, id: uuid() }))});
                }}
              />))}
          </div>
        </div>
        <div className="relative grow flex flex-col">
          <div className={classMerge(
            "absolute z-10 top-2 flex items-center bg-gray-100 shadow-md p-1 space-x-2 rounded-lg",
              "left-1/2 -translate-x-1/2 flex-row" // Desktop: horizontal centered
          )}>
            <Tooltip 
              text={t('planner.patternEditor.addTriangle')}
              position="bottom"
              disabled={isTouchDevice}
              component={ref => 
                <ToolbarButton 
                  ref={ref} 
                  onClick={() => addTriangle()} 
                  icon={<Triangle />} 
                  className="w-10 h-10 md:w-auto md:h-auto"
                />
              } />
            <Tooltip 
              text={t('planner.patternEditor.addRectangleHorizontal')}
              position="bottom"
              disabled={isTouchDevice}
              component={ref => 
                <ToolbarButton 
                  ref={ref} 
                  onClick={() => addRectangleHorizontal()} 
                  icon={<RectangleHorizontal />} 
                  className="w-10 h-10 md:w-auto md:h-auto"
                />
              } />
            <Tooltip 
              text={t('planner.patternEditor.addRectangleVertical')}
              position="bottom"
              disabled={isTouchDevice}
              component={ref => 
                <ToolbarButton 
                  ref={ref} 
                  onClick={() => addRectangleVertical()} 
                  icon={<RectangleVertical />} 
                  className="w-10 h-10 md:w-auto md:h-auto"
                />
              } />
            <Tooltip 
              text={t('planner.patternEditor.addSquare')}
              position="bottom"
              disabled={isTouchDevice}
              component={ref => 
                <ToolbarButton 
                  ref={ref} 
                  onClick={() => addSquare()} 
                  icon={<Square />} 
                  className="w-10 h-10 md:w-auto md:h-auto"
                />
              } />
            <Tooltip 
              text={t('planner.patternEditor.addDiamond')}
              position="bottom"
              disabled={isTouchDevice}
              component={ref => 
                <ToolbarButton 
                  ref={ref} 
                  onClick={() => addDiamond()} 
                  icon={<Diamond />} 
                  className="w-10 h-10 md:w-auto md:h-auto"
                />
              } />
            <Tooltip 
              text={t('planner.patternEditor.addHexagon')}
              position="bottom"
              disabled={isTouchDevice}
              component={ref => 
                <ToolbarButton 
                  ref={ref} 
                  onClick={() => addHexagon()} 
                  icon={<Hexagon />} 
                  className="w-10 h-10 md:w-auto md:h-auto"
                />
              } />
          </div>
          <div className="grow">
            <ResizePlanner render={(dimensions) => <PatternCanvas 
              preview={preview}
              pattern={pattern}
              height={dimensions.height}
              width={dimensions.width}
              zoom={zoom}
              panOffset={panOffset}
              isDragging={activeData !== null}
              selectedId={edited}
              isTouchDevice={isTouchDevice}
              onStageClick={onBackgroundClick}
              onStageMouseMove={onMouseMove}
              onStageMouseUp={onMouseUp}
              onStageTouchStart={onTouchStart}
              onTileClick={onTileClick}
              onTileDown={onTileDown}
              onTileEnter={onTileEnter}
              onTileLeave={onTileLeave}            
            />
            } />
          </div>
          <div className={classMerge(
            "absolute flex gap-1 items-center justify-center px-4 bg-gray-100 shadow-md p-1 space-x-2 rounded-lg",
            "bottom-2 left-2 right-2 flex-wrap", // Touch: full width at bottom
            "md:bottom-3 md:left-1/2 md:right-auto md:-translate-x-1/2 md:flex-nowrap" // Desktop: centered
          )}>
              <RulerDimensionLine className="text-black md:block hidden" />
              <input 
                type="number" 
                min={0} 
                step={1} 
                disabled={!pattern.tiles.length} 
                className={classMerge(
                  "text-black text-center border border-black rounded-md bg-gray-100",
                  "w-16 h-10 md:w-20 md:h-8"
                )}
                value={pattern.width * (pattern.scale * 10)} 
                onChange={e => setPattern(c=> ({...c, width: e.target.valueAsNumber / (pattern.scale * 10)}))} 
              />
              <span className="text-black">x</span>
              <input 
                type="number" 
                min={0} 
                step={1} 
                disabled={!pattern.tiles.length} 
                className={classMerge(
                  "text-black text-center border border-black rounded-md bg-gray-100",
                  "w-16 h-10 md:w-20 md:h-8"
                )}
                value={pattern.height * (pattern.scale * 10)} 
                onChange={e => setPattern(c=> ({...c, height: e.target.valueAsNumber / (pattern.scale * 10)}))} 
              />
              <span className="text-black">{t('planner.measurements.mm')}</span>
              <Tooltip 
                text={t('planner.patternEditor.zoomOut')}
                position="top"
                disabled={isTouchDevice}
                component={ref => 
                  <ToolbarButton 
                    ref={ref} 
                    onClick={zoomOut} 
                    icon={<ZoomOut />}
                    className={"w-10 h-10 md:w-auto md:h-auto"}
                  />
                } />
              <Tooltip 
                text={t('planner.patternEditor.zoomIn')}
                position="top"
                disabled={isTouchDevice}
                component={ref => 
                  <ToolbarButton 
                    ref={ref} 
                    onClick={zoomIn} 
                    icon={<ZoomIn />}
                    className={"w-10 h-10 md:w-auto md:h-auto"}
                  />
                } />
              <Tooltip 
                text={t('planner.patternEditor.resetZoom')}
                position="top"
                disabled={isTouchDevice}
                component={ref => 
                  <ToolbarButton 
                    ref={ref} 
                    onClick={resetZoom} 
                    icon={<ResetZoom />}
                    className={"w-10 h-10 md:w-auto md:h-auto"}
                  />
                } />
              <Tooltip 
                text={t('planner.patternEditor.togglePreview')}
                position="top"
                disabled={isTouchDevice}
                component={ref => 
                  <ToolbarButton 
                    ref={ref} 
                    onClick={() => setPreview(c => !c)} 
                    icon={preview ? <EyeOff /> : <Eye/>}
                    className={"w-10 h-10 md:w-auto md:h-auto"}
                  />
                } />
          </div>
          {edited && (
            <div className={classMerge(
              "absolute z-10 bg-gray-100 shadow-md p-1 rounded-lg flex gap-1 items-center justify-center",
              isTouchDevice
                ? "left-2 top-20 flex-col w-12" // Touch: vertical layout below main toolbar
                : "left-2 top-5 flex-col" // Desktop: vertical on left
            )}>
              <input 
                type="color" 
                value={pattern.tiles.find(t => t.id === edited)?.color} 
                onChange={e => setPattern(c=> ({...c, tiles: c.tiles.map(t => t.id === edited ? {...t, color: e.target.value } : t)}))} 
                className={classMerge(
                  "m-0 p-0 rounded-md border border-solid border-black cursor-pointer hover:text-red-800 hover:bg-gray-200",
                  "w-10 h-10 md:w-full md:h-9"
                )} 
              />
              <Tooltip 
                text={t('planner.patternEditor.duplicateTile')}
                position="right"
                disabled={isTouchDevice}
                component={ref => 
                  <ToolbarButton 
                    ref={ref} 
                    onClick={duplicateTile} 
                    icon={<Copy />} 
                    className={"w-10 h-10 md:w-auto md:h-auto"}
                  />
                } />
              <CursorArrows 
                onDown={moveTileDown}
                onLeft={moveTileLeft}
                onRight={moveTileRight}
                onUp={moveTileUp}
              />
              <Tooltip 
                text={t('planner.patternEditor.deleteTile')}
                position="right"
                disabled={isTouchDevice}
                component={ref => 
                  <ToolbarButton 
                    ref={ref} 
                    variant="danger" 
                    onClick={removeTile} 
                    icon={<Trash2 />} 
                    className={"w-10 h-10 md:w-auto md:h-auto"}
                  />
                } />
            </div>
          )}
          {rotateCursor && !isTouchDevice && <RotateCcw className="fixed text-black -translate-1/2 pointer-events-none" ref={cursorRef}  />}
        </div>
        <div className={"flex justify-end gap-3"}>
          <ToolbarButton 
            label={t('planner.patternEditor.cancel')} 
            onClick={onClose}
          />
          <ToolbarButton 
            label={t('planner.patternEditor.save')} 
            icon={<CircleCheck className="text-green-800 size-5"/>} 
            onClick={() => onSubmit?.(pattern)} 
            className={"border border-black"}
          />
        </div>
      </div>
    </div>
  );
}